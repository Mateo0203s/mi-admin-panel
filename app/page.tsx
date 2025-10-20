// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Usando el alias que ya configuramos

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Si hay una sesión activa, lo mandamos al dashboard
        router.replace('/dashboard');
      } else {
        // Si no hay sesión, lo mandamos al login
        router.replace('/login');
      }
    };

    checkUserAndRedirect();
  }, [router]);

  // Mientras redirige, mostramos un loader simple
  return (
    <div className="d-flex vh-100 justify-content-center align-items-center">
        <h3>Cargando...</h3>
    </div>
  );
}