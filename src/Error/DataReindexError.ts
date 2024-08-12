export class DataReindexError extends Error {
  public constructor(message?: string, public previous?: Error) {
    super(message);
  }
}
