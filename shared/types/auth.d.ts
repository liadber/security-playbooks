/** The request body of POST /auth/register and POST /auth/login. */
export interface Credentials {
  email: string;
  password: string;
}
