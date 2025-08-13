#!/bin/bash

# Major League Database Seed Script
# Populates database with initial data

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
printf "${BLUE}  Major League Database Seed    ${NC}\n"
printf "${BLUE}================================${NC}\n"
echo ""

# Ask for environment
echo "¿En qué entorno deseas ejecutar el seed?"
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
        print_warning "¡CUIDADO! Vas a poblar la base de datos de PRODUCCIÓN"
        read -p "¿Estás seguro? (y/N): " confirm
        if [[ $confirm != [yY] ]]; then
            print_info "Operación cancelada"
            exit 0
        fi
        ;;
    *)
        print_error "Opción inválida. Usa 1 para local o 2 para remoto."
        exit 1
        ;;
esac

print_info "Ejecutando seed en entorno: $ENV_NAME"
echo ""

# Check if npx is available
if ! command -v npx &> /dev/null; then
    print_error "npx no está disponible. Asegúrate de tener Node.js instalado"
    exit 1
fi

# Check if seed file exists
if [ ! -f "migrations/sql/seed.sql" ]; then
    print_error "Archivo migrations/sql/seed.sql no encontrado"
    exit 1
fi

print_info "Aplicando datos de seed..."
if npx wrangler d1 execute majorleague $DB_FLAG --file=migrations/sql/seed.sql; then
    print_success "Seed aplicado correctamente"
else
    print_error "Error al aplicar seed"
    exit 1
fi

echo ""
print_success "Seed completado exitosamente en entorno $ENV_NAME"
echo ""
