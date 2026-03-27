import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reviews from '../components/Reviews';
import { useProducts } from '../hooks/useProducts';
import SafeImage from '../components/SafeImage';

export default function Home() {
  const { products, loading } = useProducts();
  
  // Get top 3 products for featured section
  const featuredProducts = products.slice(0, 3);
  const signatureProduct = products.length > 0 ? products[0] : null;

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            referrerPolicy="no-referrer"
            src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2000&auto=format&fit=crop" 
            alt="Luxury Perfume Bottle" 
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent transition-colors duration-300" />
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.span 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="block text-xs uppercase tracking-[0.3em] text-secondary mb-6"
          >
            Welcome to
          </motion.span>
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-light tracking-tight mb-8 text-neutral"
          >
            Elegance<span className="italic text-secondary">Pak</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-tertiary max-w-lg mx-auto mb-10 text-xl md:text-2xl font-serif leading-relaxed"
          >
            Effortless Elegance Everyday
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <Link to="/catalog" className="inline-flex items-center gap-3 border border-secondary/50 px-8 py-4 text-sm uppercase tracking-widest text-secondary hover:bg-secondary hover:text-primary transition-all duration-300 group">
              Discover the Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Signature Perfume Section */}
      <section className="py-32 bg-surface border-y border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : signatureProduct ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="aspect-square bg-surface rounded-sm overflow-hidden transition-colors duration-300 relative flex items-center justify-center p-8"
                style={{
                  background: `linear-gradient(to bottom, ${signatureProduct.color || 'var(--color-surface)'} 0%, var(--color-primary) 100%)`
                }}
              >
                <img 
                  referrerPolicy="no-referrer"
                  src={signatureProduct.img} 
                  alt={signatureProduct.name} 
                  className="max-w-full max-h-full object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              >
                <span className="text-xs uppercase tracking-widest text-secondary mb-4 block">Our Signature Scent</span>
                <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight text-neutral">
                  {signatureProduct.name.split(' ')[0]} <br/>
                  <span className="italic text-secondary">{signatureProduct.name.split(' ').slice(1).join(' ')}</span>
                </h2>
                <p className="text-tertiary mb-8 leading-relaxed text-lg">
                  {signatureProduct.description}
                </p>
                <div className="mb-10">
                  <span className="text-xs text-secondary uppercase tracking-wider block mb-2">Key Notes</span>
                  <p className="text-sm text-tertiary">{signatureProduct.notes}</p>
                </div>
                <Link to={`/product/${signatureProduct.id}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border-b border-secondary/50 pb-1 text-secondary hover:border-secondary transition-colors">
                  Check Out <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-secondary">The Permanent Collection</h2>
            <p className="text-tertiary text-sm max-w-md">Our iconic fragrances, crafted with the rarest ingredients sourced from around the globe.</p>
          </div>
          <Link to="/catalog" className="text-xs uppercase tracking-widest border-b border-secondary/50 pb-1 text-secondary hover:border-secondary transition-colors flex items-center gap-2">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className="group cursor-pointer"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-[3/4] bg-surface mb-6 overflow-hidden rounded-sm relative transition-colors duration-300">
                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10" />
                    <img 
                      referrerPolicy="no-referrer"
                      src={product.img} 
                      alt={product.name}
                      className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-xl mb-1 text-neutral">{product.name}</h3>
                      <p className="text-xs text-tertiary">{product.notes}</p>
                    </div>
                    <span className="text-sm text-secondary">Rs. {product.price}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Reviews Section */}
      <Reviews />
    </div>
  );
}
