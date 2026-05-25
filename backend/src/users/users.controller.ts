import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Controller, Get, Param, UseGuards, Body, Put, Delete } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get() // Get all users (admin only)
    findAll(@CurrentUser() user: any) {
        return this.usersService.findAll();
    }

    @Get(':uid') // Get user by UID (admin or self)
    findOne(@Param('uid') uid: string, @CurrentUser() user: any) {
        return this.usersService.findOne(uid);
    }

    @Put('me')
    updateMe(@Body() updateUserDto: UpdateUserDto, @CurrentUser() user: any) {
        return this.usersService.updateProfile(user.uid, updateUserDto);
    }

    @Put(':uid') // Update user
    adminUpdate(@Param('uid') uid: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() user: any) {
        return this.usersService.adminUpdate(uid, updateUserDto, user);
    }

    @Delete(':uid') // Delete user
    delete(@Param('uid') uid: string, @CurrentUser() user: any) {
        return this.usersService.delete(uid, user);
    }

}