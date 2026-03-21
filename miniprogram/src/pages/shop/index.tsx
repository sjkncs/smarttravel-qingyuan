import { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

interface Product {
  id: number;
  name: string;
  desc: string;
  price: number;
  originalPrice?: number;
  image: string;
  village: string;
  tags: string[];
  sales: number;
}

const mockProducts: Product[] = [
  {
    id: 1, name: '英德红茶·金毫', desc: '英德核心产区，一芽一叶手工采摘',
    price: 128, originalPrice: 168, image: '', village: '积庆里',
    tags: ['非遗工艺', '有机认证'], sales: 2341,
  },
  {
    id: 2, name: '连南瑶族刺绣手提包', desc: '瑶族阿婆手工刺绣，传承千年技艺',
    price: 298, image: '', village: '油岭村',
    tags: ['非遗手工', '限量'], sales: 856,
  },
  {
    id: 3, name: '阳山西洋菜干', desc: '阳山高山种植，天然晾晒',
    price: 35, originalPrice: 45, image: '', village: '阳山',
    tags: ['原产地直发'], sales: 5230,
  },
  {
    id: 4, name: '清远麻鸡礼盒装', desc: '正宗清远麻鸡，走地放养180天',
    price: 199, originalPrice: 258, image: '', village: '清城区',
    tags: ['地理标志', '冷链直达'], sales: 3891,
  },
  {
    id: 5, name: '连州水晶梨', desc: '连州高山水晶梨，汁多甜脆',
    price: 68, image: '', village: '连州',
    tags: ['当季鲜果', '产地直发'], sales: 1567,
  },
  {
    id: 6, name: '瑶族长鼓挂饰', desc: '微缩长鼓工艺品，瑶族文化纪念',
    price: 58, image: '', village: '南岗村',
    tags: ['文创', '伴手礼'], sales: 923,
  },
];

const categories = [
  { id: 'all', label: '全部', icon: '🏪' },
  { id: 'tea', label: '茗茶', icon: '🍵' },
  { id: 'food', label: '美食', icon: '🍗' },
  { id: 'craft', label: '手工艺', icon: '🧵' },
  { id: 'fruit', label: '鲜果', icon: '🍐' },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const handleBuy = (product: Product) => {
    Taro.showModal({
      title: '购买确认',
      content: `确定购买「${product.name}」\n价格：¥${product.price}`,
      confirmText: '立即购买',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '功能开发中...', icon: 'none' });
        }
      },
    });
  };

  return (
    <View className='shop-page'>
      {/* Categories */}
      <ScrollView scrollX className='categories'>
        {categories.map(cat => (
          <View
            key={cat.id}
            className={`cat-item ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <Text className='cat-icon'>{cat.icon}</Text>
            <Text className='cat-label'>{cat.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Products */}
      <View className='product-grid'>
        {mockProducts.map(product => (
          <View key={product.id} className='product-card' onClick={() => handleBuy(product)}>
            <View className='product-img'>
              {product.image ? (
                <Image src={product.image} className='img' mode='aspectFill' />
              ) : (
                <View className='img-placeholder'>
                  <Text className='placeholder-icon'>🎁</Text>
                </View>
              )}
              {product.originalPrice && (
                <View className='discount-badge'>
                  <Text className='discount-text'>
                    {Math.round((1 - product.price / product.originalPrice) * 100)}%OFF
                  </Text>
                </View>
              )}
            </View>
            <View className='product-info'>
              <Text className='product-name'>{product.name}</Text>
              <Text className='product-desc'>{product.desc}</Text>
              <View className='product-tags'>
                {product.tags.slice(0, 2).map(tag => (
                  <Text key={tag} className='product-tag'>{tag}</Text>
                ))}
              </View>
              <View className='product-bottom'>
                <View className='price-wrap'>
                  <Text className='price'>¥{product.price}</Text>
                  {product.originalPrice && (
                    <Text className='original-price'>¥{product.originalPrice}</Text>
                  )}
                </View>
                <Text className='sales'>已售{product.sales}</Text>
              </View>
              <Text className='product-village'>📍 {product.village}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
