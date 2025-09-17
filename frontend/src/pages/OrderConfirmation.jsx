import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Calendar,
  Download,
  ArrowLeft,
  Home,
  ShoppingBag
} from 'lucide-react';

const OrderConfirmation = () => {
  const [orderData, setOrderData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get order data from localStorage
    const savedOrder = localStorage.getItem('techstore_last_order');
    if (savedOrder) {
      try {
        setOrderData(JSON.parse(savedOrder));
      } catch (error) {
        console.error('Error parsing order data:', error);
        navigate('/');
      }
    } else {
      // No order data found, redirect to home
      navigate('/');
    }
  }, [navigate]);

  if (!orderData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimatedDeliveryDate = formatDate(orderData.estimatedDelivery);
  const orderDate = formatDate(orderData.orderDate);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your order. We've received your payment and are processing your order.
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Order ID:</span>
                  <p className="text-muted-foreground">{orderData.orderId}</p>
                </div>
                <div>
                  <span className="font-medium">Order Date:</span>
                  <p className="text-muted-foreground">{orderDate}</p>
                </div>
                <div>
                  <span className="font-medium">Payment Method:</span>
                  <p className="text-muted-foreground capitalize">
                    {orderData.paymentMethod === 'card' ? 'Credit/Debit Card' : orderData.paymentMethod}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge variant="secondary">Processing</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Ordered */}
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.brand}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} each
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}
                </p>
                <p>{orderData.shippingAddress.address}</p>
                <p>
                  {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}
                </p>
                <p>{orderData.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Actions */}
        <div className="space-y-6">
          {/* Order Total */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(orderData.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {orderData.shipping === 0 ? 'Free' : formatPrice(orderData.shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(orderData.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total Paid</span>
                  <span>{formatPrice(orderData.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">Estimated Delivery:</p>
                <p className="text-muted-foreground">{estimatedDeliveryDate}</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Tracking:</p>
                <p className="text-muted-foreground">
                  You'll receive tracking information via email once your order ships.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            
            <Button className="w-full" asChild>
              <Link to="/products">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            
            <Button className="w-full" variant="outline" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center space-y-2">
              <div className="mx-auto w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Order Processing</p>
                <p className="text-muted-foreground">We're preparing your items for shipment</p>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="mx-auto w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Shipping</p>
                <p className="text-muted-foreground">Your order will be shipped within 1-2 business days</p>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="mx-auto w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Delivery</p>
                <p className="text-muted-foreground">Estimated delivery by {estimatedDeliveryDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Need help with your order? Contact our support team at{' '}
          <a href="mailto:support@techstore.com" className="text-primary hover:underline">
            support@techstore.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmation;

