import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { FriendLinkRepository } from '../repositories/friend-link.repository';
import { FriendLinkEntity } from '../entities/friend-link.entity';
import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';

@Injectable()
export class FriendLinkQueryService {
  constructor(private readonly friendLinkRepository: FriendLinkRepository) {}

  async getAllFriendLinks(
    transactionContext?: PersistenceTransactionContext,
  ): Promise<FriendLinkEntity[]> {
    try {
      return await this.friendLinkRepository.findAll(transactionContext);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取友链列表失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async getFriendLinkById(
    id: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<FriendLinkEntity | null> {
    try {
      return await this.friendLinkRepository.findById(id, transactionContext);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取友链失败',
        {
          friendLinkId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }
}
