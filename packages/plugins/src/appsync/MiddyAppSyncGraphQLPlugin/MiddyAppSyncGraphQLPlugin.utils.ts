export type AppSyncAuthorizationMode = "cognito" | "iam" | "oidc" | "apiKey" | "lambda";

export interface MiddyAppSyncGraphQLPluginOptions {
  /**
   * Allowed authorization modes for your AppSync GraphQL API.
   * It will narrow down the identity types in the generated definition.
   */
  authorizationModes?: AppSyncAuthorizationMode[];

  /**
   * Whether to generate definitions only for operations and relations (fields that reference other models) without generating definitions for regular fields.
   * This can be useful to avoid verbosity in the type suggestions.
   * @default true
   */
  relationsOnly?: boolean;
}

export const getAuthModeIdentityType = (mode: AppSyncAuthorizationMode): string => {
  switch (mode) {
    case "cognito":
      return "AppSyncIdentityCognito";
    case "iam":
      return "AppSyncIdentityIAM";
    case "oidc":
      return "AppSyncIdentityOIDC";
    case "lambda":
      return "AppSyncIdentityLambda";
    case "apiKey":
      return "null"; // API Key auth doesn't have an identity object
    default:
      throw new Error(`Unsupported authorization mode: ${mode}`);
  }
};
