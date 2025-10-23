import React from 'react';
import { useParams } from 'react-router-dom';

const GroupDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-4">Group Detail</h1>
        <p className="text-gray-300">Group ID: {id}</p>
        <p className="text-gray-400 mt-4">This page is under development...</p>
      </div>
    </div>
  );
};

export default GroupDetail;
