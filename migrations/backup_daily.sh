#!/bin/bash

# Major League Daily Backup Script
# Creates automated backups with cleanup and verification

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
LOGS_DIR="./logs/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_LOG="$LOGS_DIR/backup_$DATE.log"
RETENTION_DAYS=7
MAX_BACKUP_SIZE="100M"  # Maximum backup file size warning

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
    echo "$(date): SUCCESS - $1" >> "$BACKUP_LOG"
}

print_warning() {
    printf "${YELLOW}⚠️  $1${NC}\n"
    echo "$(date): WARNING - $1" >> "$BACKUP_LOG"
}

print_error() {
    printf "${RED}❌ $1${NC}\n"
    echo "$(date): ERROR - $1" >> "$BACKUP_LOG"
}

print_info() {
    printf "${BLUE}ℹ️  $1${NC}\n"
    echo "$(date): INFO - $1" >> "$BACKUP_LOG"
}

print_header() {
    printf "${BLUE}================================${NC}\n"
    printf "${BLUE}   Major League Daily Backup    ${NC}\n"
    printf "${BLUE}================================${NC}\n"
    echo ""
}

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_success "Directorio de backup creado: $BACKUP_DIR"
    fi
}

# Check if wrangler is available
check_wrangler() {
    if ! (cd .. && npx wrangler --version) &> /dev/null; then
        print_error "Wrangler CLI no está instalado"
        exit 1
    fi
}

