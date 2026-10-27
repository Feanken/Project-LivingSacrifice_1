export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}
export function normalizeDatabaseError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError(500, "Data tidak dapat dimuat. Silakan coba kembali.");
}
