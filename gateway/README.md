# API Gateway Service

Gateway service que implementa patrones de disponibilidad: Circuit Breaker, Retry y Health Monitoring.

## Características

- **Circuit Breaker**: Protege contra fallos en cascada
- **Retry Pattern**: Reintentos automáticos con backoff exponencial (como dimos en clase)
- **Health Monitoring**: Monitoreo del estado de las instancias del servicio backend (tenemos un monolito)
- **Load Balancing**: Distribución de carga entre las instancias del servicio de backend

## Configuración

Variables de entorno:

- `PORT`: Puerto del gateway (default: 8080)
- `BACKEND_SERVICE_1`: URL del primer servicio backend
- `BACKEND_SERVICE_2`: URL del segundo servicio backend
- `BACKEND_SERVICE_3`: URL del tercer servicio backend

## Endpoints

- `GET /`: Información del gateway
- `GET /health`: Estado de salud del propio gateway y del backend
- `GET /api/*`: Proxy a servicios backend con circuit breaker y retry

