'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsService } from '@/services/products.service';
import { categoriesService } from '@/services/categories.service';
import { Category, Product } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import CategorySelect from '@/components/ui/CategorySelect';
import ImageUpload from '@/components/ui/ImageUpload';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(1, 'Price must be at least ₹1'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  categorySlug: z.string().min(1, 'Please select a category'),
});

type FormValues = z.input<typeof schema>;
type FormData = z.infer<typeof schema>;

export default function EditProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, any, FormData>({ resolver: zodResolver(schema), defaultValues: { categorySlug: '' } });

  const categorySlug = watch('categorySlug');

  useEffect(() => {
    Promise.all([
      categoriesService.getAll(),
      productsService.getOne(slug),
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.data);
      const p = prodRes.data;
      setProduct(p);
      setExistingImages(p.images || []);
      reset({
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        categorySlug: p.category?.slug || '',
      });
    }).catch(() => {
      setError('Failed to load product');
    }).finally(() => setLoadingProduct(false));
  }, [slug, reset]);

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', String(data.price));
      formData.append('stock', String(data.stock));
      formData.append('categorySlug', data.categorySlug);
      formData.append('existingImages', JSON.stringify(existingImages));
      imageFiles.forEach((file) => formData.append('images', file));

      await productsService.update(slug, formData);
      router.push('/seller/products');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to update product');
    }
  };

  if (loadingProduct) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Product not found</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline text-sm">Go back</button>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
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
              min="0"
              step="0.01"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              error={errors.stock?.message}
              {...register('stock')}
            />
          </div>

          <CategorySelect
            categories={categories}
            value={categorySlug}
            onChange={(slug) => setValue('categorySlug', slug, { shouldValidate: true })}
            onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
            error={errors.categorySlug?.message}
          />

          <ImageUpload
            existingImages={existingImages}
            onRemoveExisting={(url) => setExistingImages((prev) => prev.filter((u) => u !== url))}
            files={imageFiles}
            onFilesChange={setImageFiles}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
