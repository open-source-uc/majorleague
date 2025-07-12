#!/bin/bash

# Major League Safe Migration Script
# Simple migration execution with logging

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
MIGRATION_DIR="."
LOGS_DIR="./logs/migrations"
MIGRATION_LOG="$LOGS_DIR/migration_$(date +%Y%m%d_%H%M%S).log"

# Create logs directory structure
create_logs_dir() {
    if [ ! -d "$LOGS_DIR" ]; then
        mkdir -p "$LOGS_DIR"
        print_success "Directorio de logs creado: $LOGS_DIR"
    fi
}

# Functions
print_success() {
    printf "${GREEN}✅ $1${NC}\n"
    echo "$(date): SUCCESS - $1" >> "$MIGRATION_LOG"
}

print_warning() {
    printf "${YELLOW}⚠️  $1${NC}\n"
    echo "$(date): WARNING - $1" >> "$MIGRATION_LOG"
}

print_error() {
    printf "${RED}❌ $1${NC}\n"
    echo "$(date): ERROR - $1" >> "$MIGRATION_LOG"
}

print_info() {
    printf "${BLUE}ℹ️  $1${NC}\n"
    echo "$(date): INFO - $1" >> "$MIGRATION_LOG"
}

print_header() {
    printf "${BLUE}================================${NC}\n"
    printf "${BLUE}    Safe Database Migration     ${NC}\n"
    printf "${BLUE}================================${NC}\n"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    # Check wrangler
    if ! (cd .. && npx wrangler --version) &> /dev/null; then
        print_error "Wrangler CLI no está instalado"
        exit 1
    fi
    
    # Check migration SQL directory
    if [ ! -d "$MIGRATION_DIR/sql" ]; then
        print_error "Directorio de migraciones SQL no encontrado: $MIGRATION_DIR/sql"
        exit 1
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
        printf "${RED}Esta operación modificará la base de datos de PRODUCCIÓN${NC}\n"
        printf "${RED}Nombre: $DB_NAME${NC}\n"
        printf "${RED}ID: $DB_ID${NC}\n"
        echo ""
    fi
}

# Verify database connection
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
    return 0
}



# Validate migration file
validate_migration() {
    local migration_file=$1
    
    if [ ! -f "$migration_file" ]; then
        print_error "Archivo de migración no encontrado: $migration_file"
        return 1
    fi
    
    # Check if file is not empty
    if [ ! -s "$migration_file" ]; then
        print_error "El archivo de migración está vacío"
        return 1
    fi
    
    # Check for dangerous operations
    if grep -qi "DROP TABLE\|DELETE FROM\|TRUNCATE" "$migration_file"; then
        print_warning "La migración contiene operaciones potencialmente peligrosas"
        print_warning "Se recomienda crear un backup antes de continuar"
        read -p "¿Continuar de todas formas? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            print_info "Migración cancelada por el usuario"
            return 1
        fi
    fi
    
    print_success "Migración validada correctamente"
    return 0
}

