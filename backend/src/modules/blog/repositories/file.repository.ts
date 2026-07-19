import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getTypeOrmEntityManager } from '@src/infrastructure/database/transaction/typeorm-persistence-transaction-context';
import { FileEntity } from '../entities/file.entity';

@Injectable()
export class FileRepository {
  constructor(
    @InjectRepository(FileEntity)
    private readonly repository: Repository<FileEntity>,
  ) {}

  private getRepository(transactionContext?: PersistenceTransactionContext) {
    if (transactionContext) {
      const entityManager = getTypeOrmEntityManager(transactionContext);
      return entityManager.getRepository(FileEntity);
    }
    return this.repository;
  }

  async findAllWithPagination(
    page: number,
    limit: number,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ items: FileEntity[]; total: number }> {
    try {
      const repository = this.getRepository(transactionContext);
      const [items, total] = await repository.findAndCount({
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { items, total };
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询文件列表失败',
        {
          page,
          limit,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async findById(
    id: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<FileEntity | null> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.findOne({ where: { id } });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询文件失败',
        {
          id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async save(
    file: Partial<FileEntity>,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<FileEntity> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.save(file);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.CREATE_FAILED,
        '保存文件失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async delete(id: string, transactionContext?: PersistenceTransactionContext): Promise<void> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.delete(id);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.DELETE_FAILED,
        '删除文件失败',
        {
          id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }
}
