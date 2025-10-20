// components/AuthGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Si no hay sesión, redirigir al login.
        router.replace('/login')
      } else {
        // Si hay sesión, dejamos de cargar y mostramos el contenido.
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    // Muestra un loader mientras se verifica la sesión.
    return (
        <div className="d-flex vh-100 justify-content-center align-items-center">
            <h3>Verificando acceso...</h3>
        </div>
    );
  }

  // Si no está cargando (lo que implica que hay sesión), muestra las páginas protegidas.
  return <>{children}</>;
}