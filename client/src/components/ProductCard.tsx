import { Product } from "@shared/schema";
import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const images = [product.imageUrl, product.imageUrl2].filter((img): img is string => !!img);

  return (
    <div className="group relative" data-testid={`card-product-${product.id}`}>
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square bg-card rounded-md overflow-hidden mb-4 relative hover-elevate">
          <img
            src={images[imageIndex]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onMouseEnter={() => images.length > 1 && setImageIndex(1)}
            onMouseLeave={() => setImageIndex(0)}
            data-testid={`img-product-${product.id}`}
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm" data-testid={`badge-soldout-${product.id}`}>
                Sold Out
              </Badge>
            </div>
          )}
        </div>
      </Link>
      
      <div className="space-y-2">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif text-lg font-medium hover:text-primary transition-colors" data-testid={`text-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2">
          {product.regularPrice && parseFloat(product.regularPrice) > parseFloat(product.price) && (
            <span className="text-muted-foreground line-through text-sm" data-testid={`text-regular-price-${product.id}`}>
              ${parseFloat(product.regularPrice).toFixed(2)}
            </span>
          )}
          <span className="text-xl font-bold" data-testid={`text-price-${product.id}`}>
            ${parseFloat(product.price).toFixed(2)}
          </span>
        </div>

        <Button
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          className="w-full gap-2"
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4" />
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
}
