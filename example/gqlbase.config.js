import { defineConfig } from "@gqlbase/cli/config";
import { basePreset } from "@gqlbase/plugins/base";

export default defineConfig({
  schema: "src/**/*.graphql",
  output: "generated",
  plugins: [basePreset()],
});
