import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import phoneImg from '@/assets/phone.jpg';
import headphonesImg from '@/assets/headphones.jpg';
import laptopImg from '@/assets/laptop.jpg';
import watchImg from '@/assets/watch.jpg';

const products = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 89990,
    image: phoneImg,
    description: 'Новейший iPhone с передовым процессором A17 Pro, профессиональной камерой и титановым корпусом. Идеальное сочетание производительности и элегантности.',
    category: 'Смартфоны',
    features: [
      'Процессор A17 Pro',
      'Камера 48MP ProRAW',
      'Титановый корпус',
      'USB-C разъем',
      'Dynamic Island',
      'Face ID'
    ]
  },
  {
    id: '2',
    name: 'AirPods Max',
    price: 59990,
    image: headphonesImg,
    description: 'Премиальные наушники с активным шумоподавлением, пространственным звуком и невероятным качеством звучания. Комфорт на весь день.',
    category: 'Наушники',
    features: [
      'Активное шумоподавление',
      'Пространственный звук',
      '20 часов работы',
      'Быстрая зарядка',
      'Адаптивный эквалайзер',
      'Premium материалы'
    ]
  },
  {
    id: '3',
    name: 'MacBook Pro 16"',
    price: 199990,
    image: laptopImg,
    description: 'Мощный ноутбук для профессионалов с процессором M3 Pro, Retina дисплеем и невероятной автономностью. Создан для серьезных задач.',
    category: 'Ноутбуки',
    features: [
      'Процессор M3 Pro',
      'Retina дисплей 16"',
      '18 часов работы',
      '32GB памяти',
      'ProRes видео',
      'Студийное качество звука'
    ]
  },
  {
    id: '4',
    name: 'Apple Watch Ultra 2',
    price: 79990,
    image: watchImg,
    description: 'Самые прочные и функциональные смарт-часы Apple с титановым корпусом, улучшенным GPS и функциями для экстремальных видов спорта.',
    category: 'Умные часы',
    features: [
      'Титановый корпус',
      'Двухчастотный GPS',
      '36 часов работы',
      'Глубина до 100м',
      'Температурный датчик',
      'Экстрим-спорт режимы'
    ]
  },
];

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();

  const product = products.find(p => p.id === id);
  const cartItem = items.find(item => item.id === id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
          <Button onClick={() => navigate('/')}>
            Вернуться к каталогу
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Товар добавлен в корзину!",
      description: `${product.name} добавлен в корзину`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Назад к каталогу
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card className="overflow-hidden border-0 shadow-card">
            <CardContent className="p-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <Badge className="mb-3 bg-shop-accent/20 text-shop-accent border-shop-accent/30">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Особенности:</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {product.price.toLocaleString('ru-RU')} ₽
              </span>
              {cartItem && (
                <Badge variant="secondary" className="text-sm">
                  В корзине: {cartItem.quantity} шт.
                </Badge>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-primary hover:opacity-90 shadow-primary text-lg py-6"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Добавить в корзину
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/cart')}
                className="px-6 py-6"
              >
                Перейти в корзину
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;