import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { v5 } from 'uuid';

import { Provider, providers } from '../providers/constants';
import { PrismaService } from '../prisma/prisma.service';
import { DeserializedUser } from '../@types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  public async getUser(uid?: string | null): Promise<User | null> {
    if (!uid) {
      return null;
    }

    return this.prisma.user.findUnique({
      where: {
        uid,
      },
    });
  }

  public async saveOrUpdate(
    id: string,
    provider: Provider,
    userInfo: Omit<User, 'uid' | 'creationDate' | 'updatedOn'>,
  ): Promise<User | null> {
    const uid = this.serializeUser(id, provider, true);
    const existingUser = await this.getUser(uid);

    if (!existingUser) {
      return this.prisma.user.create({
        data: {
          ...userInfo,
          uid: this.serializeUser(id, provider, true),
        },
      });
    }

    return this.prisma.user.update({
      data: {
        ...userInfo,
      },
      where: {
        uid,
      },
    });
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
