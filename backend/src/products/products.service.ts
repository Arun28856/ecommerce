import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {Model} from 'mongoose';
import { Product, ProductDocument} from './schemas/products.schema';
import {Category, CategoryDocument} from '../categories/schemas/categories.schema';
import {CreateProductDto} from './dtos/create-products.dto';
import {UpdateProductDto} from './dtos/update-products.dto';
import {QueryProductDto} from './dtos/query-products.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {

    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
        private cloudinaryService: CloudinaryService,
    ) {}

    private generateSlug(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    async findAll(query: QueryProductDto) {
        const { search, category, page = 1, limit = 10, sort } = query;
        const filter: any = { isActive: true };

        if (search) {
            filter.$text = { $search: search };
        }

        if (category) {
            const categoryDoc = await this.categoryModel.findOne({ slug: category });
            if (categoryDoc) {
                filter.category = categoryDoc._id;
            }
        }

        let sortOption: any = {createdAt: -1}; // default sort by newest
        if (sort === 'price_asc') {
            sortOption = { price: 1 };
        }

        if (sort === 'price_desc') {
            sortOption = { price: -1 };
        }

        if (sort === 'rating') {
            sortOption = { rating: -1 };
        }

        if (sort === 'newest') {
            sortOption = { createdAt: -1 };
        }

        const skip = (page - 1) * limit;
        const products = await this.productModel.find(filter).
        populate('category', 'name slug').
        sort(sortOption).skip(skip).limit(limit).select('-__v');
        const total = await this.productModel.countDocuments(filter);
        
        return {
            data: products,
            total,
            page,
            limit,
        };
    }

    async findOne(slug: string) {
        const product = await this.productModel.
        findOne({ slug, isActive: true }).populate('category', 'name slug').select('-__v');

        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return product;
    }

    async findMySells(sellerUid: string) {
        const products = await this.productModel.find({ sellerUid }).populate('category', 'name slug').
        select('-__v').sort({ createdAt: -1 });
        return products;
    }

    async create(createDto: CreateProductDto, files: Express.Multer.File[], sellerUid: string) {
        const category = await this.categoryModel.findOne({ slug: createDto.categorySlug });
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const slug = this.generateSlug(createDto.name);
        const images = await Promise.all(
            files.map((file) => this.cloudinaryService.uploadFile(file, `products/${sellerUid}`)),
        );

        const product = new this.productModel({
            ...createDto,
            images,
            slug,
            sellerUid,
            category: category._id,
            rating: 0,
            reviewCount: 0,
            isActive: true,
        });

        await product.save();
        return product.populate('category', 'name slug');
    }

    async update(id: string, updateDto: UpdateProductDto, existingImages: string[], files: Express.Multer.File[], sellerUid: string) {
        const product = await this.productModel.findOne({ slug: id });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        let categoryId = product.category;
        if (updateDto.categorySlug) {
            const category = await this.categoryModel.findOne({ slug: updateDto.categorySlug });
            if (!category) {
                throw new NotFoundException('Category not found');
            }
            categoryId = category._id;
        }

        const updateSlug = updateDto.name ? this.generateSlug(updateDto.name) : product.slug;

        const newImages = await Promise.all(
            files.map((file) => this.cloudinaryService.uploadFile(file, `products/${sellerUid}`)),
        );

        const updated = await this.productModel.findOneAndUpdate(
            { slug: id },
            {
                $set: {
                    ...updateDto,
                    slug: updateSlug,
                    category: categoryId,
                    images: [...existingImages, ...newImages],
                }
             },
            { new: true },
        )

        if (!updated) {
            throw new NotFoundException('Product not found');
        }

        return updated.populate('category', 'name slug');
    }

    async delete(id: string, sellerUid: string) {
        const product = await this.productModel.findOne({ slug: id });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        await this.productModel.findOneAndDelete({ slug: id });
        return { message: 'Product deleted successfully' };
    }
}