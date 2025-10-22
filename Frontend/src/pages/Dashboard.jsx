import React from 'react'
import { Link } from 'react-router-dom'
import { FaBoxes, FaCashRegister, FaUsers, FaChartBar, FaHome } from 'react-icons/fa'

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const navItems = [
    { label: 'Home', icon: <FaHome />, link: '/' },
    { label: 'Units', icon: <FaBoxes />, link: '/units' },
    { label: 'Products', icon: <FaBoxes />, link: '/products' },
    { label: 'Transactions', icon: <FaCashRegister />, link: '/transactions' },
    { label: 'Employees', icon: <FaUsers />, link: '/employees' },
    { label: 'Reports', icon: <FaChartBar />, link: '/reports' },
  ]

  const cardStyles = [
    'bg-gradient-to-r from-purple-500 to-pink-500',
    'bg-gradient-to-r from-green-400 to-blue-500',
    'bg-gradient-to-r from-yellow-400 to-orange-500',
    'bg-gradient-to-r from-pink-400 to-purple-600',
    'bg-gradient-to-r from-blue-400 to-indigo-500',
  ]

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors duration-500">

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg rounded-r-3xl p-6 flex flex-col space-y-6 transition-all duration-500">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Dashboard</h2>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transition-colors duration-500">
          <h1 className="text-3xl font-extrabold mb-4 text-gray-800 dark:text-white">Welcome, {user?.full_name || 'User'}!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Use the left navigation to manage units, products, transactions, employees, and reports.
          </p>

          {/* Dashboard cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {navItems.slice(1).map((item, idx) => (
              <Link
                key={idx}
                to={item.link}
                className={`${cardStyles[idx]} p-6 rounded-2xl text-white shadow-lg transform transition-transform hover:scale-105 flex flex-col items-center justify-center`}
              >
                <span className="text-3xl mb-2">{item.icon}</span>
                <p className="font-bold">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
