'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient';
import ClientModal from '@/app/components/ClientModal' 
import { Client } from '@/app/components/ClientForm' 

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)

  const fetchClients = async () => {
    const { data, error } = await supabase.from('users').select('*').order('full_name', { ascending: true });
    if (error) {
      console.error('Error fetching clients:', error)
    } else {
      setClients(data as Client[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleOpenModal = (client: Client) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClientToEdit(null);
  };

  const handleClientSaved = () => {
    fetchClients(); 
  };

  const filteredClients = clients.filter(c => c.full_name && c.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="text-center p-5"><h3>Cargando clientes...</h3></div>

  return (
    // --- INICIO DE LA ACTUALIZACIÓN VISUAL ---
    <div className="container mt-4">
      <div className="mb-4">
        <h1 className="h2">👥 Gestión de Clientes ({filteredClients.length})</h1>
        <p className="text-muted">Visualiza y gestiona la información de los clientes.</p>
      </div>

      <input 
        type="text" 
        placeholder="Buscar cliente..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
        className="form-control form-control-lg mb-4"
      />

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Tipo</th>
                  <th className="text-end">Tarifa Flete</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.full_name}</td>
                    <td>{client.phone_number || 'N/A'}</td>
                    <td className="text-capitalize">{client.client_type || 'minorista'}</td>
                    <td className="text-end">{client.freight_rate ? `$${client.freight_rate.toLocaleString('es-AR')}` : '-'}</td>
                    <td className="text-end">
                      <button onClick={() => handleOpenModal(client)} className="btn btn-sm btn-outline-secondary">
                         <i className="fas fa-pencil-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        clientToEdit={clientToEdit}
        onClientSaved={handleClientSaved}
      />
    </div>
    // --- FIN DE LA ACTUALIZACIÓN VISUAL ---
  )
}