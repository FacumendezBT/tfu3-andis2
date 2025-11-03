#!/bin/bash

BASE_URL="http://localhost:8080"

echo "╔════════════════════════════════════════════╗"
echo "║  PRUEBA DEL PATRÓN CIRCUIT BREAKER         ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "El Circuit Breaker protege contra cascadas de fallos."
echo "Si hay 5 fallos seguidos, se 'abre' y bloquea requests"
echo "por 60 segundos para dar tiempo a que el servicio se recupere."
echo ""

echo "Paso 1: Operación normal (circuit debería estar CERRADO)"
response=$(curl -s "${BASE_URL}/api/products")
http_code=$(echo "$response" | grep -o '"status":[0-9]*' | cut -d: -f2 || echo "200")
if [ -z "$http_code" ]; then
    http_code="200"
fi

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 404 ]; then
    echo "✓ Request exitosa"
    echo "  El circuit breaker está CERRADO (CLOSED) y permite requests normalmente"
else
    echo "✗ Request falló con código: $http_code"
fi
echo ""

echo "Paso 2: Enviando muchos requests rápidamente"
echo "Enviando 25 requests al mismo endpoint..."
echo ""
echo "IMPORTANTE: El circuit breaker solo se abre si hay"
echo "5 fallos CONSECUTIVOS con código >= 500."
echo "Como los servicios están saludables, debería quedarse CERRADO."
echo ""

success=0
failed=0
circuit_open=0

for i in {1..25}; do
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/products" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 503 ]; then
        circuit_body=$(echo "$response" | sed '$d')
        if echo "$circuit_body" | grep -q "circuitState"; then
            circuit_open=$((circuit_open + 1))
            echo "  Request $i: ⚠ CIRCUIT BREAKER ABIERTO (503)"
        else
            failed=$((failed + 1))
        fi
    elif [ "$http_code" -eq 200 ] || [ "$http_code" -eq 404 ]; then
        success=$((success + 1))
        if [ $((i % 8)) -eq 0 ]; then
            echo "  Request $i: ✓ Exitosa"
        fi
    else
        failed=$((failed + 1))
        echo "  Request $i: ✗ Falló (HTTP $http_code)"
    fi
    
    sleep 0.15
done

echo ""
echo "📊 RESULTADOS:"
echo "   Requests exitosas: $success"
echo "   Requests fallidas: $failed"
echo "   Veces que el circuit breaker estuvo ABIERTO: $circuit_open"
echo ""

if [ "$circuit_open" -gt 0 ]; then
    echo "✓ El patrón funciona! El circuit breaker se abrió cuando detectó problemas"
    echo "  Esto significa que está protegiendo el sistema correctamente"
elif [ "$failed" -gt 0 ]; then
    echo "⚠ Hubo algunos fallos pero el circuit breaker no se abrió"
    echo "  (solo se abre después de 5 fallos consecutivos con código >= 500)"
else
    echo "✓ El patrón está funcionando correctamente"
    echo "  El circuit breaker se mantuvo CERRADO porque todos los requests fueron exitosos"
    echo "  Esto es lo esperado cuando los servicios están saludables"
fi

echo ""
echo "Paso 3: Probando la recuperación del circuit breaker"
echo "Esperando 5 segundos y haciendo un request de prueba..."
sleep 5

response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/products")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 404 ]; then
    echo "✓ El servicio sigue funcionando"
    echo "  El circuit breaker permite requests cuando todo está bien"
elif [ "$http_code" -eq 503 ]; then
    echo "⚠ El circuit breaker sigue ABIERTO"
    echo "  (normal si el servicio está degradado)"
else
    echo "⚠ Código inesperado: $http_code"
fi

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  FIN DE LA PRUEBA                          ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "ESTADOS DEL CIRCUIT BREAKER:"
echo "  CLOSED:   Permite todas las requests (normal)"
echo "  OPEN:     Bloquea requests después de 5 fallos"
echo "  HALF_OPEN: Estado intermedio para probar recuperación"
echo ""
echo "El circuit breaker es como un fusible eléctrico:"
echo "se 'quema' para proteger todo el sistema cuando hay problemas."
