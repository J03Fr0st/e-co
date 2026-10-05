/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" includes the primitives showcase route in a build (CI end-to-end only). */
  readonly VITE_SHOWCASE?: string
}
