import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen">
      <section className="relative py-16 md:py-24 lg:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f5e6d3] via-[#faf4ed] to-background -z-10"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6" data-testid="text-hero-title">
            Handcrafted with Love
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10" data-testid="text-hero-subtitle">
            Discover unique, handmade jewelry pieces that tell your story
          </p>
          <Button 
            asChild 
            size="lg" 
            className="text-base md:text-lg px-8 md:px-10 h-12 md:h-14"
            data-testid="button-shop-collection"
          >
            <a href="#products">Shop Collection</a>
          </Button>
        </div>
      </section>

      <section id="products" className="pb-12 md:pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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

      <section className="bg-card border-t border-border py-12 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">About WOW Jewelry</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-3 md:mb-4 leading-relaxed">
            Every piece in our collection is handmade with love and attention to detail. We believe jewelry should be as unique as the person wearing it.
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            From delicate necklaces to statement earrings, each item is crafted to bring joy and beauty to your everyday life.
          </p>
        </div>
      </section>
    </div>
  );
}
