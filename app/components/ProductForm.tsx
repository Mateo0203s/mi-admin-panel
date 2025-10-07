'use client'

import { useState, useEffect } from 'react';

// Interfaz para definir la estructura de un Producto
interface Product {
  id?: string;
  name: string;
  type: 'verduleria' | 'huevo';
  stock_quantity: number;
  cost_price: number;
  sale_price: number | null;
  status: 'activo' | 'inactivo';
}

// Interfaz para definir las propiedades que recibe este componente
interface ProductFormProps {
  product: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    name: '',
    type: 'verduleria',
    stock_quantity: 0,
    cost_price: 0,
    sale_price: 0,
    status: 'activo',
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Usamos Number() para los campos numéricos para asegurar que el tipo de dato sea correcto
    const newValue = e.target.type === 'number' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '15px' }}>
        <label>Nombre:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Tipo:</label>
        <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
          <option value="verduleria">Verdulería</option>
          <option value="huevo">Huevo</option>
        </select>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Stock:</label>
        <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label>Precio Costo:</label>
          <input type="number" step="0.01" name="cost_price" value={formData.cost_price} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label>Precio Venta:</label>
          <input type="number" step="0.01" name="sale_price" value={formData.sale_price || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>
      </div>
       <div style={{ marginBottom: '15px' }}>
        <label>Estado:</label>
        <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="submit" style={{ fontWeight: 'bold' }}>Guardar</button>
      </div>
    </form>
  );
}