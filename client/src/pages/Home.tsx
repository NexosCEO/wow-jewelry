import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import heroImage from "@assets/IMG_3464_1761882788256.jpeg";

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
    <div className="min-h-screen">
      <section className="relative min-h-[70vh] md:min-h-[85vh] grid md:grid-cols-2 overflow-hidden">
        <div className="relative order-2 md:order-1">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e8d5c4] to-[#f0e5d8]"></div>
          <div className="relative h-full flex flex-col justify-center px-6 md:px-12 lg:px-16 py-16 md:py-0">
            <div className="max-w-xl">
              <p className="text-sm uppercase tracking-[0.2em] mb-4 text-primary font-semibold" data-testid="text-hero-eyebrow">
                Handmade with Love
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
                Jewelry That Tells Your Story
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed" data-testid="text-hero-subtitle">
                Each piece is thoughtfully crafted by hand, making every item as unique as you are.
              </p>
              <Button 
                asChild 
                size="lg" 
                className="text-base px-10 h-14 shadow-lg hover:shadow-xl transition-shadow"
                data-testid="button-shop-collection"
              >
                <a href="#products">Shop Collection</a>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="relative order-1 md:order-2 h-64 md:h-auto">
          <img 
            src={heroImage}
            alt="Handmade jewelry collection"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:bg-gradient-to-r md:from-black/30 md:to-transparent"></div>
        </div>
      </section>

      <section id="products" className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              The Collection
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our carefully curated selection of handcrafted jewelry
            </p>
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
            <div className="text-center py-12 md:py-16">
              <p className="text-muted-foreground" data-testid="text-no-products">
                No products available at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-card py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] mb-3 text-primary font-semibold">
                Our Story
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                Handmade with Passion
              </h2>
              <p className="text-base md:text-lg text-foreground/80 mb-4 leading-relaxed">
                Every piece in our collection is handmade with love and attention to detail. We believe jewelry should be as unique as the person wearing it.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                From delicate necklaces to statement earrings, each item is crafted to bring joy and beauty to your everyday life.
              </p>
            </div>
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
              <img 
                src={products?.[2]?.imageUrl || products?.[0]?.imageUrl || ''}
                alt="Jewelry craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
