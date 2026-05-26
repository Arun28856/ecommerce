import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(FirebaseAuthGuard) // 🔐 all routes protected
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users/me — get own profile
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.usersService.getMe(user.uid);
  }

  // PUT /api/users/me — update own profile
  @Put('me')
  updateMe(
    @CurrentUser() user: any,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateMe(user.uid, dto);
  }

  // DELETE /api/users/me — delete own account
  @Delete('me')
  deleteMe(@CurrentUser() user: any) {
    return this.usersService.deleteMe(user.uid);
  }

  // PATCH /api/users/me/switch-role — toggle buyer/seller
  @Patch('me/switch-role')
  switchRole(@CurrentUser() user: any) {
    return this.usersService.switchRole(user.uid);
  }
}