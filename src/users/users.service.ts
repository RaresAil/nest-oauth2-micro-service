import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';

import { Provider, providers } from '../providers/constants';
import { DeserializedUser, UserModel } from '../@types';
import { User } from '../models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  private async getRawUser(
    id: string,
    provider: Provider,
  ): Promise<User | null> {
    return this.userModel.findOne({
      where: {
        uid: this.serializeUser(id, provider),
      },
    });
  }

  public async getUser(
    id: string,
    provider: Provider,
  ): Promise<UserModel | null> {
    const user = await this.getRawUser(id, provider);
    return (user?.toJSON() as UserModel) ?? null;
  }

  public async saveOrUpdate({
    uid,
    ...userInfo
  }: UserModel): Promise<UserModel | null> {
    const { id, provider } = this.deserializeUser(uid);
    const existingUser = await this.getRawUser(id, provider);
    if (!existingUser) {
      const user = new User({
        ...userInfo,
        uid,
      });

      return (await user.save()).toJSON() as UserModel;
    }

    return (
      await existingUser.update({
        ...userInfo,
      })
    ).toJSON() as UserModel;
  }

  public isValidProvider(provider: string): boolean {
    return Object.values(providers).includes(
      provider as DeserializedUser['provider'],
    );
  }

  public deserializeUser(serializedUser: string): DeserializedUser | null {
    const [id, provider] = serializedUser.split(':');
    if (!this.isValidProvider(provider)) {
      return null;
    }

    return {
      id,
      provider: provider as DeserializedUser['provider'],
    };
  }

  public serializeUser(id: string, provider: Provider): string {
    return `${id}:${provider}`;
  }
}
