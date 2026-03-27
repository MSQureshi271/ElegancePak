import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-border py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-serif tracking-widest mb-6 text-secondary">ElegancePak</h3>
            <p className="text-tertiary text-sm max-w-sm leading-relaxed">
              Crafting olfactory masterpieces since 1924. Each fragrance is a journey, a memory, a statement of pure elegance.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-secondary mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-tertiary hover:text-secondary transition-colors">The Collection</a></li>
              <li><a href="#" className="text-sm text-tertiary hover:text-secondary transition-colors">Our Story</a></li>
              <li><a href="#" className="text-sm text-tertiary hover:text-secondary transition-colors">Bespoke Services</a></li>
              <li><a href="#" className="text-sm text-tertiary hover:text-secondary transition-colors">Journal</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-secondary mb-6">Client Care</h4>
            <ul className="space-y-4">
              <li><Link to="/contact" className="text-sm text-tertiary hover:text-secondary transition-colors">Contact Us</Link></li>
              <li><a href="#" className="text-sm text-tertiary hover:text-secondary transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="text-sm text-tertiary hover:text-secondary transition-colors">FAQ</a></li>
              <li><a href="#" className="text-sm text-tertiary hover:text-secondary transition-colors">Store Locator</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300">
          <p className="text-xs text-tertiary/70">&copy; 2026 ElegancePak. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-tertiary/70 hover:text-secondary transition-colors">Instagram</a>
            <a href="#" className="text-xs text-tertiary/70 hover:text-secondary transition-colors">Pinterest</a>
            <a href="#" className="text-xs text-tertiary/70 hover:text-secondary transition-colors">TikTok</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
