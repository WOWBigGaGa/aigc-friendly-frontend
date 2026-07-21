import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field(() => String, { description: '原密码' })
  @IsString()
  oldPassword!: string;

  @Field(() => String, { description: '新密码' })
  @IsString()
  newPassword!: string;
}

@ObjectType()
export class ChangePasswordResult {
  @Field(() => Boolean, { description: '是否成功' })
  success!: boolean;

  @Field(() => String, { nullable: true, description: '错误信息' })
  message?: string | null;

  @Field(() => String, { nullable: true, description: '错误码' })
  errorCode?: string | null;
}
