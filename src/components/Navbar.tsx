import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Sun, Moon, X, Shield, User, LogOut, Trash2, Edit, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { toast } from 'sonner';

export default function Navbar({ onOpenBag, isDarkMode, toggleTheme }: { onOpenBag: () => void, isDarkMode: boolean, toggleTheme: () => void }) {
  const { cartCount } = useCart();
  const { user, userProfile, isAdmin, signOut, deleteAccount } = useAuth();
  const { products } = useProducts();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    await signOut();
    toast.success("Successfully logged out!");
    navigate('/');
  };

  const handleDeleteAccountClick = () => {
    setIsProfileDropdownOpen(false);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    setDeleteError('');
    try {
      await deleteAccount();
      setShowDeleteConfirm(false);
      navigate('/');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setDeleteError("Please log out and log back in to verify your identity before deleting your account.");
      } else {
        setDeleteError("Failed to delete account. Please try again.");
      }
    }
  };

  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.notes.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed w-full z-40 top-0 bg-primary/90 backdrop-blur-md border-b border-border transition-colors duration-300"
      >
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="flex items-center h-20">
            <div className="flex items-center gap-6 flex-1 justify-start">
              <button onClick={toggleTheme} className="text-tertiary hover:text-secondary transition-colors" aria-label="Toggle Theme">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsSearchOpen(true)} className="text-tertiary hover:text-secondary transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            <Link to="/" className="text-2xl font-serif tracking-widest text-secondary shrink-0 text-center">
              ElegancePak
            </Link>

            <div className="flex items-center gap-6 flex-1 justify-end">
              <Link to="/catalog" className="hidden sm:block text-xs uppercase tracking-widest text-tertiary hover:text-secondary transition-colors">
                Shop
              </Link>
              {isAdmin && (
                <Link to="/admin" className="hidden sm:flex items-center gap-1 text-xs uppercase tracking-widest text-secondary hover:text-secondary/80 transition-colors">
                  <Shield className="w-3 h-3" /> Admin
                </Link>
              )}
              
              <div className="hidden sm:block h-4 w-[1px] bg-border"></div>

              <button onClick={onOpenBag} className="text-tertiary hover:text-secondary transition-colors relative" title="Shopping Bag">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-primary text-[10px] font-bold flex items-center justify-center rounded-full transition-colors duration-300">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="text-tertiary hover:text-secondary transition-colors flex items-center gap-2" 
                    title="Profile"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-primary border border-border rounded-md shadow-lg py-1 z-50"
                      >
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-medium text-neutral truncate">
                            {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}` : user.email}
                          </p>
                        </div>
                        <Link 
                          to="/profile" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-tertiary hover:bg-surface hover:text-secondary transition-colors"
                        >
                          <Edit className="w-4 h-4" /> Edit info
                        </Link>
                        <Link 
                          to="/orders" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-tertiary hover:bg-surface hover:text-secondary transition-colors"
                        >
                          <Package className="w-4 h-4" /> Purchase History
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-tertiary hover:bg-surface hover:text-secondary transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" /> Log out
                        </button>
                        <button 
                          onClick={handleDeleteAccountClick}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <Trash2 className="w-4 h-4" /> Delete account
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="text-tertiary hover:text-secondary transition-colors" title="Sign In">
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral/80 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-primary p-6 max-w-md w-full border border-border shadow-2xl"
            >
              <h3 className="text-xl font-serif text-neutral mb-4">Delete Account</h3>
              <p className="text-tertiary mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              {deleteError && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                  {deleteError}
                </div>
              )}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteError('');
                  }}
                  className="px-4 py-2 text-sm uppercase tracking-widest text-tertiary hover:text-neutral transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAccount}
                  className="px-4 py-2 bg-red-500 text-white text-sm uppercase tracking-widest hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-primary/95 backdrop-blur-xl flex flex-col transition-colors duration-300"
          >
            <div className="max-w-3xl mx-auto w-full px-4 pt-20 pb-6">
              <div className="flex justify-between items-center mb-8 border-b border-border pb-3">
                <input 
                  type="text" 
                  placeholder="Search fragrances, notes..." 
                  className="w-full bg-transparent text-2xl font-serif text-neutral placeholder:text-tertiary/50 focus:outline-none"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={() => setIsSearchOpen(false)} className="text-tertiary hover:text-secondary transition-colors ml-4">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {searchQuery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[60vh] pr-4">
                  {searchResults.length > 0 ? searchResults.map(product => (
                    <Link 
                      key={product.id} 
                      to={`/product/${product.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex gap-6 group items-center"
                    >
                      <div className="w-20 h-24 bg-surface rounded-sm overflow-hidden flex-shrink-0">
                        <img referrerPolicy="no-referrer" src={product.img} alt={product.name} className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl text-neutral group-hover:text-secondary transition-colors">{product.name}</h3>
                        <p className="text-sm text-tertiary mt-1">{product.notes}</p>
                        <p className="text-sm text-secondary mt-2">Rs. {product.price}</p>
                      </div>
                    </Link>
                  )) : (
                    <p className="text-tertiary text-lg">No fragrances found matching "{searchQuery}".</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
