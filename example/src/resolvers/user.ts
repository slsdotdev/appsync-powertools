import { createQueryResolver, createResolver, defineResolvers } from "@middy-appsync/graphql";
import { isCognito } from "@middy-appsync/graphql/utils";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { users } from "../../generated/drizzle/schema";

export const queryMe = createQueryResolver({
  fieldName: "me",
  resolve: async ({ identity }) => {
    if (!isCognito(identity)) {
      throw new Error("Unauthorized");
    }

    const user = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        displayName: users.displayName,
        email: users.email,
        phone: users.phone,
        roles: users.roles,
        avatarUrl: users.avatarUrl,
        emailVerifiedAt: users.emailVerifiedAt,
        version: users.version,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, identity.sub))
      .limit(1)
      .then((res) => res[0]);

    return {
      ...user,
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
