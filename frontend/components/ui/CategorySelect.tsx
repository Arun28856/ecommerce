'use client';

import { useState } from 'react';
import { categoriesService } from '@/services/categories.service';
import { Category } from '@/types';
import Input from './Input';
import Button from './Button';

const ADD_NEW_VALUE = '__add_new__';

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (slug: string) => void;
  onCategoryCreated: (category: Category) => void;
  error?: string;
}

export default function CategorySelect({
  categories,
  value,
  onChange,
  onCategoryCreated,
  error,
}: CategorySelectProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === ADD_NEW_VALUE) {
      setAdding(true);
      setCreateError('');
      return;
    }
    onChange(selected);
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;

    setCreating(true);
    setCreateError('');
    try {
      const res = await categoriesService.create({ name });
      onCategoryCreated(res.data);
      onChange(res.data.slug);
      setAdding(false);
      setNewName('');
    } catch (err: any) {
      setCreateError(err?.response?.data?.message ?? 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-gray-700">Category</label>
      <select
        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        value={value}
        onChange={handleSelectChange}
      >
        <option value="">Select a category</option>
        {categories.map((c) => (
          <option key={c._id} value={c.slug}>{c.name}</option>
        ))}
        <option value={ADD_NEW_VALUE}>+ Add new category</option>
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {adding && (
        <div className="mt-2 flex items-start gap-2">
          <div className="flex-1">
            <Input
              placeholder="New category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              error={createError}
            />
          </div>
          <Button type="button" onClick={handleCreate} loading={creating}>
            Add
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setAdding(false);
              setNewName('');
              setCreateError('');
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
