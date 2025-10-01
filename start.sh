#!/bin/bash

# TFU3 ANDIS2 Application Startup Script
# This script helps you start the entire application stack

echo "🚀 Starting TFU3 ANDIS2 E-commerce Application"
echo "================================================"

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is ready"

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down --volumes --remove-orphans

# Build and start the application
echo "🔨 Building and starting the application..."
docker-compose up --build -d

echo "⏳ Waiting for services to be ready..."

# Wait for MySQL to be healthy
echo "🔄 Waiting for MySQL to initialize..."
while ! docker-compose exec -T mysql mysqladmin ping -h localhost -u appuser -papppassword --silent 2>/dev/null; do
    echo "   MySQL is still initializing..."
    sleep 5
done
echo "✅ MySQL is ready"

# Wait for app services to be ready
echo "🔄 Waiting for application services..."
sleep 10

# Check if services are running
echo "📊 Service Status:"
docker-compose ps

# Test the application
echo "🧪 Testing the application..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Application is responding"
    echo ""
    echo "🎉 Application is ready!"
    echo "================================================"
    echo "📱 Application URL: http://localhost:8080"
    echo "🔍 Health Check: http://localhost:8080/health"
    echo "📚 API Endpoints:"
    echo "   • GET  /api/customers       - List all customers"
    echo "   • GET  /api/products        - List all products"
    echo "   • GET  /api/orders          - List all orders"
    echo ""
    echo "🗄️  Database Access:"
    echo "   • Host: localhost"
    echo "   • Port: 3306"
    echo "   • Database: ecommerce_db"
    echo "   • Username: appuser"
    echo "   • Password: apppassword"
    echo ""
    echo "📊 View logs with: docker-compose logs -f"
    echo "🛑 Stop with: docker-compose down"
else
    echo "❌ Application is not responding. Check the logs:"
    echo "   docker-compose logs"
fi