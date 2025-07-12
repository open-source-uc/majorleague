# SOLO USAR EN LOCAL, NO USAR EN REMOTO, NO SE HA PROBADO EN REMOTO

# 🗄️ Database Migrations

Sistema de migraciones para Major League UC con Cloudflare D1.

## 🚀 Configuración Rápida

```bash
cd migrations
chmod +x *.sh
./setup.sh
```

## 🛠️ Scripts Disponibles

### `setup.sh` - Configuración inicial

**Qué hace:** Configura la base de datos con schema, datos iniciales y triggers
**Cuándo usar:**

- Primera vez configurando el proyecto
- Resetear la base de datos completamente
- Configurar entorno de desarrollo

```bash
./setup.sh
```

### `backup_daily.sh` - Backups automáticos

**Qué hace:** Crea backups de la base de datos con limpieza de backups antiguos (7 días)
**Cuándo usar:**

- Backups regulares programados (cron)
- Antes de cambios importantes
- Disaster recovery
- Mantenimiento preventivo

```bash
./backup_daily.sh
```

**Características:**

- Timestamp automático en nombres de archivo
- Limpieza de backups antiguos (>7 días)
- Verificación de integridad post-backup
- Logs detallados en `backup.log`

### `rollback.sh` - Restauración de emergencia

**Qué hace:** Restaura la base de datos desde un backup específico
**Cuándo usar:**

- Después de errores en producción
- Deshacer cambios fallidos
- Recuperación de datos corruptos
- Rollback de migraciones problemáticas

```bash
./rollback.sh
```

**Características:**

- Selección interactiva de backups
- Backup de seguridad antes de rollback
- Verificación de integridad post-restauración
- Soporte para backups locales y remotos

### `migrate_safe.sh` - Migraciones seguras

**Qué hace:** Aplica cambios con backup automático y rollback en caso de error
**Cuándo usar:**

- Cambios de esquema en producción
- Migraciones con validación
- Despliegues críticos
- Actualizaciones de datos masivas

```bash
./migrate_safe.sh migration_file.sql
```

**Características:**

- Backup automático pre-migración
- Rollback automático en caso de error
- Validación de sintaxis SQL
- Testing en local antes de remoto

### `verify_integrity.sh` - Verificación de datos

> Falta revisar y completar el script

**Qué hace:** Verifica la integridad de la base de datos (10 verificaciones esenciales)
**Cuándo usar:**

- Después de migraciones
- Diagnóstico de problemas
- Mantenimiento regular
- Auditorías de datos

```bash
./verify_integrity.sh
```

**Verificaciones incluidas:**

- Foreign keys válidas
- Duplicados en campos únicos
- Datos huérfanos
- Consistencia de timestamps
- Reglas de negocio

## 📁 Estructura de Archivos

### `/logs/` - Sistema de Logging Centralizado

Todos los scripts generan logs automáticamente organizados por tipo:

```
logs/
├── backups/         # Logs de backups diarios
├── migrations/      # Logs de migraciones
├── setup/          # Logs de configuración inicial
├── rollback/       # Logs de restauraciones
└── verify/         # Logs de verificaciones
```

Cada log incluye timestamp, nivel (INFO/WARNING/ERROR) y detalles de la operación.

### `config/tables.conf` - Configuración de Tablas

Sistema centralizado para manejo de tablas de la base de datos:

```bash
# Formato: TABLE_NAME:DESCRIPTION
# Orden: dependencias (hijos primero, padres último)
streams:Live streaming data for matches
teams:Football teams
profiles:User profiles and authentication data
```
