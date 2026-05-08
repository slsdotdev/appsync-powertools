import { AuroraDSQLPool } from "@aws/aurora-dsql-node-postgres-connector";
import { createPgSession } from "dsqlbase/pg";
import { createClient } from "dsqlbase";
import * as schema from "../../generated/dsqlbase.schema";
import { getEnv } from "./env";

const session = createPgSession(
  new AuroraDSQLPool({
    host: getEnv("DATABASE_URL"),
    user: getEnv("DATABASE_USER"),
  })
);

export const dsql = createClient({ session, schema });
