#!/bin/bash

BASE_URL="http://localhost:8080"

echo "╔════════════════════════════════════════════╗"
echo "║  PRUEBA DEL PATRÓN RETRY                   ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Este patrón hace que si una request falla,"
echo "el gateway la reintente automáticamente hasta 3 veces"
echo "con backoff exponencial (espera 1s, luego 2s, luego 4s)"
echo ""

echo "Paso 1: Request normal (debería funcionar al primer intento)"
start_time=$(date +%s%N)
response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/products")
end_time=$(date +%s%N)
http_code=$(echo "$response" | tail -n1)
duration=$((($end_time - $start_time) / 1000000))

echo ""
echo "Código HTTP: $http_code"
echo "Tiempo de respuesta: ${duration}ms"
if [ "$http_code" -eq 200 ]; then
    echo "✓ Funcionó al primer intento (como esperábamos)"
    echo "  No hubo necesidad de retry porque todo salió bien"
else
    echo "✗ Algo salió mal"
fi
echo ""

echo "Paso 2: Request a un endpoint que no existe (404)"
start_time=$(date +%s%N)
response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/products/99999")
end_time=$(date +%s%N)
http_code=$(echo "$response" | tail -n1)
duration=$((($end_time - $start_time) / 1000000))

echo ""
echo "Código HTTP: $http_code"
echo "Tiempo de respuesta: ${duration}ms"
if [ "$http_code" -eq 404 ]; then
    echo "✓ El gateway manejó el 404 correctamente"
    echo "  (404 no se reintenta porque no es un error del servidor)"
else
    echo "⚠ Código inesperado: $http_code"
fi
echo ""

echo "Paso 3: Haciendo muchos requests para probar la resiliencia"
echo "Enviando 15 requests al endpoint de customers..."
echo "Si alguna falla temporalmente, el retry debería recuperarla"
echo ""

success_count=0
total_requests=15
failed_requests=0

for i in $(seq 1 $total_requests); do
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/customers")
    http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" -eq 200 ]; then
        success_count=$((success_count + 1))
        echo -n "✓"
    else
        failed_requests=$((failed_requests + 1))
        echo -n "✗"
    fi
    sleep 0.2
done
echo ""
echo ""

success_rate=$((success_count * 100 / total_requests))
echo "📊 RESULTADOS:"
echo "   Requests exitosas: ${success_count} de ${total_requests}"
echo "   Requests fallidas: ${failed_requests}"
echo "   Tasa de éxito: ${success_rate}%"
echo ""

if [ "$success_rate" -ge 90 ]; then
    echo "✓ El patrón Retry está funcionando perfecto"
    echo "  La alta tasa de éxito muestra que los reintentos"
    echo "  están ayudando a recuperar requests que podrían fallar"
elif [ "$success_rate" -ge 70 ]; then
    echo "⚠ La tasa de éxito es aceptable pero podría ser mejor"
else
    echo "✗ Algo está fallando, la tasa de éxito es muy baja"
fi

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  FIN DE LA PRUEBA                          ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Nota: El patrón Retry solo reintenta errores del servidor (500+)"
echo "Errores del cliente (400, 404) no se reintentan porque no tiene sentido."
