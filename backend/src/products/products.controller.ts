import { Controller, Get, Query, Param, UseGuards, Post, Body, Put, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-products.dto';
import { UpdateProductDto } from './dtos/update-products.dto';
import { QueryProductDto } from './dtos/query-products.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { SellerGuard } from '../auth/guards/seller.guard';
import {CurrentUser} from '../auth/decorators/current-user.decorator';
import {Public} from '../auth/decorators/public.decorator';


@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    // Public routes for browsing products
    @Public()
    @Get()
    findAll(@Query() query: QueryProductDto) {
        return this.productsService.findAll(query);
    }

    //Seller-only routes for managing products
    @Get('seller/my-products')
    @UseGuards(FirebaseAuthGuard, SellerGuard)
    findMySells(@CurrentUser() user: any) {
        return this.productsService.findMySells(user.uid);
    }

    @Public()
    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.productsService.findOne(slug);
    }

    @UseGuards(FirebaseAuthGuard, SellerGuard)
    @Post()
    create(@Body() createDto: CreateProductDto, @CurrentUser() user: any) {
        return this.productsService.create(createDto, user.uid);
    }   

    @UseGuards(FirebaseAuthGuard, SellerGuard)
    @Put(':slug')
    update(@Param('slug') slug: string, @Body() updateDto: UpdateProductDto, @CurrentUser() user: any) {
        return this.productsService.update(slug, updateDto, user.uid);
    }

    @UseGuards(FirebaseAuthGuard, SellerGuard)
    @Delete(':slug')
    delete(@Param('slug') slug: string, @CurrentUser() user: any) {
        return this.productsService.delete(slug, user.uid);
    }

}
