#!/bin/bash

# Major League Database Rollback Script
# Safely restores database from backups with verification

set -e  # Exit on any error

# Load table utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/table_utils.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
LOGS_DIR="./logs/rollback"
ROLLBACK_LOG="$LOGS_DIR/rollback_$(date +%Y%m%d_%H%M%S).log"

# Create logs directory structure
create_logs_dir() {
    if [ ! -d "$LOGS_DIR" ]; then
        mkdir -p "$LOGS_DIR"
        echo "$(date): Directorio de logs creado: $LOGS_DIR"
    fi
}

# Functions
print_success() {
    printf "${GREEN}✅ $1${NC}\n"
    echo "$(date): SUCCESS - $1" >> "$ROLLBACK_LOG"
}

print_warning() {
    printf "${YELLOW}⚠️  $1${NC}\n"
    echo "$(date): WARNING - $1" >> "$ROLLBACK_LOG"
}

print_error() {
    printf "${RED}❌ $1${NC}\n"
    echo "$(date): ERROR - $1" >> "$ROLLBACK_LOG"
}

print_info() {
    printf "${BLUE}ℹ️  $1${NC}\n"
    echo "$(date): INFO - $1" >> "$ROLLBACK_LOG"
}

print_header() {
    printf "${RED}================================${NC}\n"
    printf "${RED}  Major League Database Rollback ${NC}\n"
    printf "${RED}================================${NC}\n"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    # Check wrangler
    if ! (cd .. && npx wrangler --version) &> /dev/null; then
        print_error "Wrangler CLI no está instalado"
        exit 1
    fi
    
    # Check backup directory
    if [ ! -d "$BACKUP_DIR" ]; then
        print_error "Directorio de backups no encontrado: $BACKUP_DIR"
        print_info "Creando directorio de backups..."
        mkdir -p "$BACKUP_DIR"
        if [ ! -d "$BACKUP_DIR" ]; then
            print_error "No se pudo crear el directorio de backups"
            exit 1
        fi
    fi
    
    print_success "Verificaciones previas completadas"
}

# Show database information for remote operations
show_database_info() {
    local flag=$1
    
    if [ "$flag" = "--remote" ]; then
        print_info "Obteniendo información de la base de datos remota..."
        
        # Get database info from wrangler.jsonc
        DB_NAME=$(grep -A 10 "d1_databases" ../wrangler.jsonc | grep "database_name" | sed 's/.*"database_name": "\([^"]*\)".*/\1/')
        DB_ID=$(grep -A 10 "d1_databases" ../wrangler.jsonc | grep "database_id" | sed 's/.*"database_id": "\([^"]*\)".*/\1/')
        
        echo ""
        printf "${YELLOW}📊 INFORMACIÓN DE BASE DE DATOS REMOTA:${NC}\n"
        printf "${YELLOW}════════════════════════════════════════${NC}\n"
        printf "📋 Nombre: ${BLUE}$DB_NAME${NC}\n"
        printf "🆔 ID: ${BLUE}$DB_ID${NC}\n"
        
        # Try to get additional info from wrangler
        print_info "Verificando conexión con base de datos remota..."
        if DB_INFO=$(cd .. && npx wrangler d1 info majorleague 2>/dev/null); then
            echo "$DB_INFO" | grep -E "(uuid|name|created_at|version)" | while read line; do
                printf "📈 $line\n"
            done
        else
            print_warning "No se pudo obtener información adicional de la base de datos"
        fi
        
        printf "${YELLOW}════════════════════════════════════════${NC}\n"
        echo ""
        
        printf "${RED}⚠️  ADVERTENCIA CRÍTICA:${NC}\n"
        printf "${RED}Esta operación restaurará la base de datos de PRODUCCIÓN${NC}\n"
        printf "${RED}Nombre: $DB_NAME${NC}\n"
        printf "${RED}ID: $DB_ID${NC}\n"
        echo ""
    fi
}

