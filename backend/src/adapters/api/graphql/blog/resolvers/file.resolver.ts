import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { FileDTO } from '../types/file.dto';
import { FileQueryService } from '@src/modules/blog/queries/file.query.service';
import { DeleteFileUsecase } from '@usecases/blog/delete-file.usecase';
import { UploadFileUsecase } from '@usecases/blog/upload-file.usecase';
import { mapJwtToUsecaseSession } from '@app-types/auth/session.types';

@Resolver(() => FileDTO)
export class FileResolver {
  constructor(
    private readonly fileQueryService: FileQueryService,
    private readonly uploadFileUsecase: UploadFileUsecase,
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
    const session = mapJwtToUsecaseSession(context.req.user);
    return this.uploadFileUsecase.execute({
      filename,
      content,
      mimeType,
      session,
    });
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
