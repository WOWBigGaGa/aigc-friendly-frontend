import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileEntity } from '../entities/file.entity';
import { FileRepository } from './file.repository';

describe('FileRepository', () => {
  let repository: FileRepository;
  let typeOrmRepository: any;

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
    typeOrmRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileRepository,
        {
          provide: getRepositoryToken(FileEntity),
          useValue: typeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<FileRepository>(FileRepository);
  });

  describe('findAllWithPagination', () => {
    it('should return paginated files ordered by createdAt DESC', async () => {
      const expectedItems = [mockFileEntity];
      const expectedTotal = 1;

      typeOrmRepository.findAndCount.mockResolvedValue([expectedItems, expectedTotal]);

      const result = await repository.findAllWithPagination(1, 10);

      expect(result).toEqual({ items: expectedItems, total: expectedTotal });
      expect(typeOrmRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should calculate skip correctly for different pages', async () => {
      typeOrmRepository.findAndCount.mockResolvedValue([[], 0]);

      await repository.findAllWithPagination(3, 20);

      expect(typeOrmRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 40,
        take: 20,
      });
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.findAndCount.mockRejectedValue(new Error('Database error'));

      await expect(repository.findAllWithPagination(1, 10)).rejects.toThrow(DomainError);
      await expect(repository.findAllWithPagination(1, 10)).rejects.toHaveProperty(
        'code',
        BLOG_ERROR.QUERY_FAILED,
      );
    });
  });

  describe('findById', () => {
    it('should return file when found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockFileEntity);

      const result = await repository.findById('file-1');

      expect(result).toEqual(mockFileEntity);
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 'file-1' } });
    });

    it('should return null when file not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('file-1');

      expect(result).toBeNull();
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(repository.findById('file-1')).rejects.toThrow(DomainError);
    });
  });

  describe('save', () => {
    it('should save and return file', async () => {
      const fileData = {
        originalName: 'new-image.png',
        storedName: '9876543210-new-image.png',
        path: './uploads/9876543210-new-image.png',
        url: 'http://localhost:3000/uploads/9876543210-new-image.png',
        mimeType: 'image/png',
        size: 512000,
        uploadedBy: '2',
      };
      const savedFile = { ...fileData, id: 'file-2', createdAt: new Date(), updatedAt: new Date() };

      typeOrmRepository.save.mockResolvedValue(savedFile);

      const result = await repository.save(fileData);

      expect(result).toEqual(savedFile);
      expect(typeOrmRepository.save).toHaveBeenCalledWith(fileData);
    });

    it('should throw DomainError when save fails', async () => {
      typeOrmRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(repository.save({ originalName: 'test.jpg' })).rejects.toThrow(DomainError);
    });
  });

  describe('delete', () => {
    it('should delete file by id', async () => {
      typeOrmRepository.delete.mockResolvedValue({ affected: 1 });

      await repository.delete('file-1');

      expect(typeOrmRepository.delete).toHaveBeenCalledWith('file-1');
    });

    it('should throw DomainError when delete fails', async () => {
      typeOrmRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(repository.delete('file-1')).rejects.toThrow(DomainError);
      await expect(repository.delete('file-1')).rejects.toHaveProperty(
        'code',
        BLOG_ERROR.DELETE_FAILED,
      );
    });
  });
});
