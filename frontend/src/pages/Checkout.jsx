import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CreditCard, 
  Truck, 
  Shield, 
  Loader2,
  ArrowLeft,
  Lock,
  MapPin,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
  const { cart, getCartTotal, getCartItemsCount, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: 'Senapati',
    state: 'Manipur',
    zip_code: '795106',
    country: 'India',
    is_default: false,
  });
  const [formData, setFormData] = useState({
    // Payment Information
    paymentMethod: 'cod',
    upiId: '',
    
    // Options
    saveInfo: false,
  });

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  const fetchAddresses = async () => {
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
        setAddresses(data);
        if (location.state && location.state.selectedAddress) {
          setSelectedAddress(location.state.selectedAddress);
        } else {
          const defaultAddr = data.find(addr => addr.is_default) || data[0];
          setSelectedAddress(defaultAddr);
        }
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

  useEffect(() => {
    fetchAddresses();
  }, [token, location.state]);

  const subtotal = getCartTotal();
  const shipping = subtotal > 200 ? 0 : 29.99;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const MEDIA_BASE_URL = 'http://127.0.0.1:8000/media/';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
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

  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/addresses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(newAddress),
      });

      if (response.ok) {
        const addedAddress = await response.json();
        toast.success('Address added successfully!');
        setIsAddingAddress(false);
        setNewAddress({
          first_name: '',
          last_name: '',
          phone: '',
          address: '',
          city: 'Senapati',
          state: 'Manipur',
          zip_code: '795106',
          country: 'India',
          is_default: false,
        });

        let updatedAddresses = [...addresses, addedAddress];

        if (updatedAddresses.length > 3) {
          const oldestAddress = updatedAddresses[0]; // Assuming oldest is the first one
          try {
            await fetch(`${API_BASE_URL}/addresses/${oldestAddress.id}/`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Token ${token}`,
              },
            });
            toast.info('Oldest address was removed to keep the list clean.');
            updatedAddresses.shift(); // Remove the oldest from the local list
          } catch (error) {
            console.error('Error deleting oldest address:', error);
            toast.error('Could not remove the oldest address.');
          }
        }

        setAddresses(updatedAddresses);
        setSelectedAddress(addedAddress);
        fetchAddresses(); // Re-sync with the server in the background
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to save address.');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Error saving address.');
    } finally {
      setIsProcessing(false);
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
    } else if (formData.paymentMethod === 'upi') {
      if (!formData.upiId.trim()) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(formData.upiId)) {
        newErrors.upiId = 'Invalid UPI ID format';
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

    if (formData.paymentMethod === 'upi') {
      try {
        // Simulate UPI payment processing
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
        toast.error('Payment failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Existing logic for other payment methods
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
    }
  };

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  if (!cart || !cart.items || cart.items.length === 0) {
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
                <div className="space-y-2">
                  <Label>Select Address</Label>
                  <Select 
                    value={selectedAddress ? selectedAddress.id : ''}
                    onValueChange={(value) => {
                      const address = addresses.find(a => a.id === parseInt(value));
                      setSelectedAddress(address);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an address" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map(address => (
                        <SelectItem key={address.id} value={address.id}>
                          {address.first_name} {address.last_name}, {address.address}, {address.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddNewAddress} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="First Name" name="first_name" value={newAddress.first_name} onChange={handleNewAddressChange} required />
                        <Input placeholder="Last Name" name="last_name" value={newAddress.last_name} onChange={handleNewAddressChange} required />
                      </div>
                      <Input placeholder="Phone" name="phone" value={newAddress.phone} onChange={handleNewAddressChange} required />
                      <Input placeholder="Address" name="address" value={newAddress.address} onChange={handleNewAddressChange} required />
                      <div className="grid grid-cols-3 gap-4">
                        <Input placeholder="City" name="city" value={newAddress.city} onChange={handleNewAddressChange} required />
                        <Input placeholder="State" name="state" value={newAddress.state} onChange={handleNewAddressChange} required />
                        <Input placeholder="Zip Code" name="zip_code" value={newAddress.zip_code} onChange={handleNewAddressChange} required />
                      </div>
                      <Input placeholder="Country" name="country" value={newAddress.country} onChange={handleNewAddressChange} required />
                      <div className="flex items-center space-x-2">
                        <Checkbox id="is_default" name="is_default" checked={newAddress.is_default} onCheckedChange={(checked) => setNewAddress(prev => ({ ...prev, is_default: checked }))} />
                        <Label htmlFor="is_default">Set as default</Label>
                      </div>
                      <Button type="button" onClick={handleAddNewAddress} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Address'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
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
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">Cash on Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi">UPI</Label>
                  </div>
                </RadioGroup>

                {formData.paymentMethod === 'upi' && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        name="upiId"
                        placeholder="yourname@okhdfcbank"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        className={errors.upiId ? 'border-destructive' : ''}
                      />
                      {errors.upiId && (
                        <p className="text-sm text-destructive">{errors.upiId}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
          </div>
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
                        src={item.product.image}
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

