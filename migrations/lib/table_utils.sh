#!/bin/bash

# Table Utilities Library
# Major League UC - Database Management Utilities
# 
# This library provides functions to read table configuration
# and generate SQL commands dynamically

# Configuration file path
TABLES_CONFIG_FILE="$(dirname "${BASH_SOURCE[0]}")/../config/tables.conf"

# Read table names from configuration file
# Returns array of table names in dependency order
get_table_names() {
    local tables=()
    
    if [ ! -f "$TABLES_CONFIG_FILE" ]; then
        echo "Error: Configuration file not found: $TABLES_CONFIG_FILE" >&2
        return 1
    fi
    
    # Read table names from config file, ignoring comments and empty lines
    while IFS=':' read -r table_name description; do
        # Skip comments and empty lines
        if [[ "$table_name" =~ ^[[:space:]]*# ]] || [[ -z "$table_name" ]]; then
            continue
        fi
        
        # Trim whitespace and add to array
        table_name=$(echo "$table_name" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        if [ -n "$table_name" ]; then
            tables+=("$table_name")
        fi
    done < "$TABLES_CONFIG_FILE"
    
    # Return array elements
    printf '%s\n' "${tables[@]}"
}

# Get table names as space-separated string
get_table_names_string() {
    local tables=($(get_table_names))
    echo "${tables[*]}"
}

# Generate DROP TABLE statements for all tables
generate_drop_tables_sql() {
    local tables=($(get_table_names))
    local sql=""
    
    for table in "${tables[@]}"; do
        sql="${sql}DROP TABLE IF EXISTS $table;\n"
    done
    
    echo -e "$sql"
}

# Generate DROP TABLE statements as single command
generate_drop_tables_command() {
    local tables=($(get_table_names))
    local commands=()
    
    for table in "${tables[@]}"; do
        commands+=("DROP TABLE IF EXISTS $table;")
    done
    
    # Join commands with newlines
    local IFS=$'\n'
    echo "${commands[*]}"
}

# Check if a table exists in configuration
table_exists_in_config() {
    local search_table="$1"
    local tables=($(get_table_names))
    
    for table in "${tables[@]}"; do
        if [ "$table" = "$search_table" ]; then
            return 0
        fi
    done
    
    return 1
}

# Get table description from configuration
get_table_description() {
    local search_table="$1"
    
    if [ ! -f "$TABLES_CONFIG_FILE" ]; then
        echo "Configuration file not found"
        return 1
    fi
    
    while IFS=':' read -r table_name description; do
        # Skip comments and empty lines
        if [[ "$table_name" =~ ^[[:space:]]*# ]] || [[ -z "$table_name" ]]; then
            continue
        fi
        
        # Trim whitespace
        table_name=$(echo "$table_name" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        description=$(echo "$description" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        
        if [ "$table_name" = "$search_table" ]; then
            echo "$description"
            return 0
        fi
    done < "$TABLES_CONFIG_FILE"
    
    echo "Table not found in configuration"
    return 1
}

# List all tables with descriptions
list_tables_with_descriptions() {
    if [ ! -f "$TABLES_CONFIG_FILE" ]; then
        echo "Error: Configuration file not found: $TABLES_CONFIG_FILE" >&2
        return 1
    fi
    
    echo "Database Tables:"
    echo "=================="
    
    while IFS=':' read -r table_name description; do
        # Skip comments and empty lines
        if [[ "$table_name" =~ ^[[:space:]]*# ]] || [[ -z "$table_name" ]]; then
            continue
        fi
        
        # Trim whitespace
        table_name=$(echo "$table_name" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        description=$(echo "$description" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        
        if [ -n "$table_name" ]; then
            printf "%-25s %s\n" "$table_name" "$description"
        fi
    done < "$TABLES_CONFIG_FILE"
}

# Validate configuration file format
validate_config_file() {
    if [ ! -f "$TABLES_CONFIG_FILE" ]; then
        echo "Error: Configuration file not found: $TABLES_CONFIG_FILE" >&2
        return 1
    fi
    
    local line_number=0
    local errors=0
    
    while IFS= read -r line; do
        line_number=$((line_number + 1))
        
        # Skip comments and empty lines
        if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')" ]]; then
            continue
        fi
        
        # Check format: TABLE_NAME:DESCRIPTION
        if [[ ! "$line" =~ ^[[:space:]]*[a-zA-Z_][a-zA-Z0-9_]*[[:space:]]*:[[:space:]]*.*$ ]]; then
            echo "Error: Invalid format at line $line_number: $line" >&2
            errors=$((errors + 1))
        fi
    done < "$TABLES_CONFIG_FILE"
    
    if [ $errors -eq 0 ]; then
        echo "Configuration file is valid"
        return 0
    else
        echo "Configuration file has $errors errors"
        return 1
    fi
}

# Export functions for use in other scripts
export -f get_table_names
export -f get_table_names_string
export -f generate_drop_tables_sql
export -f generate_drop_tables_command
export -f table_exists_in_config
export -f get_table_description
export -f list_tables_with_descriptions
export -f validate_config_file 