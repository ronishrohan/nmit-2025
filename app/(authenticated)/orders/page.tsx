import React, { useEffect, useState } from 'react';
import { useMoStore } from '@/app/store/moStore';
import { useUserStore } from '@/app/store/userStore';
import { useRouter } from 'next/navigation';

function Page() {
  const { manufacturingOrders, fetchManufacturingOrders, loading, error } = useMoStore();
  const { isLoggedIn } = useUserStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(manufacturingOrders);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchManufacturingOrders();
    }
  }, [isLoggedIn, router, fetchManufacturingOrders]);

  useEffect(() => {
    setFilteredOrders(
      manufacturingOrders.filter((order) =>
        order.id.toString().includes(searchQuery) &&
        (statusFilter === '' || order.status === statusFilter)
      )
    );
  }, [searchQuery, statusFilter, manufacturingOrders]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Order ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded p-2 mr-2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && filteredOrders.length === 0 && (
        <div>No Orders Found</div>
      )}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
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