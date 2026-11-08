import { FIELD_LIMITS } from "../api/constants";
import { format, text } from "../i18n";
import { REGEX_PATTERN } from "./constants";

const describeLengthProblem = (password: string): string | null => {
  if (password.length < FIELD_LIMITS.passwordMin) {
    return format(text.password.tooShort, { count: FIELD_LIMITS.passwordMin });
  }

  if (password.length > FIELD_LIMITS.passwordMax) {
    return format(text.password.tooLong, { count: FIELD_LIMITS.passwordMax });
  }

  return null;
};

export const describeNewPasswordProblem = (password: string): string | null =>
  describeLengthProblem(password) ??
  (REGEX_PATTERN.PASSWORD.test(password) ? null : text.password.weak);

export const describeConfirmationProblem = (
  password: string,
  confirmation: string,
): string | null => (password === confirmation ? null : text.password.mismatch);

export const passwordComplexityHint = (): string =>
  format(text.password.complexityHint, { count: FIELD_LIMITS.passwordMin });
