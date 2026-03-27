import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle2, XCircle, Truck, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: any;
  shippingAddress: any;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const ordersRef = collection(db, `users/${user.uid}/orders`);
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, `users/${user.uid}/orders`, orderId));
      toast.success("Order cancelled successfully");
      setCancelConfirmId(null);
      fetchOrders();
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order: " + error.message);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-600';
      case 'Accepted': return 'bg-blue-500/10 text-blue-600';
      case 'Rejected': return 'bg-red-500/10 text-red-600';
      case 'Dispatched': return 'bg-purple-500/10 text-purple-600';
      case 'Delivered': return 'bg-green-500/10 text-green-600';
      default: return 'bg-surface text-tertiary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'Dispatched':
        return <Truck className="w-4 h-4" />;
      case 'Delivered':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-serif mb-4 text-neutral">Please log in</h2>
        <p className="text-tertiary mb-8">You need to be logged in to view your orders.</p>
        <Link to="/checkout" className="px-8 py-3 bg-secondary text-primary text-xs uppercase tracking-widest hover:bg-neutral transition-colors">
          Go to Login
        </Link>
      </div>
    );
  }

  const filteredOrders = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-4xl font-serif mb-8 text-neutral">Purchase History</h1>

      {orders.length > 0 && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar">
          {['All', 'Pending', 'Accepted', 'Dispatched', 'Delivered', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors whitespace-nowrap ${
                filterStatus === status 
                  ? 'bg-secondary text-primary border-secondary' 
                  : 'border-border text-tertiary hover:border-secondary hover:text-secondary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border">
          <Package className="w-12 h-12 text-tertiary mx-auto mb-4" />
          <h2 className="text-xl font-serif mb-2 text-neutral">No orders found</h2>
          <p className="text-tertiary mb-6">
            {filterStatus === 'All' ? 'When you make a purchase, it will appear here.' : `You have no ${filterStatus.toLowerCase()} orders.`}
          </p>
          {filterStatus === 'All' && (
            <Link to="/catalog" className="px-8 py-3 bg-secondary text-primary text-xs uppercase tracking-widest hover:bg-neutral transition-colors inline-block">
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((order, index) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface border border-border overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-tertiary mb-1">Order Placed</p>
                  <p className="text-sm font-medium text-neutral">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-tertiary mb-1">Total</p>
                  <p className="text-sm font-medium text-neutral">Rs. {order.totalAmount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-tertiary mb-1">Order #</p>
                  <p className="text-sm font-mono text-neutral">{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-4 self-start sm:self-auto">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm ${getStatusStyle(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {order.status}
                    </span>
                  </div>
                  {order.status !== 'Delivered' && order.status !== 'Rejected' && (
                    <div className="flex items-center gap-2">
                      {cancelConfirmId === order.id ? (
                        <>
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-3 py-1.5 bg-red-500 text-white text-xs uppercase tracking-widest hover:bg-red-600 transition-colors"
                          >
                            Confirm Cancel
                          </button>
                          <button 
                            onClick={() => setCancelConfirmId(null)}
                            className="px-3 py-1.5 border border-border text-tertiary text-xs uppercase tracking-widest hover:text-secondary hover:border-secondary transition-colors"
                          >
                            Keep Order
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setCancelConfirmId(order.id)}
                          className="flex items-center gap-1 text-xs uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" /> Cancel Order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-primary border border-border overflow-hidden shrink-0">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <Link to={`/product/${item.id}`} className="font-serif text-neutral hover:text-secondary transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-xs text-tertiary mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral">Rs. {item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
