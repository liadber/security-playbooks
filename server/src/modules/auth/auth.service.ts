import { HttpStatus } from '../../shared/constants/http-status.constants.js';
import { MONGO_DUPLICATE_KEY_CODE } from '../../shared/db/db.constants.js';
import { HttpError } from '../../shared/errors/http-error.js';
import { User } from '../users/user.model.js';
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
        if ((err as { code?: number }).code === MONGO_DUPLICATE_KEY_CODE) {
          throw new HttpError(HttpStatus.CONFLICT, 'Email is already registered');
        }
        throw err;
      }
    },

    async login({ email, password }) {
      const user = await User.findOne({ email });

      // Same message whether the email is unknown or the password is wrong.
      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        throw new HttpError(HttpStatus.UNAUTHORIZED, 'Invalid email or password');
      }

      return {
        user: { id: user.id, email: user.email },
        token: await tokens.signToken(user.id),
      };
    },

    async getCurrentUser(id) {
      const user = await User.findById(id);
      if (!user) {
        throw new HttpError(HttpStatus.UNAUTHORIZED, 'User no longer exists');
      }
      return { id: user.id, email: user.email };
    },
  };
}
