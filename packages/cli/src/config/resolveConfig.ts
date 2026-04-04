import { access, constants } from "node:fs/promises";
import path from "node:path";
import { stripUndef } from "@gqlbase/shared/utils";
import { Config, DEFAULT_CONFIG } from "./config.js";

export interface CliOptions {
  config?: string;
  output?: string;
  verbose?: boolean;
  watch?: boolean;
}

export const DEFAULT_CONFIG_FILES = [
  // "gqlbase.config.ts",
  "gqlbase.config.js",
  "gqlbase.config.mjs",
  "gqlbase.config.cjs",
] as const;

const resolveConfigFilePath = async (filePath?: string): Promise<string | null> => {
  if (filePath) {
    try {
      await access(path.resolve(process.cwd(), filePath), constants.F_OK);
      return path.resolve(process.cwd(), filePath);
    } catch {
      return null;
    }
  }

  for (const configFile of DEFAULT_CONFIG_FILES) {
    try {
      await access(path.resolve(process.cwd(), configFile), constants.F_OK);
      return path.resolve(process.cwd(), configFile);
    } catch {
      // Continue to next file
      continue;
    }
  }

  return null;
};

export const loadConfigFile = async (filePath?: string): Promise<Partial<Config> | null> => {
  try {
    const resolvedFilePath = await resolveConfigFilePath(filePath);

    if (!resolvedFilePath) {
      console.warn(`No configuration file found. Searched for: ${DEFAULT_CONFIG_FILES.join(", ")}`);

      return null;
    }

    const { default: config } = await import(resolvedFilePath);
    return config;
  } catch (error) {
    console.error(`Failed to load configuration file at ${filePath}:`, error);
    return null;
  }
};

export interface CliOverrides extends CliOptions {
  source: string | undefined;
}

export async function resolveConfig(
  overrides: CliOverrides = { source: undefined }
): Promise<Config> {
  const configFromFile = await loadConfigFile(overrides.config);

  if (!configFromFile) {
    throw new Error(
      "No configuration file found. Please create a configuration file or provide one using the --config option."
    );
  }

  return {
    ...DEFAULT_CONFIG,
    ...configFromFile,
    ...stripUndef(overrides),
  } as Config;
}
