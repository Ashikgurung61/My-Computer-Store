import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const DynamicFields = ({ fields, specifications, handleSpecificationChange }) => {
  if (!fields) {
    return null;
  }

  return (
    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map(field => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          {field.type === 'text' && (
            <Input
              id={field.name}
              name={field.name}
              value={specifications[field.name] || ''}
              onChange={handleSpecificationChange}
            />
          )}
          {field.type === 'number' && (
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={specifications[field.name] || ''}
              onChange={handleSpecificationChange}
            />
          )}
          {field.type === 'checkbox' && (
            <Checkbox
              id={field.name}
              name={field.name}
              checked={specifications[field.name] || false}
              onCheckedChange={(checked) => handleSpecificationChange({ target: { name: field.name, value: checked } })}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default DynamicFields;
