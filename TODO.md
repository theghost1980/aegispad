# Mejoras Futuras para AegisPad

## Persistencia de Borradores de Artículos

- **Objetivo:** Permitir a los usuarios guardar borradores de sus artículos para continuar trabajando en ellos más tarde, incluso si cierran el navegador o cambian de dispositivo (con sincronización).

- **Almacenamiento Local (Navegador):**

  - Utilizar **IndexedDB** para almacenar borradores de artículos localmente en el navegador del usuario. Esto permite guardar múltiples borradores y manejar datos más grandes de forma eficiente y asíncrona.
  - Considerar librerías como `dexie.js` para simplificar la interacción con IndexedDB.

- **Sincronización con Backend (Opcional por el Usuario):**
  - Ofrecer al usuario la opción de sincronizar sus borradores guardados localmente con un backend.
  - Esto permitiría acceder y continuar editando los borradores desde diferentes dispositivos.
  - Requeriría autenticación y una API en el backend para almacenar y recuperar los datos de los borradores.
  - Investigar la mejor forma de manejar conflictos de sincronización si el mismo borrador se edita en múltiples lugares sin conexión.

## Publicaciones de Artículos Programadas

- **Objetivo:** Permitir a los usuarios programar la publicación de sus artículos en HIVE para una fecha y hora específicas.

- **Consideraciones Técnicas:**
  - **Componente Backend:** Necesario para almacenar la información de los artículos programados (contenido, metadatos, fecha/hora de publicación, usuario).
  - **Planificador de Tareas (Cron Job):** Un servicio en el backend que se ejecute periódicamente (ej. cada minuto) para verificar si hay artículos que deban publicarse.
  - **Gestión Segura de Claves de Publicación (Posting Keys):**
    - Opción 1 (Más segura para el usuario, menos automatizada): El sistema podría generar una "transacción firmada diferida" que el usuario aprueba con Keychain cerca de la hora programada, o el sistema envía una notificación al usuario para que publique manualmente a través de Keychain.
    - Opción 2 (Más automatizada, requiere confianza y seguridad robusta): El usuario podría delegar de forma segura su clave de publicación al backend (encriptada y con acceso muy restringido). Esto es complejo y conlleva riesgos de seguridad significativos.
  - **Interfaz de Usuario (UI):** Un selector de fecha y hora en la página de revisión o en una sección de "programados".
  - **Manejo de Zonas Horarias:** Almacenar las fechas/horas en UTC en el backend y convertirlas a la zona horaria del usuario en la UI.
  - **Cola de Publicación y Reintentos:** Manejar posibles fallos en la publicación (ej. nodo HIVE caído) con un sistema de reintentos.
  - **Notificaciones al Usuario:** Informar al usuario sobre el estado de sus publicaciones programadas (éxito, fallo).

## Asistente de Ayuda IA para Redacción y Generación de Imágenes

- **Objetivo:** Integrar un asistente basado en IA para ayudar a los usuarios a redactar contenido, ofrecer sugerencias, y generar imágenes a petición directamente dentro de Aegispad.

- **Consideraciones Técnicas (IA Alojada en VPS):**
  - **Selección de Modelos IA:**
    - **Texto:** Modelos de lenguaje grandes (LLMs) como Llama, Mixtral, GPT-2 (fine-tuned), u otros modelos open-source adecuados para sugerencias, resúmenes, o generación de borradores.
    - **Imágenes:** Modelos de difusión como Stable Diffusion.
  - **Configuración del VPS:**
    - **Recursos:** CPU potente, RAM suficiente, y especialmente una GPU (NVIDIA recomendada para muchos modelos) para la generación de imágenes y para la inferencia eficiente de LLMs.
    - **Software:** Entorno Python, librerías de IA (PyTorch/TensorFlow, Hugging Face Transformers, Diffusers), y un framework para la API (FastAPI, Flask).
  - **API Backend en el VPS:** Crear endpoints seguros que la aplicación frontend Aegispad pueda consumir para enviar prompts y recibir texto o imágenes.
  - **Seguridad de la API:** Autenticación para la API, rate limiting para prevenir abusos.
  - **Interfaz de Usuario (UI):**
    - Integración en el editor para solicitar ayuda contextual, generar secciones de texto, o pedir imágenes.
    - Visualizador para las imágenes generadas con opciones para insertarlas.
  - **Prompt Engineering:** Desarrollar y refinar los prompts enviados a la IA para obtener resultados de alta calidad y relevantes.
  - **Almacenamiento de Imágenes Generadas:** Decidir dónde se almacenarán temporal o permanentemente las imágenes generadas por la IA antes de ser usadas en un post (ej. almacenamiento temporal en el VPS, subida directa a un servicio de hosting de imágenes compatible con HIVE como el de PeakD o Ecency, o IPFS).
  - **Gestión de Costos del VPS:** Monitorizar el uso de recursos, especialmente si se usa GPU, ya que puede incrementar los costos.
  - **Optimización de Modelos:** Considerar técnicas como cuantización o poda de modelos si los recursos del VPS son limitados.
