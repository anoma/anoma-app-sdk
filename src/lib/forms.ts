import { ResponseError } from "api";
import { ZodError } from "zod";

export const getFirstErrorMessage = (
  ...args: (Error | ZodError | ResponseError | unknown | undefined | null)[]
): string | undefined => {
  const error = args.find(Boolean);
  if (!error) return;

  // API errors are parsed in to ResponseError, and if they're descriptive,
  // they'll have a `json` property
  if (
    error instanceof ResponseError &&
    error.json &&
    typeof error.json === "object" &&
    "error" in error.json
  ) {
    return error.json.error?.toString();
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
