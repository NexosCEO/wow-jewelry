import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import heroImage from "@assets/IMG_3464_1761882788256.jpeg";
import logoUrl from "@assets/Untitled Project (3)_1764567021014.png";
import { SiInstagram, SiTiktok } from "react-icons/si";

interface HomeProps {
  onAddToCart: (product: Product) => void;
}

export default function Home({ onAddToCart }: HomeProps) {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    // First filter out sold out products - they should not show on the main app
    // Hide items that are marked out of stock OR have zero inventory
    let result = products.filter((p) => p.inStock && p.stockQuantity > 0);

    // Filter by type/category
    if (filterType !== "all") {
      result = result.filter((p) => 
        p.category.toLowerCase().includes(filterType.toLowerCase()) ||
        p.name.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    // Filter by max price
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      const maxPriceNum = parseFloat(maxPrice);
      result = result.filter((p) => parseFloat(p.price) <= maxPriceNum);
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-desc":
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "alpha":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // featured - keep original order
        break;
    }

    return result;
  }, [products, filterType, sortBy, maxPrice]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-products" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-[#e8d5c4] to-[#f0e5d8]">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage}
            alt="Elegant jewelry hero"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
              Jewelry That Tells Your Story
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed" data-testid="text-hero-subtitle">
              Each piece is thoughtfully crafted by hand — made to be worn every day and treasured for years.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                asChild 
                size="lg" 
                className="text-base px-10 h-14 shadow-lg hover:shadow-xl transition-all font-bold rounded-full"
                style={{ background: 'linear-gradient(135deg, var(--rose) 0%, var(--gold) 100%)', color: '#2b211b' }}
                data-testid="button-shop-collection"
              >
                <a href="#products">Shop Collection</a>
              </Button>
              <Button 
                asChild 
                variant="outline"
                size="lg" 
                className="text-base px-10 h-14 backdrop-blur-sm bg-background/30 hover:bg-background/50 border-2 font-bold rounded-full"
                data-testid="button-learn-more"
              >
                <a href="#about">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              All Products
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our carefully curated selection of handcrafted jewelry
            </p>
          </div>

          <div className="mb-8 p-6 bg-card rounded-lg border border-border shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="filter-type" className="text-sm font-medium">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="filter-type" data-testid="select-filter-type">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="sets">Sets</SelectItem>
                    <SelectItem value="rings">Rings</SelectItem>
                    <SelectItem value="earrings">Earrings</SelectItem>
                    <SelectItem value="necklaces">Necklaces</SelectItem>
                    <SelectItem value="bracelets">Bracelets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-by" className="text-sm font-medium">Sort</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort-by" data-testid="select-sort-by">
                    <SelectValue placeholder="Featured" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="alpha">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-price" className="text-sm font-medium">Max Price</Label>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="e.g. 80"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  data-testid="input-max-price"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium opacity-0 hidden sm:block">Apply</Label>
                <Button 
                  className="w-full font-bold rounded-lg"
                  style={{ background: 'linear-gradient(135deg, var(--rose) 0%, var(--gold) 100%)', color: '#2b211b' }}
                  onClick={() => {
                    // Filters apply automatically via useMemo, this is just for UX feedback
                  }}
                  data-testid="button-apply-filters"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

          {filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-12 md:py-16">
              <p className="text-muted-foreground" data-testid="text-no-products">
                No products match your filters. Try adjusting your selection.
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="about" className="bg-card py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                WOW by Dany
              </h2>
              <p className="text-base md:text-lg text-foreground/80 mb-4 leading-relaxed">
                WOW by Dany jewelry collection it's more than just an accessory—it's a tool for self-confidence and a symbol of connection. Our collection is crafted with love and attention to detail, featuring premium finishes, including luxurious 24k gold plating and durable 18k gold lamination.
              </p>
              <p className="text-base md:text-lg text-foreground/80 mb-4 leading-relaxed">
                We create unique pieces that reflect the uniqueness in you.
              </p>
              <p className="text-base md:text-lg text-foreground/80 mb-4 leading-relaxed">
                I'm very happy of my new brand and the new journey filled with pride and excitement. My greatest hope is to foster a beautiful community where everyone feels empowered, radiant and celebrated.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Thank you for making this journey shine brighter!
              </p>
            </div>
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-gradient-to-br from-[#e8d5c4] to-[#f0e5d8]">
              <img 
                src={logoUrl}
                alt="WOW by Dany logo"
                className="max-h-full max-w-full object-contain p-8"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12 md:py-16 px-4" style={{ background: '#0f0d0b', color: '#fff' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h3 className="font-serif text-xl font-bold mb-3">Follow Us on Social Media</h3>
              <p className="mb-4 max-w-md" style={{ color: '#f0e7d6' }}>
                Join our community for exclusive behind-the-scenes content, new collection launches, and special offers!
              </p>
              {/* Social Media Links */}
              <div className="flex gap-4 mb-4">
                <a 
                  href="https://www.instagram.com/wow_bydany?igsh=MXFsZXZpbDVqaGp4dQ%3D%3D&utm_source=qr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Follow us on Instagram"
                  data-testid="link-instagram"
                >
                  <SiInstagram size={24} style={{ color: '#caa55b' }} />
                </a>
                <a 
                  href="http://www.tiktok.com/@wow_bydany" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Follow us on TikTok"
                  data-testid="link-tiktok"
                >
                  <SiTiktok size={24} style={{ color: '#caa55b' }} />
                </a>
              </div>
              <p className="text-xs" style={{ color: '#c9c0b0' }}>
                &copy; {new Date().getFullYear()} WOW by Dany. All rights reserved.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Shop</h4>
                <div className="space-y-2 text-sm">
                  <a href="/" className="block transition-colors hover:opacity-80" style={{ color: '#f0e7d6' }}>Shop All</a>
                  <a href="#products" className="block transition-colors hover:opacity-80" style={{ color: '#f0e7d6' }}>Best Sellers</a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Support</h4>
                <div className="space-y-2 text-sm">
                  <a href="#" className="block transition-colors hover:opacity-80" style={{ color: '#f0e7d6' }}>Shipping & Returns</a>
                  <a href="#" className="block transition-colors hover:opacity-80" style={{ color: '#f0e7d6' }}>Contact</a>
                  <a href="/privacy-policy" className="block transition-colors hover:opacity-80" style={{ color: '#f0e7d6' }} data-testid="link-privacy-policy">Privacy Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
