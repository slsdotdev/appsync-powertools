import { dsqlbaseSchemaGeneratorPlugin } from "./DsqlBaseSchemaGeneratorPlugin/index.js";

export function dsqlbase() {
  return [dsqlbaseSchemaGeneratorPlugin()];
}
