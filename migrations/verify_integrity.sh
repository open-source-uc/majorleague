#!/bin/bash

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
LOGS_DIR="./logs/verify"
VERIFY_LOG="$LOGS_DIR/verify_$(date +%Y%m%d_%H%M%S).log"

# Create logs directory structure
create_logs_dir() {
    if [ ! -d "$LOGS_DIR" ]; then
        mkdir -p "$LOGS_DIR"
        echo "$(date): Directorio de logs creado: $LOGS_DIR"
    fi
}

# Counters
TOTAL_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Print functions
print_header() {
    printf "${BLUE}================================${NC}\n"
    printf "${BLUE}  Database Integrity Verification${NC}\n"
    printf "${BLUE}================================${NC}\n"
    echo ""
}

print_success() {
    printf "${GREEN}✅ $1${NC}\n"
    echo "$(date): SUCCESS - $1" >> "$VERIFY_LOG"
}

print_warning() {
    printf "${YELLOW}⚠️  $1${NC}\n"
    echo "$(date): WARNING - $1" >> "$VERIFY_LOG"
    WARNINGS=$((WARNINGS + 1))
}

print_error() {
    printf "${RED}❌ $1${NC}\n"
    echo "$(date): ERROR - $1" >> "$VERIFY_LOG"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
}

print_info() {
    printf "${BLUE}ℹ️  $1${NC}\n"
    echo "$(date): INFO - $1" >> "$VERIFY_LOG"
}

# Execute query and return result - SIMPLIFIED AND FAST
execute_query() {
    local query=$1
    local flag=$2
    
    # Execute and extract the number from JSON output
    # Look for "COUNT(*)": number or similar patterns
    (cd .. && npx wrangler d1 execute majorleague $flag --command "$query" --yes) 2>&1 | \
    grep -oE '"[^"]*":\s*[0-9]+' | \
    grep -oE '[0-9]+' | \
    head -n 1
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
        
        printf "${RED}⚠️  INFORMACIÓN:${NC}\n"
        printf "${RED}Esta operación verificará la base de datos de PRODUCCIÓN${NC}\n"
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
    
    echo ""
    printf "${GREEN}✅ VERIFICACIÓN COMPLETADA:${NC}\n"
    printf "${GREEN}La base de datos $env_name está lista para verificación${NC}\n"
    echo ""
    
    return 0
}

# Quick table check
check_table() {
    local table=$1
    local flag=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    local count=$(execute_query "SELECT COUNT(*) FROM $table;" "$flag")
    
    if [[ "$count" =~ ^[0-9]+$ ]] && [ "$count" -gt 0 ]; then
        print_success "Tabla $table: $count registros"
        return 0
    elif [[ "$count" =~ ^[0-9]+$ ]] && [ "$count" -eq 0 ]; then
        print_warning "Tabla $table: vacía"
        return 1
    else
        print_error "Tabla $table: error al acceder"
        return 1
    fi
}

# Essential integrity checks only
check_essential_integrity() {
    local flag=$1
    
    print_info "Verificando integridad esencial..."
    
    # Foreign key checks (only the most important ones, expanded later)
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    local orphan_teams=$(execute_query "SELECT COUNT(*) FROM teams WHERE captain_id NOT IN (SELECT id FROM profiles);" "$flag")
    if [[ "$orphan_teams" =~ ^[0-9]+$ ]] && [ "$orphan_teams" -gt 0 ]; then
        print_error "Equipos sin capitán válido: $orphan_teams"
    else
        print_success "Integridad teams -> profiles: OK"
    fi
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    local orphan_players=$(execute_query "SELECT COUNT(*) FROM players WHERE profile_id NOT IN (SELECT id FROM profiles);" "$flag")
    if [[ "$orphan_players" =~ ^[0-9]+$ ]] && [ "$orphan_players" -gt 0 ]; then
        print_error "Jugadores sin perfil válido: $orphan_players"
    else
        print_success "Integridad players -> profiles: OK"
    fi
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    local orphan_matches=$(execute_query "SELECT COUNT(*) FROM matches WHERE competition_id NOT IN (SELECT id FROM competitions);" "$flag")
    if [[ "$orphan_matches" =~ ^[0-9]+$ ]] && [ "$orphan_matches" -gt 0 ]; then
        print_error "Partidos sin competición válida: $orphan_matches"
    else
        print_success "Integridad matches -> competitions: OK"
    fi
    
    # Basic business rules
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    local duplicate_emails=$(execute_query "SELECT COUNT(*) FROM (SELECT email FROM profiles WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1);" "$flag")
    if [[ "$duplicate_emails" =~ ^[0-9]+$ ]] && [ "$duplicate_emails" -gt 0 ]; then
        print_error "Emails duplicados: $duplicate_emails"
    else
        print_success "Emails únicos: OK"
    fi
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    local duplicate_teams=$(execute_query "SELECT COUNT(*) FROM (SELECT name FROM teams GROUP BY name HAVING COUNT(*) > 1);" "$flag")
    if [[ "$duplicate_teams" =~ ^[0-9]+$ ]] && [ "$duplicate_teams" -gt 0 ]; then
        print_error "Nombres de equipos duplicados: $duplicate_teams"
    else
        print_success "Nombres de equipos únicos: OK"
    fi
}

