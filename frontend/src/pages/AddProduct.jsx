import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import DynamicFields from '../components/DynamicFields';
import { categoryFields } from '../data/categoryFields';

const AddProduct = () => {
  const { category_name } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discount: 0,
    stock: 0,
    description: '',
    image: null,
    category_id: '',
  });
  const [specifications, setSpecifications] = useState({});
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/categories/');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          if (category_name) {
            const selectedCategory = data.find(c => c.name.toLowerCase() === category_name.toLowerCase());
            if (selectedCategory) {
              setFormData(prev => ({ ...prev, category_id: selectedCategory.id }));
            }
          }
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [category_name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category_id: value }));
    setSpecifications({});
  };

  const handleSpecificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSpecifications(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const productData = new FormData();
    for (const key in formData) {
      productData.append(key, formData[key]);
    }
    productData.append('specifications', JSON.stringify(specifications));

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

  const selectedCategoryName = categories.find(c => c.id === formData.category_id)?.name.toLowerCase();
  const fields = selectedCategoryName ? categoryFields[selectedCategoryName] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-1 space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input id="discount" name="discount" type="number" value={formData.discount} onChange={handleInputChange} />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={handleCategoryChange} value={formData.category_id} disabled={!!category_name}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required />
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <Input id="image" name="image" type="file" onChange={handleFileChange} />
            </div>

            {fields && (
              <div className="col-span-full border-t pt-6">
                <h3 className="text-lg font-medium">Specifications</h3>
              </div>
            )}
            <DynamicFields fields={fields} specifications={specifications} handleSpecificationChange={handleSpecificationChange} />

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