# Execute migration
execute_migration() {
    local migration_file=$1
    local flag=$2
    local env=$3
    
    print_info "Ejecutando migración en entorno $env..."
    print_info "Archivo: $(basename "$migration_file")"
    
    # Extract relative path from migrations directory
    local relative_path=${migration_file#*/migrations/}
    
    if (cd .. && npx wrangler d1 execute majorleague $flag --file="migrations/$relative_path" --yes); then
        print_success "Migración ejecutada exitosamente"
        return 0
    else
        print_error "Error al ejecutar migración"
        return 1
    fi
}

# Verify migration success
verify_migration() {
    local flag=$1
    local env=$2
    
    print_info "Verificando migración en entorno $env..."
    
    # Basic connectivity test
    if (cd .. && npx wrangler d1 execute majorleague $flag --command "SELECT 1;" --yes) > /dev/null 2>&1; then
        print_success "Base de datos responde correctamente"
        return 0
    else
        print_error "Base de datos no responde después de la migración"
        return 1
    fi
}

# Interactive migration selection
select_migration() {
    local migrations=()
    local count=1
    local sql_dir="$MIGRATION_DIR/sql"
    
    print_info "Archivos de migración disponibles:" >&2
    echo "" >&2
    
    # Check if SQL directory exists
    if [ ! -d "$sql_dir" ]; then
        print_error "Directorio de migraciones SQL no encontrado: $sql_dir" >&2
        exit 1
    fi
    
    # Build array of migration files and show them
    for migration in "$sql_dir"/*.sql; do
        if [ -f "$migration" ]; then
            migrations+=("$migration")
            local filename=$(basename "$migration")
            local size=$(stat -f%z "$migration" 2>/dev/null || stat -c%s "$migration" 2>/dev/null)
            echo "$count) $filename ($(($size / 1024))KB)" >&2
            count=$((count + 1))
        fi
    done
    
    if [ ${#migrations[@]} -eq 0 ]; then
        print_error "No se encontraron archivos .sql en $sql_dir" >&2
        exit 1
    fi
    
    echo "" >&2
    read -p "Seleccione la migración a ejecutar (1-${#migrations[@]}): " selection >&2
    
    if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le ${#migrations[@]} ]; then
        echo "${migrations[$((selection - 1))]}"
    else
        print_error "Selección inválida" >&2
        exit 1
    fi
}

# Main migration function
main() {
    print_header
    
    # Initialize logging
    create_logs_dir
    echo "$(date): Iniciando migración segura de Major League Database" > "$MIGRATION_LOG"
    
    # Check prerequisites
    check_prerequisites
    
    # Environment selection
    echo ""
    print_info "Seleccione el entorno de destino:"
    echo "1) 🏠 Local (desarrollo)"
    echo "2) 🌐 Remoto (producción)"
    echo ""
    read -p "Opción (1-2): " env_choice
    
    case $env_choice in
        1)
            FLAG="--local"
            ENV="local"
            print_info "Entorno seleccionado: Local (desarrollo)"
            ;;
        2)
            FLAG="--remote"
            ENV="remoto"
            print_warning "¡ATENCIÓN! Vas a migrar la base de datos de PRODUCCIÓN"
            read -p "¿Estás seguro? Escribe 'MIGRATE PRODUCTION' para confirmar: " confirm
            if [ "$confirm" != "MIGRATE PRODUCTION" ]; then
                print_info "Migración cancelada"
                exit 0
            fi
            
            # Show detailed database information
            show_database_info "$FLAG"
            ;;
        *)
            print_error "Opción inválida"
            exit 1
            ;;
    esac
    
    # Verify database connection
    if ! verify_database_connection "$FLAG" "$ENV"; then
        print_error "No se pudo conectar a la base de datos"
        exit 1
    fi
    
    # Select migration file
    echo ""
    MIGRATION_FILE=$(select_migration)
    
    # Validate migration
    if ! validate_migration "$MIGRATION_FILE"; then
        exit 1
    fi
    
    # Final confirmation
    echo ""
    print_warning "CONFIRMACIÓN FINAL:"
    echo "  Entorno: $ENV"
    echo "  Migración: $(basename "$MIGRATION_FILE")"
    echo "  Acción: Ejecutar migración"
    echo ""
    
    if [ "$ENV" = "remoto" ]; then
        print_warning "RECOMENDACIÓN: Crear backup antes de continuar"
        echo "  Usa: ./backup_daily.sh (opción 2 - Remoto)"
        echo ""
    fi
    
    read -p "¿Continuar con la migración? (yes/no): " final_confirm
    
    if [ "$final_confirm" != "yes" ]; then
        print_info "Migración cancelada por el usuario"
        exit 0
    fi
    
    # Execute migration
    echo ""
    print_info "Ejecutando migración..."
    
    if execute_migration "$MIGRATION_FILE" "$FLAG" "$ENV"; then
        # Verify migration
        if verify_migration "$FLAG" "$ENV"; then
            print_success "🎉 Migración completada exitosamente!"
            print_info "Log de migración: $MIGRATION_LOG"
        else
            print_error "Migración ejecutada pero la verificación falló"
            print_warning "Revisa el estado de la base de datos"
            exit 1
        fi
    else
        print_error "Error durante la migración"
        print_warning "Revisa el log para más detalles: $MIGRATION_LOG"
        exit 1
    fi
}

# Handle Ctrl+C 
trap 'printf "\n${YELLOW}Migración interrumpida por el usuario${NC}"; exit 1' INT

# Run main function
main "$@" 