# Main verification function
verify_database() {
    local flag=$1
    local env_name=$2
    
    print_info "Verificando base de datos $env_name..."
    echo ""
    
    # Check tables exist and have data using configuration
    print_info "Verificando tablas principales..."
    local essential_tables=("profiles" "teams" "competitions" "matches" "players")
    local tables_ok=0
    
    for table in "${essential_tables[@]}"; do
        if check_table "$table" "$flag"; then
            tables_ok=$((tables_ok + 1))
        fi
    done
    
    echo ""
    
    # Only run integrity checks if we have data
    if [ "$tables_ok" -gt 0 ]; then
        check_essential_integrity "$flag"
    else
        print_warning "No hay datos suficientes para verificar integridad"
    fi
    
    echo ""
}

# Print summary
print_summary() {
    printf "${BLUE}================================${NC}\n"
    printf "${BLUE}      RESUMEN DE VERIFICACIÓN    ${NC}\n"
    printf "${BLUE}================================${NC}\n"
    echo ""
    
    printf "Total de verificaciones: $TOTAL_CHECKS\n"
    printf "Verificaciones fallidas: $FAILED_CHECKS\n"
    printf "Advertencias: $WARNINGS\n"
    echo ""
    
    if [ "$FAILED_CHECKS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
        print_success "🎉 Base de datos completamente saludable"
        print_info "Log de verificación: $VERIFY_LOG"
        exit 0
    elif [ "$FAILED_CHECKS" -eq 0 ]; then
        print_warning "⚠️  Base de datos saludable con $WARNINGS advertencias"
        print_info "Log de verificación: $VERIFY_LOG"
        exit 0
    else
        print_error "❌ Base de datos con $FAILED_CHECKS errores críticos"
        print_info "Log de verificación: $VERIFY_LOG"
        exit 1
    fi
}

# Main function
main() {
    print_header
    
    # Initialize logging
    create_logs_dir
    echo "$(date): Iniciando verificación de integridad de Major League Database" > "$VERIFY_LOG"
    
    # Check if wrangler is available
    if ! (cd .. && npx wrangler --version) &> /dev/null; then
        print_error "Wrangler CLI no está disponible"
        exit 1
    fi
    
    # Environment selection
    print_info "Seleccione el entorno a verificar:"
    echo "1) 🏠 Local (desarrollo)"
    echo "2) 🌐 Remoto (producción)"
    echo "3) 🔍 Ambos entornos"
    echo ""
    read -p "Opción (1-3): " choice
    
    case $choice in
        1)
            verify_database_connection "--local" "local"
            verify_database "--local" "local"
            ;;
        2)
            show_database_info "--remote"
            verify_database_connection "--remote" "remoto"
            verify_database "--remote" "remoto"
            ;;
        3)
            verify_database_connection "--local" "local"
            verify_database "--local" "local"
            echo ""
            print_info "Verificando base de datos remota..."
            show_database_info "--remote"
            verify_database_connection "--remote" "remoto"
            verify_database "--remote" "remoto"
            ;;
        *)
            print_error "Opción inválida"
            exit 1
            ;;
    esac
    
    print_summary
}

# Handle Ctrl+C 
trap 'printf "\n${YELLOW}Verificación interrumpida por el usuario${NC}\n"; exit 1' INT

# Run main function
main "$@" 