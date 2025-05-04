import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AiOutlineBell } from 'react-icons/ai';
import { BsRobot, BsBox, BsGraphUpArrow, BsGraphDownArrow, BsBank2, BsCreditCard2BackFill, BsCashCoin, BsPercent, BsArrowLeftCircle, BsArrowRightCircle } from 'react-icons/bs';

const Dashboard = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className='h-screen flex flex-col w-full'>
      {/* Header */}
      <header className='bg-green-900 text-white py-4 px-8 text-2xl font-bold flex justify-between items-center shadow-md w-full'>
        <div className='flex items-center gap-6'>
          <span className='text-3xl font-extrabold tracking-wide'>DS</span>
        </div>
        <nav className='flex gap-6 items-center'>
          <Link to='/income' className='hover:underline'>
            <AiOutlineBell className='w-8 h-8' />
          </Link>
          {isAuthenticated ? (
            <Link to='/profile'>
              <img
                src={user?.profilePicture || '/public/default-profile.png'}
                alt='Profile'
                className='w-10 h-10 rounded-full cursor-pointer'
              />
            </Link>
          ) : (
            <Link to='/login'>
              <img
                src='/public/default-profile.png'
                alt='Login'
                className='w-10 h-10 rounded-full cursor-pointer'
              />
            </Link>
          )}
        </nav>
      </header>
      
      <div className='flex flex-1 w-full'>
        {/* Content */}
        <main className='bg-gray-100 w-full'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
