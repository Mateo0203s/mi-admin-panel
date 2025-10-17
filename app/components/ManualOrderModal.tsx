// app/components/ManualOrderModal.tsx
'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { createOrderFromTextAndRevalidate } from "@/app/pedidos/actions";
interface User {
  id: string;
  full_name: string;
}

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

export default function ManualOrderModal({ isOpen, onClose, onOrderCreated }: ManualOrderModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [orderText, setOrderText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Cargar la lista de clientes cuando se abre el modal
      const fetchUsers = async () => {
        const { data } = await supabase.from('users').select('id, full_name').order('full_name');
        if (data) setUsers(data);
      };
      fetchUsers();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedUserId || !orderText.trim()) {
      alert('Por favor, selecciona un cliente y pega la lista del pedido.');
      return;
    }
    setIsLoading(true);

    try {
      // Llamamos a nuestra nueva Server Action
      const result = await createOrderFromTextAndRevalidate(selectedUserId, orderText);

      alert(result);
      onOrderCreated();
      onClose();
      setOrderText('');
      setSelectedUserId('');

    } catch (error: any) {
      alert('Error al crear el pedido: ' + error.message);
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Cargar Pedido Manual</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="client-select" className="form-label">1. Selecciona el Cliente</label>
              <select 
                id="client-select" 
                className="form-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- Elige un cliente --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="order-text" className="form-label">2. Pega la Lista del Pedido</label>
              <textarea 
                id="order-text"
                className="form-control" 
                rows={15}
                placeholder="Pega aquí la lista de productos, uno por línea..."
                value={orderText}
                onChange={(e) => setOrderText(e.target.value)}
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Procesando...' : 'Crear Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}