import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface JwtUser {
  id: string;
  email: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Request() req: { user: JwtUser }) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me/avatar')
  async updateAvatar(
    @Request() req: { user: JwtUser },
    @Body('avatar') avatar: string,
  ) {
    await this.usersService.updateAvatar(req.user.id, avatar);
    return { success: true };
  }

  @Delete('me/avatar')
  async removeAvatar(@Request() req: { user: JwtUser }) {
    await this.usersService.clearAvatar(req.user.id);
    return { success: true };
  }
}
