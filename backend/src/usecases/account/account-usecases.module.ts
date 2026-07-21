// src/usecases/account/account-usecases.module.ts
import { Module } from '@nestjs/common';
import { AccountInstallerModule } from '@src/modules/account/account-installer.module';
import { PasswordModule } from '@src/modules/common/password/password.module';
import { ChangePasswordUsecase } from '@src/usecases/account/change-password.usecase';
import { CreateAccountUsecase } from '@src/usecases/account/create-account.usecase';
import { FetchIdentityByRoleUsecase } from '@src/usecases/account/fetch-identity-by-role.usecase';
import { FetchUserInfoUsecase } from '@src/usecases/account/fetch-user-info.usecase';
import { GetAccountByIdUsecase } from '@src/usecases/account/get-account-by-id.usecase';
import { GetVisibleUserInfoUsecase } from '@src/usecases/account/get-visible-user-info.usecase';
import {
  UpdateAccessGroupUsecase,
  UpdateVisibleUserInfoUsecase,
} from '@src/usecases/account/update-visible-user-info.usecase';

@Module({
  imports: [AccountInstallerModule, PasswordModule],
  providers: [
    ChangePasswordUsecase,
    CreateAccountUsecase,
    FetchIdentityByRoleUsecase,
    FetchUserInfoUsecase,
    GetAccountByIdUsecase,
    GetVisibleUserInfoUsecase,
    UpdateVisibleUserInfoUsecase,
    UpdateAccessGroupUsecase,
  ],
  exports: [
    ChangePasswordUsecase,
    CreateAccountUsecase,
    FetchIdentityByRoleUsecase,
    FetchUserInfoUsecase,
    GetAccountByIdUsecase,
    GetVisibleUserInfoUsecase,
    UpdateVisibleUserInfoUsecase,
    UpdateAccessGroupUsecase,
  ],
})
export class AccountUsecasesModule {}
