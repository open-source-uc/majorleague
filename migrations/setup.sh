#!/bin/bash

# Major League Database Setup Script
# Sets up schema and triggers

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    printf "${GREEN}✅ $1${NC}\n"
}

print_error() {
    printf "${RED}❌ $1${NC}\n"
}

print_info() {
    printf "${BLUE}ℹ️  $1${NC}\n"
}

print_warning() {
    printf "${YELLOW}⚠️  $1${NC}\n"
}

# Main script
echo ""
printf "${BLUE}================================${NC}\n"
printf "${BLUE}  Major League Database Setup   ${NC}\n"
printf "${BLUE}================================${NC}\n"
echo ""

# Ask for environment
echo "¿En qué entorno deseas ejecutar el setup?"
echo "1) Local (development)"
echo "2) Remoto (production)"
read -p "Selecciona una opción (1-2): " env_choice

case $env_choice in
    1)
        DB_FLAG="--local"
        ENV_NAME="LOCAL"
        ;;
    2)
        DB_FLAG="--remote"
        ENV_NAME="REMOTO"
        ;;
    *)
        print_error "Opción inválida. Usa 1 para local o 2 para remoto."
        exit 1
        ;;
esac

print_info "Ejecutando setup en entorno: $ENV_NAME"
echo ""

# Check if npx is available
if ! command -v npx &> /dev/null; then
    print_error "npx no está disponible. Asegúrate de tener Node.js instalado"
    exit 1
fi

# Select if schema, triggers or both
echo "¿Qué quieres ejecutar?"
echo "1) Schema"
echo "2) Triggers"
echo "3) Ambos"
read -p "Selecciona una opción (1-3): " action_choice

case $action_choice in
    1)
        ACTION="schema"
        ;;
    2)
        ACTION="triggers"
        ;;
    3)
        ACTION="both"
        ;;
    *)
        print_error "Opción inválida. Usa 1 para schema, 2 para triggers o 3 para ambos."
        exit 1
        ;;
esac

# Check if sql files exist
if [ ! -f "migrations/sql/schema.sql" ]; then
    print_error "Archivo migrations/sql/schema.sql no encontrado"
    exit 1
fi

if [ ! -f "migrations/sql/triggers.sql" ]; then
    print_error "Archivo migrations/sql/triggers.sql no encontrado"
    exit 1
fi

if [ "$ACTION" = "schema" ] || [ "$ACTION" = "both" ]; then
print_info "Aplicando schema..."
if npx wrangler d1 execute majorleague $DB_FLAG --file=migrations/sql/schema.sql; then
    print_success "Schema aplicado correctamente"
else
    print_error "Error al aplicar schema"
    exit 1
fi
fi

if [ "$ACTION" = "triggers" ] || [ "$ACTION" = "both" ]; then
print_info "Aplicando triggers..."
if npx wrangler d1 execute majorleague $DB_FLAG --file=migrations/sql/triggers.sql; then
    print_success "Triggers aplicados correctamente"
else
    print_error "Error al aplicar triggers"
    exit 1
fi
fi

echo ""
print_success "Setup completado exitosamente en entorno $ENV_NAME"
echo ""