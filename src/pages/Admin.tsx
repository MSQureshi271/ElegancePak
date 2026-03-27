import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { useAdminOrders, Order } from '../hooks/useAdminOrders';
import { doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { products as seedData } from '../data/products';
import { Trash2, Edit, Plus, Database, X, Loader2, Package, ShoppingBag, Eye, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const { orders, loading: ordersLoading } = useAdminOrders();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [seedConfirm, setSeedConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('All');

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  
  if (authLoading || productsLoading || ordersLoading) {
    return <div className="min-h-screen flex items-center justify-center pt-20">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center">
        <h1 className="text-4xl font-serif text-neutral mb-4">Access Denied</h1>
        <p className="text-tertiary">You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleSeedDatabase = () => {
    setSeedConfirm(true);
  };

  const confirmSeedDatabase = async () => {
    setSeedConfirm(false);
    for (const p of seedData) {
      try {
        await setDoc(doc(db, 'products', p.id), {
          ...p,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Error seeding product:", p.id, error);
      }
    }
    setToastMessage("Database seeded successfully!");
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const id = currentProduct.id || currentProduct.name.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'products', id), {
        id,
        name: currentProduct.name,
        notes: currentProduct.notes,
        price: Number(currentProduct.price),
        stock: Number(currentProduct.stock),
        img: currentProduct.img,
        color: currentProduct.color || '#ffffff',
        gender: currentProduct.gender || 'Unisex',
        collection: currentProduct.collection || 'Permanent',
        description: currentProduct.description,
        createdAt: currentProduct.createdAt || serverTimestamp()
      });
      setIsEditing(false);
      setCurrentProduct({});
      toast.success("Product saved successfully!");
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error("Error saving product: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, 'products', deleteConfirmId));
      setToastMessage("Product deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      setToastMessage("Error deleting product: " + error.message);
    }
    setDeleteConfirmId(null);
  };

  const handleUpdateOrderStatus = async (orderId: string, userId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const orderRef = doc(db, `users/${userId}/orders`, orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({ ...viewingOrder, status: newStatus });
      }
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update status: " + error.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-secondary text-primary px-6 py-3 rounded-sm shadow-lg z-50 flex items-center gap-4">
          <span className="text-sm font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-primary/70 hover:text-primary"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Seed Confirm Modal */}
      {seedConfirm && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border p-8 max-w-md w-full">
            <h3 className="text-2xl font-serif text-neutral mb-4">Seed Database</h3>
            <p className="text-tertiary mb-8">This will add the default products to the database. Do you want to continue?</p>
            <div className="flex gap-4">
              <button onClick={confirmSeedDatabase} className="flex-1 bg-secondary text-primary py-3 text-xs uppercase tracking-widest font-bold hover:bg-secondary/90 transition-colors">Confirm</button>
              <button onClick={() => setSeedConfirm(false)} className="flex-1 border border-border text-tertiary py-3 text-xs uppercase tracking-widest hover:border-secondary hover:text-secondary transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border p-8 max-w-md w-full">
            <h3 className="text-2xl font-serif text-neutral mb-4">Delete Product</h3>
            <p className="text-tertiary mb-8">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-red-700 transition-colors">Delete</button>
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 border border-border text-tertiary py-3 text-xs uppercase tracking-widest hover:border-secondary hover:text-secondary transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-12 border-b border-border pb-6">
        <h1 className="text-4xl font-serif text-secondary">
          {activeTab === 'dashboard' && 'Admin Dashboard'}
          {activeTab === 'products' && 'Manage Products'}
          {activeTab === 'orders' && 'Manage Orders'}
        </h1>
        <div className="flex gap-4">
          {activeTab !== 'dashboard' && (
            <button 
              onClick={() => { setActiveTab('dashboard'); setIsEditing(false); setViewingOrder(null); }}
              className="flex items-center gap-2 px-4 py-2 border border-border text-tertiary hover:text-secondary hover:border-secondary transition-colors text-xs uppercase tracking-widest"
            >
              Back to Dashboard
            </button>
          )}
          {activeTab === 'products' && (
            <>
              <button 
                onClick={handleSeedDatabase}
                className="flex items-center gap-2 px-4 py-2 border border-border text-tertiary hover:text-secondary hover:border-secondary transition-colors text-xs uppercase tracking-widest"
              >
                <Database className="w-4 h-4" /> Seed Data
              </button>
              <button 
                onClick={() => { setCurrentProduct({}); setIsEditing(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary hover:bg-secondary/90 transition-colors text-xs uppercase tracking-widest font-bold"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            onClick={() => setActiveTab('products')}
            className="bg-surface border border-border p-8 rounded-sm cursor-pointer hover:border-secondary transition-colors group flex flex-col items-center justify-center text-center min-h-[240px]"
          >
            <Package className="w-12 h-12 text-tertiary group-hover:text-secondary mb-4 transition-colors" />
            <h2 className="text-2xl font-serif text-neutral mb-2">Editing Products</h2>
            <p className="text-tertiary">Manage your catalog, add new items, or update existing product details.</p>
          </div>
          
          <div 
            onClick={() => setActiveTab('orders')}
            className="bg-surface border border-border p-8 rounded-sm cursor-pointer hover:border-secondary transition-colors group flex flex-col items-center justify-center text-center min-h-[240px]"
          >
            <ShoppingBag className="w-12 h-12 text-tertiary group-hover:text-secondary mb-4 transition-colors" />
            <h2 className="text-2xl font-serif text-neutral mb-2">Managing Orders</h2>
            <p className="text-tertiary">View customer orders, update fulfillment status, and manage requests.</p>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <>
          {isEditing ? (
        <div className="bg-surface border border-border p-8 rounded-sm">
          <h2 className="text-2xl font-serif text-neutral mb-6">{currentProduct.id ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSaveProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Name</label>
                <input required type="text" value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} className="w-full bg-primary border border-border p-3 text-neutral focus:border-secondary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Price (Rs.)</label>
                <input required type="number" min="1" value={currentProduct.price || ''} onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} className="w-full bg-primary border border-border p-3 text-neutral focus:border-secondary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Stock</label>
                <input required type="number" min="0" value={currentProduct.stock ?? ''} onChange={e => setCurrentProduct({...currentProduct, stock: e.target.value})} className="w-full bg-primary border border-border p-3 text-neutral focus:border-secondary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Notes</label>
                <input required type="text" value={currentProduct.notes || ''} onChange={e => setCurrentProduct({...currentProduct, notes: e.target.value})} className="w-full bg-primary border border-border p-3 text-neutral focus:border-secondary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Image URL</label>
                <input required type="url" value={currentProduct.img || ''} onChange={e => setCurrentProduct({...currentProduct, img: e.target.value})} className="w-full bg-primary border border-border p-3 text-neutral focus:border-secondary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Gradient Color</label>
                <div className="flex gap-4 items-center">
                  <input required type="color" value={currentProduct.color || '#ffffff'} onChange={e => setCurrentProduct({...currentProduct, color: e.target.value})} className="h-12 w-12 cursor-pointer bg-transparent border-none p-0" />
                  <input required type="text" value={currentProduct.color || '#ffffff'} onChange={e => setCurrentProduct({...currentProduct, color: e.target.value})} className="flex-1 bg-primary border border-border p-3 text-neutral focus:border-secondary focus:outline-none uppercase" placeholder="#FFFFFF" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Gender</label>
                <select required value={currentProduct.gender || 'Unisex'} onChange={e => setCurrentProduct({...currentProduct, gender: e.target.value})} className="w-full bg-primary border border-border p-3 text-neutral focus:border-secondary focus:outline-none">
                  <option value="Unisex">Unisex</option>
                  <option value="Feminine">Feminine</option>
                  <option value="Masculine">Masculine</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Collection</label>
                <select required value={currentProduct.collection || 'Permanent'} onChange={e => setCurrentProduct({...currentProduct, collection: e.target.value})} className="w-full bg-primary border border-border p-3 text-neutral focus:border-secondary focus:outline-none">
                  <option value="Permanent">Permanent</option>
                  <option value="Private Blend">Private Blend</option>
                  <option value="Limited">Limited</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Description</label>
              <textarea required rows={4} value={currentProduct.description || ''} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} className="w-full bg-primary border border-border p-3 text-neutral focus:border-secondary focus:outline-none"></textarea>
            </div>
            <div className="flex gap-4">
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-8 py-3 bg-secondary text-primary text-xs uppercase tracking-widest font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Product
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 border border-border text-tertiary text-xs uppercase tracking-widest hover:border-secondary hover:text-secondary transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-4 px-4 text-xs uppercase tracking-widest text-tertiary font-normal">Product</th>
                <th className="py-4 px-4 text-xs uppercase tracking-widest text-tertiary font-normal">Price</th>
                <th className="py-4 px-4 text-xs uppercase tracking-widest text-tertiary font-normal">Stock</th>
                <th className="py-4 px-4 text-xs uppercase tracking-widest text-tertiary font-normal">Collection</th>
                <th className="py-4 px-4 text-xs uppercase tracking-widest text-tertiary font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-surface overflow-hidden flex-shrink-0">
                        <img referrerPolicy="no-referrer" src={product.img} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-serif text-neutral">{product.name}</div>
                        <div className="text-xs text-tertiary">{product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-neutral">Rs. {product.price}</td>
                  <td className="py-4 px-4 text-neutral">{product.stock}</td>
                  <td className="py-4 px-4 text-tertiary">{product.collection}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => { setCurrentProduct(product); setIsEditing(true); }} className="p-2 text-tertiary hover:text-secondary transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-tertiary hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-tertiary">No products found. Click "Seed Data" to add default products.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}

      {activeTab === 'orders' && !viewingOrder && (
        <div className="space-y-6">
          {orders.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {['All', 'Pending', 'Accepted', 'Dispatched', 'Delivered', 'Rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setOrderFilterStatus(status)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors whitespace-nowrap ${
                    orderFilterStatus === status 
                      ? 'bg-secondary text-primary border-secondary' 
                      : 'border-border text-tertiary hover:border-secondary hover:text-secondary'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 px-4 text-xs uppercase tracking-widest text-tertiary font-normal">Date</th>
                  <th className="py-4 px-4 text-xs uppercase tracking-widest text-tertiary font-normal">Customer</th>
                  <th className="py-4 px-4 text-xs uppercase tracking-widest text-tertiary font-normal">Email</th>
                  <th className="py-4 px-4 text-xs uppercase tracking-widest text-tertiary font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {(orderFilterStatus === 'All' ? orders : orders.filter(o => o.status === orderFilterStatus)).map(order => (
                  <tr 
                    key={order.id} 
                    onClick={() => setViewingOrder(order)}
                    className="border-b border-border/50 hover:bg-surface/50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4 text-neutral">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-neutral">
                      {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                    </td>
                    <td className="py-4 px-4 text-tertiary">{order.userEmail}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs uppercase tracking-widest rounded-sm ${
                        order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' :
                        order.status === 'Accepted' ? 'bg-blue-500/10 text-blue-600' :
                        order.status === 'Rejected' ? 'bg-red-500/10 text-red-600' :
                        order.status === 'Dispatched' ? 'bg-purple-500/10 text-purple-600' :
                        order.status === 'Delivered' ? 'bg-green-500/10 text-green-600' :
                        'bg-surface text-tertiary'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(orderFilterStatus === 'All' ? orders : orders.filter(o => o.status === orderFilterStatus)).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-tertiary">
                      {orderFilterStatus === 'All' ? 'No orders found.' : `No ${orderFilterStatus.toLowerCase()} orders found.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && viewingOrder && (
        <div className="bg-surface border border-border p-8 rounded-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-serif text-neutral mb-2">Order Details</h2>
              <p className="text-tertiary text-sm">Order ID: {viewingOrder.id}</p>
            </div>
            <button 
              onClick={() => setViewingOrder(null)}
              className="text-tertiary hover:text-secondary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-tertiary mb-4 border-b border-border pb-2">Customer Information</h3>
              <div className="space-y-2 text-neutral">
                <p><span className="text-tertiary inline-block w-24">Name:</span> {viewingOrder.shippingAddress?.firstName} {viewingOrder.shippingAddress?.lastName}</p>
                <p><span className="text-tertiary inline-block w-24">Email:</span> {viewingOrder.userEmail}</p>
                <p><span className="text-tertiary inline-block w-24">Phone:</span> {viewingOrder.shippingAddress?.phone}</p>
              </div>

              <h3 className="text-xs uppercase tracking-widest text-tertiary mt-8 mb-4 border-b border-border pb-2">Shipping Address</h3>
              <div className="space-y-1 text-neutral">
                <p>{viewingOrder.shippingAddress?.address}</p>
                <p>{viewingOrder.shippingAddress?.city}, {viewingOrder.shippingAddress?.province} {viewingOrder.shippingAddress?.postalCode}</p>
                <p>{viewingOrder.shippingAddress?.country}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-tertiary mb-4 border-b border-border pb-2">Order Status</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-tertiary">Current Status:</span>
                  <span className={`px-3 py-1 text-sm uppercase tracking-widest rounded-sm font-bold ${
                    viewingOrder.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' :
                    viewingOrder.status === 'Accepted' ? 'bg-blue-500/10 text-blue-600' :
                    viewingOrder.status === 'Rejected' ? 'bg-red-500/10 text-red-600' :
                    viewingOrder.status === 'Dispatched' ? 'bg-purple-500/10 text-purple-600' :
                    viewingOrder.status === 'Delivered' ? 'bg-green-500/10 text-green-600' :
                    'bg-surface text-tertiary'
                  }`}>
                    {viewingOrder.status}
                  </span>
                </div>
                
                <div className="mt-4">
                  <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Update Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Pending', 'Accepted', 'Rejected', 'Dispatched'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleUpdateOrderStatus(viewingOrder.id, viewingOrder.userId, status)}
                        disabled={isUpdatingStatus || viewingOrder.status === status}
                        className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                          viewingOrder.status === status 
                            ? 'bg-secondary text-primary border-secondary opacity-50 cursor-not-allowed' 
                            : 'border-border text-tertiary hover:border-secondary hover:text-secondary'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-xs uppercase tracking-widest text-tertiary mb-4 border-b border-border pb-2">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 px-4 text-xs uppercase tracking-widest text-tertiary font-normal">Item</th>
                    <th className="py-2 px-4 text-xs uppercase tracking-widest text-tertiary font-normal">Price</th>
                    <th className="py-2 px-4 text-xs uppercase tracking-widest text-tertiary font-normal">Qty</th>
                    <th className="py-2 px-4 text-xs uppercase tracking-widest text-tertiary font-normal text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingOrder.items.map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-surface overflow-hidden flex-shrink-0">
                            <img referrerPolicy="no-referrer" src={item.img} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="font-serif text-neutral">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-neutral">Rs. {item.price}</td>
                      <td className="py-4 px-4 text-neutral">{item.quantity}</td>
                      <td className="py-4 px-4 text-neutral text-right">Rs. {item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-4 px-4 text-right font-serif text-tertiary">Total Amount:</td>
                    <td className="py-4 px-4 text-right font-serif text-xl text-secondary">Rs. {viewingOrder.totalAmount}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => {
                handleUpdateOrderStatus(viewingOrder.id, viewingOrder.userId, 'Delivered');
                setViewingOrder(null);
              }}
              disabled={isUpdatingStatus}
              className="px-8 py-3 bg-green-600 text-white text-xs uppercase tracking-widest font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark as Delivered
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
