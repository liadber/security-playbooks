/**
 * The message is sent to the client as is. Anything else thrown is answered with a
 * generic 500 and its details are not exposed.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
