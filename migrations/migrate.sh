#!/bin/bash

# Major League Database Migration Script
# Executes selected SQL file

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
printf "${BLUE}  Major League Database Migrate ${NC}\n"
printf "${BLUE}================================${NC}\n"
echo ""

# Ask for environment
echo "¿En qué entorno deseas ejecutar la migración?"
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
        print_warning "¡CUIDADO! Vas a ejecutar una migración en PRODUCCIÓN"
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

echo ""
print_info "Entorno seleccionado: $ENV_NAME"
echo ""

# Check if npx is available
if ! command -v npx &> /dev/null; then
    print_error "npx no está disponible. Asegúrate de tener Node.js instalado"
    exit 1
fi

# Check if sql directory exists
if [ ! -d "migrations/sql" ]; then
    print_error "Directorio migrations/sql/ no encontrado"
    exit 1
fi

# List available SQL files
echo "Archivos SQL disponibles:"
echo ""
SQL_FILES=($(find migrations/sql -name "*.sql" -type f | sort))

if [ ${#SQL_FILES[@]} -eq 0 ]; then
    print_error "No se encontraron archivos SQL en el directorio migrations/sql/"
    exit 1
fi

# Display numbered list of SQL files
for i in "${!SQL_FILES[@]}"; do
    echo "$((i+1))) ${SQL_FILES[$i]}"
done

echo ""
read -p "Selecciona el archivo SQL a ejecutar (1-${#SQL_FILES[@]}): " file_choice

# Validate choice
if ! [[ "$file_choice" =~ ^[0-9]+$ ]] || [ "$file_choice" -lt 1 ] || [ "$file_choice" -gt ${#SQL_FILES[@]} ]; then
    print_error "Opción inválida. Debe ser un número entre 1 y ${#SQL_FILES[@]}"
    exit 1
fi

# Get selected file
SELECTED_FILE="${SQL_FILES[$((file_choice-1))]}"

echo ""
print_info "Archivo seleccionado: $SELECTED_FILE"

# Show file preview (first few lines)
print_info "Vista previa del archivo:"
echo ""
head -10 "$SELECTED_FILE" | sed 's/^/  /'
echo ""

# Final confirmation
read -p "¿Confirmas la ejecución de este archivo en $ENV_NAME? (y/N): " final_confirm
if [[ $final_confirm != [yY] ]]; then
    print_info "Operación cancelada"
    exit 0
fi

echo ""
print_info "Ejecutando migración..."

# Execute the SQL file
if npx wrangler d1 execute majorleague $DB_FLAG --file="$SELECTED_FILE"; then
    print_success "Migración ejecutada correctamente"
else
    print_error "Error al ejecutar la migración"
    exit 1
fi

echo ""
print_success "Migración completada exitosamente en entorno $ENV_NAME"
print_info "Archivo ejecutado: $SELECTED_FILE"
echo ""
