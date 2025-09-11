import React from 'react';
import { Helmet } from 'react-helmet-async';

const GiftCardsPage = () => {
  const cards = [
    { id: 'gc1', title: 'eGift Card', desc: 'Email delivery, choose your amount' },
    { id: 'gc2', title: 'Print at Home', desc: 'Print and deliver your gift card' },
    { id: 'gc3', title: 'Physical Gift Card', desc: 'Mail a gift card in a greeting card' },
  ];
  return (
    <>
      <Helmet>
        <title>Gift Cards - Amazon Clone</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Gift Cards</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((c) => (
              <div key={c.id} className="p-6 bg-white border border-gray-200 rounded-md hover:shadow-sm">
                <div className="text-lg font-medium text-gray-900">{c.title}</div>
                <div className="text-sm text-gray-600">{c.desc}</div>
                <button className="mt-3 bg-amazon-orange text-white px-4 py-2 rounded-md hover:bg-orange-600">Shop now</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GiftCardsPage;


