import { createQueryResolver, createResolver, defineResolvers } from "@middy-appsync/graphql";
import { isCognito } from "@middy-appsync/graphql/utils";
import { db } from "../lib/db";

export const queryMe = createQueryResolver({
  fieldName: "me",
  resolve: async ({ identity }) => {
    if (!isCognito(identity)) {
      throw new Error("Unauthorized");
    }

    const user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.id, identity.sub),
      with: {
        vendorMembership: true,
      },
    });

    return user ?? null;
  },
});

const userAddresses = createResolver({
  typeName: "User",
  fieldName: "addresses",
  resolve: async ({ source, args }) => {
    const userAddresses = await db.query.addresses.findMany({
      where: (address, { eq }) => eq(address.userId, source.id),
      limit: args.first ?? 100,
    });

    const edges = userAddresses.map((address) => ({
      cursor: address.id,
      node: address,
    }));

    return {
      edges,
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
