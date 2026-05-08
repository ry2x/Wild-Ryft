export class SyncError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'CONFIG_ERROR'
      | 'FETCH_ERROR'
      | 'NORMALIZATION_ERROR'
      | 'DB_ERROR'
      | 'UNKNOWN_ERROR',
    public readonly retryable: boolean = false,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'SyncError';
  }
}
