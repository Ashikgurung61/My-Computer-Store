import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, Truck, Package } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();

  // Mock order data - in a real app, you'd fetch this based on the id
  const order = {
    id: 'ORD002',
    date: '2025-09-27',
    total: 899.99,
    status: 'Out for Delivery',
    shippingAddress: {
      street: '123 Tech Lane',
      city: 'Innovate City',
      zip: '54321',
      country: 'Techland'
    },
    items: [
      { id: 1, name: 'SuperFast Laptop 15"', quantity: 1, price: 899.99 },
    ],
  };

  const trackingSteps = [
    { name: 'Processing', icon: <Package /> },
    { name: 'Out for Delivery', icon: <Truck /> },
    { name: 'Delivered', icon: <CheckCircle /> },
  ];

  const currentStepIndex = trackingSteps.findIndex(step => step.name === order.status);

  return (
    <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-semibold">Order ID: {order.id}</p>
                <p className="text-sm text-muted-foreground">Date: {order.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Total</p>
                <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
              </div>
            </div>
            <Separator />
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Items Ordered</h3>
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2">
                  <p>{item.name} (x{item.quantity})</p>
                  <p>${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
            <p>{order.shippingAddress.country}</p>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Order Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {trackingSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`flex items-center justify-center h-10 w-10 rounded-full ${index <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {React.cloneElement(step.icon, { size: 20 })}
                    </div>
                    {index < trackingSteps.length - 1 && (
                      <div className={`flex-grow w-0.5 mt-2 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`}></div>
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold ${index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {index === currentStepIndex ? 'In Progress' : index < currentStepIndex ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetail;
