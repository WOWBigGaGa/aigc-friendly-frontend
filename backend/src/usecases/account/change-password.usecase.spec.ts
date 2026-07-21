// src/usecases/account/change-password.usecase.spec.ts

import { AccountStatus } from '@app-types/models/account.types';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from '@src/modules/account/base/services/account.service';
import { TRANSACTION_RUNNER } from '@src/usecases/common/ports/transaction-runner.contract';
import { ChangePasswordUsecase } from './change-password.usecase';

describe('ChangePasswordUsecase', () => {
  let usecase: ChangePasswordUsecase;
  let accountService: jest.Mocked<AccountService>;

  const mockTransactionRunner = {
    run: jest.fn((callback) => callback({})),
  };

  const adminSession = { accountId: 1, roles: ['ADMIN'] };

  const createMockAccountEntity = (
    overrides: Partial<{ id: number; loginPassword: string; createdAt: Date }> = {},
  ) => ({
    id: overrides.id || 1,
    loginName: 'admin',
    loginEmail: 'admin@example.com',
    loginPassword: overrides.loginPassword || 'hashed_password',
    status: AccountStatus.ACTIVE,
    recentLoginHistory: null,
    identityHint: 'ADMIN',
    createdAt: overrides.createdAt || new Date('2024-01-01'),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUsecase,
        {
          provide: AccountService,
          useValue: {
            lockByIdForUpdate: jest.fn(),
            updateAccountPasswordHash: jest.fn(),
          },
        },
        { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
      ],
    }).compile();

    usecase = module.get<ChangePasswordUsecase>(ChangePasswordUsecase);
    accountService = module.get(AccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change password successfully when old password is correct', async () => {
    const createdAt = new Date('2024-01-01');
    const oldPassword = 'oldPassword123!';
    const newPassword = 'newPassword456!';
    const oldPasswordHash = AccountService.hashPasswordWithTimestamp(oldPassword, createdAt);
    const newPasswordHash = AccountService.hashPasswordWithTimestamp(newPassword, createdAt);

    accountService.lockByIdForUpdate.mockResolvedValue(
      createMockAccountEntity({ id: 1, loginPassword: oldPasswordHash, createdAt }),
    );

    const result = await usecase.execute({
      session: adminSession,
      oldPassword,
      newPassword,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBeNull();
    expect(accountService.lockByIdForUpdate).toHaveBeenCalledWith(1, expect.any(Object));
    expect(accountService.updateAccountPasswordHash).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 1,
        passwordHash: newPasswordHash,
      }),
    );
  });

  it('should return failure when old password is incorrect', async () => {
    const createdAt = new Date('2024-01-01');
    const oldPassword = 'wrongPassword';
    const newPassword = 'newPassword456!';
    const correctPasswordHash = AccountService.hashPasswordWithTimestamp('correctPassword', createdAt);

    accountService.lockByIdForUpdate.mockResolvedValue(
      createMockAccountEntity({ id: 1, loginPassword: correctPasswordHash, createdAt }),
    );

    const result = await usecase.execute({
      session: adminSession,
      oldPassword,
      newPassword,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('原密码错误');
    expect(accountService.updateAccountPasswordHash).not.toHaveBeenCalled();
  });

  it('should return failure when account is not found', async () => {
    accountService.lockByIdForUpdate.mockRejectedValue(new Error('账户不存在'));

    const result = await usecase.execute({
      session: adminSession,
      oldPassword: 'oldPassword123!',
      newPassword: 'newPassword456!',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('账户不存在');
    expect(accountService.updateAccountPasswordHash).not.toHaveBeenCalled();
  });

  it('should return failure when old password is empty', async () => {
    const createdAt = new Date('2024-01-01');
    const oldPasswordHash = AccountService.hashPasswordWithTimestamp('correctPassword', createdAt);

    accountService.lockByIdForUpdate.mockResolvedValue(
      createMockAccountEntity({ id: 1, loginPassword: oldPasswordHash, createdAt }),
    );

    const result = await usecase.execute({
      session: adminSession,
      oldPassword: '',
      newPassword: 'newPassword456!',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('密码不能为空或纯空白字符');
    expect(accountService.updateAccountPasswordHash).not.toHaveBeenCalled();
  });

  it('should return failure when new password is empty', async () => {
    const createdAt = new Date('2024-01-01');
    const oldPassword = 'oldPassword123!';
    const oldPasswordHash = AccountService.hashPasswordWithTimestamp(oldPassword, createdAt);

    accountService.lockByIdForUpdate.mockResolvedValue(
      createMockAccountEntity({ id: 1, loginPassword: oldPasswordHash, createdAt }),
    );

    const result = await usecase.execute({
      session: adminSession,
      oldPassword,
      newPassword: '',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('密码不能为空或纯空白字符');
    expect(accountService.updateAccountPasswordHash).not.toHaveBeenCalled();
  });

  it('should return failure when old password contains leading/trailing spaces', async () => {
    const createdAt = new Date('2024-01-01');
    const oldPasswordHash = AccountService.hashPasswordWithTimestamp('correctPassword', createdAt);

    accountService.lockByIdForUpdate.mockResolvedValue(
      createMockAccountEntity({ id: 1, loginPassword: oldPasswordHash, createdAt }),
    );

    const result = await usecase.execute({
      session: adminSession,
      oldPassword: ' correctPassword',
      newPassword: 'newPassword456!',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('密码首尾不能包含空格');
    expect(accountService.updateAccountPasswordHash).not.toHaveBeenCalled();
  });

  it('should return failure when new password contains leading/trailing spaces', async () => {
    const createdAt = new Date('2024-01-01');
    const oldPassword = 'oldPassword123!';
    const oldPasswordHash = AccountService.hashPasswordWithTimestamp(oldPassword, createdAt);

    accountService.lockByIdForUpdate.mockResolvedValue(
      createMockAccountEntity({ id: 1, loginPassword: oldPasswordHash, createdAt }),
    );

    const result = await usecase.execute({
      session: adminSession,
      oldPassword,
      newPassword: 'newPassword456! ',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('密码首尾不能包含空格');
    expect(accountService.updateAccountPasswordHash).not.toHaveBeenCalled();
  });

  it('should handle transaction errors gracefully', async () => {
    const createdAt = new Date('2024-01-01');
    const oldPassword = 'oldPassword123!';
    const oldPasswordHash = AccountService.hashPasswordWithTimestamp(oldPassword, createdAt);

    accountService.lockByIdForUpdate.mockResolvedValue(
      createMockAccountEntity({ id: 1, loginPassword: oldPasswordHash, createdAt }),
    );
    accountService.updateAccountPasswordHash.mockRejectedValue(new Error('Database connection failed'));

    const result = await usecase.execute({
      session: adminSession,
      oldPassword,
      newPassword: 'newPassword456!',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Database connection failed');
  });
});