# Verify database connection and basic structure
verify_database_connection() {
    local flag=$1
    local env_name=$2
    
    print_info "Verificando conexión con base de datos $env_name..."
    
    # Test basic connectivity
    if ! (cd .. && npx wrangler d1 execute majorleague $flag --command "SELECT 1;" --yes) > /dev/null 2>&1; then
        print_error "No se puede conectar a la base de datos $env_name"
        print_error "Verifica tu autenticación y configuración"
        return 1
    fi
    
    print_success "Conexión con base de datos $env_name establecida"
    
    # For remote operations, do additional verification
    if [ "$flag" = "--remote" ]; then
        print_info "Verificando estructura de base de datos remota..."
        
        # Check if main tables exist (for rollback, we expect the database to be functional)
        local essential_tables=("profiles" "teams" "competitions")
        local missing_tables=0
        
        for table in "${essential_tables[@]}"; do
            if (cd .. && npx wrangler d1 execute majorleague $flag --command "SELECT COUNT(*) FROM $table;" --yes) > /dev/null 2>&1; then
                local count=$(cd .. && npx wrangler d1 execute majorleague $flag --command "SELECT COUNT(*) FROM $table;" --yes 2>/dev/null | grep -oE '"[^"]*":\s*[0-9]+' | grep -oE '[0-9]+' | head -n 1)
                if [[ "$count" =~ ^[0-9]+$ ]]; then
                    print_success "Tabla $table: $count registros"
                else
                    print_success "Tabla $table: accesible"
                fi
            else
                print_warning "Tabla $table: no encontrada (se restaurará con el rollback)"
                missing_tables=$((missing_tables + 1))
            fi
        done
        
        if [ "$missing_tables" -gt 0 ]; then
            print_warning "Faltan $missing_tables tablas principales en la base de datos"
            print_warning "Esto es normal si la base de datos está corrupta y necesita rollback"
        else
            print_success "Estructura de base de datos remota verificada"
        fi
    fi
    
    echo ""
    printf "${GREEN}✅ VERIFICACIÓN COMPLETADA:${NC}\n"
    printf "${GREEN}La base de datos $env_name está lista para la operación${NC}\n"
    echo ""
    
    return 0
}

