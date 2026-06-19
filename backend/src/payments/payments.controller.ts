import { Controller, Post, UseGuards, Body, Req, Headers } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { VerifyPaymentDto } from './dtos/verify-payment.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// 20 payment attempts per 60 seconds per IP
@Throttle({ default: { ttl: 60000, limit: 20 } })
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    //create payment order
    @UseGuards(FirebaseAuthGuard)
    @Post('/create')
    async createPayment(@Body() dto: CreatePaymentDto, @CurrentUser() buyerId: any) {
        return this.paymentsService.createPayment(dto, buyerId.uid);
    }

    //verify payment
    @UseGuards(FirebaseAuthGuard)
    @Post('/verify')
    async verifyPayment(@Body() dto: VerifyPaymentDto, @CurrentUser() buyerId: any) {
        return this.paymentsService.verifyPayment(dto, buyerId.uid);
    }

    //razorpay webhook
    @Public()
    @Post('/webhook')
    async handleRazorpayWebhook(@Req() req: RawBodyRequest<Request>, @Headers('x-razorpay-signature') signature: string) {
        return this.paymentsService.handleRazorpayWebhook(req.body, signature);
    }
}
