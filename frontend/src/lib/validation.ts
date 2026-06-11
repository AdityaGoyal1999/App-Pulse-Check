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

  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return { trimmed, errors, valid: Object.keys(errors).length === 0 };
}
