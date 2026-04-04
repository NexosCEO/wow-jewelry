import { useQuery } from "@tanstack/react-query";
import { Product, Perfume } from "@shared/schema";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import heroImage1 from "@assets/IMG_3453_1761882788256.jpeg";
import heroImage2 from "@assets/IMG_3454_1761882788256.jpeg";
import heroImage3 from "@assets/IMG_3456_1761882788256.jpeg";
import heroImage4 from "@assets/IMG_3464_1761882788256.jpeg";
import logoUrl from "@assets/Untitled Project (3)_1764567021014.png";
import collectionSets from "@assets/IMG_3455_1761882788256.jpeg";
import collectionNecklaces from "@assets/IMG_3457_1761882788256.jpeg";
import collectionEarrings from "@assets/IMG_3458_1761882788256.jpeg";
import collectionBracelets from "@assets/IMG_3462_1761882788256.jpeg";
import { SiInstagram, SiTiktok } from "react-icons/si";
import { Star, Send } from "lucide-react";

const heroSlides = [
  {
    image: heroImage1,
    title: "Jewelry That Tells Your Story",
    subtitle: "Each piece is thoughtfully crafted by hand — made to be worn every day and treasured for years.",
  },
  {
    image: heroImage2,
    title: "Handcrafted With Love",
    subtitle: "Premium finishes with luxurious 24k gold plating and durable 18k gold lamination.",
  },
  {
    image: heroImage3,
    title: "24K Gold Plated Elegance",
    subtitle: "Unique pieces that reflect the uniqueness in you — designed to make you shine.",
  },
  {
    image: heroImage4,
    title: "Shop the Collection",
    subtitle: "Discover our carefully curated selection of handmade artisan jewelry.",
  },
];

