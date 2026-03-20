# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

gqlbase is a GraphQL schema transformer and code generator. It processes GraphQL schemas using directives (like `@model`, `@hasOne`, `@hasMany`) to generate CRUD operations, relation types, filter inputs, and TypeScript code. The project has two primary functions: **schema transformation** (adding types/fields/operations based on directives) and **code generation** (producing TypeScript types and other artifacts from the transformed schema).

## Commands

```bash
npm run build          # Build all packages (TypeScript via tsc, orchestrated by Turbo)
npm run dev            # Watch mode for all packages
npm run lint           # ESLint with auto-fix
npm run test           # Run all tests (Vitest)
npm run coverage       # Test coverage report
npx vitest run packages/core   # Run tests for a single package
npx vitest run path/to/file    # Run a single test file
```

## Monorepo Structure

Five packages under `packages/`, managed with npm workspaces and Turborepo:

- **@gqlbase/core** — Transformer engine, plugin system, and definition node classes
- **@gqlbase/cli** — CLI entry point, config loading, file watching
- **@gqlbase/plugins** — Built-in plugins organized into `base/` and `relay/` presets
- **@gqlbase/shared** — Logger, file I/O, error classes, string formatting utilities
- **gqlbase** — Meta-package re-exporting all of the above

## Architecture

### Transformer Pipeline

`GraphQLTransformer` (core) processes schemas through 7 ordered phases. Each phase calls matching plugins:

1. **Validation** — Parse and validate the schema
2. **Before** — Pre-processing hooks
3. **Normalize** — Plugins prepare the schema (add fields, directives)
4. **Execute** — Core transformation (generate new types from directives)
5. **Generate** — Code generation (TypeScript types, etc.)
6. **Cleanup** — Remove internal/temporary directives and fields
7. **After** — Finalization; then collect `output()` from all plugins

### Definition Node System

All GraphQL AST nodes are wrapped in custom classes under `packages/core/src/definition/`. Key classes: `DocumentNode`, `ObjectNode`, `FieldNode`, `DirectiveNode`, `TypeNode`, `InputObjectNode`, `EnumNode`, `UnionNode`, `ScalarNode`, `InterfaceNode`. Each has `serialize()` (to graphql-js AST) and `fromDefinition()` (from graphql-js AST). `DocumentNode` maintains a `Map<name, DefinitionNode>` for lookups.

### Plugin System

Plugins implement `ITransformerPlugin` with lifecycle hooks matching the pipeline phases. The `match(definition)` method controls which definitions a plugin processes. Use `TransformerPluginBase` as the abstract base class and `createPluginFactory<TOptions>()` to create type-safe factory functions.

**Built-in presets:**
- `basePreset()` — ScalarsPlugin, UtilitiesPlugin, ModelPlugin, RelationsPlugin, SchemaGeneratorPlugin, ModelTypesGeneratorPlugin
- `relayPreset()` — NodeInterfacePlugin, ConnectionPlugin (Relay pagination)

### Key Directives

| Directive | Purpose |
|-----------|---------|
| `@model` | Marks type for CRUD operation generation |
| `@hasOne` / `@hasMany` | Relation field markers |
| `@readOnly` / `@writeOnly` | Field visibility in inputs/outputs |
| `@clientOnly` / `@serverOnly` | Schema scope filtering |
| `@createOnly` / `@updateOnly` / `@filterOnly` | Operation-specific fields |
| `@gqlbase_internal` | Marks definitions for cleanup (internal use) |
| `@gqlbase_typehint` | Maps scalars to TypeScript types (internal use) |

## Code Conventions

- ES modules throughout (`"type": "module"`), use `.js` extensions in imports
- Strict TypeScript with `nodenext` module resolution
- PascalCase for classes (`ModelPlugin`), camelCase for factory exports (`modelPlugin`)
- Named exports only, no default exports for utilities
- Double quotes, semicolons, trailing commas (es5), 100 char print width (Prettier)
- Custom error classes: `TransformerValidationError`, `InvalidDefinitionError`, `TransformerPluginExecutionError`
- Hierarchical logger with scopes: `logger.createChild('scope')`

## Release

Uses Changesets for versioning. All `@gqlbase/*` packages are version-linked (fixed group). CI runs build → lint → test → publish on main.
