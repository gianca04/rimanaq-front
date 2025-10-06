# Sistema de Práctica de Gestos LSP

## Descripción

El sistema de práctica de gestos permite importar archivos JSON con secuencias de gestos de lengua de señas y practicarlos frame por frame, comparando los movimientos del usuario con los gestos grabados.

## Formato del Archivo JSON

Los archivos de gesto deben seguir esta estructura:

```json
{
  "version": "1.0",
  "createdAt": "2025-10-06T08:07:56.493Z",
  "gesture": {
    "name": "nombre_del_gesto",
    "frames": [
      {
        "id": 1759734292423,
        "timestamp": "2025-10-06T07:04:52.423Z",
        "landmarks": [...],
        "landmarksNormalizados": [...],
        "handedness": [...],
        "gestureName": "nombre_del_gesto",
        "frameIndex": 0,
        "sequenceMetadata": {...}
      }
    ],
    "frameCount": 3,
    "isSequential": true,
    "createdAt": "2025-10-06T07:05:13.000000Z"
  }
}
```

## Cómo usar el sistema

1. **Iniciar tracking**: Haz clic en "Iniciar" para activar la detección de manos
2. **Importar gesto**: Haz clic en "Importar Gesto JSON" y selecciona un archivo válido
3. **Configurar umbral**: Ajusta el umbral de similitud (recomendado: 80%)
4. **Iniciar práctica**: Haz clic en "Iniciar Práctica"
5. **Replicar movimientos**: Realiza cada frame del gesto según se muestra
6. **Completar secuencia**: Avanza automáticamente cuando alcances el umbral

## Características

- **Detección automática**: Avanza automáticamente cuando alcanzas la similitud requerida
- **Feedback visual**: Barras de progreso que muestran similitud y avance
- **Umbral ajustable**: Puedes modificar la exigencia según tu nivel
- **Compatibilidad**: Funciona con archivos JSON generados por el sistema de captura
- **Tiempo real**: Comparación inmediata sin demoras perceptibles

## Algoritmo de Similitud

El sistema utiliza normalización de landmarks basada en:
- Centroide de la mano para translación
- Distancia máxima para escalado
- Comparación euclidiana punto a punto
- Porcentaje de similitud en tiempo real