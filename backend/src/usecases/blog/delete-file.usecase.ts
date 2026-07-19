import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import type { UsecaseSession } from '@app-types/auth/session.types';
import { Inject, Injectable } from '@nestjs/common';
import { FileRepository } from '@src/modules/blog/repositories/file.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import {
  FILE_STORAGE_SERVICE,
  type FileStorageService,
} from '@src/usecases/common/ports/file-storage.contract';
import { BLOG_ERROR, DomainError, PERMISSION_ERROR } from '@core/common/errors/domain-error';
import { isAdmin } from '@core/blog/policy/blog-authorization.policy';

@Injectable()
export class DeleteFileUsecase {
  constructor(
    private readonly fileRepository: FileRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    @Inject(FILE_STORAGE_SERVICE)
    private readonly fileStorageService: FileStorageService,
  ) {}

  async execute({
    id,
    session,
    transactionContext,
  }: {
    id: string;
    session: UsecaseSession;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<void> {
    if (!isAdmin(session)) {
      throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限删除文件');
    }

    const run = async (activeTransactionContext: PersistenceTransactionContext) => {
      const file = await this.fileRepository.findById(id, activeTransactionContext);
      if (!file) {
        throw new DomainError(BLOG_ERROR.FILE_NOT_FOUND, '文件不存在', { fileId: id });
      }

      await this.fileRepository.delete(id, activeTransactionContext);
      await this.fileStorageService.deleteFile(file.storedName);
    };

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }
}
