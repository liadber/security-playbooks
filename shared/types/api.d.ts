/** The body of every error response; validation failures add one message per field. */
export interface ErrorResponse {
  error: string;
  fields?: Record<string, string>;
}
