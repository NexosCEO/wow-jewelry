import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/ProductCard";
import { Loader2 } from "lucide-react";

interface HomeProps {
  onAddToCart: (product: Product) => void;
}

export default function Home({ onAddToCart }: HomeProps) {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-products" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background py-24 md:py-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent" data-testid="text-hero-title">
            Handcrafted with Love
          </h2>
          <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
            Discover unique, handmade jewelry pieces that tell your story and celebrate your individuality
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span>Handmade</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span>Premium Quality</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚚</span>
              <span>Free Shipping</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Our Collection</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Each piece is carefully handcrafted with attention to detail and passion for beauty</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

          {products && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground" data-testid="text-no-products">
                No products available at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-br from-card to-background border-y border-border py-20 md:py-32">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">About WOW Jewelry</h2>
          <p className="text-xl text-foreground/80 mb-6 leading-relaxed">
            Every piece in our collection is handmade with love and attention to detail. We believe jewelry should be as unique as the person wearing it.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From delicate necklaces to statement earrings, each item is crafted to bring joy and beauty to your everyday life. We pour our heart into every creation.
          </p>
        </div>
      </section>
    </div>
  );
}
