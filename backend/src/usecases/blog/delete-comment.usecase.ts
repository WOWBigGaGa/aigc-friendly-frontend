import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import type { UsecaseSession } from '@app-types/auth/session.types';
import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@src/modules/blog/repositories/comment.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError, PERMISSION_ERROR } from '@core/common/errors/domain-error';
import { canManageComment } from '@core/blog/policy/blog-authorization.policy';
import { normalizeCommentId } from './blog.input.normalize';

@Injectable()
export class DeleteCommentUsecase {
  constructor(
    private readonly commentRepository: CommentRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
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
    const normalizedId = normalizeCommentId(id);

    const run = async (activeTransactionContext: PersistenceTransactionContext) => {
      const comment = await this.commentRepository.findById(normalizedId, activeTransactionContext);
      if (!comment) {
        throw new DomainError(BLOG_ERROR.COMMENT_NOT_FOUND, '评论不存在', {
          commentId: normalizedId,
        });
      }

      if (!canManageComment(session)) {
        throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限删除评论');
      }

      const children = await this.commentRepository.findChildrenRecursively(
        normalizedId,
        activeTransactionContext,
      );

      for (const child of children) {
        await this.commentRepository.softDelete(child.id, activeTransactionContext);
      }

      await this.commentRepository.softDelete(normalizedId, activeTransactionContext);
    };

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }
}
