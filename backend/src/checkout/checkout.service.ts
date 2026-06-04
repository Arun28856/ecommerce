import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/products.schema';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../payments/payments.service';
import { CheckoutDto } from './dtos/checkout.dto';
import { PaymentMethod } from '../payments/schemas/payment.schema';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    private ordersService: OrdersService,
    private paymentService: PaymentsService,
  ) {}

  // Step 1 — Validate cart before checkout
  async validateCart(items: { productSlug: string; quantity: number }[]) {
    const validated: { productSlug: string; name: string; price: number; quantity: number; stock: number; image: string; subtotal: number }[] = [];
    const errors: string[] = [];

    for (const item of items) {
      const product = await this.productModel.findOne({
        slug: item.productSlug,
        isActive: true,
      });

      if (!product) {
        errors.push(`"${item.productSlug}" is no longer available`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(
          `"${product.name}" only has ${product.stock} units left`,
        );
        continue;
      }

      validated.push({
        productSlug: item.productSlug,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        stock: product.stock,
        image: product.images?.[0] || '',
        subtotal: product.price * item.quantity,
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Cart validation failed',
        errors,
      });
    }

    const totalAmount = validated.reduce((sum, i) => sum + i.subtotal, 0);

    return { items: validated, totalAmount };
  }

  // Step 2 — Full checkout: create order + initiate payment
  async checkout(dto: CheckoutDto, buyerUid: string) {
    // 1. Validate cart
    await this.validateCart(dto.items);

    // 2. Create order
    const order = await this.ordersService.create(
      buyerUid,
      {
        items: dto.items,
        shippingAddress: dto.shippingAddress,
      },
    );

    // 3. Initiate payment
    const payment = await this.paymentService.createPayment(
      {
        order: (order as any)._id.toString(),
        method: dto.paymentMethod,
      },
      buyerUid,
    );

    // 4. Return everything frontend needs
    return {
      order,
      payment,
      // If COD — no Razorpay needed
      isCOD: dto.paymentMethod === PaymentMethod.COD,
    };
  }

  // Step 3 — Order summary before placing
  async getOrderSummary(
    items: { productSlug: string; quantity: number }[],
  ) {
    const validated = await this.validateCart(items);

    const platformFeePercent = 2; // show buyer the platform fee
    const deliveryCharge = validated.totalAmount > 500 ? 0 : 49;
    const platformFee = Math.round(
      (validated.totalAmount * platformFeePercent) / 100,
    );

    return {
      items: validated.items,
      subtotal: validated.totalAmount,
      deliveryCharge,
      platformFee,
      totalAmount: validated.totalAmount + deliveryCharge,
    };
  }
}