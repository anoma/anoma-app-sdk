import { ResponseError } from "api";
import { ZodError } from "zod";

function hasProp<T extends string>(
  value: unknown,
  prop: T
): value is Record<T, unknown> {
  return typeof value === "object" && value !== null && prop in value;
}

export const getFirstErrorMessage = (
  ...args: (Error | ZodError | ResponseError | unknown | undefined | null)[]
): string | undefined => {
  const error = args.find(Boolean);
  if (!error) return;

  // API errors are parsed in to ResponseError, and if they're descriptive,
  // they'll have a `json` property
  if (error instanceof ResponseError && hasProp(error, "json")) {
    const { json } = error;
    if (hasProp(json, "error")) {
      return json.error?.toString();
    }
    if (hasProp(json, "errors") && hasProp(json.errors, "detail")) {
      return json.errors.detail?.toString();
    }
  }

  if (error instanceof ZodError && error.issues.length > 0) {
    return error.issues[0].message;
  }

  if (error instanceof Error) {
    if ("shortMessage" in error) {
      return String(error.shortMessage);
    }

    return error.message;
  }

  return String(error);
};
