import { modelPlugin } from "./ModelPlugin.js";
import { relationPlugin } from "./RelationsPlugin.js";
import { schemaGeneratorPlugin } from "./SchemaGeneratorPlugin.js";
import { utilsPlugin } from "./UtilitiesPlugin.js";

/**
 * A preset that includes all the base plugins
 *
 * Inludes:
 * - `UtilitiesPlugin`
 * - `ModelPlugin`
 * - `RelationsPlugin`
 * - `SchemaGeneratorPlugin`
 *
 * @returns An array of plugin factories for the base plugins.
 */

export function basePreset() {
  return [utilsPlugin(), modelPlugin(), relationPlugin(), schemaGeneratorPlugin()];
}
