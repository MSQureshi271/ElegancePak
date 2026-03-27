import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import SafeImage from '../components/SafeImage';

export default function Catalog() {
  const { products, loading } = useProducts();
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [collectionFilter, setCollectionFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Featured');

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (genderFilter !== 'All') {
      result = result.filter(p => p.gender === genderFilter);
    }
    if (collectionFilter !== 'All') {
      result = result.filter(p => p.collection === collectionFilter);
    }

    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, genderFilter, collectionFilter, sortBy]);

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-serif mb-6 text-secondary"
          >
            The Collection
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-tertiary max-w-2xl mx-auto text-sm"
          >
            Explore our complete range of artisanal fragrances. Each scent is a unique narrative, waiting to be worn.
          </motion.p>
        </div>

        {/* Filters Toolbar */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex justify-between items-center py-6 border-y border-border mb-8 transition-colors duration-300"
        >
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-xs uppercase tracking-widest transition-colors ${showFilters ? 'text-secondary' : 'text-tertiary hover:text-secondary'}`}
          >
            <Filter className="w-4 h-4" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className="flex items-center gap-6">
            <span className="text-xs text-tertiary/70 hidden sm:inline-block">{filteredProducts.length} Products</span>
            <div className="relative group">
              <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-tertiary hover:text-secondary transition-colors">
                Sort: {sortBy} <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-primary border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
                {['Featured', 'Price: Low to High', 'Price: High to Low'].map(option => (
                  <button 
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`block w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-surface transition-colors ${sortBy === option ? 'text-secondary' : 'text-tertiary'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Expandable Filter Area */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="p-8 bg-surface border border-border grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-sm font-serif text-secondary mb-4 uppercase tracking-widest">Gender</h3>
                  <div className="flex flex-wrap gap-3">
                    {['All', 'Unisex', 'Feminine', 'Masculine'].map(g => (
                      <button 
                        key={g}
                        onClick={() => setGenderFilter(g)}
                        className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${genderFilter === g ? 'border-secondary text-secondary bg-secondary/5' : 'border-border text-tertiary hover:border-secondary/50'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-serif text-secondary mb-4 uppercase tracking-widest">Collection</h3>
                  <div className="flex flex-wrap gap-3">
                    {['All', 'Permanent', 'Private Blend', 'Limited'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setCollectionFilter(c)}
                        className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${collectionFilter === c ? 'border-secondary text-secondary bg-secondary/5' : 'border-border text-tertiary hover:border-secondary/50'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filteredProducts.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + (i * 0.05), duration: 0.6 }}
                className={`group ${product.stock === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {product.stock === 0 ? (
                  <div className="block">
                    <div className="aspect-[3/4] bg-surface mb-6 overflow-hidden rounded-sm relative transition-colors duration-300">
                      <div className="absolute inset-0 bg-primary/20 transition-colors z-10 flex items-center justify-center">
                        <span className="bg-primary/90 text-secondary px-4 py-2 text-xs uppercase tracking-widest font-bold">Out of Stock</span>
                      </div>
                      <SafeImage 
                        src={product.img} 
                        alt={product.name}
                        className="w-full h-full object-cover opacity-95 transition-all duration-700"
                      />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif text-xl mb-1 text-neutral">{product.name}</h3>
                        <p className="text-xs text-tertiary">{product.notes}</p>
                      </div>
                      <span className="text-sm text-secondary">Rs. {product.price}</span>
                    </div>
                  </div>
                ) : (
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-[3/4] bg-surface mb-6 overflow-hidden rounded-sm relative transition-colors duration-300">
                      <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10" />
                      <SafeImage 
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
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <h3 className="text-2xl font-serif text-neutral mb-4">No fragrances found</h3>
            <p className="text-tertiary mb-8">Try adjusting your filters to discover more scents.</p>
            <button 
              onClick={() => { setGenderFilter('All'); setCollectionFilter('All'); }}
              className="px-8 py-3 border border-secondary text-secondary text-xs uppercase tracking-widest hover:bg-secondary hover:text-primary transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
