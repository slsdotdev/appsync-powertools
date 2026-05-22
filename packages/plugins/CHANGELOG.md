# @gqlbase/plugins

## 0.1.10

### Patch Changes

- 09b33a7: Fix zod schemas dependency refs
  - @gqlbase/core@0.1.10
  - @gqlbase/shared@0.1.10

## 0.1.9

### Patch Changes

- 2fe3339: zod plugin: derive create/update schemas from `@model` types
  - `ZodSchemaGeneratorPlugin` now emits `Create${Model}InputSchema` and `Update${Model}InputSchema` directly from each `@model` object instead of the public GraphQL input. The schemas describe the full persistence row: `@serverOnly` and `@readOnly` fields are included; relations, `@clientOnly`, and the opposing `@createOnly`/`@updateOnly` fields are excluded. Non-null model fields on update are now `.optional()` (no `.nullable()`); nullable fields stay `.optional().nullable()`. `id` is required on update and optional on create.
  - Input definitions are no longer matched by default. New `generateArgumentSchemas` option (default `false`) walks every field argument across Query/Mutation/Subscription and object fields, emitting zod schemas for argument types and their transitive dependencies (filter inputs, custom inputs). Already-emitted names are not overwritten.
  - `ModelPlugin.execute()` now respects `@model(operations:)` when building inputs — `CreateXInput` / `UpdateXInput` / `XFilterInput` are only emitted for the corresponding enabled operations.
  - `basePreset()` accepts `{ operations }` and forwards it to `ModelPlugin`.
  - `MiddyAppSyncGraphQLPlugin` moved from `@gqlbase/plugins/middy` to `@gqlbase/plugins/appsync` and is now bundled inside `appsyncPreset()` via the new `middyAppSync` option.
  - @gqlbase/core@0.1.9
  - @gqlbase/shared@0.1.9

## 0.1.8

### Patch Changes

- 25c27f1: codegen fixes
  - @gqlbase/core@0.1.8
  - @gqlbase/shared@0.1.8

## 0.1.7

### Patch Changes

- ff979f8: Added DsqlBaseSchemaGeneratorPlugin
  - @gqlbase/core@0.1.7
  - @gqlbase/shared@0.1.7

## 0.1.6

### Patch Changes

- c677464: Fix relations key parsing
- 18da481: Update deps
- Updated dependencies [18da481]
  - @gqlbase/shared@0.1.6
  - @gqlbase/core@0.1.6

## 0.1.5

### Patch Changes

- c265909: Added DrizzleSchemaGenerator plugin
  - @gqlbase/core@0.1.5
  - @gqlbase/shared@0.1.5

## 0.1.4

### Patch Changes

- cd20bc5: Added ZodSchemaGeneratorPlugin
  - @gqlbase/core@0.1.4
  - @gqlbase/shared@0.1.4

## 0.1.3

### Patch Changes

- ef8127f: Bug fixes and improvements
- 5c99042: relations only typegen for MyddyAppSyncGraphQLPlugin option
  - @gqlbase/core@0.1.3
  - @gqlbase/shared@0.1.3

## 0.1.2

### Patch Changes

- feca490: Added `@belongsTo` on RelationsPlugin
- Updated dependencies [feca490]
  - @gqlbase/core@0.1.2
  - @gqlbase/shared@0.1.2

## 0.1.1

### Patch Changes

- 06cd90b: Base plugins fixes
  - fixes key generation for operation nodes
  - adds filters for `hasMany` relations on model fields
  - runs model transformation in two stages to avoid positioning issues

- 72052ff: Added MiddyAppSyncGraphQLPlugin
  - @gqlbase/core@0.1.1
  - @gqlbase/shared@0.1.1

## 0.1.0

### Minor Changes

- 24f07c8: Transformer outputs file contents rather than write to fs.

### Patch Changes

- Updated dependencies [24f07c8]
  - @gqlbase/shared@0.1.0
  - @gqlbase/core@0.1.0

## 0.0.10

### Patch Changes

- cbd7391: Update dependencies
- Updated dependencies [cbd7391]
  - @gqlbase/shared@0.0.10
  - @gqlbase/core@0.0.10

## 0.0.9

### Patch Changes

- Updated dependencies [ec95c9c]
  - @gqlbase/shared@0.0.9
  - @gqlbase/core@0.0.9

## 0.0.8

### Patch Changes

- 2f3cc44: Added `appSyncPreset` with `AppSynUtilsPlugin` for aws appsync support
- 2f3cc44: Added AppSyncSchemaGeneratorPlugin
  - @gqlbase/core@0.0.8
  - @gqlbase/shared@0.0.8

## 0.0.7

### Patch Changes

- 309082b: Add test coverage for `ConnectionPlugin` and detect conflicting pagination connection types from `RelationsPlugin`.
- 309082b: Add comprehensive test coverage for `NodeInterfacePlugin` and refactor plugin to use `TransformerPluginBase`.
- 309082b: Fix level-aware semantic nullability in type generation. `isSemanticNullable` now unwraps to the correct depth level, and `ModelTypesGeneratorPlugin` wraps inner list types with `Maybe` when they are nullable at their respective level.
- 309082b: Added InterfaceUtilsPlugin
- 309082b: Added RfcFeaturesPlugin
- Updated dependencies [309082b]
  - @gqlbase/core@0.0.7
  - @gqlbase/shared@0.0.7

## 0.0.6

### Patch Changes

- dc22a95: Add README files for all packages
- Updated dependencies [dc22a95]
  - @gqlbase/core@0.0.6
  - @gqlbase/shared@0.0.6

## 0.0.5

### Patch Changes

- acf3f62: Added ScalarsPlugin
- a53c785: Added ModelTypesGeneratorPlugin
  - @gqlbase/core@0.0.5
  - @gqlbase/shared@0.0.5

## 0.0.4

### Patch Changes

- deb9567: feat: base preset plugins
  - @gqlbase/core@0.0.4
  - @gqlbase/shared@0.0.4

## 0.0.2

### Patch Changes

- 68109c1: feat(plugins): added ModelPlugin
- Updated dependencies [52f4e5d]
- Updated dependencies [fbc977e]
- Updated dependencies [d09d42e]
- Updated dependencies [710da2f]
- Updated dependencies [68109c1]
- Updated dependencies [4cbe6d8]
  - @gqlbase/core@0.0.3
  - @gqlbase/shared@0.0.2
