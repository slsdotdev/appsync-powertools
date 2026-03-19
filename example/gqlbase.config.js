import { defineConfig } from "@gqlbase/cli/config";
import { basePreset } from "@gqlbase/plugins/base";

export default defineConfig({
  source: "src/schema/**/*.graphql",
  output: "generated",
  plugins: [basePreset()],
});
