import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { FileStorageService, StoredFileInfo } from '@usecases/common/ports/file-storage.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';

@Injectable()
export class LocalFileStorageService implements FileStorageService {
  private readonly uploadDir: string;
  private readonly maxSizeBytes: number;
  private readonly allowedMimeTypes: string[];
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('fileStorage.uploadDir', './uploads');
    this.maxSizeBytes = this.configService.get<number>('fileStorage.maxSizeBytes', 10 * 1024 * 1024);
    this.allowedMimeTypes = this.configService.get<string[]>('fileStorage.allowedMimeTypes', [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ]);
    this.baseUrl = this.configService.get<string>('fileStorage.baseUrl', '');
  }

  async storeFile(params: {
    originalName: string;
    buffer: Buffer;
    mimeType: string;
  }): Promise<StoredFileInfo> {
    const { originalName, buffer, mimeType } = params;

    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new DomainError(BLOG_ERROR.VALIDATION_FAILED, '不支持的文件类型', {
        mimeType,
        allowedTypes: this.allowedMimeTypes,
      });
    }

    if (buffer.length > this.maxSizeBytes) {
      throw new DomainError(BLOG_ERROR.VALIDATION_FAILED, '文件大小超过限制', {
        size: buffer.length,
        maxSize: this.maxSizeBytes,
      });
    }

    const storedName = `${Date.now()}-${originalName}`;
    const relativePath = path.posix.join(this.uploadDir, storedName);
    const absolutePath = path.join(process.cwd(), relativePath);

    try {
      if (!fs.existsSync(path.dirname(absolutePath))) {
        fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
      }
      fs.writeFileSync(absolutePath, buffer);
    } catch (error) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '文件存储失败', {
        originalName,
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    const url = this.baseUrl
      ? `${this.baseUrl}/uploads/${storedName}`
      : `/uploads/${storedName}`;

    return {
      storedName,
      path: relativePath,
      url,
      size: buffer.length,
    };
  }

  async deleteFile(storedName: string): Promise<void> {
    const relativePath = path.posix.join(this.uploadDir, storedName);
    const absolutePath = path.join(process.cwd(), relativePath);

    try {
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (error) {
      throw new DomainError(BLOG_ERROR.DELETE_FAILED, '文件删除失败', {
        storedName,
        cause: error instanceof Error ? error.message : String(error),
      });
    }
  }

  getAllowedMimeTypes(): string[] {
    return [...this.allowedMimeTypes];
  }

  getMaxSizeBytes(): number {
    return this.maxSizeBytes;
  }
}
