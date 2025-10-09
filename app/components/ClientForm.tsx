'use client'

import { useState, useEffect } from 'react';

// Interfaz para definir la estructura de un Usuario/Cliente
export interface Client {
  id?: string;
  full_name: string;
  phone_number: string;
  client_type: 'minorista' | 'mayorista'; 
  freight_rate: number | null; // Tarifa de flete
}

// Propiedades que recibe el componente
interface ClientFormProps {
  client: Client | null;
  onSave: (clientData: Client) => void;
  onCancel: () => void;
}

export default function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<Client>({
    full_name: '',
    phone_number: '',
    client_type: 'minorista',
    freight_rate: 0,
  });

  useEffect(() => {
    if (client) {
      setFormData(client);
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
        <label>Nombre Completo:</label>
        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Teléfono:</label>
        <input type="text" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Tipo de Cliente:</label>
        {/* --- INICIO DE LA CORRECCIÓN --- */}
        <select 
          name="client_type" 
          value={formData.client_type || 'minorista'} // Si es null, usa 'minorista' como fallback
          onChange={handleChange} 
          style={{ width: '100%', padding: '8px' }}
        >
        {/* --- FIN DE LA CORRECCIÓN --- */}
          <option value="minorista">Minorista</option>
          <option value="mayorista">Mayorista</option>
        </select>
      </div>
       <div style={{ marginBottom: '15px' }}>
        <label>Tarifa de Flete:</label>
        <input type="number" step="0.01" name="freight_rate" value={formData.freight_rate || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="submit" style={{ fontWeight: 'bold' }}>Guardar Cambios</button>
      </div>
    </form>
  );
}