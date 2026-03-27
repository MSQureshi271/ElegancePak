export interface Product {
  id: string;
  name: string;
  notes: string;
  price: number;
  img: string;
  color?: string;
  gender: 'Unisex' | 'Feminine' | 'Masculine';
  collection: 'Permanent' | 'Private Blend' | 'Limited';
  description: string;
  stock: number;
}

export const products: Product[] = [
  { 
    id: 'obsidian-rose', 
    name: 'Obsidian Rose', 
    notes: 'Damask Rose, Oud, Black Pepper', 
    price: 285, 
    img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop', 
    color: '#4a0e17',
    gender: 'Unisex', 
    collection: 'Private Blend', 
    description: 'A dark, intoxicating blend that reimagines the classic rose. Damask rose petals are steeped in smoked oud and crushed black pepper, creating a fragrance that is simultaneously romantic and dangerous.',
    stock: 15
  },
  { 
    id: 'velvet-iris', 
    name: 'Velvet Iris', 
    notes: 'Iris, Leather, Vanilla', 
    price: 260, 
    img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop', 
    color: '#4b0082',
    gender: 'Feminine', 
    collection: 'Permanent', 
    description: 'A soft, powdery embrace of Tuscan iris and supple white leather, sweetened by a whisper of Madagascar vanilla.',
    stock: 8
  },
  { 
    id: 'santal-blanc', 
    name: 'Santal Blanc', 
    notes: 'Sandalwood, Fig, Musk', 
    price: 295, 
    img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop', 
    color: '#d2b48c',
    gender: 'Unisex', 
    collection: 'Permanent', 
    description: 'Creamy Australian sandalwood brightened by the green, milky sap of crushed fig leaves, resting on a bed of clean skin musk.',
    stock: 5
  },
  { 
    id: 'amber-nuit', 
    name: 'Amber Nuit', 
    notes: 'Amber, Bergamot, Patchouli', 
    price: 310, 
    img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop', 
    color: '#b8860b',
    gender: 'Masculine', 
    collection: 'Private Blend', 
    description: 'A luminous, golden amber glowing against the dark, earthy richness of aged patchouli, lifted by a spark of Calabrian bergamot.',
    stock: 0
  },
  { 
    id: 'midnight-vetiver', 
    name: 'Midnight Vetiver', 
    notes: 'Vetiver, Smoke, Cedar', 
    price: 340, 
    img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop', 
    color: '#2f4f4f',
    gender: 'Masculine', 
    collection: 'Limited', 
    description: 'The scent of a forest at midnight. Earthy Haitian vetiver shrouded in tendrils of woodsmoke and dry Atlas cedar.',
    stock: 2
  },
  { 
    id: 'lumiere-d-or', 
    name: "Lumière d'Or", 
    notes: 'Orange Blossom, Honey, Neroli', 
    price: 275, 
    img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop', 
    color: '#daa520',
    gender: 'Feminine', 
    collection: 'Permanent', 
    description: 'Liquid sunshine. Radiant orange blossom and bitter neroli dripping with the golden sweetness of wild honey.',
    stock: 20
  },
];
