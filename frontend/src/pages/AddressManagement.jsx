import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, Edit, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const AddressManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    is_default: false,
  });

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const fetchAddresses = async () => {
    if (!token) {
      setLoading(false);
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
      } else {
        toast.error('Failed to fetch addresses.');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Error fetching addresses.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddOrUpdateAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editingAddress ? 'PUT' : 'POST';
    const url = editingAddress 
      ? `${API_BASE_URL}/addresses/${editingAddress.id}/` 
      : `${API_BASE_URL}/addresses/`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
        setIsAdding(false);
        setEditingAddress(null);
        setFormData({
          first_name: '',
          last_name: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zip_code: '',
          country: 'United States',
          is_default: false,
        });
        fetchAddresses();
        navigate('/checkout');
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to save address.');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Error saving address.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/addresses/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Address deleted successfully!');
        fetchAddresses();
      } else {
        toast.error('Failed to delete address.');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Error deleting address.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (address) => {
    setEditingAddress(address);
    setFormData(address);
    setIsAdding(true);
  };

  const handleSetDefault = async (id) => {
    setLoading(true);
    try {
      // First, unset current default if any
      const currentDefault = addresses.find(addr => addr.is_default);
      if (currentDefault && currentDefault.id !== id) {
        await fetch(`${API_BASE_URL}/addresses/${currentDefault.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
          body: JSON.stringify({ is_default: false }),
        });
      }

      // Then set the new default
      const response = await fetch(`${API_BASE_URL}/addresses/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ is_default: true }),
      });

      if (response.ok) {
        toast.success('Default address set successfully!');
        fetchAddresses();
      } else {
        toast.error('Failed to set default address.');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Error setting default address.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Addresses</h1>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        )}
      </div>

      {isAdding || editingAddress ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOrUpdateAddress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address Line</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor="is_default">Set as default address</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingAddress(null);
                    setFormData({
                      first_name: '',
                      last_name: '',
                      phone: '',
                      address: '',
                      city: '',
                      state: '',
                      zip_code: '',
                      country: 'United States',
                      is_default: false,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingAddress ? 'Update Address' : 'Add Address'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <p className="text-muted-foreground text-center">No addresses found. Please add a new address.</p>
          ) : (
            <RadioGroup 
              value={addresses.find(addr => addr.is_default)?.id?.toString()} 
              onValueChange={(value) => handleSetDefault(parseInt(value))}
            >
              {addresses.map((address) => (
                <Card key={address.id} className="relative">
                  <CardContent className="p-4 flex items-start space-x-4">
                    <RadioGroupItem value={address.id.toString()} id={`address-${address.id}`} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={`address-${address.id}`} className="flex flex-col space-y-1 cursor-pointer">
                        <div className="font-semibold flex items-center">
                          {address.first_name} {address.last_name}
                          {address.is_default && (
                            <Badge variant="secondary" className="ml-2">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{address.address}</p>
                        <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.zip_code}</p>
                        <p className="text-sm text-muted-foreground">{address.country}</p>
                        <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
                      </Label>
                    </div>
                    <div className="flex space-x-2 absolute top-4 right-4">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleEditClick(address)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/cart')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
        {addresses.length > 0 && !isAdding && (
          <Button onClick={() => navigate('/checkout')} disabled={loading}>
            Proceed to Payment
            <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddressManagement;
