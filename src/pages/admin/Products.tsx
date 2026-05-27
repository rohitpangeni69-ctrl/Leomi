import React, { useState, useEffect } from 'react';
import { subscribeToProducts, deleteProduct } from '../../lib/api';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { AddProductModal } from '../../components/AddProductModal';
import { toast } from 'sonner';

export const ProductsAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted');
      } catch(e: any) {
        toast.error('Failed to delete: ' + e.message);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 shrink-0">
                      <img className="h-10 w-10 rounded object-cover" src={product.images[0]} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 truncate w-48">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-max ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.inStock ? 'In Stock' : 'Stock Out'}
                    </span>
                    {product.stock !== undefined && (
                      <span className="text-xs text-gray-500 font-mono">Qty: {product.stock}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col space-y-1">
                    <span>{formatPrice(product.price)}</span>
                    {product.flashSalePrice && product.flashSaleEndTime && product.flashSaleEndTime > Date.now() && (
                      <span className="text-xs font-bold text-red-600">⚡ {formatPrice(product.flashSalePrice)}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No products found. Add one!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && <AddProductModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
