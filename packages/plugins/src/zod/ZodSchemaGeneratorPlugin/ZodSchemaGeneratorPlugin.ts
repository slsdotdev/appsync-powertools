import { ITransformerContext, TransformerPluginBase } from "@gqlbase/core";

/**
 * Generates Zod schemas for the defined types in the GraphQL schema. This can be used for runtime validation of data against the schema.
 *
 * @example
 * ```graphql
 * # schema.graphql
 * enum UserRole {
 *   ADMIN
 *   USER
 * }
 *
 * type User {
 *   id: ID!
 *   name: String! `@constraint(min: 3, max: 50)`
 *   email: String!
 *   role: UserRole!
 * }
 * ```
 *
 * ```typescript
 * // generated/zod/validators.typegen.ts
 * import { z } from "zod";
 *
 * export const UserRoleSchema = z.enum(["ADMIN", "USER"]);
 *
 * export const UserSchema = z.object({
 *   id: z.string(),
 *   name: z.string().min(3).max(50),
 *   email: z.string(),
 *   role: UserRoleSchema,
 * });
 * ```
 */

export class ZodSchemaGeneratorPlugin extends TransformerPluginBase {
  constructor(context: ITransformerContext) {
    super("ZodSchemaGeneratorPlugin", context);
  }
}
