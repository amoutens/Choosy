import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

const mockUser: User = {
  id: 'test-uuid',
  email: 'test@example.com',
  password: 'hashed_password',
  name: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSafeUser = (({ password: _p, ...rest }) => rest)(mockUser);

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { create: jest.Mock; findByEmail: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('creates a user and returns access_token', async () => {
      usersService.create.mockResolvedValue(mockSafeUser);

      const result = await service.register({
        email: 'test@example.com',
        password: '123456',
      });

      expect(result.access_token).toBe('mock_token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockSafeUser.id,
        email: mockSafeUser.email,
      });
    });

    it('returned user does not contain password', async () => {
      usersService.create.mockResolvedValue(mockSafeUser);

      const result = await service.register({
        email: 'test@example.com',
        password: '123456',
      });

      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if password is incorrect', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns access_token and user without password on success', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({
        email: 'test@example.com',
        password: '123456',
      });

      expect(result.access_token).toBe('mock_token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe(mockUser.email);
    });
  });
});
