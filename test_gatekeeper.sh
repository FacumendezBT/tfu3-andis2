#!/bin/bash


BASE_URL="http://localhost:8080" 
PROTECTED_ROUTE="/api/orders"
LOGIN_ROUTE="/api/auth/login"

echo "### INICIANDO PRUEBA DEL PATRÓN GATEKEEPER ###"
echo "----------------------------------------------------"

# --- Paso 1: Intentar acceder a una ruta protegida SIN token ---
echo "1. Intentando acceder a ${PROTECTED_ROUTE} SIN token (debe fallar con 401)..."
STATUS_CODE_NO_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${PROTECTED_ROUTE}")
echo "-> Respuesta del servidor: ${STATUS_CODE_NO_TOKEN}"
if [ "$STATUS_CODE_NO_TOKEN" -eq 401 ]; then
  echo "PRUEBA EXITOSA: El servidor denegó el acceso como se esperaba."
else
  echo "ERROR: El servidor permitió el acceso sin token."



# --- Paso 2: Obtener un token de autenticación ---
echo "2. Obteniendo un token de acceso desde ${LOGIN_ROUTE} (debe funcionar)..."
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123"}' \
  "${BASE_URL}${LOGIN_ROUTE}")

ACCESS_TOKEN=$(echo "${LOGIN_RESPONSE}" | jq -r '.accessToken')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
  echo "ERROR: No se pudo obtener el token. Respuesta del login: ${LOGIN_RESPONSE}"
  exit 1
else
  echo "PRUEBA EXITOSA: Token obtenido correctamente."



# --- Paso 3: Acceder a la ruta protegida CON el token válido ---
echo "3. Accediendo a ${PROTECTED_ROUTE} CON un token válido (debe funcionar con 200)..."
STATUS_CODE_WITH_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  "${BASE_URL}${PROTECTED_ROUTE}")
echo "-> Respuesta del servidor: ${STATUS_CODE_WITH_TOKEN}"
if [ "$STATUS_CODE_WITH_TOKEN" -eq 200 ]; then
  echo "PRUEBA EXITOSA: El servidor permitió el acceso con un token válido."
else
  echo "ERROR: El servidor denegó el acceso con un token válido."



# --- Paso 4: Intentar acceder con un token inválido ---
echo "4. Accediendo a ${PROTECTED_ROUTE} CON un token FALSO (debe fallar con 403)..."
STATUS_CODE_FAKE_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer tokenfalso12345" \
  "${BASE_URL}${PROTECTED_ROUTE}")
echo "-> Respuesta del servidor: ${STATUS_CODE_FAKE_TOKEN}"
if [ "$STATUS_CODE_FAKE_TOKEN" -eq 403 ]; then
  echo "PRUEBA EXITOSA: El servidor denegó el acceso con un token falso como se esperaba."
else
  echo "ERROR: El servidor no manejó correctamente el token falso."
echo "### PRUEBA DEL GATEKEEPER FINALIZADA ###"