import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

type QA = { question: string; answer?: string; user?: { firstName?: string } };

const ProductQnA = ({ qna = [] as QA[] }: { qna?: QA[] }) => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const [items, setItems] = useState<QA[]>(qna);
  const [text, setText] = useState('');

  const submitQuestion = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to ask a question');
      return;
    }
    if (!text.trim()) return;
    setItems([{ question: text.trim() }, ...items]);
    setText('');
    toast.success('Question submitted');
  };

  if (!items.length && !isAuthenticated) return null;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer questions & answers</h3>
      <div className="flex items-center space-x-3 mb-6">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a question"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
        />
        <button onClick={submitQuestion} className="bg-amazon-orange text-white px-4 py-2 rounded-md hover:bg-orange-600">
          Ask
        </button>
      </div>

      <div className="space-y-4">
        {items.map((qa, idx) => (
          <div key={idx} className="border-b last:border-b-0 pb-4">
            <p className="font-medium text-gray-900">Q: {qa.question}</p>
            {qa.answer ? (
              <p className="text-gray-700 mt-1">A: {qa.answer}</p>
            ) : (
              <p className="text-gray-500 mt-1">Awaiting answers</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductQnA;


