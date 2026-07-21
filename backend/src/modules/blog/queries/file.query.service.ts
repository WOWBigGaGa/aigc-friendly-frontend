import { Injectable } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repository';
import { FileEntity } from '../entities/file.entity';
import { FileDTO } from '@src/adapters/api/graphql/blog/types/file.dto';
import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';

@Injectable()
export class FileQueryService {
  constructor(private readonly fileRepository: FileRepository) {}

  private mapToDTO(entity: FileEntity): FileDTO {
    return {
      id: entity.id,
      originalName: entity.originalName,
      storedName: entity.storedName,
      path: entity.path,
      url: entity.url,
      mimeType: entity.mimeType,
      size: entity.size,
      uploadedBy: entity.uploadedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  async getFiles(
    page: number,
    limit: number,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ items: FileDTO[]; total: number; page: number; pageSize: number }> {
    const result = await this.fileRepository.findAllWithPagination(page, limit, transactionContext);
    return {
      items: result.items.map((entity) => this.mapToDTO(entity)),
      total: result.total,
      page,
      pageSize: limit,
    };
  }

  async getFileById(
    id: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<FileDTO | null> {
    const entity = await this.fileRepository.findById(id, transactionContext);
    return entity ? this.mapToDTO(entity) : null;
  }
}
