export const BuildInScalar = Object.freeze({
  ID: "ID",
  STRING: "String",
  INT: "Int",
  FLOAT: "Float",
  BOOLEAN: "Boolean",
});

export type BuildInScalar = (typeof BuildInScalar)[keyof typeof BuildInScalar];

export const isBuildInScalar = (typeName: string): typeName is BuildInScalar => {
  return Object.values(BuildInScalar).includes(typeName as BuildInScalar);
};
