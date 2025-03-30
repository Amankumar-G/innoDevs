import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = (event) => {
    event.preventDefault();
    setUser({ email: email, password: password });
    console.log("Sign-in successfully");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="block md:flex justify-center items-center md:mx-40 mx-6 p-6 shadow-lg bg-gray-800 rounded-lg">
        
        {/* Right Section */}
        <div className="flex flex-col items-center gap-8 md:gap-11 bg-gray-800 rounded-lg">
          <h2 className="md:text-2xl text-lg font-semibold text-gray-200">Sign In</h2>
          <form className="w-3/4 space-y-4" onSubmit={handleSubmit}>
            
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 text-lg bg-gray-800 text-gray-200 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 text-lg bg-gray-800 text-gray-200 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {/* Sign In Button */}
            <button type="submit" className="w-full text-lg bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 hover:cursor-pointer transition">
              Sign In
            </button>
          </form>
          
          <p className="text-sm text-gray-400 text-center mt-4">
            Don’t have an account? <a href="/signup" className="text-blue-400 hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
