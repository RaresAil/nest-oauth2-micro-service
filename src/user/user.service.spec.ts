import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { v4, version } from 'uuid';

import { providers } from '../providers/constants';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { UserModel } from '../@types';

import userConstants from '../../test/constants/user';
import dbConfig from '../../test/config/db.json';

describe('UserService', () => {
  let service: UserService;
  let createdUserId: string;

  beforeAll(async () => {
    process.env.UUID_NAMESPACE = v4();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(dbConfig as any),
        SequelizeModule.forFeature([User]),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  it("Should return null because user doesn't exists", async () => {
    const user = await service.getUser(userConstants.fakeId);
    expect(user).toBeNull();
  });

  it("Should fail because the provider doesn't exists", async () => {
    const check = service.isValidProvider('');
    expect(check).toBeFalsy();
  });

  it('Should pass because the provider exists', async () => {
    const check = service.isValidProvider(providers.Google);
    expect(check).toBeTruthy();
  });

  it('Should create an user', async () => {
    const { creationDate, updatedOn, ...user } =
      (await service.saveOrUpdate(
        userConstants.mockedId,
        providers.Google,
        userConstants.mockedUser,
      )) ?? ({} as UserModel);

    expect(creationDate).toBeDefined();
    expect(updatedOn).toBeDefined();

    expect(creationDate.getTime()).toBeLessThan(Date.now());
    expect(updatedOn.getTime()).toBeLessThan(Date.now());

    expect(user).not.toBe({});
    expect(version(user.uid)).toBe(5);
    expect(user).toEqual({
      ...userConstants.mockedUser,
      uid: user.uid,
    });

    createdUserId = user.uid;
  });

  it('Should return a valid user', async () => {
    expect(createdUserId).toBeDefined();
    const { creationDate, updatedOn, ...user } =
      (await service.getUser(createdUserId)) ?? ({} as UserModel);

    expect(creationDate).toBeDefined();
    expect(updatedOn).toBeDefined();
    expect(user).not.toBe({});
    expect(version(user.uid)).toBe(5);
    expect(user).toEqual({
      ...userConstants.mockedUser,
      uid: user.uid,
    });
  });
});
