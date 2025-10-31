import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ProductDetailProps {
  onAddToCart: (product: Product) => void;
}

export default function ProductDetail({ onAddToCart }: ProductDetailProps) {
  const [, params] = useRoute("/product/:id");
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-product-detail" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif mb-4">Product not found</h2>
        <Link href="/">
          <Button data-testid="button-back-home">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const images = [product.imageUrl, product.imageUrl2].filter(Boolean);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/">
          <Button variant="ghost" className="mb-8 gap-2" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-card rounded-md overflow-hidden border border-card-border">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="img-product-main"
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square w-20 rounded-md overflow-hidden border-2 transition-all hover-elevate ${
                      selectedImage === index ? "border-primary" : "border-card-border"
                    }`}
                    data-testid={`button-thumbnail-${index}`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-4xl font-bold mb-2" data-testid="text-product-name">
                {product.name}
              </h1>
              <Badge variant="secondary" data-testid="badge-category">
                {product.category}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              {product.regularPrice && parseFloat(product.regularPrice) > parseFloat(product.price) && (
                <span className="text-2xl text-muted-foreground line-through" data-testid="text-regular-price-detail">
                  ${parseFloat(product.regularPrice).toFixed(2)}
                </span>
              )}
              <span className="text-4xl font-bold" data-testid="text-price-detail">
                ${parseFloat(product.price).toFixed(2)}
              </span>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground" data-testid="text-description">
                {product.description}
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                onClick={() => onAddToCart(product)}
                disabled={!product.inStock}
                size="lg"
                className="w-full gap-2"
                data-testid="button-add-to-cart-detail"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>

              {!product.inStock && (
                <p className="text-sm text-muted-foreground text-center" data-testid="text-out-of-stock-message">
                  This item is currently out of stock
                </p>
              )}

              {product.inStock && product.stockQuantity < 5 && (
                <p className="text-sm text-destructive text-center" data-testid="text-low-stock">
                  Only {product.stockQuantity} left in stock
                </p>
              )}
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="font-semibold">Product Details</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Handmade with care and attention to detail</li>
                <li>• Unique design - each piece may vary slightly</li>
                <li>• Free shipping on all orders</li>
                <li>• Carefully packaged for gift-giving</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
