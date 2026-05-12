import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './user.entity'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email } })
    if (exists) throw new ConflictException('Email already in use')

    const hashed = await bcrypt.hash(dto.password, 10)
    const user = this.usersRepo.create({ ...dto, password: hashed })
    const saved = await this.usersRepo.save(user)
    const { password: _, ...result } = saved
    return result
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } })
  }

  async findById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    const { password: _, ...result } = user
    return result
  }
}
