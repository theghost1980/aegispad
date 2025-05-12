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
