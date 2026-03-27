import { X, Minus, Plus, ArrowRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import SafeImage from './SafeImage';

export default function ShoppingBag({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-primary border-l border-border z-[70] flex flex-col transition-colors duration-300"
          >
            <div className="flex items-center justify-between p-6 border-b border-border transition-colors duration-300">
              <h2 className="text-lg font-serif tracking-widest text-secondary">YOUR BAG ({cartCount})</h2>
              <button onClick={onClose} className="text-tertiary hover:text-secondary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-tertiary mb-6">Your bag is currently empty.</p>
                  <Link 
                    to="/catalog" 
                    onClick={onClose}
                    className="px-8 py-3 border border-secondary text-secondary text-xs uppercase tracking-widest hover:bg-secondary hover:text-primary transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-6">
                    <div className="w-24 h-32 bg-surface rounded-sm overflow-hidden flex-shrink-0 transition-colors duration-300">
                      <img referrerPolicy="no-referrer" src={item.img} alt={item.name} className="w-full h-full object-cover opacity-95" />
                    </div>
                    <div className="flex flex-col justify-between flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-serif text-lg text-neutral">{item.name}</h3>
                          <p className="text-xs text-tertiary mt-1">Eau de Parfum • 50ml</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-tertiary hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border rounded-sm transition-colors duration-300">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 text-tertiary hover:text-secondary transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs w-8 text-center text-neutral">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-2 text-tertiary hover:text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm text-secondary">Rs. {item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-primary transition-colors duration-300">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-tertiary uppercase tracking-widest">Subtotal</span>
                  <span className="text-lg font-serif text-secondary">Rs. {cartTotal}</span>
                </div>
                <p className="text-xs text-tertiary/70 mb-6">Shipping and taxes calculated at checkout.</p>
                <Link 
                  to="/checkout"
                  onClick={onClose}
                  className="w-full bg-secondary text-primary py-4 text-sm uppercase tracking-widest font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
