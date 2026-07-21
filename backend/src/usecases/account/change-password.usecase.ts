import { AUTH_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Inject, Injectable } from '@nestjs/common';
import { AccountService } from '@src/modules/account/base/services/account.service';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { type ChangePasswordParams, type ChangePasswordResult } from './account.types';

@Injectable()
export class ChangePasswordUsecase {
  constructor(
    private readonly accountService: AccountService,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(params: ChangePasswordParams): Promise<ChangePasswordResult> {
    const { session, oldPassword, newPassword } = params;
    const accountId = session.accountId;

    try {
      const result = await this.transactionRunner.run<ChangePasswordResult>(
        async (transactionContext) => {
          const account = await this.accountService.lockByIdForUpdate(
            accountId,
            transactionContext,
          );

          const isValid = AccountService.verifyPassword(
            oldPassword,
            account.loginPassword,
            account.createdAt,
          );

          if (!isValid) {
            throw new DomainError(AUTH_ERROR.INVALID_PASSWORD, '原密码错误');
          }

          const newPasswordHash = AccountService.hashPasswordWithTimestamp(
            newPassword,
            account.createdAt,
          );

          await this.accountService.updateAccountPasswordHash({
            accountId,
            passwordHash: newPasswordHash,
            transactionContext,
          });

          return { success: true, message: null, errorCode: null };
        },
      );

      return result;
    } catch (error) {
      if (error instanceof DomainError) {
        return {
          success: false,
          message: error.message,
          errorCode: error.code,
        };
      }
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
          errorCode: null,
        };
      }
      return {
        success: false,
        message: '修改密码失败',
        errorCode: null,
      };
    }
  }
}
