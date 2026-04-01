import { BaseScalar, type BaseScalarName } from "../../base/ScalarsPlugin/ScalarsPlugin.utils.js";

export interface ZodSchemaGeneratorPluginOptions {
  /**
   * The output file name for the generated schemas.
   * @default "validators.typegen.ts"
   */
  fileName?: string;

  /**
   * Whether to include the generated schemas in the output object.
   * @default false
   */
  emitOutput?: boolean;
}

export const DEFAULT_OPTIONS: Required<ZodSchemaGeneratorPluginOptions> = {
  fileName: "validators.typegen.ts",
  emitOutput: false,
} as const;

export const mergeOptions = (
  options?: ZodSchemaGeneratorPluginOptions
): Required<ZodSchemaGeneratorPluginOptions> => {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
  };
};

export const CUSTOM_SCALAR_ZOD_MAP: Record<BaseScalarName, string> = {
  [BaseScalar.DATE_TIME]: "z.iso.datetime()",
  [BaseScalar.DATE]: "z.iso.date()",
  [BaseScalar.TIME]: "z.iso.time()",
  [BaseScalar.TIMESTAMP]: "z.number()",
  [BaseScalar.UUID]: "z.uuid()",
  [BaseScalar.URL]: "z.url()",
  [BaseScalar.EMAIL_ADDRESS]: "z.email()",
  [BaseScalar.PHONE_NUMBER]: "z.e164()",
  [BaseScalar.IP_ADDRESS]: "z.ip()",
  [BaseScalar.JSON]: "z.record(z.string(), z.unknown())",
};
