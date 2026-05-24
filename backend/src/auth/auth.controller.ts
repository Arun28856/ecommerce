import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.gaurd';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from './decorators/current-user.decoratot';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('sync')
    @UseGuards(FirebaseAuthGuard)
    async syncUser(@CurrentUser() user: any) {
        return this.authService.syncUser(user);
    }

    @Get('me')
    @UseGuards(FirebaseAuthGuard)
    async getMe(@CurrentUser() user: any) {
        return this.authService.getMe(user.uid);
    }
}
