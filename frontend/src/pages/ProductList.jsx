import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const { addToCart, cart, loading } = useCart();
  const { isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const [imageUrls, setImageUrls] = React.useState({});

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

  const isInCart = (productId) => {
    return cart?.items?.some(item => item.product.id === productId);
  }

  // Filter and sort products
  const filteredAndSortedLaptops = useMemo(() => {
    let filteredProducts = products;
    if (filterCategory !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === filterCategory.toLowerCase());
    }
    return filteredProducts;
  }, [products, filterCategory]);

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

  return (
    <div className="space-y-8">
      {/* Category Section */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        <div
          className={`cursor-pointer p-2 rounded-lg ${filterCategory === 'all' ? 'bg-gray-200' : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-semibold">All</span>
          </div>
        </div>
        {categories.map((category) => (
          <div
            key={category.name}
            className={`cursor-pointer p-2 rounded-lg ${filterCategory === category.name ? 'bg-gray-200' : ''}`}
            onClick={() => setFilterCategory(category.name)}
          >
            {imageUrls[category.name] && (
              <img src={imageUrls[category.name]} alt={category.name} className="w-24 h-24 rounded-full object-cover" />
            )}
            <p className="text-center text-sm mt-2">{category.name}</p>
          </div>
        ))}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedLaptops.length} of {products.length} products
      </div>

      {/* Product Grid */}
      {filteredAndSortedLaptops.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">No products found matching your criteria</div>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedLaptops.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock === 0 && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                      Out of Stock
                    </Badge>
                  )}
                  {product.originalPrice > product.price && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      Sale
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to={`/product/${product.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={loading || product.stock === 0}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : isInCart(product.id) ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    )}
                    {isInCart(product.id) ? 'Added' : 'Add to Cart'}
                  </Button>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/product/update/${product.id}`)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;

