import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, DollarSign, CheckCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryType: 'pickup' | 'delivery' | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  deliveryType,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { getTotalPrice, clearCart } = useCart();

  const paymentMethods = [
    {
      id: 'card',
      name: 'Кредитная карта',
      icon: CreditCard,
      description: 'Visa, MasterCard, МИР',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: DollarSign,
      description: 'Безопасные платежи через PayPal',
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      icon: Smartphone,
      description: 'Быстрая оплата с помощью Apple Pay',
    },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      clearCart();
      setIsSuccess(false);
      onClose();
      toast({
        title: "Оплата прошла успешно!",
        description: "Ваш заказ принят в обработку. Спасибо за покупку!",
      });
    }, 2000);
  };

  const deliveryText = deliveryType === 'pickup' ? 'Самовывоз' : 'Курьерская доставка';
  const totalPrice = getTotalPrice();

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-8">
            <CheckCircle className="h-16 w-16 text-success mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Оплата прошла успешно!</h3>
            <p className="text-muted-foreground">
              Ваш заказ принят в обработку. Мы свяжемся с вами в ближайшее время.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Выберите способ оплаты</DialogTitle>
          <DialogDescription>
            {deliveryText} • Итого: {totalPrice.toLocaleString('ru-RU')} ₽
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                <RadioGroupItem value={method.id} id={method.id} />
                <Label
                  htmlFor={method.id}
                  className="flex-1 flex items-center gap-3 cursor-pointer"
                >
                  <method.icon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {method.description}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {isProcessing ? 'Обработка...' : `Оплатить ${totalPrice.toLocaleString('ru-RU')} ₽`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};