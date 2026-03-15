import { defineConfig } from "@gqlbase/cli/config";

export default defineConfig({
  schema: "src/**/*.graphql",
  output: "generated",
  verbose: true,
});
