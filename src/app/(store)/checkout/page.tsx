"use client";

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, clearCart } from '@/store/shoppingCart';
import { getCartProducts } from '@/actions/product/product';
import Button from '@/shared/components/UI/button';
import { TCartItemData } from '@/shared/types/shoppingCart';

const CheckoutPage = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart);
    const [products, setProducts] = useState<TCartItemData[]>([]);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCartDetails = async () => {
            if (cartItems.items.length === 0) {
                router.push('/');
                return;
            }

            const ids = cartItems.items.map(i => i.productId);
            const res = await getCartProducts(ids);
            if (res.res) {
                const mapped = res.res.map(p => ({
                    productId: p.id,
                    productName: p.name,
                    price: p.price,
                    quantity: cartItems.items.find(i => i.productId === p.id)?.quantity || 0,
                    imgUrl: p.images[0],
                    dealPrice: p.salePrice || undefined,
                }));
                setProducts(mapped);
            }

            // Fetch user profile for default address
            try {
                const userRes = await fetch('/api/user/profile');
                const userData = await userRes.json();
                if (userData.address) {
                    setAddress(userData.address);
                }
            } catch (e) {
                console.error("Failed to fetch profile", e);
            }

            setLoading(false);
        };

        fetchCartDetails();
    }, [cartItems, router]);

    const totalAmount = products.reduce((acc, p) => acc + (p.dealPrice || p.price) * p.quantity, 0);

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: products.map(p => ({
                        productId: p.productId,
                        quantity: p.quantity,
                        price: p.dealPrice || p.price
                    })),
                    shippingAddress: address,
                    totalAmount
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to place order");
            }

            // Success
            dispatch(clearCart());
            router.push('/orders'); // Redirect to order history
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="mt-40 storeContainer">Preparing checkout...</div>;

    return (
        <div className="mt-40 storeContainer min-h-screen pb-20">
            <h1 className="text-3xl font-light text-gray-900 mb-10">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {/* Shipping Address */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-medium text-gray-800 mb-6 border-b pb-4">Shipping Address</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Street Address</label>
                                <input
                                    className="w-full border p-2 rounded"
                                    value={address.street}
                                    onChange={e => setAddress({ ...address, street: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">City</label>
                                <input
                                    className="w-full border p-2 rounded"
                                    value={address.city}
                                    onChange={e => setAddress({ ...address, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">State / Province</label>
                                <input
                                    className="w-full border p-2 rounded"
                                    value={address.state}
                                    onChange={e => setAddress({ ...address, state: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Postal Code</label>
                                <input
                                    className="w-full border p-2 rounded"
                                    value={address.postalCode}
                                    onChange={e => setAddress({ ...address, postalCode: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Country</label>
                                <input
                                    className="w-full border p-2 rounded"
                                    value={address.country}
                                    onChange={e => setAddress({ ...address, country: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-medium text-gray-800 mb-6 border-b pb-4">Order Items</h2>
                        <div className="space-y-4">
                            {products.map(product => (
                                <div key={product.productId} className="flex justify-between items-center py-2">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                            <img src={`/images/images/productImages/${product.imgUrl}`} alt={product.productName} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{product.productName}</p>
                                            <p className="text-xs text-gray-500">Qty: {product.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold">${((product.dealPrice || product.price) * product.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Totals */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-40">
                        <h2 className="text-xl font-medium text-gray-800 mb-6 border-b pb-4">Total Amount</h2>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>${totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span>${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

                        <Button
                            className="w-full py-4 text-white bg-black hover:bg-gray-800 rounded-lg text-lg font-bold transition-colors"
                            onClick={handlePlaceOrder}
                            isLoading={isSubmitting}
                        >
                            Place Order
                        </Button>
                        <p className="text-[10px] text-center text-gray-400 mt-4 leading-relaxed">
                            By placing your order, you agree to Bitex&apos;s Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
