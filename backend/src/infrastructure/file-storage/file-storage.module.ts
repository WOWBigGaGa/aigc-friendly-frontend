import { Module } from '@nestjs/common';
import { LocalFileStorageService } from './local-file-storage.service';
import { FILE_STORAGE_SERVICE } from '@usecases/common/ports/file-storage.contract';

@Module({
  providers: [
    {
      provide: FILE_STORAGE_SERVICE,
      useClass: LocalFileStorageService,
    },
  ],
  exports: [FILE_STORAGE_SERVICE],
})
export class FileStorageModule {}
