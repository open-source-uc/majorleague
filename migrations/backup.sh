#!/bin/bash

# Major League Database Backup Script
# Creates database backup

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
printf "${BLUE}  Major League Database Backup  ${NC}\n"
printf "${BLUE}================================${NC}\n"
echo ""

# Ask for environment
echo "¿De qué entorno deseas crear el backup?"
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

print_info "Creando backup del entorno: $ENV_NAME"
echo ""

# Check if npx is available
if ! command -v npx &> /dev/null; then
    print_error "npx no está disponible. Asegúrate de tener Node.js instalado"
    exit 1
fi

# Create backups directory if it doesn't exist
BACKUP_DIR="./migrations/backups"
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    print_info "Directorio de backups creado: $BACKUP_DIR"
fi

# Generate backup filename with timestamp
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${ENV_NAME,,}_$DATE.sql"

print_info "Creando backup en: $BACKUP_FILE"

# Create backup using npx wrangler d1 backup
if npx wrangler d1 backup download majorleague $DB_FLAG --output="$BACKUP_FILE"; then
    print_success "Backup creado correctamente: $BACKUP_FILE"
    
    # Show backup file size
    if command -v ls &> /dev/null; then
        FILE_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
        print_info "Tamaño del backup: $FILE_SIZE"
    fi
else
    print_error "Error al crear backup"
    exit 1
fi

echo ""
print_success "Backup completado exitosamente"
print_info "Archivo guardado en: $BACKUP_FILE"
echo ""
