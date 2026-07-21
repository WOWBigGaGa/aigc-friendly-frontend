import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { FriendLinkDTO } from '../types/friend-link.dto';
import { FriendLinkQueryService } from '@src/modules/blog/queries/friend-link.query.service';
import { FriendLinkRepository } from '@src/modules/blog/repositories/friend-link.repository';

@Resolver(() => FriendLinkDTO)
export class FriendLinkResolver {
  constructor(
    private readonly friendLinkQueryService: FriendLinkQueryService,
    private readonly friendLinkRepository: FriendLinkRepository,
  ) {}

  @Query(() => [FriendLinkDTO])
  async friendLinks(): Promise<FriendLinkDTO[]> {
    return await this.friendLinkQueryService.getAllFriendLinks();
  }

  @Query(() => FriendLinkDTO, { nullable: true })
  async friendLink(@Args('id') id: string): Promise<FriendLinkDTO | null> {
    return await this.friendLinkQueryService.getFriendLinkById(id);
  }

  @Mutation(() => FriendLinkDTO)
  @UseGuards(JwtAuthGuard)
  async createFriendLink(
    @Args('name') name: string,
    @Args('url') url: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('logo', { nullable: true }) logo?: string,
    @Args('sort', { nullable: true }) sort?: number,
  ): Promise<FriendLinkDTO> {
    return await this.friendLinkRepository.create({
      name,
      url,
      description: description || null,
      logo: logo || null,
      sort: sort || 0,
      isActive: true,
    });
  }

  @Mutation(() => FriendLinkDTO)
  @UseGuards(JwtAuthGuard)
  async updateFriendLink(
    @Args('id') id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('url', { nullable: true }) url?: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('logo', { nullable: true }) logo?: string,
    @Args('sort', { nullable: true }) sort?: number,
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ): Promise<FriendLinkDTO> {
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (url !== undefined) updates.url = url;
    if (description !== undefined) updates.description = description;
    if (logo !== undefined) updates.logo = logo;
    if (sort !== undefined) updates.sort = sort;
    if (isActive !== undefined) updates.isActive = isActive;
    return await this.friendLinkRepository.update(id, updates);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteFriendLink(@Args('id') id: string): Promise<boolean> {
    await this.friendLinkRepository.delete(id);
    return true;
  }
}
