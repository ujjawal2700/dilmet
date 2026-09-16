import apiClient from '../api/client';

// Razorpay Key ID (public key, safe to expose)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

/**
 * Razorpay's checkout.js locks page scroll (overflow/touch-action on <html>
 * and <body>) while its modal is open. On some browsers/devices it doesn't
 * always clean this up after the modal closes - especially on the success
 * path, where our own handler callback runs async work before the app
 * re-renders - leaving the whole page permanently unscrollable. Force-reset
 * it ourselves once the checkout flow is done, regardless of what Razorpay
 * did or didn't clean up.
 */
const restorePageScroll = () => {
    for (const el of [document.documentElement, document.body]) {
        el.style.overflow = '';
        el.style.touchAction = '';
        el.style.position = '';
        (el.style as any).overscrollBehavior = '';
    }
};

/**
 * Load Razorpay SDK script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if ((window as any).Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const createOrder = async (planId: string) => {
    const response = await apiClient.post('/payment/create-order', { planId });
    return response.data.data;
};

export const verifyPayment = async (data: any) => {
    const response = await apiClient.post('/payment/verify', data);
    return response.data.data;
};

export const getPaymentHistory = async (params?: any) => {
    const response = await apiClient.get('/payment/history', { params });
    return response.data.data;
};

/**
 * Complete payment flow with Razorpay checkout
 * @param planId - The coin plan ID to purchase
 * @param userInfo - User info for Razorpay prefill
 * @returns Promise with payment result
 */
export const initiatePayment = async (
    planId: string,
    userInfo: {
        name?: string;
        email?: string;
        phone?: string;
    } = {}
): Promise<{
    success: boolean;
    message: string;
    coinsAdded?: number;
    newBalance?: number;
    error?: string;
    // Membership upgrade info
    membershipUpgraded?: boolean;
    previousTier?: string;
    newTier?: 'silver' | 'gold' | 'platinum';
    newMemberTier?: string;
}> => {
    try {
        // Step 1: Load Razorpay SDK
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            return {
                success: false,
                message: 'Failed to load payment gateway',
                error: 'SCRIPT_LOAD_FAILED',
            };
        }

        // Step 2: Create order on backend
        const orderData = await createOrder(planId);

        // Step 3: Open Razorpay checkout
        return new Promise((resolve) => {
            const options = {
                key: orderData.keyId || RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Dil Mate',
                description: `Purchase ${orderData.plan.coins} Coins`,
                order_id: orderData.orderId,
                prefill: {
                    name: userInfo.name || '',
                    email: userInfo.email || '',
                    contact: userInfo.phone || '',
                },
                theme: {
                    color: '#F5A623', // Primary color
                },
                handler: async (response: any) => {
                    try {
                        // Step 4: Verify payment on backend
                        const result = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            transactionId: orderData.transactionId,
                        });

                        restorePageScroll();
                        resolve({
                            success: true,
                            message: result.message,
                            coinsAdded: result.coinsAdded,
                            newBalance: result.newBalance,
                            // Pass through membership upgrade info
                            membershipUpgraded: result.membershipUpgraded,
                            previousTier: result.previousTier,
                            newTier: result.newTier,
                            newMemberTier: result.newMemberTier,
                        });
                    } catch (error: any) {
                        restorePageScroll();
                        resolve({
                            success: false,
                            message: 'Payment verification failed',
                            error: error.response?.data?.message || error.message,
                        });
                    } finally {
                        // Razorpay's own close animation can finish slightly after this
                        // callback runs and re-apply its scroll lock - reset again once
                        // it's definitely done closing.
                        setTimeout(restorePageScroll, 300);
                    }
                },
                modal: {
                    ondismiss: () => {
                        restorePageScroll();
                        resolve({
                            success: false,
                            message: 'Payment cancelled',
                            error: 'USER_CANCELLED',
                        });
                        setTimeout(restorePageScroll, 300);
                    },
                },
            };

            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();
        });
    } catch (error: any) {
        restorePageScroll();
        return {
            success: false,
            message: 'Failed to initiate payment',
            error: error.response?.data?.message || error.message,
        };
    }
};

export default {
    loadRazorpayScript,
    createOrder,
    verifyPayment,
    getPaymentHistory,
    initiatePayment,
};
