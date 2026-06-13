'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsService } from '@/services/products.service';
import { categoriesService } from '@/services/categories.service';
import { Category } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(1, 'Price must be at least ₹1'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  categorySlug: z.string().min(1, 'Please select a category'),
  images: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    categoriesService.getAll().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const images = data.images
        ? data.images.split('\n').map((u) => u.trim()).filter(Boolean)
        : [];

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', String(data.price));
      formData.append('stock', String(data.stock));
      formData.append('categorySlug', data.categorySlug);
      images.forEach((url) => formData.append('images', url));

      await productsService.create(formData);
      router.push('/seller/products');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create product');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Product Name"
            placeholder="e.g. Wireless Bluetooth Headphones"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              placeholder="Describe your product in detail..."
              rows={4}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              placeholder="999"
              min="0"
              step="0.01"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Stock"
              type="number"
              placeholder="50"
              min="0"
              error={errors.stock?.message}
              {...register('stock')}
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                errors.categorySlug ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('categorySlug')}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            {errors.categorySlug && (
              <p className="text-sm text-red-500">{errors.categorySlug.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">
              Image URLs <span className="text-gray-400 font-normal">(one per line, optional)</span>
            </label>
            <textarea
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              rows={3}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 resize-none text-sm"
              {...register('images')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={isSubmitting}>
              Create Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
