export const categoryFields = {
  computer: [
    { name: 'processor', label: 'Processor', type: 'text' },
    { name: 'ram', label: 'RAM', type: 'text' },
    { name: 'storage', label: 'Storage', type: 'text' },
    { name: 'screen_size', label: 'Screen Size', type: 'text' },
  ],
  vegetable: [
    { name: 'per_kg_price', label: 'Price per Kg', type: 'number' },
    { name: 'origin_country', label: 'Country of Origin', type: 'text' },
  ],
  accessories: [
    { name: 'type', label: 'Type', type: 'text' },
    { name: 'compatibility', label: 'Compatibility', type: 'text' },
  ],
  meat: [
    { name: 'cut', label: 'Cut', type: 'text' },
    { name: 'weight_kg', label: 'Weight (kg)', type: 'number' },
  ],
  // Add more categories and their specific fields here
};
