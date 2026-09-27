/**
 * Compatibility Layer: Re-exports Sileo notifications under the Sonner UI path
 * to seamlessly upgrade all application toast calls to Sileo's gooey physics engine.
 */
export { Toaster, toast, sileo } from "./sileo";
export type { ToasterProps, ToastOptions } from "./sileo";
