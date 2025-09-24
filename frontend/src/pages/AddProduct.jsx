import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model_name: '',
    price: '',
    stock: 0,
    description: '',
    image: null,
    processor_brand: '',
    processor_name: '',
    ram_size: '',
    ram_type: '',
    storage_type: '',
    storage_capacity: '',
    screen_size: '',
    screen_resolution: '',
    screen_type: '',
    graphics_processor: '',
    os: '',
    warranty: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const productData = new FormData();
    for (const key in formData) {
      productData.append(key, formData[key]);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/products/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: productData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add product');
      }

      navigate('/products');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* General Information */}
            <div className="col-span-1 space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" value={formData.brand} onChange={handleInputChange} required />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="model_name">Model Name</Label>
              <Input id="model_name" name="model_name" value={formData.model_name} onChange={handleInputChange} required />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required />
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required />
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <Input id="image" name="image" type="file" onChange={handleFileChange} required />
            </div>

            {/* Core Specifications */}
            <div className="col-span-full border-t pt-6">
              <h3 className="text-lg font-medium">Core Specifications</h3>
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="processor_brand">Processor Brand</Label>
              <Input id="processor_brand" name="processor_brand" value={formData.processor_brand} onChange={handleInputChange} />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="processor_name">Processor Name</Label>
              <Input id="processor_name" name="processor_name" value={formData.processor_name} onChange={handleInputChange} />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="ram_size">RAM Size</Label>
              <Input id="ram_size" name="ram_size" value={formData.ram_size} onChange={handleInputChange} />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="ram_type">RAM Type</Label>
              <Input id="ram_type" name="ram_type" value={formData.ram_type} onChange={handleInputChange} />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="storage_type">Storage Type</Label>
              <Input id="storage_type" name="storage_type" value={formData.storage_type} onChange={handleInputChange} />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="storage_capacity">Storage Capacity</Label>
              <Input id="storage_capacity" name="storage_capacity" value={formData.storage_capacity} onChange={handleInputChange} />
            </div>

            {/* Display */}
            <div className="col-span-full border-t pt-6">
              <h3 className="text-lg font-medium">Display</h3>
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="screen_size">Screen Size</Label>
              <Input id="screen_size" name="screen_size" value={formData.screen_size} onChange={handleInputChange} />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="screen_resolution">Screen Resolution</Label>
              <Input id="screen_resolution" name="screen_resolution" value={formData.screen_resolution} onChange={handleInputChange} />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="screen_type">Screen Type</Label>
              <Input id="screen_type" name="screen_type" value={formData.screen_type} onChange={handleInputChange} />
            </div>

            {/* Graphics */}
            <div className="col-span-full border-t pt-6">
              <h3 className="text-lg font-medium">Graphics</h3>
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="graphics_processor">Graphics Processor</Label>
              <Input id="graphics_processor" name="graphics_processor" value={formData.graphics_processor} onChange={handleInputChange} />
            </div>

            {/* Other */}
            <div className="col-span-full border-t pt-6">
              <h3 className="text-lg font-medium">Other</h3>
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="os">Operating System</Label>
              <Input id="os" name="os" value={formData.os} onChange={handleInputChange} />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="warranty">Warranty</Label>
              <Input id="warranty" name="warranty" value={formData.warranty} onChange={handleInputChange} />
            </div>

            <div className="col-span-full">
              {error && <p className="text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
