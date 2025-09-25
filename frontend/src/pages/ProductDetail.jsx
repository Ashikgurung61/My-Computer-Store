import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  ShoppingCart, 
  ArrowLeft,
  Check,
  Loader2,
  Minus,
  Plus,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Pencil,
  Trash2
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, loading: cartLoading } = useCart();
  const { isAdmin, token } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/products/${id}/?_=${new Date().getTime()}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const cartItem = cart?.items.find(item => item.product.id === product?.id);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        if (response.ok) {
          navigate('/products');
        } else {
          console.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">{error || 'Product Not Found'}</h1>
        <Button onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleAddToCart = () => {
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity + quantity);
    } else {
      addToCart(product, quantity);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/products" className="hover:text-foreground">Products</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{product.brand}</Badge>
              {isOutOfStock && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
               {!isOutOfStock && (
                <Badge variant="outline">In Stock</Badge>
              )}
            </div>
            
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            <p className="text-muted-foreground text-lg">{product.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock || quantity >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
               {!isOutOfStock && <p className="text-sm text-muted-foreground">{product.stock} pieces available</p>}
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock || cartLoading}
                className="flex-1"
              >
                {cartLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : cartItem ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                {cartItem ? 'Update Cart' : 'Add to Cart'}
              </Button>
              
              <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="lg">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {isAdmin && (
              <div className="flex gap-3 pt-4">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => navigate(`/product/update/${product.id}`)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Update
                </Button>
                <Button variant="destructive" size="lg" className="flex-1" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}

            {cartItem && (
              <p className="text-sm text-muted-foreground">
                Currently {cartItem.quantity} in cart
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-primary" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>2 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="h-4 w-4 text-primary" />
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-8">
        <Button variant="outline" onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;