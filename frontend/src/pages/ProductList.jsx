import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  ShoppingCart, 
  Search, 
  Filter,
  Eye,
  Check,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-react';

const imageModules = import.meta.glob('../assets/images/*');

const categories = Object.entries(imageModules).map(([path, importer]) => {
  const fileName = path.split('/').pop();
  const categoryName = fileName.split('.')[0];
  return { name: categoryName, importer };
});

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const { addToCart, cart, loading } = useCart();
  const { isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const [timeBasedCategory, setTimeBasedCategory] = useState('');
  const [imageUrls, setImageUrls] = React.useState({});
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);

  React.useEffect(() => {
    const loadImageUrls = async () => {
      const urls = {};
      for (const category of categories) {
        const module = await category.importer();
        urls[category.name] = module.default;
      }
      setImageUrls(urls);
    };
    loadImageUrls();
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeBasedCategory('Breakfast');
    } else if (hour >= 12 && hour < 17) {
      setTimeBasedCategory('Package Food');
    } else {
      setTimeBasedCategory('Fish & Meat');
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/products/');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
      const oneWeekAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
      const recentItems = recentlyViewed.filter(item => item.timestamp > oneWeekAgo);
      const recentProductIds = recentItems.map(item => item.id);
      const recentProducts = products.filter(p => recentProductIds.includes(p.id));
      setRecentlyViewedProducts(recentProducts);
    }
  }, [products]);

  const isInCart = (productId) => {
    return cart?.items?.some(item => item.product.id === productId);
  }

  const handleAddToCart = (productId) => {
    addToCart(productId, 1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        if (response.ok) {
          setProducts(products.filter(p => p.id !== productId));
        } else {
          console.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const renderProductCard = (product) => (
    <Card key={product.id} className="group hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-24 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.stock === 0 && (
            <Badge variant="destructive" className="absolute top-1 left-1 text-xs px-1 py-0.5">
              Out of Stock
            </Badge>
          )}
          {product.discount > 0 && (
            <Badge variant="secondary" className="absolute top-1 right-1 text-xs px-1 py-0.5">
              {product.discount}% OFF
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-1 sm:p-2 space-y-1">
        <div className="space-y-0.5">
          <CardTitle className="text-sm sm:text-base line-clamp-1">{product.name}</CardTitle>
          <CardDescription className="text-xs line-clamp-1">
            {product.description}
          </CardDescription>
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold">{formatPrice(parseFloat(product.price) * (1 - parseFloat(product.discount) / 100))}</span>
            {product.discount > 0 && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">{formatPrice(parseFloat(product.price))}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-1 pt-1">
          <Button variant="outline" size="icon-xs" asChild className="flex-1">
            <Link to={`/product/${product.id}`}>
              <Eye className="h-3 w-3" />
            </Link>
          </Button>
          <Button
            size="icon-xs"
            onClick={() => handleAddToCart(product.id)}
            disabled={loading || product.stock === 0}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isInCart(product.id) ? (
              <Check className="h-3 w-3" />
            ) : (
              <ShoppingCart className="h-3 w-3" />
            )}
          </Button>
        </div>
        {isAdmin && (
          <div className="flex gap-1 pt-1">
            <Button variant="outline" size="xs" className="flex-1" onClick={() => navigate(`/product/update/${product.id}`)}>
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button variant="destructive" size="xs" className="flex-1" onClick={() => handleDelete(product.id)}>
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const timeBasedProducts = products.filter(p => p.category && p.category.name.toLowerCase() === timeBasedCategory.toLowerCase());
  const computerProducts = products.filter(p => p.category && p.category.name.toLowerCase() === 'laptops & computer');

  return (
    <div className="space-y-8">
      {/* Category Section */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`cursor-pointer p-2 rounded-lg`}
            onClick={() => navigate(`/category/${category.name}`)}
          >
            {imageUrls[category.name] && (
              <img src={imageUrls[category.name]} alt={category.name} className="w-24 h-24 rounded-full object-cover" />
            )}
            <p className="text-center text-sm mt-2">{category.name}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">{timeBasedCategory}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-4">
          {timeBasedProducts.length > 0 ? (
            timeBasedProducts.map(renderProductCard)
          ) : (
            <p>No products found for {timeBasedCategory}.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Laptops & Computer</h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-4">
          {computerProducts.length > 0 ? (
            computerProducts.map(renderProductCard)
          ) : (
            <p>No Laptops & Computer found.</p>
          )}
        </div>
      </div>

      {recentlyViewedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recently Viewed</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-4">
            {recentlyViewedProducts.map(renderProductCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
