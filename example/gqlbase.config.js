import { defineConfig } from "@gqlbase/cli/config";
import { basePreset, relayPreset, appsyncPreset } from "@gqlbase/plugins";
import { middyAppSyncGraphQLPlugin } from "@gqlbase/plugins/middy";
import { zodSchemaGeneratorPlugin } from "@gqlbase/plugins/zod";
import { drizzleSchemaGeneratorPlugin } from "@gqlbase/plugins/drizzle";

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
    drizzleSchemaGeneratorPlugin({
      scalarMap: {
        Decimal: "varchar",
        DateTime: {
          type: "timestamp",
          config: {
            withTimezone: false,
            mode: "string",
          },
        },
      },
    }),
  ],
});
