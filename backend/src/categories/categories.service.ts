import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/categories.schema';
import { CreateCategoryDto } from './dtos/create-categories.dto';
import { UpdateCategoryDto } from './dtos/update-categories.dto';

@Injectable()
export class CategoriesService {

    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    ) { }

    private generateSlug(name: string): string {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    async findAll(): Promise<Category[]> {
        return this.categoryModel.find({isActive: true}).select('-__v').sort({ name: 1 });
    }

    async findOne(slug: string): Promise<Category> {
        const category = await this.categoryModel.findOne({slug, isActive: true}).select('-__v');
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    }

    async create(dto: CreateCategoryDto) {
        if (!dto.name) {
            throw new Error('Category name is required');
        }

        const slug = this.generateSlug(dto.name);

        const existingCategory = await this.categoryModel.findOne({ slug });

        if (existingCategory) {
            throw new Error('Category with this name already exists');
        }

        const category = await this.categoryModel.create({...dto, slug });
        return category.save();
    }

    async update(slug: string, dto: UpdateCategoryDto) {
        const updateSlug = dto.name ? this.generateSlug(dto.name) : undefined;

        const updatedCategory = await this.categoryModel.findOneAndUpdate(
            { slug },
            { ...dto, slug: updateSlug },
            { new: true }
        );
        if (!updatedCategory) {
            throw new Error('Category not found');
        }
        return updatedCategory;
    }

    async remove(slug: string) {
        const result = await this.categoryModel.deleteOne({ slug });
        if (result.deletedCount === 0) {
            throw new Error('Category not found');
        }
        return { message: 'Category deleted successfully' };
    }
}