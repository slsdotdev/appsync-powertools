import { createQueryResolver, createResolver, defineResolvers } from "@middy-appsync/graphql";
import { isCognito } from "@middy-appsync/graphql/utils";

export const queryMe = createQueryResolver({
  fieldName: "me",
  resolve: async ({ identity }) => {
    if (!isCognito(identity)) {
      throw new Error("Unauthorized");
    }

    return {
      id: identity.sub,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      roles: ["GUEST"],
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __typename: "User",
    };
  },
});

const userAddresses = createResolver({
  typeName: "User",
  fieldName: "addresses",
  resolve: async () => {
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };
  },
});

export default defineResolvers(queryMe, userAddresses);
