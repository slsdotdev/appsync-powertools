---
"@gqlbase/plugins": patch
---

zod plugin: derive create/update schemas from `@model` types

- `ZodSchemaGeneratorPlugin` now emits `Create${Model}InputSchema` and `Update${Model}InputSchema` directly from each `@model` object instead of the public GraphQL input. The schemas describe the full persistence row: `@serverOnly` and `@readOnly` fields are included; relations, `@clientOnly`, and the opposing `@createOnly`/`@updateOnly` fields are excluded. Non-null model fields on update are now `.optional()` (no `.nullable()`); nullable fields stay `.optional().nullable()`. `id` is required on update and optional on create.
- Input definitions are no longer matched by default. New `generateArgumentSchemas` option (default `false`) walks every field argument across Query/Mutation/Subscription and object fields, emitting zod schemas for argument types and their transitive dependencies (filter inputs, custom inputs). Already-emitted names are not overwritten.
- `ModelPlugin.execute()` now respects `@model(operations:)` when building inputs — `CreateXInput` / `UpdateXInput` / `XFilterInput` are only emitted for the corresponding enabled operations.
- `basePreset()` accepts `{ operations }` and forwards it to `ModelPlugin`.
- `MiddyAppSyncGraphQLPlugin` moved from `@gqlbase/plugins/middy` to `@gqlbase/plugins/appsync` and is now bundled inside `appsyncPreset()` via the new `middyAppSync` option.
