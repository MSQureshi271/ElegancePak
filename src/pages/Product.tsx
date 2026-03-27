import { motion } from 'motion/react';
import { useState } from 'react';
import { ArrowRight, Plus, Minus, Check } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import SafeImage from '../components/SafeImage';

export default function Product() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('notes');
  const [isAdded, setIsAdded] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 text-center px-4">
        <h1 className="text-4xl font-serif text-neutral mb-4">Fragrance Not Found</h1>
        <p className="text-tertiary mb-8">The scent you are looking for does not exist or has been discontinued.</p>
        <Link to="/catalog" className="px-8 py-4 bg-secondary text-primary text-sm uppercase tracking-widest font-bold hover:bg-secondary/90 transition-colors">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div 
      className="pt-20 min-h-screen transition-colors duration-500"
      style={{
        background: `linear-gradient(to bottom, ${product.color || 'var(--color-surface)'} 0%, var(--color-primary) 100%)`
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative h-[60vh] flex items-center justify-center mb-16"
        >
          <img 
            referrerPolicy="no-referrer"
            src={product.img} 
            alt={product.name} 
            className="max-w-full max-h-full object-contain filter drop-shadow-2xl"
          />
        </motion.div>

        {/* Details Section */}
        <div className="flex flex-col justify-center items-center text-center bg-primary/40 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-border/50 shadow-xl">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full"
          >
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest text-secondary mb-3 block">Eau de Parfum • {product.gender}</span>
              <h1 className="text-4xl md:text-6xl font-serif mb-4 text-neutral">{product.name}</h1>
              <div className="flex items-center justify-center gap-4">
                <span className="text-tertiary text-sm">50ml / 1.7 fl oz</span>
                <span className="w-1 h-1 rounded-full bg-border"></span>
                <span className="text-2xl font-serif text-secondary">Rs. {product.price}</span>
              </div>
            </div>

            <p className="text-tertiary leading-relaxed mb-12 max-w-2xl mx-auto text-lg">
              {product.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 max-w-md mx-auto">
              <div className={`flex items-center border border-border rounded-sm transition-colors duration-300 bg-primary/50 ${product.stock === 0 ? 'opacity-50' : ''}`}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.stock === 0}
                  className="p-4 text-tertiary hover:text-secondary transition-colors disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm w-12 text-center text-neutral font-medium">{product.stock === 0 ? 0 : quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={product.stock === 0 || quantity >= product.stock}
                  className="p-4 text-tertiary hover:text-secondary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={isAdded || product.stock === 0}
                className={`w-full sm:w-auto px-12 py-4 text-sm uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center gap-2 group ${
                  product.stock === 0
                    ? 'bg-neutral/20 text-tertiary cursor-not-allowed border border-border'
                    : isAdded 
                      ? 'bg-green-800 text-white border border-green-700' 
                      : 'bg-secondary text-primary hover:bg-secondary/90 shadow-lg hover:shadow-xl'
                }`}
              >
                {product.stock === 0 ? (
                  <>Out of Stock</>
                ) : isAdded ? (
                  <>Added <Check className="w-4 h-4" /></>
                ) : (
                  <>
                    Add to Bag
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Accordion / Tabs */}
            <div className="border-t border-border/50 pt-10 transition-colors duration-300 max-w-2xl mx-auto text-left">
              <div className="flex justify-center gap-8 mb-8 border-b border-border/50 pb-4 transition-colors duration-300">
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`text-xs uppercase tracking-widest transition-colors ${activeTab === 'notes' ? 'text-secondary font-bold' : 'text-tertiary hover:text-secondary'}`}
                >
                  Olfactory Notes
                </button>
                <button 
                  onClick={() => setActiveTab('ingredients')}
                  className={`text-xs uppercase tracking-widest transition-colors ${activeTab === 'ingredients' ? 'text-secondary font-bold' : 'text-tertiary hover:text-secondary'}`}
                >
                  Ingredients
                </button>
                <button 
                  onClick={() => setActiveTab('shipping')}
                  className={`text-xs uppercase tracking-widest transition-colors ${activeTab === 'shipping' ? 'text-secondary font-bold' : 'text-tertiary hover:text-secondary'}`}
                >
                  Shipping
                </button>
              </div>

              <div className="min-h-[120px] text-center">
                {activeTab === 'notes' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div>
                      <span className="text-xs text-secondary uppercase tracking-wider block mb-2">Key Notes</span>
                      <p className="text-base text-neutral">{product.notes}</p>
                    </div>
                    <div>
                      <span className="text-xs text-secondary uppercase tracking-wider block mb-2">Collection</span>
                      <p className="text-base text-neutral">{product.collection}</p>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'ingredients' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-base text-neutral leading-relaxed">
                      Alcohol Denat., Parfum (Fragrance), Aqua (Water), Citronellol, Geraniol, Linalool, Limonene, Eugenol, Farnesol, Citral, Benzyl Benzoate, Cinnamal, Benzyl Alcohol.
                    </p>
                  </motion.div>
                )}
                {activeTab === 'shipping' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-base text-neutral leading-relaxed">
                      Complimentary standard shipping on all orders. Express shipping available at checkout. Returns accepted within 14 days of delivery, provided the seal remains unbroken.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
