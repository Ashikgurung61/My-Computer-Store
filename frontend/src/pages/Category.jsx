import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const imageModules = import.meta.glob('../assets/images/*');

const categories = Object.entries(imageModules).map(([path, importer]) => {
  const fileName = path.split('/').pop();
  const categoryName = fileName.split('.')[0];
  return { name: categoryName, importer };
});

const Category = () => {
  const navigate = useNavigate();
  const [imageUrls, setImageUrls] = React.useState({});

  React.useEffect(() => {
    const loadImageUrls = async () => {
      const urls = {};
      for (const category of categories) {
        const module = await category.importer();
        urls[category.name] = module.default;
      }
      setImageUrls(urls);
    };
    loadImageUrls();
  }, []);

  const handleAddProductClick = (category) => {
    navigate(`/add-product/${category.name}`);
  };

  const handleViewProductsClick = (category) => {
    navigate(`/products?category=${category.name}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Choose a Category</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {categories.map((category) => (
          <div
            key={category.name}
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
          >
            {imageUrls[category.name] && (
              <img src={imageUrls[category.name]} alt={category.name} className="w-full h-48 object-cover" />
            )}
            <div className="p-4 flex-grow flex flex-col">
              <h2 className="text-lg font-semibold text-center mb-4">{category.name}</h2>
              <div className="mt-auto space-y-2">
                <Button onClick={() => handleViewProductsClick(category)} className="w-full">View Products</Button>
                <Button onClick={() => handleAddProductClick(category)} className="w-full" variant="outline">Add Product</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
