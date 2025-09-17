import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { laptops } from '../data/laptops';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, 
  ShoppingCart, 
  Search, 
  Filter,
  Eye,
  Check,
  Loader2
} from 'lucide-react';

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const { addToCart, isInCart, loading } = useCart();

  // Get unique categories and brands
  const categories = [...new Set(laptops.map(laptop => laptop.category))];
  const brands = [...new Set(laptops.map(laptop => laptop.brand))];

  // Filter and sort laptops
  const filteredAndSortedLaptops = useMemo(() => {
    let filtered = laptops.filter(laptop => {
      const matchesSearch = laptop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           laptop.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           laptop.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || laptop.category === filterCategory;
      const matchesBrand = filterBrand === 'all' || laptop.brand === filterBrand;
      
      return matchesSearch && matchesCategory && matchesBrand;
    });

    // Sort laptops
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchTerm, sortBy, filterCategory, filterBrand]);

  const handleAddToCart = (laptop) => {
    addToCart(laptop, 1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Premium Laptops</h1>
        <p className="text-muted-foreground">
          Discover our curated collection of high-performance laptops from top brands
        </p>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search laptops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger>
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map(brand => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="price-low">Price (Low to High)</SelectItem>
            <SelectItem value="price-high">Price (High to Low)</SelectItem>
            <SelectItem value="rating">Rating (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedLaptops.length} of {laptops.length} laptops
      </div>

      {/* Product Grid */}
      {filteredAndSortedLaptops.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">No laptops found matching your criteria</div>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterBrand('all');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedLaptops.map((laptop) => (
            <Card key={laptop.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={laptop.image}
                    alt={laptop.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!laptop.inStock && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                      Out of Stock
                    </Badge>
                  )}
                  {laptop.originalPrice > laptop.price && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      Sale
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {laptop.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        {laptop.rating} ({laptop.reviews})
                      </span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg line-clamp-1">{laptop.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {laptop.description}
                  </CardDescription>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{formatPrice(laptop.price)}</span>
                    {laptop.originalPrice > laptop.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(laptop.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {laptop.specifications.processor} • {laptop.specifications.memory}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to={`/product/${laptop.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(laptop)}
                    disabled={!laptop.inStock || loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : isInCart(laptop.id) ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    )}
                    {isInCart(laptop.id) ? 'Added' : 'Add to Cart'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;

