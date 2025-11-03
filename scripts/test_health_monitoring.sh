#!/bin/bash

BASE_URL="http://localhost:8080"

echo "╔════════════════════════════════════════════╗"
echo "║  PRUEBA DEL PATRÓN HEALTH MONITORING       ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Este script prueba que el gateway está monitoreando"
echo "el estado de los servicios backend y la memoria"
echo ""

echo "Paso 1: Verificando el endpoint de health..."
response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo ""
echo "Código HTTP recibido: $http_code"
echo ""
echo "Respuesta completa del gateway:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 503 ]; then
    echo "✓ El endpoint responde correctamente"
    echo ""
    
    status=$(echo "$body" | jq -r '.status' 2>/dev/null)
    memory_percentage=$(echo "$body" | jq -r '.memory.percentage' 2>/dev/null)
    memory_used=$(echo "$body" | jq -r '.memory.used' 2>/dev/null)
    memory_total=$(echo "$body" | jq -r '.memory.total' 2>/dev/null)
    
    services_up=$(echo "$body" | jq '[.services[] | select(.status == "up")] | length' 2>/dev/null)
    services_total=$(echo "$body" | jq '.services | length' 2>/dev/null)
    
    echo "📊 RESUMEN DEL ESTADO:"
    echo "   Estado general: $status"
    echo "   Servicios backend funcionando: ${services_up} de ${services_total}"
    echo "   Memoria usada: ${memory_used}MB de ${memory_total}MB (${memory_percentage}%)"
    echo ""
    
    if [ "$services_up" -gt 0 ]; then
        echo "✓ Los servicios backend están siendo monitoreados correctamente"
    else
        echo "✗ Algo falló con el monitoreo de servicios backend"
    fi
    
    if [ -n "$memory_percentage" ] && [ "$memory_percentage" != "null" ]; then
        echo "✓ El monitoreo de memoria está funcionando"
    else
        echo "✗ El monitoreo de memoria falló"
    fi
else
    echo "✗ El endpoint de health no responde (código: $http_code)"
fi

echo ""
echo "Paso 2: Probando varias veces para ver la consistencia..."
echo "Haciendo 5 requests seguidas al endpoint de health:"
echo ""

for i in {1..5}; do
    response=$(curl -s "${BASE_URL}/health")
    status=$(echo "$response" | jq -r '.status' 2>/dev/null)
    memory=$(echo "$response" | jq -r '.memory.percentage' 2>/dev/null)
    services=$(echo "$response" | jq '[.services[] | select(.status == "up")] | length' 2>/dev/null)
    
    echo "  Intento $i: estado=$status | memoria=${memory}% | servicios_up=$services"
    sleep 1
done

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  FIN DE LA PRUEBA                          ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Si viste que el estado cambia entre 'healthy' y 'degraded'"
echo "es normal, depende de la memoria que esté usando el gateway."
echo "Lo importante es que el patrón está monitoreando todo correctamente."
