import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './user.entity';

const mockUser: User = {
  id: 'test-uuid',
  email: 'test@example.com',
  password: 'hashed_password',
  name: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('throws ConflictException if email already exists', async () => {
      repo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create({ email: 'test@example.com', password: '123456' }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes the password before saving', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockUser);
      repo.save.mockResolvedValue(mockUser);

      const spy = jest.spyOn(bcrypt, 'hash');
      await service.create({ email: 'test@example.com', password: '123456' });

      expect(spy).toHaveBeenCalledWith('123456', 10);
    });

    it('returns user without password', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockUser);
      repo.save.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'test@example.com',
        password: '123456',
      });

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(mockUser.email);
    });
  });

  describe('findByEmail', () => {
    it('returns user if found', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('returns null if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('throws NotFoundException if user does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns user without password', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      const result = await service.findById('test-uuid');
      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(mockUser.id);
    });
  });
});
