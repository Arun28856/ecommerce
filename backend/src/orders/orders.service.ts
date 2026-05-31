import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Order, OrderDocument, OrderStatus } from './schemas/orders.schema';
import { Product, ProductDocument } from '../products/schemas/products.schema';
import { CreateOrderDto } from './dtos/create-order.dto';
import { updateOrderStatusDto } from './dtos/update-order-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class OrdersService {

    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) {}

    async create(buyerUid: string, createOrderDto: CreateOrderDto){
        let totalAmount = 0;
        const orderItems: any[] = [];

        for (const item of createOrderDto.items) {
            const product = await this.productModel.findOne({ slug: item.productSlug, isActive: true });
        

        if (!product) {
            throw new NotFoundException(`Product with slug ${item.productSlug} not found or is inactive`);
        }

        if (product.stock < item.quantity) {
            throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            sellerUid: product.sellerUid,
            image: product.images.length > 0 ? product.images[0] : '',
        });

        // Reduce stock
        await this.productModel.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
     }

        const order = new this.orderModel({
            buyerUid,
            orderItems,
            shippingAddress: createOrderDto.shippingAddress,
            totalPrice: totalAmount,
        });
        await order.save();
        return order.populate('orderItems.product', 'name slug images');
    }

    //Buyer - view own orders
    async findMyOrders(buyerUid: string) {
        return this.orderModel.find({ buyerUid }).populate('orderItems.product', 'name slug images').
        sort({ createdAt: -1 }).select('-__v');
    }

    //Buyer - view specific order
    async findOne(orderId: string, buyerUid: string) {
        const order = await this.orderModel.findOne({ _id: orderId, buyerUid }).populate('orderItems.product', 'name slug images').select('-__v');
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        return order;
    }

    //Buyer - cancel order
    async cancelOrder(orderId: string, buyerUid: string) {
        const order = await this.orderModel.findOne({ _id: orderId, buyerUid });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('Only pending orders can be cancelled');
        }
        order.status = OrderStatus.CANCELLED;
        await order.save();

        // Restock products
        for (const item of order.orderItems) {
            await this.productModel.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }

        order.status = OrderStatus.CANCELLED;
        await order.save();
        return order;
    }

    //Seller - view orders containing their products
    async findSellerOrders(sellerUid: string) {
        const orders = await this.orderModel.find({ 'orderItems.sellerUid': sellerUid }).populate('orderItems.product', 'name slug images').
        sort({ createdAt: -1 }).select('-__v');

        return orders.map(order => ({
            _id: order._id,
            buyerUid: order.buyerUid,
            orderItems: order.orderItems.filter(item => item.sellerUid.toString() === sellerUid),
            shippingAddress: order.shippingAddress,
            totalPrice: order.totalPrice,
            status: order.status,
            createdAt: order.createdAt,
        }));
    }

    //Seller - update order status
    async updateOrderStatus(orderId: string, sellerUid: string, updateOrderStatusDto: updateOrderStatusDto) {
        const order = await this.orderModel.findOne({ _id: orderId, 'orderItems.sellerUid': sellerUid });
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        //Check seller owns at least one item in the order
        const sellerItems = order.orderItems.some(item => item.sellerUid.toString() === sellerUid);
        if (!sellerItems) {
            throw new BadRequestException('You can only update orders containing your products');
        }

        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('Cannot update status of a cancelled order');
        }

        order.status = updateOrderStatusDto.status;
        await order.save();
        return order;
    }
}
    
