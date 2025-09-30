import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Truck, 
  Shield, 
  Loader2,
  ArrowLeft,
  Lock,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
  const { cart, getCartTotal, getCartItemsCount, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Payment Information
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Options
    saveInfo: false,
  });

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      if (!token) {
        setAddressLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/addresses/`, {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const defaultAddr = data.find(addr => addr.is_default) || data[0];
          setSelectedAddress(defaultAddr);
        } else {
          toast.error('Failed to fetch addresses.');
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Error fetching addresses.');
      } finally {
        setAddressLoading(false);
      }
    };
    fetchDefaultAddress();
  }, [token]);

  const subtotal = getCartTotal();
  const shipping = subtotal > 200 ? 0 : 29.99;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedAddress) {
      newErrors.address = 'Please select a shipping address.';
    }

    // Payment validation
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
      if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
      if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
      if (!formData.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
      
      // Basic card number validation (should be 16 digits)
      if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
      
      // CVV validation
      if (formData.cvv.length !== 3) {
        newErrors.cvv = 'CVV must be 3 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate order data
      const orderData = {
        orderId: `ORD-${Date.now()}`,
        items: cart.items,
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress: selectedAddress,
        paymentMethod: formData.paymentMethod,
        orderDate: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Store order data in localStorage
      localStorage.setItem('techstore_last_order', JSON.stringify(orderData));
      
      // Clear cart
      clearCart();
      
      // Navigate to order confirmation
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Payment failed:', error);
      // In a real app, show error message
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (addressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedAddress) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 p-4">
        <MapPin className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No Shipping Address Found</h2>
        <p className="text-muted-foreground">
          Please add a shipping address to proceed with checkout.
        </p>
        <Button onClick={() => navigate('/addresses')}>
          Add Shipping Address
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/cart')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your order for {getCartItemsCount()} items
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="font-medium">{selectedAddress.first_name} {selectedAddress.last_name}</p>
                  <p className="text-muted-foreground">{selectedAddress.address}</p>
                  <p className="text-muted-foreground">{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip_code}</p>
                  <p className="text-muted-foreground">{selectedAddress.country}</p>
                  <p className="text-muted-foreground">Phone: {selectedAddress.phone}</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/addresses')}>
                  Change Address
                </Button>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Credit/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal">PayPal (Demo)</Label>
                  </div>
                </RadioGroup>

                {formData.paymentMethod === 'card' && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className={errors.cardName ? 'border-destructive' : ''}
                      />
                      {errors.cardName && (
                        <p className="text-sm text-destructive">{errors.cardName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className={errors.cardNumber ? 'border-destructive' : ''}
                      />
                      {errors.cardNumber && (
                        <p className="text-sm text-destructive">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className={errors.expiryDate ? 'border-destructive' : ''}
                        />
                        {errors.expiryDate && (
                          <p className="text-sm text-destructive">{errors.expiryDate}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className={errors.cvv ? 'border-destructive' : ''}
                        />
                        {errors.cvv && (
                          <p className="text-sm text-destructive">{errors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saveInfo"
                    checked={formData.saveInfo}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, saveInfo: checked }))
                    }
                  />
                  <Label htmlFor="saveInfo" className="text-sm">
                    Save payment information for future orders
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Demo Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Demo Mode:</strong> This is a simulated checkout. No real payment will be processed.
                Use any test card number like 4111111111111111.
              </AlertDescription>
            </Alert>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Pay {formatPrice(total)}
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Your payment information is secure and encrypted
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;

