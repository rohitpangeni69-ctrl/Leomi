import React, { useState } from 'react';
import { addProduct } from '../lib/api';
import { toast } from 'sonner';

export const AddProductModal = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Women',
    sizes: 'S,M,L',
    colors: 'Black,White',
    images: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60',
    stock: '100',
    flashSalePrice: '',
    flashSaleHours: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const stockNum = parseInt(formData.stock) || 0;
      await addProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category as any,
        sizes: formData.sizes.split(',').map(s => s.trim()),
        colors: formData.colors.split(',').map(s => s.trim()),
        images: formData.images.split(',').map(s => s.trim()),
        inStock: stockNum > 0,
        stock: stockNum,
        flashSalePrice: formData.flashSalePrice ? parseFloat(formData.flashSalePrice) : undefined,
        flashSaleEndTime: formData.flashSaleHours ? Date.now() + (parseFloat(formData.flashSaleHours) * 3600000) : undefined
      });
      toast.success('Product added successfully');
      onClose();
    } catch (error: any) {
      toast.error('Failed to add product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold mb-4">Add Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded p-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded p-2">
                <option>Women</option><option>Men</option><option>Accessories</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sizes (comma separated)</label>
            <input type="text" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Colors (comma separated)</label>
            <input type="text" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Images (comma separated URLs)</label>
            <input type="text" value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} className="w-full border rounded p-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 pb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Flash Price</label>
              <input type="number" value={formData.flashSalePrice} onChange={e => setFormData({...formData, flashSalePrice: e.target.value})} className="w-full border rounded p-2" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Flash Hours</label>
              <input type="number" value={formData.flashSaleHours} onChange={e => setFormData({...formData, flashSaleHours: e.target.value})} className="w-full border rounded p-2" placeholder="Duration" />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50">
              {loading ? 'Saving...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
