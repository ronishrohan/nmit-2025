import React, { useEffect } from 'react';
import { useMoStore } from '@/app/store/moStore';
import { useUserStore } from '@/app/store/userStore';
import { useRouter } from 'next/navigation';

function Page() {
  const { manufacturingOrders, fetchManufacturingOrders, loading, error } = useMoStore();
  const { isLoggedIn } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchManufacturingOrders();
    }
  }, [isLoggedIn, router, fetchManufacturingOrders]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && manufacturingOrders.length === 0 && (
        <div>No Orders Yet</div>
      )}
      {!loading && !error && manufacturingOrders.length > 0 && (
        <div className="space-y-4">
          {manufacturingOrders.map((order) => (
            <div key={order.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-bold">Order #{order.id}</div>
                <div>Status: <span className="font-medium">{order.status}</span></div>
                <div>Product ID: {order.productId ?? 'N/A'}</div>
                <div>Quantity: {order.quantity ?? 'N/A'}</div>
                <div>Created: {order.createdAt ? String(order.createdAt) : 'N/A'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Page;