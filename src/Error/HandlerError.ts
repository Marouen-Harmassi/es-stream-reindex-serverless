import { DataReindexError } from "~/Error/DataReindexError";

export class HandlerError extends DataReindexError {
  public constructor(message?: string, public errors: Error[] = []) {
    super(message);
  }
}
