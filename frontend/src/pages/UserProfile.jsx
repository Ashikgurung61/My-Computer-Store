import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Trash2, Edit } from 'lucide-react';

const UserProfile = () => {
  // Mock user data
  const [user, setUser] = useState({
    username: 'testuser',
    email: 'testuser@example.com',
    phone: '123-456-7890',
  });

  const [addresses, setAddresses] = useState([
    { id: 1, street: '123 Tech Lane', city: 'Innovate City', state: 'CA', zip: '54321', isDefault: true },
    { id: 2, street: '456 Code Avenue', city: 'Dev Town', state: 'NY', zip: '98765', isDefault: false },
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={user.username} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={user.phone} readOnly />
          </div>
          <Button className="w-full">Edit Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Addresses</CardTitle>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.map(address => (
            <div key={address.id} className="border p-4 rounded-lg flex justify-between items-start">
              <div>
                {address.isDefault && <Badge className="mb-2">Default</Badge>}
                <p className="font-medium">{address.street}</p>
                <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.zip}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
