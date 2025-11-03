#!/bin/bash

echo "🚀 Iniciando Aplicación E-commerce TFU3 ANDIS2"
echo "================================================"

if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado. Por favor instale Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose no está instalado. Por favor instale Docker Compose primero."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Error: Docker no se está ejecutando. Por favor inicie Docker primero."
    exit 1
fi

echo "✅ Docker está listo"

echo "🧹 Limpiando contenedores existentes..."
docker-compose down --volumes --remove-orphans

echo "🔨 Construyendo e iniciando la aplicación..."
docker-compose up --build -d

echo "⏳ Esperando que los servicios estén listos..."

echo "🔄 Esperando que MySQL se inicialice..."
while ! docker-compose exec -T mysql mysqladmin ping -h localhost -u appuser -papppassword --silent 2>/dev/null; do
    echo "   MySQL aún se está inicializando..."
    sleep 5
done
echo "✅ MySQL está listo"

echo "🔄 Esperando servicios de la aplicación..."
sleep 10

echo "📊 Estado de los Servicios:"
docker-compose ps

echo "🧪 Probando la aplicación..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ La aplicación está respondiendo"
    echo ""
    echo "🎉 ¡La aplicación está lista!"
    echo "================================================"
    echo "📱 URL de la Aplicación: http://localhost:8080"
    echo "🔍 Verificación de Salud: http://localhost:8080/health"
    echo "📚 Endpoints de la API:"
    echo "   • GET  /api/customers       - Listar todos los clientes"
    echo "   • GET  /api/products        - Listar todos los productos"
    echo "   • GET  /api/orders          - Listar todas las órdenes"
    echo ""
    echo "🗄️  Acceso a la Base de Datos:"
    echo "   • Host: localhost"
    echo "   • Puerto: 3306"
    echo "   • Base de Datos: ecommerce_db"
    echo "   • Usuario: appuser"
    echo "   • Contraseña: apppassword"
    echo ""
    echo "📊 Ver logs con: docker-compose logs -f"
    echo "🛑 Detener con: docker-compose down"
else
    echo "❌ La aplicación no está respondiendo. Revise los logs:"
    echo "   docker-compose logs"
fi