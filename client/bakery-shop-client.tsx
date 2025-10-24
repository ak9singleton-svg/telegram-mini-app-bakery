import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Store } from 'lucide-react';

const BakeryShop = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('catalog'); // catalog, cart, checkout
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    comment: ''
  });

  // Инициализация Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.BackButton.onClick(() => {
        if (view === 'cart') setView('catalog');
        else if (view === 'checkout') setView('cart');
      });
      
      if (view !== 'catalog') {
        tg.BackButton.show();
      } else {
        tg.BackButton.hide();
      }
    }
  }, [view]);

  // Загрузка товаров из хранилища
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await window.storage.get('products', true);
      if (result && result.value) {
        setProducts(JSON.parse(result.value));
      } else {
        // Демо данные если ничего нет
        const demoProducts = [
          {
            id: '1',
            name: 'Наполеон',
            description: 'Классический торт с заварным кремом',
            price: 2500,
            category: 'Торты',
            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
          },
          {
            id: '2',
            name: 'Медовик',
            description: 'Торт с медовыми коржами и сметанным кремом',
            price: 2800,
            category: 'Торты',
            image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400'
          },
          {
            id: '3',
            name: 'Макаронс',
            description: 'Французское миндальное печенье, набор 12 шт',
            price: 1500,
            category: 'Десерты',
            image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400'
          }
        ];
        setProducts(demoProducts);
      }
    } catch (error) {
      console.log('Товары не найдены, используем демо данные');
      const demoProducts = [
        {
          id: '1',
          name: 'Наполеон',
          description: 'Классический торт с заварным кремом',
          price: 2500,
          category: 'Торты',
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
        },
        {
          id: '2',
          name: 'Медовик',
          description: 'Торт с медовыми коржами и сметанным кремом',
          price: 2800,
          category: 'Торты',
          image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400'
        },
        {
          id: '3',
          name: 'Макаронс',
          description: 'Французское миндальное печенье, набор 12 шт',
          price: 1500,
          category: 'Десерты',
          image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400'
        }
      ];
      setProducts(demoProducts);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const submitOrder = async () => {
    if (!orderForm.name || !orderForm.phone) {
      alert('Пожалуйста, заполните имя и телефон');
      return;
    }

    const order = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      customer: orderForm,
      items: cart,
      total: getTotalPrice(),
      status: 'new'
    };

    try {
      // Сохраняем заказ
      await window.storage.set(`order:${order.id}`, JSON.stringify(order), true);
      
      // Отправляем данные боту
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify({
          type: 'new_order',
          order: order
        }));
      }
      
      // Очищаем корзину и форму
      setCart([]);
      setOrderForm({ name: '', phone: '', comment: '' });
      setView('catalog');
      
      alert('Заказ отправлен! Мы свяжемся с вами в ближайшее время.');
    } catch (error) {
      alert('Ошибка при отправке заказа. Попробуйте еще раз.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      {view === 'catalog' && (
        <div className="pb-20">
          {/* Header */}
          <div className="bg-white shadow-sm sticky top-0 z-10">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Store className="text-pink-500" size={24} />
                  <h1 className="text-xl font-bold text-gray-800">Наша Кондитерская</h1>
                </div>
                <button
                  onClick={() => setView('cart')}
                  className="relative p-2 bg-pink-500 text-white rounded-full"
                >
                  <ShoppingCart size={20} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cat === 'all' ? 'Все' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="p-4 grid grid-cols-1 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-bold text-pink-500">
                      {product.price} ₸
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Plus size={16} />
                      В корзину
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'cart' && (
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Корзина</h2>
          
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500">Корзина пуста</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                        <p className="text-pink-500 font-bold">{item.price} ₸</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 bg-gray-100 rounded"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 bg-gray-100 rounded"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Итого:</span>
                  <span className="text-2xl font-bold text-pink-500">
                    {getTotalPrice()} ₸
                  </span>
                </div>
              </div>

              <button
                onClick={() => setView('checkout')}
                className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold"
              >
                Оформить заказ
              </button>
            </>
          )}
        </div>
      )}

      {view === 'checkout' && (
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Оформление заказа</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя *
              </label>
              <input
                type="text"
                value={orderForm.name}
                onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Введите ваше имя"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон *
              </label>
              <input
                type="tel"
                value={orderForm.phone}
                onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="+7 (___) ___-__-__"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Комментарий (доставка/самовывоз, адрес, время)
              </label>
              <textarea
                value={orderForm.comment}
                onChange={(e) => setOrderForm({...orderForm, comment: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Укажите способ получения и другие детали"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold mb-2">Ваш заказ:</h3>
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm mb-1">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{item.price * item.quantity} ₸</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>Итого:</span>
                <span className="text-pink-500">{getTotalPrice()} ₸</span>
              </div>
            </div>

            <button
              onClick={submitOrder}
              className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold"
            >
              Отправить заказ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BakeryShop;