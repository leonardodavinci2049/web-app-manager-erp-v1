import type { ZodIssue, ZodType } from "zod";

type ParseEnvOptions = {
  scope: "client" | "server";
  sourceFiles: string[];
};

function formatIssue(issue: ZodIssue) {
  const envName = issue.path.join(".") || "<unknown>";

  if (issue.code === "invalid_type" && issue.input === undefined) {
    return `- ${envName}: missing value`;
  }

  if (issue.code === "invalid_format") {
    return `- ${envName}: invalid format (${issue.format})`;
  }

  if (issue.code === "too_small") {
    return `- ${envName}: value is too short or below the minimum`;
  }

  if (issue.code === "too_big") {
    return `- ${envName}: value is too long or above the maximum`;
  }

  return `- ${envName}: ${issue.message}`;
}

function buildEnvErrorMessage(issues: ZodIssue[], options: ParseEnvOptions) {
  const heading =
    options.scope === "client"
      ? "Invalid public environment variables"
      : "Invalid server environment variables";
  const files = options.sourceFiles.join(", ");
  const formattedIssues = issues.map(formatIssue).join("\n");

  return [
    `❌ ${heading}.`,
    `Checked files: ${files}.`,
    "Fix the values below and restart the Next.js process:",
    formattedIssues,
  ].join("\n");
}

export function parseEnv<TValues>(
  schema: ZodType<TValues>,
  values: unknown,
  options: ParseEnvOptions,
) {
  const result = schema.safeParse(values);

  if (!result.success) {
    throw new Error(buildEnvErrorMessage(result.error.issues, options));
  }

  return result.data;
}
