import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import type { UsecaseSession } from '@app-types/auth/session.types';
import { Inject, Injectable } from '@nestjs/common';
import { FileRepository } from '@src/modules/blog/repositories/file.repository';
import { FileQueryService } from '@src/modules/blog/queries/file.query.service';
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
import { FileDTO } from '@src/adapters/api/graphql/blog/types/file.dto';

@Injectable()
export class UploadFileUsecase {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly fileQueryService: FileQueryService,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    @Inject(FILE_STORAGE_SERVICE)
    private readonly fileStorageService: FileStorageService,
  ) {}

  async execute({
    filename,
    content,
    mimeType,
    session,
    transactionContext,
  }: {
    filename: string;
    content: string;
    mimeType: string;
    session: UsecaseSession;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<FileDTO> {
    if (!isAdmin(session)) {
      throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限上传文件');
    }

    const base64Data = content.split(',')[1] || content;
    const buffer = Buffer.from(base64Data, 'base64');

    const storedInfo = await this.fileStorageService.storeFile({
      originalName: filename,
      buffer,
      mimeType,
    });

    const run = async (
      activeTransactionContext: PersistenceTransactionContext,
    ): Promise<FileDTO> => {
      const file = await this.fileRepository.save(
        {
          originalName: filename,
          storedName: storedInfo.storedName,
          path: storedInfo.path,
          url: storedInfo.url,
          mimeType,
          size: storedInfo.size,
          uploadedBy: String(session.accountId),
        },
        activeTransactionContext,
      );

      const result = await this.fileQueryService.getFileById(file.id, activeTransactionContext);
      if (!result) {
        throw new DomainError(BLOG_ERROR.FILE_NOT_FOUND, '文件保存后查询失败');
      }
      return result;
    };

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }
}
