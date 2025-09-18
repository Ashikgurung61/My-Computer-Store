import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Laptop, 
  Shield, 
  Truck, 
  CreditCard, 
  Star,
  ArrowRight,
  CheckCircle,
  PlusCircle
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  const features = [
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Free shipping on orders over $500 with 2-day delivery"
    },
    {
      icon: CreditCard,
      title: "Easy Payments",
      description: "Multiple payment options with secure checkout"
    }
  ];

  const benefits = [
    "Premium laptop brands",
    "Competitive pricing",
    "Expert customer support",
    "30-day return policy",
    "Warranty protection",
    "Latest technology"
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm">
            Premium Laptop Store
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Find Your Perfect
            <span className="text-primary block">Laptop</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the latest laptops from top brands. From gaming powerhouses to 
            ultrabooks for professionals, we have the perfect device for every need.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Button size="lg" asChild>
                <Link to="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {isAdmin && (
                <Button size="lg" variant="outline" asChild>
                  <Link to="/add-product">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add New Product
                  </Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-muted-foreground">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">50+</div>
            <div className="text-muted-foreground">Laptop Models</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">4.8</div>
            <div className="text-muted-foreground flex items-center justify-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              Average Rating
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Why Choose TechStore?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing the best laptop shopping experience with 
            premium products and exceptional service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 rounded-2xl p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Everything You Need</h2>
              <p className="text-muted-foreground text-lg">
                From budget-friendly options to high-end gaming machines, 
                we have carefully curated a selection of the best laptops 
                available in the market.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {!isAuthenticated && (
              <Button size="lg" asChild>
                <Link to="/signup">
                  Start Shopping Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>

          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
              <Laptop className="h-32 w-32 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold">Ready to Find Your Perfect Laptop?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found their ideal laptop 
            through TechStore. Sign up today and start exploring our premium collection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/signup">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

