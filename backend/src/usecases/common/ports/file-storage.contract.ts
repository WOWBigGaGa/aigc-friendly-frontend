export const FILE_STORAGE_SERVICE = Symbol('FILE_STORAGE_SERVICE');

export interface StoredFileInfo {
  storedName: string;
  path: string;
  url: string;
  size: number;
}

export interface FileStorageService {
  storeFile(params: {
    originalName: string;
    buffer: Buffer;
    mimeType: string;
  }): Promise<StoredFileInfo>;

  deleteFile(storedName: string): Promise<void>;

  getAllowedMimeTypes(): string[];

  getMaxSizeBytes(): number;
}
