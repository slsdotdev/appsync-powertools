import { createQueryResolver } from "@middy-appsync/graphql";

export const getUser = createQueryResolver({
  fieldName: "getLineItem",
  resolve: async () => {
    return null;
  },
});
