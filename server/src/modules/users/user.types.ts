export interface IUser {
  email: string;
  passwordHash: string;
}

/** A user as returned to clients: never the password hash. */
export interface PublicUser {
  id: string;
  email: string;
}
