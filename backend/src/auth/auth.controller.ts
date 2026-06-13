import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('sync')
    @UseGuards(FirebaseAuthGuard)
    async syncUser(@CurrentUser() user: any, @Body() body: { role?: string }) {
        return this.authService.syncUser(user, body?.role);
    }

    @Get('me')
    @UseGuards(FirebaseAuthGuard)
    async getMe(@CurrentUser() user: any) {
        return this.authService.getMe(user.uid);
    }
}
