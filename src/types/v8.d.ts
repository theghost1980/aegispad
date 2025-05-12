/**
 * Declaración global para extender la interfaz ErrorConstructor
 * y añadir el método captureStackTrace que es específico del motor V8 (Node.js, Chrome).
 * Esto permite que TypeScript reconozca Error.captureStackTrace.
 */
interface ErrorConstructor {
  captureStackTrace(targetObject: object, constructorOpt?: Function): void;
}
