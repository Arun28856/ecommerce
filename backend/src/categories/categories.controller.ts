import { Controller, Get, UseGuards, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/create-categories.dto';
import { UpdateCategoryDto } from './dtos/update-categories.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { SellerGuard } from '../auth/guards/seller.auth.guard';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Public()
    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Public()
    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.categoriesService.findOne(slug);
    }

    @UseGuards(FirebaseAuthGuard, SellerGuard)
    @Post()
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @UseGuards(FirebaseAuthGuard, SellerGuard)
    @Put(':slug')
    update(@Param('slug') slug: string, @Body() dto: UpdateCategoryDto) {
        return this.categoriesService.update(slug, dto);
    }

    @UseGuards(FirebaseAuthGuard, SellerGuard)
    @Delete(':slug')
    remove(@Param('slug') slug: string) {
        return this.categoriesService.remove(slug);
    }

}
