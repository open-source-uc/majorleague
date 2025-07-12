#!/bin/bash

# Major League Database Setup Script
# Sets up schema, triggers, and seed data for Cloudflare D1

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOGS_DIR="./logs/setup"
SETUP_LOG="$LOGS_DIR/setup_$(date +%Y%m%d_%H%M%S).log"

# Create logs directory structure
create_logs_dir() {
    if [ ! -d "$LOGS_DIR" ]; then
        mkdir -p "$LOGS_DIR"
        echo "$(date): Directorio de logs creado: $LOGS_DIR"
    fi
}

# Functions
print_header() {
    printf "${BLUE}================================${NC}\n"
    printf "${BLUE}  Major League Database Setup   ${NC}\n"
    printf "${BLUE}================================${NC}\n"
    echo ""
}

print_success() {
    printf "${GREEN}✅ $1${NC}\n"
    echo "$(date): SUCCESS - $1" >> "$SETUP_LOG"
}

print_warning() {
    printf "${YELLOW}⚠️  $1${NC}\n"
    echo "$(date): WARNING - $1" >> "$SETUP_LOG"
}

print_error() {
    printf "${RED}❌ $1${NC}\n"
    echo "$(date): ERROR - $1" >> "$SETUP_LOG"
}

print_info() {
    printf "${BLUE}ℹ️  $1${NC}\n"
    echo "$(date): INFO - $1" >> "$SETUP_LOG"
}

# Check if wrangler is installed
check_wrangler() {
    if ! (cd .. && npx wrangler --version) &> /dev/null; then
        print_error "Wrangler CLI no está instalado. Instálalo con: npm install -g wrangler"
        exit 1
    fi
    print_success "Wrangler CLI encontrado"
}

