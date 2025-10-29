import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmailConfirmationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-gray-400 mb-6">
          We've sent a confirmation link to your email. Please click it to activate your account.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;