# Check disk space
check_disk_space() {
    AVAILABLE_SPACE=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    if [ "$AVAILABLE_SPACE" -lt 1048576 ]; then  # Less than 1GB
        print_warning "Espacio en disco bajo: $(($AVAILABLE_SPACE / 1024))MB disponibles"
    fi
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
        printf "${RED}Esta operación creará backup de la base de datos de PRODUCCIÓN${NC}\n"
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
        
        # Check if main tables exist
        local tables=("profiles" "teams" "competitions")
        local missing_tables=0
        
        for table in "${tables[@]}"; do
            if (cd .. && npx wrangler d1 execute majorleague $flag --command "SELECT COUNT(*) FROM $table;" --yes) > /dev/null 2>&1; then
                local count=$(cd .. && npx wrangler d1 execute majorleague $flag --command "SELECT COUNT(*) FROM $table;" --yes 2>/dev/null | grep -oE '"[^"]*":\s*[0-9]+' | grep -oE '[0-9]+' | head -n 1)
                if [[ "$count" =~ ^[0-9]+$ ]]; then
                    print_success "Tabla $table: $count registros"
                else
                    print_success "Tabla $table: accesible"
                fi
            else
                print_error "Tabla $table: no encontrada"
                missing_tables=$((missing_tables + 1))
            fi
        done
        
        if [ "$missing_tables" -gt 0 ]; then
            print_error "Faltan $missing_tables tablas principales en la base de datos"
            print_error "La base de datos remota no parece estar configurada correctamente"
            read -p "¿Deseas continuar de todas formas? (yes/no): " force_continue
            if [ "$force_continue" != "yes" ]; then
                print_info "Operación cancelada por el usuario"
                return 1
            fi
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

# Create backup
create_backup() {
    local env=$1
    local flag=$2
    local filename="$BACKUP_DIR/${env}_backup_$DATE.sql"
    
    print_info "Creando backup $env..."
    
    if (cd .. && npx wrangler d1 export majorleague $flag --output "migrations/$filename"); then
        # Check file size
        if [ -f "$filename" ]; then
            FILE_SIZE=$(stat -f%z "$filename" 2>/dev/null || stat -c%s "$filename" 2>/dev/null)
            if [ "$FILE_SIZE" -gt 104857600 ]; then  # 100MB
                print_warning "Backup grande: $(($FILE_SIZE / 1048576))MB"
            fi
            print_success "Backup $env creado: $filename ($(($FILE_SIZE / 1024))KB)"
            
            # Verify backup integrity
            if grep -q "CREATE TABLE" "$filename"; then
                print_success "Backup $env verificado correctamente"
                return 0
            else
                print_error "Backup $env parece estar corrupto"
                return 1
            fi
        else
            print_error "No se pudo crear el archivo de backup"
            return 1
        fi
    else
        print_error "Error al crear backup $env"
        return 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    print_info "Limpiando backups antiguos (>$RETENTION_DAYS días)..."
    
    DELETED_COUNT=0
    if [ -d "$BACKUP_DIR" ]; then
        # Find and delete old backups (compatible with all shells)
        find "$BACKUP_DIR" -name "*.sql" -mtime +$RETENTION_DAYS 2>/dev/null | while read -r file; do
            if [ -f "$file" ]; then
                rm "$file"
                DELETED_COUNT=$((DELETED_COUNT + 1))
                print_info "Eliminado: $(basename "$file")"
            fi
        done
        
        # Count remaining old files to show summary
        OLD_FILES=$(find "$BACKUP_DIR" -name "*.sql" -mtime +$RETENTION_DAYS 2>/dev/null | wc -l)
        if [ "$OLD_FILES" -eq 0 ]; then
            print_success "Backups antiguos eliminados correctamente"
        else
            print_info "No hay backups antiguos para eliminar"
        fi
    fi
}

# List current backups
list_backups() {
    print_info "Backups actuales:"
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR/*.sql 2>/dev/null)" ]; then
        ls -lh "$BACKUP_DIR"/*.sql | awk '{print "  " $9 " (" $5 ", " $6 " " $7 ")"}'
    else
        print_info "  No hay backups disponibles"
    fi
}

# Send notification (placeholder for future implementation)
send_notification() {
    local status=$1
    local message=$2
    
    # TODO: Implement notification system (email, Slack, etc.)
    echo "NOTIFICATION: [$status] $message" >> "$BACKUP_DIR/backup.log"
}

# Main backup function
main() {
    print_header
    
    # Initialize logging
    create_logs_dir
    echo "$(date): Iniciando backup de Major League Database" > "$BACKUP_LOG"
    
    # Pre-flight checks
    check_wrangler
    create_backup_dir
    check_disk_space
    
    # Environment selection
    echo ""
    print_info "Seleccione el entorno para backup:"
    echo "1) 🏠 Local (desarrollo)"
    echo "2) 🌐 Remoto (producción)"
    echo "3) 🔄 Ambos entornos"
    echo ""
    read -p "Opción (1-3): " choice
    
    case $choice in
        1)
            ENV_TYPE="local"
            print_info "Creando backup de entorno local..."
            ;;
        2)
            ENV_TYPE="remoto"
            print_warning "¡ATENCIÓN! Vas a crear backup de la base de datos de PRODUCCIÓN"
            read -p "¿Estás seguro? (yes/no): " confirm
            if [ "$confirm" != "yes" ]; then
                print_info "Operación cancelada"
                exit 0
            fi
            
            # Show detailed database information
            show_database_info "--remote"
            
            # Verify database connection and structure
            if ! verify_database_connection "--remote" "remoto"; then
                print_error "Verificación de base de datos falló"
                exit 1
            fi
            ;;
        3)
            ENV_TYPE="ambos"
            print_info "Creando backup de ambos entornos..."
            
            # Show database information for remote backup
            show_database_info "--remote"
            
            # Verify database connection and structure
            if ! verify_database_connection "--remote" "remoto"; then
                print_error "Verificación de base de datos falló"
                exit 1
            fi
            ;;
        *)
            print_error "Opción inválida"
            exit 1
            ;;
    esac
    
    BACKUP_SUCCESS=true
    
    # Execute backups based on selection
    if [ "$ENV_TYPE" = "local" ] || [ "$ENV_TYPE" = "ambos" ]; then
        if ! create_backup "local" "--local"; then
            BACKUP_SUCCESS=false
        fi
    fi
    
    if [ "$ENV_TYPE" = "remoto" ] || [ "$ENV_TYPE" = "ambos" ]; then
        if [ "$ENV_TYPE" = "ambos" ]; then
            print_warning "Creando backup de PRODUCCIÓN..."
        fi
        if ! create_backup "prod" "--remote"; then
            BACKUP_SUCCESS=false
        fi
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Show current backups
    echo ""
    list_backups
    
    # Final status
    echo ""
    if [ "$BACKUP_SUCCESS" = true ]; then
        print_success "🎉 Backup completado exitosamente: $DATE"
        print_info "Log de backup: $BACKUP_LOG"
        send_notification "SUCCESS" "Backup completado: $DATE"
    else
        print_error "❌ Backup completado con errores: $DATE"
        print_info "Log de backup: $BACKUP_LOG"
        send_notification "ERROR" "Backup con errores: $DATE"
        exit 1
    fi
}

# Handle Ctrl+C 
trap 'printf "\n${YELLOW}Proceso interrumpido por el usuario${NC}\n"; exit 1' INT

# Run main function
main "$@" 