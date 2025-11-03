#!/bin/bash

# Es crucial usar xargs para concurrencia
URL_A_PROBAR="http://localhost:8080"   
NUMERO_DE_PETICIONES=50                
CONCURRENCIA=50                        

echo "### INICIANDO PRUEBA DEL PATRÓN GATEWAY OFFLOADING (RATE LIMIT) ###"
echo "Enviando ${NUMERO_DE_PETICIONES} peticiones simultáneas a ${URL_A_PROBAR}..."
echo "--------------------------------------------------------------------"
echo "Se esperan códigos 200 al principio, seguidos de 503 cuando se active el límite."
echo "--------------------------------------------------------------------"

seq "$NUMERO_DE_PETICIONES" | xargs -n1 -P"$CONCURRENCIA" -I{} bash -c '
   codigo=$(curl -s -o /dev/null -w "%{http_code}" "'"$URL_A_PROBAR"'")
   printf "Petición #%02d -> Código: %s\n" {} "$codigo"
'

echo "### PRUEBA FINALIZADA ###"
echo "Si se observa una mezcla de códigos 200 y 503, el patrón funciona correctamente."
