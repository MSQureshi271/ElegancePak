import { motion } from 'motion/react';

const reviews = [
  {
    id: 1,
    quote: "The scent feels luxurious, lasts for hours, and honestly smells like a high-end international perfume.",
    author: "Bilal Hussain, Islamabad"
  },
  {
    id: 2,
    quote: "It’s amazing to see a Pakistani brand delivering such a refined fragrance experience.",
    author: "Usman Ali, Lahore"
  },
  {
    id: 3,
    quote: "From the packaging to the fragrance itself, everything about Elegance Pak feels sophisticated and well-crafted.",
    author: "Subhan Qureshi, Karachi"
  }
];

export default function Reviews() {
  return (
    <section className="py-32 bg-primary border-t border-border transition-colors duration-300 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-serif text-secondary mb-6">Words of Acclaim</h2>
          <div className="w-12 h-[1px] bg-secondary mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
          {reviews.map((review, index) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="flex flex-col items-center text-center group"
            >
              <span className="text-6xl font-serif text-secondary/20 leading-none mb-6 group-hover:text-secondary/40 transition-colors duration-500">"</span>
              <p className="text-lg md:text-xl font-serif text-neutral leading-relaxed mb-8 flex-grow">
                {review.quote}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-8 h-[1px] bg-tertiary/30"></div>
                <span className="text-xs uppercase tracking-widest text-secondary font-semibold">{review.author}</span>
                <div className="w-8 h-[1px] bg-tertiary/30"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
