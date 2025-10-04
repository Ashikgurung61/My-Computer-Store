import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../contexts/AuthContext';

const AddAdvertisement = () => {
  const [image, setImage] = useState(null);
  const [advertisements, setAdvertisements] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/advertisement/');
      if (response.ok) {
        const data = await response.json();
        setAdvertisements(data);
      } else {
        console.error('Failed to fetch advertisements.');
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert('Please select an image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/advertisement/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('Advertisement uploaded successfully!');
        fetchAdvertisements(); // Refresh the list
      } else {
        alert('Failed to upload advertisement.');
      }
    } catch (error) {
      console.error('Error uploading advertisement:', error);
      alert('An error occurred while uploading the advertisement.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/advertisement/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        if (response.ok) {
          alert('Advertisement deleted successfully!');
          fetchAdvertisements(); // Refresh the list
        } else {
          alert('Failed to delete advertisement.');
        }
      } catch (error) {
        console.error('Error deleting advertisement:', error);
        alert('An error occurred while deleting the advertisement.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Add Advertisement</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
        <div className="space-y-4">
          <Input type="file" onChange={handleImageChange} />
          <Button type="submit" className="w-full">Upload Advertisement</Button>
        </div>
      </form>

      <h2 className="text-2xl font-bold text-center mb-8">All Advertisements</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {advertisements.map((ad) => (
          <div key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={ad.image} alt={`Advertisement ${ad.id}`} className="w-full h-32 object-cover" />
            <div className="p-4">
              <Button onClick={() => handleDelete(ad.id)} className="w-full" variant="destructive">Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddAdvertisement;
