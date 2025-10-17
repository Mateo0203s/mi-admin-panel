'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Client } from '../clientes/page'; 

interface ClientFormProps {
  clientToEdit: Client | null;
  onSave: () => void;
  onClose: () => void;
}

export default function ClientForm({ clientToEdit, onSave, onClose }: ClientFormProps) {
  const [formData, setFormData] = useState<Client>({
    full_name: '',
    phone_number: '',
    client_type: 'Normal',
    freight_per_package: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientToEdit) {
      setFormData(clientToEdit);
    } else {
      setFormData({
        full_name: '', phone_number: '', client_type: 'Normal', freight_per_package: null
      });
    }
  }, [clientToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'client_type' && value === 'Normal') {
        newState.freight_per_package = null;
      }
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSubmit = {
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      client_type: formData.client_type,
      freight_per_package: formData.client_type === 'Con Flete' 
        ? (formData.freight_per_package ? parseFloat(String(formData.freight_per_package)) : 0) 
        : null,
    };

    let error;
    if (formData.id) {
      ({ error } = await supabase.from('users').update(dataToSubmit).eq('id', formData.id));
    } else {
      ({ error } = await supabase.from('users').insert(dataToSubmit));
    }

    if (error) {
      alert('Error al guardar el cliente: ' + error.message);
    } else {
      onSave();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="full_name" className="form-label">Nombre Completo</label>
        <input type="text" className="form-control" id="full_name" name="full_name" value={formData.full_name || ''} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label htmlFor="phone_number" className="form-label">Número de Teléfono</label>
        <input type="text" className="form-control" id="phone_number" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label htmlFor="client_type" className="form-label">Tipo de Cliente</label>
        {/* ===== CORRECCIÓN AQUÍ ===== */}
        <select className="form-select" id="client_type" name="client_type" value={formData.client_type || 'Normal'} onChange={handleChange}>
          <option value="Normal">Normal</option>
          <option value="Con Flete">Con Flete</option>
        </select>
      </div>
      
      {formData.client_type === 'Con Flete' && (
        <div className="mb-3">
          <label htmlFor="freight_per_package" className="form-label">Costo de Flete por Bulto</label>
          <input 
            type="number" 
            step="0.01" 
            className="form-control" 
            id="freight_per_package" 
            name="freight_per_package"
            value={formData.freight_per_package || ''} 
            onChange={handleChange} 
            placeholder="Ej: 1500"
            required
          />
        </div>
      )}

      <div className="modal-footer border-0 ps-0">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cliente'}
        </button>
      </div>
    </form>
  );
}