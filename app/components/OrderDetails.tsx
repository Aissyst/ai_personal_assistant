'use client';

import React, { useState, useEffect } from 'react';
import { OrderDetailsData, OrderItem } from '@/lib/types';

function prepOrderDetails(eventDetail: any): OrderDetailsData & { confirmed?: boolean } {
  console.log('DEBUG: In prepOrderDetails, received:', eventDetail);
  let parsed;
  
  if (typeof eventDetail === 'string') {
    try {
      parsed = JSON.parse(eventDetail);
    } catch (error) {
      console.error('Failed to parse event.detail as JSON:', error);
      throw new Error(`Failed to parse order details as JSON: ${error}`);
    }
  } else if (typeof eventDetail === 'object' && eventDetail !== null) {
    // If we got an object directly, assume it's already parsed.
    parsed = eventDetail;
  } else {
    throw new Error(`Unexpected event.detail type: ${typeof eventDetail}`);
  }

  console.log('DEBUG: Parsed order details:', parsed);

  const parsedItems: OrderItem[] = Array.isArray(parsed.items) ? parsed.items : parsed;
  const totalAmount = parsedItems.reduce(
    (sum, item) => sum + (typeof item.price === 'number' ? item.price : Number(item.price) || 0),
    0
  );
  

  return {
    items: parsedItems,
    totalAmount: Number(totalAmount.toFixed(2)),
    confirmed: Boolean(parsed.confirmed)
  };
}

const OrderDetails: React.FC = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetailsData>({ items: [], totalAmount: 0 });

  useEffect(() => {
    const handleOrderUpdate = async (e: Event) => {
      const event = e as CustomEvent; // Cast to CustomEvent for detail access
      console.log('DEBUG: handleOrderUpdate triggered with event.detail:', event.detail);

      try {
        const formattedData = prepOrderDetails(event.detail);
        setOrderDetails({
          items: formattedData.items,
          totalAmount: formattedData.totalAmount
        });

        // If the order is confirmed, update Google Sheets
        if (formattedData.confirmed) {
          console.log('DEBUG: Order is confirmed. Updating Google Sheets...');
          try {
            await fetch('/api/updateSheet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: formattedData.items,
                totalAmount: formattedData.totalAmount
              })
            });
            console.log('Order confirmed and sent to Google Sheets.');
          } catch (err) {
            console.error('Failed to update Google Sheet:', err);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handleCallEnded = (e: Event) => {
      console.log('DEBUG: Call ended event received. Resetting order details.');
      setOrderDetails({ items: [], totalAmount: 0 });
    };

    window.addEventListener('orderDetailsUpdated', handleOrderUpdate);
    window.addEventListener('callEnded', handleCallEnded);

    return () => {
      window.removeEventListener('orderDetailsUpdated', handleOrderUpdate);
      window.removeEventListener('callEnded', handleCallEnded);
    };
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);

  const formatOrderItem = (item: OrderItem, index: number) => (
    <div key={index} className="mb-2 pl-4 border-l-2 border-gray-200">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-200">{item.timeslot}- {item.service_name}</span>
        <span className="text-gray-200">{formatCurrency(item.price)}</span>
      </div>
      {item.specialInstructions && (
        <div className="text-sm text-gray-500 italic mt-1">Note: {item.specialInstructions}</div>
      )}
    </div>
  );

  return (
    <div className="mt-10">
      <h1 className="text-xl font-bold mb-4 text-gray-900">Appointment</h1>
      <div className="shadow-md rounded p-4">
        <div className="mb-4">
          <span className="text-gray-900 font-mono mb-2 block">Items:</span>
          {orderDetails.items.length > 0 ? (
            orderDetails.items.map((item, index) => formatOrderItem(item, index))
          ) : (
            <span className="text-gray-500 text-base font-mono">No items</span>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center font-bold">
            <span className="text-gray-900 font-mono">Total:</span>
            <span className="text-gray-900">{formatCurrency(orderDetails.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
