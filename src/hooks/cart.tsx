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
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext>({} as CartContext);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // let isCancelled = false;

    async function loadProducts(): Promise<void> {
      try {
        const response = await AsyncStorage.getItem('@GoMarketplace:cart');
        if (response) {
          setProducts(JSON.parse(response));
        }
        console.log('useEffect');
      } catch (err) {
        console.log(err);
      }
    }

    loadProducts();
    // return () => {
    //   isCancelled = true;
    // };
  }, [products]);

  const updateProductsStore = useCallback(async productsUpdate => {
    await AsyncStorage.setItem(
      '@GoMarketplace:cart',
      JSON.stringify(productsUpdate),
    );
    setProducts(productsUpdate);
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const findProduct = products.findIndex((item: Product) => id === item.id);
      const updateProducts = products;

      updateProducts[findProduct].quantity += 1;
      console.log('Increment');

      updateProductsStore(updateProducts);
    },
    [products, updateProductsStore],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const findProduct = products.findIndex((item: Product) => id === item.id);
      const updateProducts = products;

      const quantitValidation = updateProducts[findProduct].quantity;

      if (quantitValidation === 1) {
        updateProducts.splice(findProduct, 1);
      } else {
        updateProducts[findProduct].quantity -= 1;
      }
      console.log('Decrement');

      updateProductsStore(updateProducts);
    },
    [products, updateProductsStore],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      const updateProducts = products;
      const existsProduct = products.findIndex(
        (item: Product) => product.id === item.id,
      );

      if (existsProduct === -1) {
        const addProduct = {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: product.price,
          quantity: product.quantity + 1,
        };

        updateProducts.push(addProduct);
      } else {
        const findProduct = products.findIndex(
          (item: Product) => product.id === item.id,
        );

        updateProducts[findProduct].quantity += 1;
      }
      console.log('Add To Cart');

      updateProductsStore(updateProducts);
    },
    [products, updateProductsStore],
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
