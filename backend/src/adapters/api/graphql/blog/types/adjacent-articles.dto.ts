import { Field, ObjectType } from '@nestjs/graphql';
import { ArticleDTO } from './article.dto';

@ObjectType({ description: '相邻文章' })
export class AdjacentArticlesDTO {
  @Field(() => ArticleDTO, { nullable: true })
  previous!: ArticleDTO | null;

  @Field(() => ArticleDTO, { nullable: true })
  next!: ArticleDTO | null;
}
