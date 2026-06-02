import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { SellerEarning, SellerEarningDocument, EarningStatus } from './schemas/seller-earning.schema';
import { OrderDocument } from '../orders/schemas/orders.schema';

@Injectable()
export class EarningsService {
  constructor(
    @InjectModel(SellerEarning.name) private earningModel: Model<SellerEarningDocument>,
    private configService: ConfigService,
  ) {}

  async createEarningsForOrder(order: OrderDocument, paymentId: Types.ObjectId) {
    const platformFeePercentage = Number(this.configService.get<number>('PLATFORM_FEE_PERCENTAGE') ?? 10);

    // Group items by seller
    const sellerTotals = new Map<string, number>();
    for (const item of order.orderItems) {
      const uid = item.sellerUid.toString();
      sellerTotals.set(uid, (sellerTotals.get(uid) ?? 0) + item.price * item.quantity);
    }

    const earnings = Array.from(sellerTotals.entries()).map(([sellerUid, grossAmount]) => {
      const platformFeeAmount = parseFloat(((grossAmount * platformFeePercentage) / 100).toFixed(2));
      const netAmount = parseFloat((grossAmount - platformFeeAmount).toFixed(2));
      return {
        sellerUid,
        order: order._id,
        payment: paymentId,
        grossAmount,
        platformFeePercentage,
        platformFeeAmount,
        netAmount,
        status: EarningStatus.PENDING,
      };
    });

    await this.earningModel.insertMany(earnings);
  }

  async releaseEarnings(orderId: string) {
    await this.earningModel.updateMany(
      { order: new Types.ObjectId(orderId), status: EarningStatus.PENDING },
      { status: EarningStatus.AVAILABLE },
    );
  }

  async getMyEarnings(sellerUid: string) {
    return this.earningModel
      .find({ sellerUid })
      .populate('order', 'status createdAt totalPrice')
      .sort({ createdAt: -1 })
      .select('-__v');
  }

  async getEarningsSummary(sellerUid: string) {
    const earnings = await this.earningModel.find({ sellerUid });

    const sum = (status?: EarningStatus) =>
      earnings
        .filter(e => !status || e.status === status)
        .reduce((acc, e) => acc + e.netAmount, 0);

    return {
      totalNet: parseFloat(sum().toFixed(2)),
      pending: parseFloat(sum(EarningStatus.PENDING).toFixed(2)),
      available: parseFloat(sum(EarningStatus.AVAILABLE).toFixed(2)),
      paidOut: parseFloat(sum(EarningStatus.PAID_OUT).toFixed(2)),
    };
  }
}
