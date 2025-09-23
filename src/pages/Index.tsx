import React from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Sparkles } from 'lucide-react';
import phoneImg from '@/assets/phone.jpg';
import iphoneProMaxImg from '@/assets/iphone-pro-max.jpg';
import headphonesImg from '@/assets/headphones.jpg';
import laptopImg from '@/assets/laptop.jpg';
import watchImg from '@/assets/watch.jpg';

const products = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 89990,
    image: phoneImg,
    description: 'Новейший iPhone с передовым процессором A17 Pro и профессиональной камерой',
    category: 'Смартфоны',
  },
  {
    id: '2',
    name: 'AirPods Max',
    price: 59990,
    image: headphonesImg,
    description: 'Премиальные наушники с активным шумоподавлением и пространственным звуком',
    category: 'Наушники',
  },
  {
    id: '3',
    name: 'MacBook Pro 16"',
    price: 199990,
    image: laptopImg,
    description: 'Мощный ноутбук для профессионалов с процессором M3 Pro и Retina дисплеем',
    category: 'Ноутбуки',
  },
  {
    id: '4',
    name: 'Apple Watch Ultra 2',
    price: 79990,
    image: watchImg,
    description: 'Самые прочные и функциональные смарт-часы Apple с титановым корпусом',
    category: 'Умные часы',
  },
  {
    id: '5',
    name: 'iPhone 15 Pro Max',
    price: 109990,
    image: iphoneProMaxImg,
    description: 'Флагманский iPhone с самым большим дисплеем 6.7", процессором A17 Pro и улучшенной камерой',
    category: 'Смартфоны',
  },
];

const Index = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="relative">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Новые поступления
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            ShopHub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Откройте мир премиальных технологий. Лучшие товары, быстрая доставка, надежное качество.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Каталог товаров</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Index;
