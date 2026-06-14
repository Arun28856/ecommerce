import { Controller, Get, Query, Param, UseGuards, Post, Body, Put, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-products.dto';
import { UpdateProductDto } from './dtos/update-products.dto';
import { QueryProductDto } from './dtos/query-products.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { SellerGuard } from '../auth/guards/seller.guard';
import {CurrentUser} from '../auth/decorators/current-user.decorator';
import {Public} from '../auth/decorators/public.decorator';
import { productImagesMulterOptions } from './multer.config';


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
    @UseInterceptors(FilesInterceptor('images', 5, productImagesMulterOptions))
    create(
        @Body() createDto: CreateProductDto,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser() user: any,
    ) {
        return this.productsService.create(createDto, files ?? [], user.uid);
    }

    @UseGuards(FirebaseAuthGuard, SellerGuard)
    @Put(':slug')
    @UseInterceptors(FilesInterceptor('images', 5, productImagesMulterOptions))
    update(
        @Param('slug') slug: string,
        @Body() updateDto: UpdateProductDto,
        @Body('existingImages') existingImagesRaw: string,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser() user: any,
    ) {
        const existingImages: string[] = existingImagesRaw ? JSON.parse(existingImagesRaw) : [];
        return this.productsService.update(slug, updateDto, existingImages, files ?? [], user.uid);
    }

    @UseGuards(FirebaseAuthGuard, SellerGuard)
    @Delete(':slug')
    delete(@Param('slug') slug: string, @CurrentUser() user: any) {
        return this.productsService.delete(slug, user.uid);
    }

}