# Check if database exists in wrangler.jsonc
check_database() {
    if ! grep -q "majorleague" ../wrangler.jsonc 2>/dev/null; then
        print_warning "No se encontró 'majorleague' en wrangler.jsonc"
        print_info "Asegúrate de que la base de datos esté configurada correctamente"
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
        printf "${RED}Esta operación modificará la base de datos de PRODUCCIÓN${NC}\n"
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

# Execute SQL file with error handling
execute_sql() {
    local file=$1
    local description=$2
    local flag=$3
    
    if [ ! -f "$file" ]; then
        print_error "Archivo no encontrado: $file"
        exit 1
    fi
    
    print_info "Ejecutando: $description..."
    
    if (cd .. && npx wrangler d1 execute majorleague $flag --file="migrations/$file" --yes); then
        print_success "$description completado"
    else
        print_error "Error al ejecutar: $description"
        exit 1
    fi
}

# Main script
main() {
    print_header
    
    # Initialize logging
    create_logs_dir
    echo "$(date): Iniciando setup de Major League Database" > "$SETUP_LOG"
    
    # Check prerequisites
    check_wrangler
    check_database
    
    echo ""
    print_info "Seleccione el tipo de setup:"
    echo "1) 🏗️  Setup completo LOCAL (schema + triggers + seed)"
    echo "2) 🌐 Setup completo REMOTO (schema + triggers + seed)"
    echo "3) 🔧 Solo estructura LOCAL (schema + triggers)"
    echo "4) 🔧 Solo estructura REMOTO (schema + triggers)"
    echo "5) 📊 Solo seed LOCAL (mantener estructura)"
    echo "6) 📊 Solo seed REMOTO (mantener estructura)"
    echo "7) 🔄 Reset local y reconfigurar"
    echo ""
    read -p "Opción (1-7): " mode
    
    # Define flag and backup strategy
    case $mode in
        1)
            FLAG="--local"
            ENV="local"
            SETUP_TYPE="completo"
            print_info "Setup completo en base de datos local..."
            ;;
        2)
            FLAG="--remote"
            ENV="remoto"
            SETUP_TYPE="completo"
            print_warning "¡ATENCIÓN! Vas a hacer setup completo en la base de datos de PRODUCCIÓN"
            read -p "¿Estás seguro? Escribe 'SETUP PRODUCTION' para confirmar: " confirm
            if [ "$confirm" != "SETUP PRODUCTION" ]; then
                print_info "Operación cancelada"
                exit 0
            fi
            
            # Show detailed database information
            show_database_info "$FLAG"
            
            # Verify database connection and structure
            if ! verify_database_connection "$FLAG" "$ENV"; then
                print_error "Verificación de base de datos falló"
                exit 1
            fi
            
            # Create backup before production changes
            print_info "Creando backup de seguridad..."
            BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
            if (cd .. && npx wrangler d1 export majorleague --remote --output "migrations/$BACKUP_FILE"); then
                print_success "Backup creado: $BACKUP_FILE"
            else
                print_warning "No se pudo crear backup, continuando..."
            fi
            ;;
        3)
            FLAG="--local"
            ENV="local"
            SETUP_TYPE="estructura"
            print_info "Setup de estructura en base de datos local..."
            ;;
        4)
            FLAG="--remote"
            ENV="remoto"
            SETUP_TYPE="estructura"
            print_warning "¡ATENCIÓN! Vas a modificar la estructura de la base de datos de PRODUCCIÓN"
            read -p "¿Estás seguro? Escribe 'SETUP STRUCTURE PRODUCTION' para confirmar: " confirm
            if [ "$confirm" != "SETUP STRUCTURE PRODUCTION" ]; then
                print_info "Operación cancelada"
                exit 0
            fi
            
            # Show detailed database information
            show_database_info "$FLAG"
            
            # Verify database connection and structure
            if ! verify_database_connection "$FLAG" "$ENV"; then
                print_error "Verificación de base de datos falló"
                exit 1
            fi
            
            # Create backup before production changes
            print_info "Creando backup de seguridad..."
            BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
            if (cd .. && npx wrangler d1 export majorleague --remote --output "migrations/$BACKUP_FILE"); then
                print_success "Backup creado: $BACKUP_FILE"
            else
                print_warning "No se pudo crear backup, continuando..."
            fi
            ;;
        5)
            FLAG="--local"
            ENV="local"
            SETUP_TYPE="seed"
            print_info "Insertando datos de ejemplo en base de datos local..."
            execute_sql "./sql/seed.sql" "Datos de ejemplo" $FLAG
            print_success "Seed completado para $ENV"
            exit 0
            ;;
        6)
            FLAG="--remote"
            ENV="remoto"
            SETUP_TYPE="seed"
            print_warning "¡ATENCIÓN! Vas a insertar datos en la base de datos de PRODUCCIÓN"
            read -p "¿Estás seguro? Escribe 'SEED PRODUCTION' para confirmar: " confirm
            if [ "$confirm" != "SEED PRODUCTION" ]; then
                print_info "Operación cancelada"
                exit 0
            fi
            
            # Show detailed database information
            show_database_info "$FLAG"
            
            # Verify database connection and structure
            if ! verify_database_connection "$FLAG" "$ENV"; then
                print_error "Verificación de base de datos falló"
                exit 1
            fi
            
            # Create backup before production changes
            print_info "Creando backup de seguridad..."
            BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
            if (cd .. && npx wrangler d1 export majorleague --remote --output "migrations/$BACKUP_FILE"); then
                print_success "Backup creado: $BACKUP_FILE"
            else
                print_warning "No se pudo crear backup, continuando..."
            fi
            
            execute_sql "./sql/seed.sql" "Datos de ejemplo" $FLAG
            print_success "Seed completado para $ENV"
            exit 0
            ;;
        7)
            FLAG="--local"
            ENV="local (reset)"
            SETUP_TYPE="reset"
            print_info "Reseteando base de datos local..."
            print_info "El schema.sql ya incluye los DROP TABLE, no es necesario hacerlo manualmente"
            ;;
        *)
            print_error "Opción inválida. Saliendo."
            exit 1
            ;;
    esac
    
    echo ""
    print_info "Iniciando setup $SETUP_TYPE para entorno: $ENV"
    echo ""
    
    # Execute migrations based on setup type
    if [ "$SETUP_TYPE" = "completo" ] || [ "$SETUP_TYPE" = "estructura" ] || [ "$SETUP_TYPE" = "reset" ]; then
        execute_sql "./sql/schema.sql" "Estructura de base de datos" $FLAG
        execute_sql "./sql/triggers.sql" "Triggers y automatización" $FLAG
        
        # Add seed data for complete setup
        if [ "$SETUP_TYPE" = "completo" ]; then
            execute_sql "./sql/seed.sql" "Datos de ejemplo" $FLAG
        fi
    fi
    
    echo ""
    print_success "🎉 Setup $SETUP_TYPE completado exitosamente para $ENV!"
    print_info "Log de setup: $SETUP_LOG"
    
    # Post-setup verification
    print_info "Verificando instalación..."
    
    if (cd .. && npx wrangler d1 execute majorleague $FLAG --command "SELECT COUNT(*) as profiles_count FROM profiles;" --yes) > /dev/null 2>&1; then
        PROFILE_COUNT=$(cd .. && npx wrangler d1 execute majorleague $FLAG --command "SELECT COUNT(*) FROM profiles;" --yes 2>/dev/null | tail -n 1)
        print_success "Verificación exitosa - Perfiles encontrados: $PROFILE_COUNT"
    else
        print_warning "No se pudo verificar la instalación"
    fi
    
    echo ""
    print_info "Próximos pasos:"
    echo "  • Ejecuta 'npm run dev' para iniciar la aplicación"
    echo "  • Revisa './migrations/README.md' para más información"
    if [ "$SETUP_TYPE" = "completo" ] || [ "$SETUP_TYPE" = "seed" ]; then
        echo "  • Los datos de ejemplo están disponibles para pruebas"
    fi
    echo ""
}

# Handle Ctrl+C 
trap 'printf "\n${YELLOW}Setup interrumpido por el usuario${NC}\n"; exit 1' INT

# Run main function
main "$@"
