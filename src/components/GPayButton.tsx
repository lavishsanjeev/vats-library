'use client';

import GooglePayButton from '@google-pay/button-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GPayButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLoadPaymentData = async (paymentData: any) => {
        setLoading(true);
        try {
            console.log('Payment Data:', paymentData);
            const paymentToken = paymentData.paymentMethodData.tokenizationData.token;

            const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentToken }),
            });

            if (!response.ok) {
                throw new Error('Payment processing failed');
            }

            const data = await response.json();
            if (data.success) {
                alert('Payment Successful! Membership Activated.');
                router.refresh();
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[300px]">
            {loading ? (
                <div className="h-[40px] bg-secondary animate-pulse rounded-full flex items-center justify-center text-sm text-muted-foreground">
                    Processing...
                </div>
            ) : (
                <GooglePayButton
                    environment="TEST"
                    paymentRequest={{
                        apiVersion: 2,
                        apiVersionMinor: 0,
                        allowedPaymentMethods: [
                            {
                                type: 'CARD',
                                parameters: {
                                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                    allowedCardNetworks: ['MASTERCARD', 'VISA'],
                                },
                                tokenizationSpecification: {
                                    type: 'PAYMENT_GATEWAY',
                                    parameters: {
                                        gateway: 'example',
                                        gatewayMerchantId: 'exampleGatewayMerchantId',
                                    },
                                },
                            },
                        ],
                        merchantInfo: {
                            merchantId: '12345678901234567890',
                            merchantName: 'Vats Library',
                        },
                        transactionInfo: {
                            totalPriceStatus: 'FINAL',
                            totalPriceLabel: 'Total',
                            totalPrice: '100.00',
                            currencyCode: 'INR',
                            countryCode: 'IN',
                        },
                    }}
                    onLoadPaymentData={handleLoadPaymentData}
                    buttonType="pay"
                    buttonSizeMode="fill"
                    style={{ width: '100%', height: 48 }}
                />
            )}
        </div>
    );
}
