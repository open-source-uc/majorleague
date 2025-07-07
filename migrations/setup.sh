#!/bin/bash

# Preguntar si el usuario quiere modo local o remoto
echo "Seleccione el modo de ejecución:"
echo "1) Local"
echo "2) Remoto"
read -p "Opción (1/2): " mode

# Definir el flag según la opción elegida
if [ "$mode" = "1" ]; then
    FLAG="--local"
elif [ "$mode" = "2" ]; then
    FLAG="--remote"
else
    echo "Opción inválida. Saliendo."
    exit 1
fi

npx wrangler d1 execute majorleague $FLAG --file=./migrations/sql/schema.sql -y
echo "Schema Table created"

npx wrangler d1 execute majorleague $FLAG --file=./migrations/sql/triggers.sql -y
echo "Triggers created"

npx wrangler d1 execute majorleague $FLAG --file=./migrations/sql/seed.sql -y
echo "Seed Values inserted"
