import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCartFromServer } from '../store/slices/cartSlice';
import cartAPI from '../services/cartAPI';

type CartContextValue = {
	items: any[];
	totalItems: number;
	totalAmount: number;
	shippingAddress: any;
	paymentMethod: any;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const useCart = (): CartContextValue => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error('useCart must be used within a CartProvider');
	}
	return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
	const dispatch = useDispatch();
	const { items, totalItems, totalAmount, shippingAddress, paymentMethod } = useSelector(
		(state: any) => state.cart
	);

	useEffect(() => {
		const load = async () => {
			try {
				const token = localStorage.getItem('token');
				if (!token) return; // skip request if not authenticated
				const res = await cartAPI.getCart();
				const cart = res?.data?.data?.cart;
				if (cart) {
					dispatch(setCartFromServer(cart));
				}
			} catch (_e) {
				// ignore if unauthenticated
			}
		};
		load();
	}, [dispatch]);

	const value: CartContextValue = {
		items,
		totalItems,
		totalAmount,
		shippingAddress,
		paymentMethod,
	};

	return (
		<CartContext.Provider value={value}>
			{children}
		</CartContext.Provider>
	);
};
