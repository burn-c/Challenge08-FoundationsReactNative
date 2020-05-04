import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (response) {
        setProducts(JSON.parse(response));
      }
    }

    loadProducts();
  }, [products, setProducts]);

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART

      const existsProduct = products.findIndex(
        (item: Product) => product.id === item.id,
      );
      console.log(existsProduct);

      if (existsProduct === -1) {
        console.log('New product');

        const newList = [...products, product];
        // setProducts(newList);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(newList),
        );
        console.log(products);
      } else {
        console.log('Add quantity product');
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const findProduct = products.findIndex((item: Product) => id === item.id);
      const updateProducts = products;
      updateProducts[findProduct].quantity = products[findProduct].quantity + 1;

      // setProducts(updateProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(updateProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const findProduct = products.findIndex((item: Product) => id === item.id);
      const updateProducts = products;
      const quantitValidation = updateProducts[findProduct].quantity;

      if (quantitValidation === 1) {
        updateProducts.splice(findProduct, 1);
        // setProducts(updateProducts);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(updateProducts),
        );
      } else {
        updateProducts[findProduct].quantity =
          products[findProduct].quantity - 1;
        // setProducts(updateProducts);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(updateProducts),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
