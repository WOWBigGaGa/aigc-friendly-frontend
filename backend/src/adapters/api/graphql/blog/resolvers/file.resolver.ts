import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { FileDTO } from '../types/file.dto';
import { FileQueryService } from '@src/modules/blog/queries/file.query.service';
import { DeleteFileUsecase } from '@usecases/blog/delete-file.usecase';
import { mapJwtToUsecaseSession } from '@app-types/auth/session.types';
import { FileRepository } from '@src/modules/blog/repositories/file.repository';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';

@Resolver(() => FileDTO)
export class FileResolver {
  constructor(
    private readonly fileQueryService: FileQueryService,
    private readonly fileRepository: FileRepository,
    private readonly deleteFileUsecase: DeleteFileUsecase,
  ) {}

  @Query(() => [FileDTO])
  @UseGuards(JwtAuthGuard)
  async files(
    @Args('page', { nullable: true }) page?: number,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<FileDTO[]> {
    const result = await this.fileQueryService.getFiles(page || 1, limit || 20);
    return result.items;
  }

  @Query(() => FileDTO, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async file(@Args('id') id: string): Promise<FileDTO | null> {
    return this.fileQueryService.getFileById(id);
  }

  @Mutation(() => FileDTO)
  @UseGuards(JwtAuthGuard)
  async uploadFile(
    @Args('filename') filename: string,
    @Args('content') content: string,
    @Args('mimeType') mimeType: string,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<FileDTO> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(mimeType)) {
      throw new DomainError(BLOG_ERROR.VALIDATION_FAILED, '不支持的文件类型');
    }

    const base64Data = content.split(',')[1] || content;
    const buffer = Buffer.from(base64Data, 'base64');
    const size = buffer.length;

    if (size > 10 * 1024 * 1024) {
      throw new DomainError(BLOG_ERROR.VALIDATION_FAILED, '文件大小不能超过 10MB');
    }

    const storedName = `${Date.now()}-${filename}`;
    const uploadDir = process.env.FILE_UPLOAD_DIR || './uploads';
    const path = `${uploadDir}/${storedName}`;

    const fs = await import('fs');
    const pathModule = await import('path');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(pathModule.join(process.cwd(), path), buffer);

    const appHost = process.env.APP_HOST || 'localhost';
    const appPort = process.env.APP_PORT || '3000';
    const url = `http://${appHost}:${appPort}/uploads/${storedName}`;

    const file = await this.fileRepository.save({
      originalName: filename,
      storedName,
      path,
      url,
      mimeType,
      size,
      uploadedBy: String(context.req.user.sub),
    });

    const result = await this.fileQueryService.getFileById(file.id);
    if (!result) {
      throw new DomainError(BLOG_ERROR.FILE_NOT_FOUND, '文件保存后查询失败');
    }
    return result;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteFile(
    @Args('id') id: string,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<boolean> {
    const session = mapJwtToUsecaseSession(context.req.user);
    await this.deleteFileUsecase.execute({ id, session });
    return true;
  }
}