function HeroCarousel() {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplayPlugin.current]);
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    <section className="relative min-h-[75vh] md:min-h-[85vh] overflow-hidden">
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {heroSlides.map((slide, index) => (
            <div key={index} className="relative min-h-[75vh] md:min-h-[85vh] flex-[0_0_100%] min-w-0">
              {/* Background image */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e8d5c4] to-[#f0e5d8]" />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#e8d5c4]/80 via-[#e8d5c4]/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex items-center">
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16">
                  <div className="max-w-2xl">
                    <AnimatePresence mode="wait">
                      {activeIndex === index && (
                        <motion.div key={`slide-content-${index}`}>
                          <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                          >
                            {slide.title}
                          </motion.h1>
                          <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                            className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed"
                          >
                            {slide.subtitle}
                          </motion.p>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                            className="flex flex-wrap gap-4"
                          >
                            <Button
                              asChild
                              size="lg"
                              className="text-base px-10 h-14 shadow-lg hover:shadow-xl transition-all font-bold rounded-full"
                              style={{ background: 'linear-gradient(135deg, var(--rose) 0%, var(--gold) 100%)', color: '#2b211b' }}
                            >
                              <a href="#products">Shop Collection</a>
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              size="lg"
                              className="text-base px-10 h-14 backdrop-blur-sm bg-background/30 hover:bg-background/50 border-2 font-bold rounded-full"
                            >
                              <a href="#about">Learn More</a>
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/40 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background/60 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/40 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background/60 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "w-8 bg-foreground/80"
                : "w-2.5 bg-foreground/30 hover:bg-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

interface HomeProps {
  onAddToCart: (product: Product) => void;
}

export default function Home({ onAddToCart }: HomeProps) {
  const { toast } = useToast();
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: perfumes, isLoading: perfumesLoading } = useQuery<Perfume[]>({
    queryKey: ["/api/perfumes"],
  });

  // Filter perfumes to only show in-stock ones
  const availablePerfumes = useMemo(() => {
    if (!perfumes) return [];
    return perfumes.filter((p) => p.inStock && p.stockQuantity > 0);
  }, [perfumes]);

  // Convert perfume to product-like object for cart compatibility
  const handleAddPerfumeToCart = (perfume: Perfume) => {
    const productLike: Product = {
      id: perfume.id,
      name: perfume.name,
      description: perfume.description,
      price: perfume.price,
      regularPrice: perfume.regularPrice,
      imageUrl: perfume.imageUrl,
      imageUrl2: perfume.imageUrl2,
      category: "Perfume",
      inStock: perfume.inStock,
      stockQuantity: perfume.stockQuantity,
    };
    onAddToCart(productLike);
    toast({
      title: "Added to cart",
      description: `${perfume.name} has been added to your bag`,
    });
  };

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
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Featured Collections */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-10 md:mb-14"
          >
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Shop by Collection
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our handcrafted categories, each made with love and attention to detail
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "Sets", image: collectionSets, filter: "sets" },
              { name: "Earrings", image: collectionEarrings, filter: "earrings" },
              { name: "Necklaces", image: collectionNecklaces, filter: "necklaces" },
              { name: "Bracelets", image: collectionBracelets, filter: "bracelets" },
            ].map((collection, index) => (
              <motion.a
                key={collection.name}
                href="#products"
                onClick={() => setFilterType(collection.filter)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
              >
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-1">
                    {collection.name}
                  </h3>
                  <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                    Shop Now &rarr;
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              All Products
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our carefully curated selection of handcrafted jewelry
            </p>
          </motion.div>

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
            {filteredAndSortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index % 4 * 0.1, ease: "easeOut" }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                />
              </motion.div>
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

      {/* Perfumes Section - Only show if there are perfumes available */}
      {availablePerfumes.length > 0 && (
        <section id="perfumes" className="bg-card py-16 md:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" data-testid="text-perfumes-title">
                Fragrances
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Discover our exclusive collection of luxurious fragrances
              </p>
            </motion.div>

            {perfumesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {availablePerfumes.map((perfume) => (
                  <Card 
                    key={perfume.id} 
                    className="group overflow-hidden hover-elevate"
                    data-testid={`card-perfume-${perfume.id}`}
                  >
                    <Link href={`/perfume/${perfume.id}`}>
                      <CardHeader className="p-0 cursor-pointer">
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={encodeURI(perfume.imageUrl)}
                            alt={perfume.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {perfume.regularPrice && parseFloat(perfume.regularPrice) > parseFloat(perfume.price) && (
                            <Badge 
                              className="absolute top-3 left-3"
                              style={{ background: 'var(--gold)', color: 'var(--warm-charcoal)' }}
                            >
                              Sale
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                    </Link>
                    <CardContent className="p-4">
                      <Link href={`/perfume/${perfume.id}`}>
                        <CardTitle className="text-lg font-semibold mb-1 line-clamp-1 cursor-pointer hover:text-primary transition-colors" data-testid={`text-perfume-name-${perfume.id}`}>
                          {perfume.name}
                        </CardTitle>
                      </Link>
                      {perfume.size && (
                        <p className="text-sm text-muted-foreground mb-2">{perfume.size}</p>
                      )}
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {perfume.description}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold" data-testid={`text-perfume-price-${perfume.id}`}>
                            ${perfume.price}
                          </span>
                          {perfume.regularPrice && parseFloat(perfume.regularPrice) > parseFloat(perfume.price) && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${perfume.regularPrice}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddPerfumeToCart(perfume);
                          }}
                          className="gap-1"
                          data-testid={`button-add-perfume-${perfume.id}`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section id="about" className="bg-card py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-gradient-to-br from-[#e8d5c4] to-[#f0e5d8]"
            >
              <img
                src={logoUrl}
                alt="WOW by Dany logo"
                className="max-h-full max-w-full object-contain p-8"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-10 md:mb-14"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Real reviews from real people who love their WOW pieces
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                name: "Maria L.",
                text: "Absolutely in love with my Blue Butterfly set! The quality is amazing and the gold plating is so beautiful. I get compliments every time I wear it.",
                rating: 5,
              },
              {
                name: "Jessica R.",
                text: "I ordered the custom bracelet builder and it was such a fun experience. The charms are so detailed and cute. Perfect gift for my daughter!",
                rating: 5,
              },
              {
                name: "Ana G.",
                text: "The Isabellina necklace is stunning. You can tell it's handmade with care. Shipping was fast and the packaging was gorgeous. Will definitely order again!",
                rating: 5,
              },
            ].map((review, index) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: 'var(--gold)' }} />
                  ))}
                </div>
                <p className="text-foreground/80 mb-6 leading-relaxed italic">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, var(--rose) 0%, var(--gold) 100%)', color: '#2b211b' }}>
                    {review.name.charAt(0)}
                  </div>
                  <span className="font-semibold">{review.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 md:py-24 px-4" style={{ background: 'linear-gradient(135deg, #e8d5c4 0%, #f0e5d8 50%, #e8d5c4 100%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Stay in the Loop
          </h2>
          <p className="text-base md:text-lg text-foreground/80 mb-8">
            Be the first to know about new collections, exclusive deals, and behind-the-scenes content.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-background/80 backdrop-blur-sm border-border/50"
            />
            <Button
              className="h-12 px-8 font-bold rounded-lg gap-2 shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--rose) 0%, var(--gold) 100%)', color: '#2b211b' }}
            >
              <Send className="w-4 h-4" />
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </motion.div>
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
