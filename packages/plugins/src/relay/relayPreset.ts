import { connectionPlugin } from "./ConnectionPlugin.js";
import { nodeInterfacePlugin } from "./NodeInterfacePlugin.js";

/**
 * A preset that includes all the Relay plugins
 *
 * Inludes:
 * - `NodeInterfacePlugin`
 * - `ConnectionPlugin`
 *
 * @returns An array of plugin factories.
 */

export function relayPreset() {
  return [nodeInterfacePlugin(), connectionPlugin()];
}
