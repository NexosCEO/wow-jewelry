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
      <section className="relative bg-gradient-to-br from-primary/10 to-background py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-4" data-testid="text-hero-title">
            Handcrafted with Love
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Discover unique, handmade jewelry pieces that tell your story
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Our Collection</h2>
            <p className="text-muted-foreground">Each piece is carefully handcrafted with attention to detail</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

          {products && products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground" data-testid="text-no-products">
                No products available at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-card py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">About WOW Jewelry</h2>
          <p className="text-lg text-muted-foreground mb-4">
            Every piece in our collection is handmade with love and attention to detail. We believe jewelry should be as unique as the person wearing it.
          </p>
          <p className="text-muted-foreground">
            From delicate necklaces to statement earrings, each item is crafted to bring joy and beauty to your everyday life.
          </p>
        </div>
      </section>
    </div>
  );
}
