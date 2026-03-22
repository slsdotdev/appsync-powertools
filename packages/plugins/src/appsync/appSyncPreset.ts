import { appSyncUtilsPlugin } from "./AppSyncUtilsPlugin/index.js";

/**
 * Register AWS AppSync specific features and ensures schema compatibility
 *
 * Includes:
 * - `AppSyncUtilsPlugin`
 *
 * @returns An array of plugin factories.
 */

export function appsyncPreset() {
  return [appSyncUtilsPlugin()];
}
