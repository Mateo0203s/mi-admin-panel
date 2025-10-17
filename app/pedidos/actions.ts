'use server'

import { supabase } from '@/lib/supabaseClient'
import { revalidatePath } from 'next/cache'

// Definimos la estructura de los items que recibiremos
type OrderItemPayload = {
  product_id: string;
  quantity: number;
  unit_price: number;
}

// Esta es nuestra Server Action
export async function updateOrderAndRevalidate(orderId: string, items: OrderItemPayload[]) {
  // 1. Llamamos a la función de la base de datos para guardar los cambios
  const { data, error } = await supabase.rpc('editar_pedido', {
    p_order_id: orderId,
    p_items: items,
  })

  if (error) {
    // Si hay un error, lo devolvemos para que el frontend lo muestre
    throw new Error(error.message)
  }

  // 2. LA MAGIA: Le ordenamos a Next.js que invalide la caché de la página de listado
  revalidatePath('/pedidos')

  // Devolvemos los datos exitosos
  return data
}

export async function createOrderFromTextAndRevalidate(userId: string, orderText: string) {
  // 1. Llamamos a la función de la base de datos para crear el pedido
  const { data, error } = await supabase.rpc('create_order_from_text', {
    p_user_id: userId,
    p_order_text: orderText,
  })

  if (error) {
    throw new Error(error.message)
  }

  // 2. Le ordenamos a Next.js que invalide la caché de la lista de pedidos
  revalidatePath('/pedidos')

  return data
}