import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';

import { Provider, providers } from '../providers/constants';
import { DeserializedUser, UserModel } from '../@types';
import { User } from '../models/user.model';
import { v5 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  private async getRawUser(uid: string): Promise<User | null> {
    return this.userModel.findOne({
      where: {
        uid,
      },
    });
  }

  public async getUser(uid: string): Promise<UserModel | null> {
    const user = await this.getRawUser(uid);
    return (user?.toJSON() as UserModel) ?? null;
  }

  public async saveOrUpdate(
    id: string,
    provider: Provider,
    userInfo: Omit<UserModel, 'uid'>,
  ): Promise<UserModel | null> {
    const existingUser = await this.getRawUser(
      this.serializeUser(id, provider, true),
    );

    if (!existingUser) {
      const user = new User({
        ...userInfo,
        uid: this.serializeUser(id, provider),
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

  private serializeUser(id: string, provider: Provider, setV5 = false): string {
    const value = `${id}:${provider}`;

    if (setV5) {
      return v5(value, process.env.UUID_NAMESPACE);
    }

    return value;
  }
}