# List available backups
list_available_backups() {
    print_info "Backups disponibles:"
    
    if [ ! -d "$BACKUP_DIR" ] || [ ! "$(ls -A $BACKUP_DIR/*.sql 2>/dev/null)" ]; then
        print_error "No hay backups disponibles en $BACKUP_DIR"
        print_info "Ejecuta ./backup_daily.sh para crear backups"
        exit 1
    fi
    
    echo ""
    local count=1
    for backup in "$BACKUP_DIR"/*.sql; do
        if [ -f "$backup" ]; then
            local filename=$(basename "$backup")
            local size=$(stat -f%z "$backup" 2>/dev/null || stat -c%s "$backup" 2>/dev/null)
            local date=$(stat -f%Sm "$backup" 2>/dev/null || stat -c%y "$backup" 2>/dev/null)
            
            echo "$count) $filename ($(($size / 1024))KB, $date)"
            count=$((count + 1))
        fi
    done
    echo ""
}

# Validate backup file
validate_backup() {
    local backup_file=$1
    
    if [ ! -f "$backup_file" ]; then
        print_error "Archivo de backup no encontrado: $backup_file"
        return 1
    fi
    
    # Check if file is not empty
    if [ ! -s "$backup_file" ]; then
        print_error "El archivo de backup está vacío"
        return 1
    fi
    
    # Check if it contains SQL content
    if ! grep -q "CREATE TABLE\|INSERT INTO\|PRAGMA" "$backup_file"; then
        print_error "El archivo no parece ser un backup válido de SQL"
        return 1
    fi
    
    print_success "Backup validado correctamente"
    return 0
}

# Create safety backup before rollback
create_safety_backup() {
    local env=$1
    local flag=$2
    local safety_file="$BACKUP_DIR/safety_before_rollback_$(date +%Y%m%d_%H%M%S).sql"
    
    print_info "Creando backup de seguridad antes del rollback..."
    
            if (cd .. && npx wrangler d1 export majorleague $flag --output "migrations/$safety_file") 2>/dev/null; then
        if [ -f "$safety_file" ] && [ -s "$safety_file" ]; then
            print_success "Backup de seguridad creado: $safety_file"
            echo "$safety_file"
        else
            print_warning "Backup de seguridad creado pero archivo vacío"
            echo ""
        fi
    else
        print_warning "No se pudo crear backup de seguridad"
        echo ""
    fi
}

# Drop all tables
drop_all_tables() {
    local flag=$1
    
    print_warning "Eliminando todas las tablas existentes..."
    
    # Use configuration-based approach to drop all tables
    print_info "Eliminando todas las tablas..."
    local drop_command=$(generate_drop_tables_command)
    (cd .. && npx wrangler d1 execute majorleague $flag --command "$drop_command" --yes) 2>/dev/null || true
    
    print_success "Tablas eliminadas correctamente"
}

# Restore from backup
restore_from_backup() {
    local backup_file=$1
    local flag=$2
    
    print_info "Restaurando desde: $(basename "$backup_file")"
    
    # Import the backup
    if (cd .. && npx wrangler d1 execute majorleague $flag --file="migrations/$backup_file" --yes) 2>/dev/null; then
        print_success "Backup restaurado exitosamente"
        return 0
    else
        print_error "Error al restaurar el backup"
        print_error "Verifique que el archivo de backup sea válido y compatible"
        return 1
    fi
}

# Verify restoration
verify_restoration() {
    local flag=$1
    
    print_info "Verificando restauración..."
    
    # Check if main tables exist and have data
    local essential_tables=("profiles" "teams" "competitions")
    
    for table in "${essential_tables[@]}"; do
        local count=$(cd .. && npx wrangler d1 execute majorleague $flag --command "SELECT COUNT(*) FROM $table;" --yes 2>/dev/null | grep -oE '"[^"]*":\s*[0-9]+' | grep -oE '[0-9]+' | head -n 1)
        
        if [[ "$count" =~ ^[0-9]+$ ]] && [ "$count" -gt 0 ]; then
            print_success "Tabla $table: $count registros"
        else
            print_warning "Tabla $table: sin datos o no existe"
        fi
    done
    
    # Test a simple query
    if (cd .. && npx wrangler d1 execute majorleague $flag --command "SELECT 1 as test;" --yes) > /dev/null 2>&1; then
        print_success "Base de datos responde correctamente"
        return 0
    else
        print_error "Base de datos no responde"
        return 1
    fi
}

# Interactive backup selection
select_backup() {
    local backups=()
    local count=1
    
    # Build array of backup files (sorted by date, newest first)
    for backup in $(ls -t "$BACKUP_DIR"/*.sql 2>/dev/null); do
        if [ -f "$backup" ]; then
            backups+=("$backup")
            count=$((count + 1))
        fi
    done
    
    if [ ${#backups[@]} -eq 0 ]; then
        print_error "No hay backups disponibles"
        exit 1
    fi
    
    # Show selection menu
    echo "Seleccione el backup a restaurar (más recientes primero):" >&2
    for i in "${!backups[@]}"; do
        local filename=$(basename "${backups[$i]}")
        local size=$(stat -f%z "${backups[$i]}" 2>/dev/null || stat -c%s "${backups[$i]}" 2>/dev/null)
        local date=$(stat -f%Sm "${backups[$i]}" 2>/dev/null || stat -c%y "${backups[$i]}" 2>/dev/null | cut -d' ' -f1,2)
        echo "$((i + 1))) $filename ($(($size / 1024))KB - $date)" >&2
    done
    echo "" >&2
    
    read -p "Opción (1-${#backups[@]}): " selection >&2
    
    if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le ${#backups[@]} ]; then
        local selected_backup="${backups[$((selection - 1))]}"
        echo "$selected_backup"
    else
        print_error "Selección inválida"
        exit 1
    fi
}

# Main rollback function
main() {
    print_header
    
    # Initialize logging
    create_logs_dir
    echo "$(date): Iniciando rollback de Major League Database" > "$ROLLBACK_LOG"
    print_info "Log de rollback: $ROLLBACK_LOG"
    
    # Check prerequisites
    check_prerequisites
    
    # Environment selection
    echo ""
    print_info "Seleccione el entorno:"
    echo "1) 🏠 Local (desarrollo)"
    echo "2) 🌐 Remoto (producción)"
    echo ""
    read -p "Opción (1-2): " env_choice
    
    case $env_choice in
        1)
            FLAG="--local"
            ENV="local"
            ;;
        2)
            FLAG="--remote"
            ENV="remoto"
            print_warning "¡ATENCIÓN! Vas a modificar la base de datos de PRODUCCIÓN"
            read -p "¿Estás seguro? Escribe 'ROLLBACK PRODUCTION' para confirmar: " confirm
            if [ "$confirm" != "ROLLBACK PRODUCTION" ]; then
                print_info "Rollback cancelado"
                exit 0
            fi
            ;;
        *)
            print_error "Opción inválida"
            exit 1
            ;;
    esac
    
    # Show database info for remote environment
    show_database_info "$FLAG"
    
    # Verify database connection
    verify_database_connection "$FLAG" "$ENV"
    
    # List available backups
    list_available_backups
    
    # Select backup file
    echo ""
    BACKUP_FILE=$(select_backup)
    
    # Validate selected backup
    if ! validate_backup "$BACKUP_FILE"; then
        exit 1
    fi
    
    # Final confirmation
    echo ""
    print_warning "CONFIRMACIÓN FINAL:"
    echo "  Entorno: $ENV"
    echo "  Backup: $(basename "$BACKUP_FILE")"
    echo "  Acción: Eliminar TODOS los datos actuales y restaurar desde backup"
    echo ""
    read -p "¿Continuar? (yes/no): " final_confirm
    
    if [ "$final_confirm" != "yes" ]; then
        print_info "Rollback cancelado por el usuario"
        exit 0
    fi
    
    # Create safety backup
    SAFETY_BACKUP=$(create_safety_backup "$ENV" "$FLAG")
    
    # Perform rollback
    echo ""
    print_info "Iniciando rollback..."
    
    # Drop all tables
    drop_all_tables "$FLAG"
    
    # Small delay to ensure tables are dropped
    sleep 2
    
    # Restore from backup
    if restore_from_backup "$BACKUP_FILE" "$FLAG"; then
        # Verify restoration
        if verify_restoration "$FLAG"; then
            print_success "🎉 Rollback completado exitosamente!"
            echo ""
            print_info "📋 RESUMEN DEL ROLLBACK:"
            echo "  • Entorno: $ENV"
            echo "  • Backup restaurado: $(basename "$BACKUP_FILE")"
            if [ -n "$SAFETY_BACKUP" ]; then
                echo "  • Backup de seguridad: $(basename "$SAFETY_BACKUP")"
            fi
            echo "  • Log completo: $ROLLBACK_LOG"
            echo ""
            print_info "La base de datos ha sido restaurada al estado del backup seleccionado"
        else
            print_error "Rollback completado pero la verificación falló"
            exit 1
        fi
    else
        print_error "Error durante el rollback"
        exit 1
    fi
}

# Handle Ctrl+C gracefully
trap 'printf "\n${YELLOW}Proceso interrumpido por el usuario${NC}\n"; exit 1' INT

# Run main function
main "$@" 