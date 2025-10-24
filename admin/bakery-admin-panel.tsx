import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, ShoppingBag, X, Save } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: ''
  });

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await loadProducts();
    await loadOrders();
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const result = await window.storage.get('products', true);
      if (result && result.value) {
        setProducts(JSON.parse(result.value));
      } else {
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
        await window.storage.set('products', JSON.stringify(demoProducts), true);
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const result = await window.storage.list('order:', true);
      if (result && result.keys) {
        const orderPromises = result.keys.map(async (key) => {
          const orderData = await window.storage.get(key, true);
          return orderData ? JSON.parse(orderData.value) : null;
        });
        const loadedOrders = (await Promise.all(orderPromises)).filter(o => o !== null);
        setOrders(loadedOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (error) {
      console.log('Заказы не найдены');
      setOrders([]);
    }
  };

  const saveProducts = async (newProducts) => {
    try {
      await window.storage.set('products', JSON.stringify(newProducts), true);
      setProducts(newProducts);
    } catch (error) {
      alert('Ошибка сохранения товаров');
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      alert('Заполните обязательные поля: название, цена, категория');
      return;
    }

    const newProduct = {
      id: editingProduct?.id || Date.now().toString(),
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category: productForm.category,
      image: productForm.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
    };

    let updatedProducts;
    if (editingProduct) {
      updatedProducts = products.map(p => p.id === newProduct.id ? newProduct : p);
    } else {
      updatedProducts = [...products, newProduct];
    }

    await saveProducts(updatedProducts);
    resetForm();
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Удалить этот товар?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      await saveProducts(updatedProducts);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image
    });
    setShowProductForm(true);
  };

  const resetForm = () => {
    setProductForm({ name: '', description: '', price: '', category: '', image: '' });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const updatedOrder = { ...order, status: newStatus };
        await window.storage.set(`order:${orderId}`, JSON.stringify(updatedOrder), true);
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      }
    } catch (error) {
      alert('Ошибка обновления статуса');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'processing': return 'В работе';
      case 'completed': return 'Выполнен';
      case 'cancelled': return 'Отменён';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">Админ-панель</h1>
        </div>
        
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 ${
              activeTab === 'products'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500'
            }`}
          >
            <Package size={20} />
            <span className="text-sm font-medium">Товары</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 ${
              activeTab === 'orders'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500'
            }`}
          >
            <ShoppingBag size={20} />
            <span className="text-sm font-medium">Заказы ({orders.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'products' && (
        <div className="p-4">
          <button
            onClick={() => setShowProductForm(true)}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 mb-4"
          >
            <Plus size={20} />
            Добавить товар
          </button>

          <div className="space-y-3">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex gap-3">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-indigo-600">{product.price} ₸</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{product.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="p-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500">Заказов пока нет</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800">Заказ #{order.id.slice(-6)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.date).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="border-t pt-3 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Клиент:</p>
                    <p className="text-sm text-gray-600">{order.customer.name}</p>
                    <p className="text-sm text-gray-600">{order.customer.phone}</p>
                    {order.customer.comment && (
                      <p className="text-sm text-gray-600 mt-1 italic">{order.customer.comment}</p>
                    )}
                  </div>

                  <div className="border-t pt-3 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Товары:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm mb-1">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="font-medium">{item.price * item.quantity} ₸</span>
                      </div>
                    ))}
                    <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                      <span>Итого:</span>
                      <span className="text-indigo-600">{order.total} ₸</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'processing')}
                      className="flex-1 py-2 bg-yellow-50 text-yellow-700 rounded text-sm font-medium"
                    >
                      В работу
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="flex-1 py-2 bg-green-50 text-green-700 rounded text-sm font-medium"
                    >
                      Выполнен
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="flex-1 py-2 bg-red-50 text-red-700 rounded text-sm font-medium"
                    >
                      Отменить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
              </h2>
              <button onClick={resetForm} className="p-2">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Название товара"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                  placeholder="Описание товара"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена (₸) *
                </label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="2500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория *
                </label>
                <input
                  type="text"
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Торты, Десерты и т.д."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL изображения
                </label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Вставьте ссылку на изображение (можно использовать Unsplash, ImgBB и др.)
                </p>
              </div>

              <button
                onClick={handleSaveProduct}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;