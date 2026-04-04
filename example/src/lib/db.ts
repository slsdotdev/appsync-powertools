import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../../generated/drizzle/schema";

export const db = drizzle("<DATABASE_URL>", { schema });
