#!/bin/bash

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 'clientes' as tabla, COUNT(*) as cantidad FROM customers
UNION ALL
SELECT 'categorías', COUNT(*) FROM categories  
UNION ALL
SELECT 'productos', COUNT(*) FROM products
UNION ALL
SELECT 'pedidos', COUNT(*) FROM orders
UNION ALL
SELECT 'artículos_pedido', COUNT(*) FROM order_items;
"mplo

set -e

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-ecommerce_db}
DB_USER=${DB_USER:-appuser}
DB_PASSWORD=${DB_PASSWORD:-apppassword}

echo "Cargando datos de ejemplo en la base de datos..."
echo "Host: $DB_HOST:$DB_PORT"
echo "Base de datos: $DB_NAME"
echo "Usuario: $DB_USER"

echo "Esperando a que MySQL esté pronto..."
while ! mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --silent; do
    echo "MySQL no está pronto aún. Esperando..."
    sleep 2
done

echo "MySQL está pronto. Cargando datos de ejemplo..."

# Cargar datos de ejemplo
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$(dirname "$0")/sample_data.sql"

echo "¡Datos de ejemplo cargados exitosamente!"

# Mostrar estadísticas
echo "Estadísticas de la base de datos:"
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 'customers' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'categories', COUNT(*) FROM categories  
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;
"