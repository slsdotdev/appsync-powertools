import { defineConfig } from "@gqlbase/cli/config";
import { basePreset, relayPreset, appsyncPreset } from "@gqlbase/plugins";
import { middyAppSyncGraphQLPlugin } from "@gqlbase/plugins/middy";
import { zodSchemaGeneratorPlugin } from "@gqlbase/plugins/zod";
import { dsqlbase } from "@gqlbase/plugins/dsql";

export default defineConfig({
  source: "src/schema",
  output: "generated",
  verbose: false,
  plugins: [
    basePreset(),
    relayPreset(),
    appsyncPreset({
      scalarMappings: {
        Decimal: "String",
      },
    }),
    middyAppSyncGraphQLPlugin({
      authorizationModes: ["cognito", "iam"],
    }),
    zodSchemaGeneratorPlugin(),
    dsqlbase(),
  ],
});
