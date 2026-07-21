import { Test, TestingModule } from '@nestjs/testing';
import { FileEntity } from '../entities/file.entity';
import { FileRepository } from '../repositories/file.repository';
import { FileQueryService } from './file.query.service';

describe('FileQueryService', () => {
  let service: FileQueryService;
  let fileRepository: any;

  const mockFileEntity = {
    id: 'file-1',
    originalName: 'test-image.jpg',
    storedName: '1234567890-test-image.jpg',
    path: './uploads/1234567890-test-image.jpg',
    url: 'http://localhost:3000/uploads/1234567890-test-image.jpg',
    mimeType: 'image/jpeg',
    size: 1024000,
    uploadedBy: '1',
    createdAt: new Date('2026-07-20'),
    updatedAt: new Date('2026-07-20'),
  };

  beforeEach(async () => {
    fileRepository = {
      findAllWithPagination: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FileQueryService, { provide: FileRepository, useValue: fileRepository }],
    }).compile();

    service = module.get<FileQueryService>(FileQueryService);
  });

  describe('getFiles', () => {
    it('should return paginated files with mapped DTOs', async () => {
      fileRepository.findAllWithPagination.mockResolvedValue({
        items: [mockFileEntity],
        total: 1,
      });

      const result = await service.getFiles(1, 10);

      expect(result).toEqual({
        items: [
          {
            id: 'file-1',
            originalName: 'test-image.jpg',
            storedName: '1234567890-test-image.jpg',
            path: './uploads/1234567890-test-image.jpg',
            url: 'http://localhost:3000/uploads/1234567890-test-image.jpg',
            mimeType: 'image/jpeg',
            size: 1024000,
            uploadedBy: '1',
            createdAt: new Date('2026-07-20'),
            updatedAt: new Date('2026-07-20'),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      });
      expect(fileRepository.findAllWithPagination).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('should handle empty file list', async () => {
      fileRepository.findAllWithPagination.mockResolvedValue({
        items: [],
        total: 0,
      });

      const result = await service.getFiles(1, 10);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should pass transaction context when provided', async () => {
      const mockTransactionContext = {} as any;
      fileRepository.findAllWithPagination.mockResolvedValue({ items: [], total: 0 });

      await service.getFiles(1, 10, mockTransactionContext);

      expect(fileRepository.findAllWithPagination).toHaveBeenCalledWith(
        1,
        10,
        mockTransactionContext,
      );
    });
  });

  describe('getFileById', () => {
    it('should return file DTO when found', async () => {
      fileRepository.findById.mockResolvedValue(mockFileEntity);

      const result = await service.getFileById('file-1');

      expect(result).toEqual({
        id: 'file-1',
        originalName: 'test-image.jpg',
        storedName: '1234567890-test-image.jpg',
        path: './uploads/1234567890-test-image.jpg',
        url: 'http://localhost:3000/uploads/1234567890-test-image.jpg',
        mimeType: 'image/jpeg',
        size: 1024000,
        uploadedBy: '1',
        createdAt: new Date('2026-07-20'),
        updatedAt: new Date('2026-07-20'),
      });
    });

    it('should return null when file not found', async () => {
      fileRepository.findById.mockResolvedValue(null);

      const result = await service.getFileById('file-1');

      expect(result).toBeNull();
    });

    it('should pass transaction context when provided', async () => {
      const mockTransactionContext = {} as any;
      fileRepository.findById.mockResolvedValue(mockFileEntity);

      await service.getFileById('file-1', mockTransactionContext);

      expect(fileRepository.findById).toHaveBeenCalledWith('file-1', mockTransactionContext);
    });
  });
});
