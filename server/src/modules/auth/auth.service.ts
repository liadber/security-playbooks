import { HttpStatus } from '../../shared/constants/http-status.constants.js';
import { isDuplicateKeyError } from '../../shared/db/duplicate-key.js';
import { HttpError } from '../../shared/errors/http-error.js';
import { User } from '../users/user.model.js';
import { AUTH_ERRORS } from './auth.constants.js';
import type { AuthService, TokenService } from './auth.types.js';
import { hashPassword, verifyPassword } from './password.service.js';

export function createAuthService(tokens: TokenService): AuthService {
  return {
    async register({ email, password }) {
      const passwordHash = await hashPassword(password);

      try {
        const user = await User.create({ email, passwordHash });
        return { id: user.id, email: user.email };
      } catch (err) {
        if (isDuplicateKeyError(err)) {
          throw new HttpError(HttpStatus.CONFLICT, AUTH_ERRORS.EMAIL_TAKEN);
        }
        throw err;
      }
    },

    async login({ email, password }) {
      const user = await User.findOne({ email });

      // Same message whether the email is unknown or the password is wrong.
      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        throw new HttpError(HttpStatus.UNAUTHORIZED, AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      return {
        user: { id: user.id, email: user.email },
        token: await tokens.signToken(user.id),
      };
    },

    async getCurrentUser(id) {
      const user = await User.findById(id);
      if (!user) {
        throw new HttpError(HttpStatus.UNAUTHORIZED, AUTH_ERRORS.USER_GONE);
      }
      return { id: user.id, email: user.email };
    },
  };
}
