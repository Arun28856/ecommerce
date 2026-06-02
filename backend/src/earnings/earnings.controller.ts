import { Controller, Get, UseGuards } from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { SellerGuard } from '../auth/guards/seller.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('earnings')
@UseGuards(FirebaseAuthGuard, SellerGuard)
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  @Get()
  getMyEarnings(@CurrentUser() user: any) {
    return this.earningsService.getMyEarnings(user.uid);
  }

  @Get('summary')
  getEarningsSummary(@CurrentUser() user: any) {
    return this.earningsService.getEarningsSummary(user.uid);
  }
}
