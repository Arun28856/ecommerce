import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { Payment, PaymentDocument, PaymentStatus, PaymentMethod } from './schemas/payment.schema';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/orders.schema';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { VerifyPaymentDto } from './dtos/verify-payment.dto';
import { EarningsService } from '../earnings/earnings.service';


@Injectable()
export class PaymentsService {

    private razorpay: Razorpay;

    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        private configService: ConfigService,
        private earningsService: EarningsService,
    ) {
        this.razorpay = new Razorpay({
            key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
            key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
        });
    }

    // Create a payment order
    async createPayment(dto: CreatePaymentDto, buyerId: string) {

        const order = await this.orderModel.findById(dto.order);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if(order.isPaid) {
            throw new BadRequestException('Order is already paid');
        }

        //COD payment
        if(dto.method === PaymentMethod.COD) {
            const payment = new this.paymentModel({
                order: order._id,
                buyerId,
                amount: order.totalPrice,
                method: PaymentMethod.COD,
                status: PaymentStatus.PENDING,
                isCOD: true,
            });

            order.status = OrderStatus.CONFIRMED;
            order.isPaid = false;
            await Promise.all([payment.save(), order.save()]);
            await this.earningsService.createEarningsForOrder(order, payment._id);

            return {
                isCOD: true,
                message: 'Order confirmed for COD payment. Please pay at the time of delivery.',
                payment,
            };
        }

        // Online payment
        const razorpayOrder = await this.razorpay.orders.create({
            amount: order.totalPrice * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${order._id}`,
            notes: {
                orderId: order._id.toString(),
                buyerId,
            },
        });

        // Save payment details in the database
        const payment = new this.paymentModel({
            order: order._id,
            buyerId,
            amount: order.totalPrice,
            razorpayOrderId: razorpayOrder.id,
            method: dto.method,
        });
        await payment.save();

        return {
            isCOD: false,
            razorpayOrderId: razorpayOrder.id,
            amount: order.totalPrice * 100,
            currency: 'INR',
            keyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
            paymentId: payment._id,
            order: {
                id: order._id,
                totalPrice: order.totalPrice,
            }
        };
    }

    // Verify payment
    async verifyPayment(dto: VerifyPaymentDto, buyerId: string) {
        //Verify signature
        const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId;
        const expectedSignature = crypto.createHmac('sha256', this.configService.get('RAZORPAY_KEY_SECRET')!).
            update(body)
            .digest('hex');

        const isValid = expectedSignature === dto.razorpaySignature;

        if (!isValid) {
            throw new BadRequestException('Payment verification failed');
        }

        //Update payment and order status
        const payment = await this.paymentModel.findOneAndUpdate(
            { razorpayOrderId: dto.razorpayOrderId, buyerId },
            {
                razorpayPaymentId: dto.razorpayPaymentId,
                razorpaySignature: dto.razorpaySignature,
                status: PaymentStatus.COMPLETED,
            },
            { new: true }
        );

        const order = await this.orderModel.findByIdAndUpdate(
            dto.orderId,
            { status: OrderStatus.CONFIRMED, paymentId: dto.razorpayPaymentId, isPaid: true },
            { new: true }
        );

        if (payment && order) {
            await this.earningsService.createEarningsForOrder(order, payment._id);
        }

        return {
            message: 'Payment verified successfully',
            payment,
            order,
        };

    }

    // Get payment details
    async getPaymentDetails(paymentId: string, buyerId: string) {
        const payment = await this.paymentModel.findOne({ _id: paymentId, buyerId }).populate('order').select('-__v');
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }
        return payment;
    }

    // Razpray webhook handler
    async handleRazorpayWebhook(payload: any, signature: string) {
        const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET')!;
        const expectedSignature = crypto.createHmac('sha256', this.configService.get('RAZORPAY_KEY_SECRET')!)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (expectedSignature !== signature) {
            throw new BadRequestException('Invalid webhook signature');
        }

        if (payload.event === 'payment.captured') {
            const paymentEntity = payload.payload.payment.entity;
            const payment = await this.paymentModel.findOneAndUpdate(
                { razorpayOrderId: paymentEntity.order_id },
                {
                    razorpayPaymentId: paymentEntity.id,
                    status: PaymentStatus.COMPLETED,
                },
                { new: true }
            );
    }

    return {received: true};
    
    }
}
