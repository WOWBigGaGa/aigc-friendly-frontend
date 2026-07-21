import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { Inject, Injectable } from '@nestjs/common';
import { ArticleRepository } from '@src/modules/blog/repositories/article.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { normalizeArticleId } from './blog.input.normalize';

@Injectable()
export class IncrementArticleCounterUsecase {
  constructor(
    private readonly articleRepository: ArticleRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async incrementViewCount(
    id: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<void> {
    return this.increment(id, 'view', transactionContext);
  }

  async incrementLikeCount(
    id: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<void> {
    return this.increment(id, 'like', transactionContext);
  }

  private async increment(
    id: string,
    type: 'view' | 'like',
    transactionContext?: PersistenceTransactionContext,
  ): Promise<void> {
    const normalizedId = normalizeArticleId(id);

    const run = async (activeTransactionContext: PersistenceTransactionContext) => {
      const article = await this.articleRepository.findById(normalizedId, activeTransactionContext);
      if (!article) {
        throw new DomainError(BLOG_ERROR.ARTICLE_NOT_FOUND, '文章不存在', {
          articleId: normalizedId,
        });
      }

      if (type === 'view') {
        await this.articleRepository.incrementViewCount(normalizedId, activeTransactionContext);
      } else {
        await this.articleRepository.incrementLikeCount(normalizedId, activeTransactionContext);
      }
    };

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }
}
