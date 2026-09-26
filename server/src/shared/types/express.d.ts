declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth once the token in the auth cookie has been verified. */
      userId?: string;
    }
  }
}

export {};
