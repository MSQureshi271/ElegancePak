import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { doc, updateDoc, collection, addDoc, serverTimestamp, writeBatch, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
  const { user, userProfile, signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth();
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    province: '',
    city: '',
    address: '',
    postalCode: '',
    phone: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [finalOrder, setFinalOrder] = useState<{items: any[], total: number} | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        country: userProfile.country || '',
        province: userProfile.province || '',
        city: userProfile.city || '',
        address: userProfile.address || '',
        postalCode: userProfile.postalCode || '',
        phone: userProfile.phone || '',
        notes: userProfile.notes || ''
      });
    }
  }, [userProfile]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!isLogin && password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setAuthError('Email/Password sign-in is not enabled. Please use Google Sign-In or enable it in the Firebase Console.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setAuthError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError(err.message || 'Authentication failed');
      }
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Google authentication failed');
    }
  };

  const hasCompleteProfile = () => {
    return (
      userProfile?.firstName &&
      userProfile?.lastName &&
      userProfile?.country &&
      userProfile?.province &&
      userProfile?.city &&
      userProfile?.address &&
      userProfile?.postalCode &&
      userProfile?.phone
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData
      });
    } catch (error) {
      console.error("Error updating profile", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!user) return;
    
    setIsConfirming(true);
    try {
      const orderData = {
        userId: user.uid,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          img: item.img
        })),
        totalAmount: cartTotal,
        status: 'Pending',
        userEmail: user.email || '',
        createdAt: serverTimestamp(),
        shippingAddress: {
          firstName: userProfile?.firstName || '',
          lastName: userProfile?.lastName || '',
          address: userProfile?.address || '',
          city: userProfile?.city || '',
          province: userProfile?.province || '',
          country: userProfile?.country || '',
          postalCode: userProfile?.postalCode || '',
          phone: userProfile?.phone || ''
        }
      };

      const batch = writeBatch(db);
      const orderRef = doc(collection(db, `users/${user.uid}/orders`));
      batch.set(orderRef, orderData);

      for (const item of items) {
        const productRef = doc(db, 'products', item.id);
        batch.update(productRef, {
          stock: increment(-item.quantity)
        });
      }

      await batch.commit();

      setFinalOrder({ items: [...items], total: cartTotal });
      setOrderConfirmed(true);
      clearCart();
      toast.success("Order Confirmed! Thank you for your purchase.");
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("There was an error processing your order. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const displayItems = finalOrder ? finalOrder.items : items;
  const displayTotal = finalOrder ? finalOrder.total : cartTotal;

  if (items.length === 0 && !orderConfirmed) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-[70vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-serif mb-4 text-neutral">Your bag is empty</h2>
        <button onClick={() => navigate('/catalog')} className="px-8 py-3 bg-secondary text-primary text-xs uppercase tracking-widest hover:bg-neutral transition-colors">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-4xl font-serif mb-12 text-center text-neutral">Checkout</h1>

      {!user ? (
        <div className="max-w-md mx-auto">
          <div className="bg-surface p-8 border border-border">
            <h2 className="text-2xl font-serif mb-6 text-neutral text-center">{isLogin ? 'Login to Continue' : 'Create an Account'}</h2>
            
            {authError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="break-words">{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
              {!isLogin && (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Confirm Password</label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              )}
              <button type="submit" className="w-full py-4 bg-secondary text-primary text-xs uppercase tracking-widest hover:bg-neutral transition-colors">
                {isLogin ? 'Sign In' : 'Register'}
              </button>
            </form>

            <div className="flex items-center mb-6">
              <div className="flex-grow border-t border-border"></div>
              <span className="px-4 text-sm text-tertiary">Or continue with</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <button 
              onClick={handleGoogleAuth}
              className="w-full py-4 bg-primary border border-border text-neutral text-xs uppercase tracking-widest hover:border-secondary transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-tertiary hover:text-secondary transition-colors"
              >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      ) : !hasCompleteProfile() ? (
        <div className="bg-surface p-8 border border-border">
          <h2 className="text-2xl font-serif mb-2 text-neutral">Shipping Details</h2>
          <p className="text-tertiary text-sm mb-8">Please complete your profile to continue with checkout.</p>
          
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">First Name *</label>
                <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Last Name *</label>
                <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Email</label>
              <input type="email" value={user.email || ''} disabled className="w-full bg-primary/50 border border-border px-4 py-3 text-tertiary cursor-not-allowed" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Phone *</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 11)})} pattern="\d{11}" maxLength={11} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Country *</label>
                <input required type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Full Address *</label>
                <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">City *</label>
                <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Province/State *</label>
                <input required type="text" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Postal/ZIP Code *</label>
                <input required type="text" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5)})} pattern="\d{5}" maxLength={5} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Additional Notes (Optional)</label>
              <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary resize-none" />
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-secondary text-primary text-xs uppercase tracking-widest hover:bg-neutral transition-colors disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save & Continue'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-surface p-8 border border-border">
          <h2 className="text-2xl font-serif mb-6 text-neutral">Order Summary</h2>
          
          <div className="space-y-4 mb-8">
            {displayItems.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b border-border pb-4">
                <div className="flex items-center gap-4">
                  <img referrerPolicy="no-referrer" src={item.img} alt={item.name} className="w-12 h-16 object-cover" />
                  <div>
                    <p className="font-serif text-neutral">{item.name}</p>
                    <p className="text-xs text-tertiary">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-secondary">Rs. {item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-8 text-xl font-serif text-neutral">
            <span>Total</span>
            <span>Rs. {displayTotal}</span>
          </div>

          <div className="mb-8 p-4 bg-primary border border-border space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-tertiary mb-2 border-b border-border pb-2">Shipping To</h3>
            
            <div>
              <p className="text-xs text-tertiary uppercase tracking-wider mb-1">Full Name</p>
              <p className="text-sm text-neutral">{userProfile?.firstName} {userProfile?.lastName}</p>
            </div>
            
            <div>
              <p className="text-xs text-tertiary uppercase tracking-wider mb-1">Phone Number</p>
              <p className="text-sm text-neutral">{userProfile?.phone}</p>
            </div>
            
            <div>
              <p className="text-xs text-tertiary uppercase tracking-wider mb-1">Full Address</p>
              <p className="text-sm text-neutral">
                {userProfile?.address}, {userProfile?.city}, {userProfile?.province} {userProfile?.postalCode}, {userProfile?.country}
              </p>
            </div>
          </div>

          <button 
            onClick={handleConfirmOrder}
            disabled={orderConfirmed || isConfirming}
            className="w-full py-4 bg-secondary text-primary text-xs uppercase tracking-widest hover:bg-neutral transition-colors disabled:opacity-50 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {isConfirming && <Loader2 className="w-4 h-4 animate-spin" />}
            {orderConfirmed ? 'Processing...' : 'Confirm Order'}
          </button>
        </div>
      )}
    </div>
  );
}
