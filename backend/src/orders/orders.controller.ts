import { Controller, Post, UseGuards, Body, Get, Put, Patch, Delete, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { updateOrderStatusDto } from './dtos/update-order-status.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { BuyerGuard } from '../auth/guards/buyer.guard';
import { SellerGuard } from '../auth/guards/seller.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(FirebaseAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    //Buyer routes
    @UseGuards(BuyerGuard)
    @Post()
    async create(@CurrentUser() user: any, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(user.uid, createOrderDto);
    }

    @Get('my-orders')
    findMyOrders(@CurrentUser() user: any) {
        return this.ordersService.findMyOrders(user.uid);
    }

    @Get('my-orders/:id')
    findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.ordersService.findOne(id, user.uid);
    }

    @UseGuards(BuyerGuard)
    @Patch('my-orders/:id/cancel')
    cancelOrder(@CurrentUser() user: any, @Param('id') id: string) {
        return this.ordersService.cancelOrder(id, user.uid);
    }

    //Seller routes
    @UseGuards(SellerGuard)
    @Get('sellers/my-sales')
    findSellerOrders(@CurrentUser() user: any) {
        return this.ordersService.findSellerOrders(user.uid);
    }

    @UseGuards(SellerGuard)
    @Patch('sellers/my-sales/:id/status')
    updateOrderStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() updateOrderStatusDto: updateOrderStatusDto) {
        return this.ordersService.updateOrderStatus(id, user.uid, updateOrderStatusDto);
    }
}
