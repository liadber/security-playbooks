declare module 'vitest' {
  export interface ProvidedContext {
    /** Provided by the global setup; read with inject('mongoUri'). */
    mongoUri: string;
  }
}

export {};
