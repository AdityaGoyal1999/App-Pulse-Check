export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_REQUIREMENTS = [
  {
    id: "min-length",
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (password: string) => password.length >= PASSWORD_MIN_LENGTH,
  },
] as const;

export type AuthFieldErrors = {
  email?: string;
  password?: string;
};

export function validateAuthForm(email: string, password: string) {
  const trimmed = email.trim().toLowerCase();
  const errors: AuthFieldErrors = {};

  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    errors.email = "Enter a valid email address";
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }

  return { trimmed, errors, valid: Object.keys(errors).length === 0 };
}
