import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product, useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Товар добавлен в корзину!",
      description: `${product.name} добавлен в корзину`,
    });
  };

  const handleViewProduct = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card className="group cursor-pointer bg-gradient-card border-0 shadow-card hover:shadow-hover transition-all duration-300 hover:scale-105">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 rounded-full p-0"
                onClick={handleViewProduct}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="h-10 w-10 rounded-full p-0 bg-gradient-primary hover:opacity-90"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Badge 
            className="absolute top-3 right-3 bg-shop-accent/90 text-white border-0"
          >
            {product.category}
          </Badge>
        </div>
        
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {product.price.toLocaleString('ru-RU')} ₽
            </span>
            <Button
              size="sm"
              className="bg-gradient-primary hover:opacity-90 shadow-primary"
              onClick={handleAddToCart}
            >
              В корзину
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};