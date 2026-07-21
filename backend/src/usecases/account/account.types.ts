import { type UsecaseSession } from '@app-types/auth/session.types';

export interface ChangePasswordParams {
  session: UsecaseSession;
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResult {
  success: boolean;
  message?: string | null;
  errorCode?: string | null;
}
