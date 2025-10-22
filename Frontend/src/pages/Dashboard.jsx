import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBoxes, FaCashRegister, FaUsers, FaChartBar, FaHome, FaBars, FaTimes } from 'react-icons/fa';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Home', icon: <FaHome />, link: '/' },
    { label: 'Units', icon: <FaBoxes />, link: '/units' },
    { label: 'Products', icon: <FaBoxes />, link: '/products' },
    { label: 'Transactions', icon: <FaCashRegister />, link: '/transactions' },
    { label: 'Employees', icon: <FaUsers />, link: '/employees' },
    { label: 'Reports', icon: <FaChartBar />, link: '/reports' },
  ];

  const cardStyles = [
    'bg-gradient-to-r from-purple-500 to-pink-500',
    'bg-gradient-to-r from-green-400 to-blue-500',
    'bg-gradient-to-r from-yellow-400 to-orange-500',
    'bg-gradient-to-r from-pink-400 to-purple-600',
    'bg-gradient-to-r from-blue-400 to-indigo-500',
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 transition-colors duration-500">

      {/* Mobile Navbar Toggle */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-800 dark:text-white text-2xl focus:outline-none"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 shadow-lg p-6 flex flex-col space-y-6 transition-transform duration-300
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:hidden">Dashboard</h2>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300"
              onClick={() => setSidebarOpen(false)} // close sidebar on mobile
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 md:ml-64 transition-all duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-8 transition-colors duration-500">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 text-gray-800 dark:text-white">
            Welcome, {user?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base">
            Use the left navigation to manage units, products, transactions, employees, and reports.
          </p>

          {/* Dashboard cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {navItems.slice(1).map((item, idx) => (
              <Link
                key={idx}
                to={item.link}
                className={`${cardStyles[idx]} p-4 sm:p-6 rounded-2xl text-white shadow-lg transform transition-transform hover:scale-105 flex flex-col items-center justify-center`}
              >
                <span className="text-2xl sm:text-3xl mb-2">{item.icon}</span>
                <p className="font-bold text-sm sm:text-base">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
