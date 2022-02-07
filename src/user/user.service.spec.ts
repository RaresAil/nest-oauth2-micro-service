import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { v4, version } from 'uuid';

import { providers } from '../providers/constants';
import { UserService } from './user.service';

import { PrismaService } from '../prisma/prisma.service';
import mockPrismaService from '../../test/mocks/prisma';
import userConstants from '../../test/constants/user';

describe('UserService', () => {
  let prismaService: typeof mockPrismaService;
  let createdUserId: string;
  let service: UserService;

  afterEach(() => {
    prismaService.user.create.mockRestore();
    prismaService.user.update.mockRestore();
    prismaService.user.findUnique.mockRestore();
  });

  beforeAll(async () => {
    process.env.UUID_NAMESPACE = v4();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService) as any;
    service = module.get<UserService>(UserService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  it("Should return null because user doesn't exists", async () => {
    prismaService.user.findUnique.mockReturnValueOnce(null);
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
    const date = new Date(Date.now() - 10000);
    prismaService.user.findUnique.mockReturnValueOnce(null);
    prismaService.user.create.mockImplementationOnce((entry) => ({
      ...entry?.data,
      creationDate: date,
      updatedOn: date,
    }));

    const { creationDate, updatedOn, ...user } =
      (await service.saveOrUpdate(
        userConstants.mockedId,
        providers.Google,
        userConstants.mockedUser,
      )) ?? ({} as User);

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
    prismaService.user.findUnique.mockReturnValueOnce({
      ...userConstants.mockedUser,
      uid: createdUserId,
      creationDate: new Date(),
      updatedOn: new Date(),
    });

    const { creationDate, updatedOn, ...user } =
      (await service.getUser(createdUserId)) ?? ({} as User);

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
