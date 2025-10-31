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
    <div className="group relative bg-card border border-card-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1" data-testid={`card-product-${product.id}`}>
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square bg-background overflow-hidden relative">
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
      
      <div className="p-3.5 space-y-2.5">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif text-lg font-bold hover:text-primary transition-colors leading-snug" data-testid={`text-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>
        
        <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" data-testid={`text-price-${product.id}`}>
            ${parseFloat(product.price).toFixed(2)}
          </span>
          {product.regularPrice && parseFloat(product.regularPrice) > parseFloat(product.price) && (
            <span className="text-muted-foreground line-through text-sm" data-testid={`text-regular-price-${product.id}`}>
              ${parseFloat(product.regularPrice).toFixed(2)}
            </span>
          )}
        </div>

        <Button
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          className="w-full gap-2 font-bold rounded-xl"
          style={{ background: product.inStock ? 'linear-gradient(135deg, var(--gold) 0%, var(--gold-deep) 100%)' : undefined }}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4" />
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
}
