import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FaUser, FaLock, FaUserTie, FaEdit, FaTrash, FaBars, FaTimes, FaHome, FaBoxes, FaCashRegister, FaUsers, FaChartBar } from 'react-icons/fa';

export default function Employees() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState(null);

  const navItems = [
    { label: 'Home', icon: <FaHome />, link: '/' },
    { label: 'Units', icon: <FaBoxes />, link: '/units' },
    { label: 'Products', icon: <FaBoxes />, link: '/products' },
    { label: 'Transactions', icon: <FaCashRegister />, link: '/transactions' },
    { label: 'Employees', icon: <FaUsers />, link: '/employees' },
    { label: 'Reports', icon: <FaChartBar />, link: '/reports' },
  ];

  async function load() {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  useEffect(() => { load() }, []);

  async function register(e) {
    e.preventDefault();
    try {
      await api.post('/auth/register', { full_name: fullName, username, password, role });
      setFullName(''); setUsername(''); setPassword(''); setRole('staff');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  async function resetPassword(id) {
    const new_password = prompt('Enter new password for employee (manager only):');
    if (!new_password) return;
    try {
      await api.put('/employees/' + id + '/password', { new_password });
      alert('Password reset');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  async function deleteEmployee(id) {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api.delete('/employees/' + id);
      setEmployees(employees.filter(e => e.employee_id !== id));
      alert('Employee deleted successfully');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

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
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 md:ml-64 transition-all duration-300">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-8 transition-colors duration-500">

          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">Employees</h2>

          {/* Registration Form */}
          <form onSubmit={register} className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-3 space-y-3 sm:space-y-0">
              <FaUser className="text-gray-400 dark:text-gray-200" />
              <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-300"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:space-x-3 space-y-3 sm:space-y-0">
              <FaUserTie className="text-gray-400 dark:text-gray-200" />
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-300"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:space-x-3 space-y-3 sm:space-y-0">
              <FaLock className="text-gray-400 dark:text-gray-200" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-300"
              />
            </div>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </select>
            {error && <p className="text-red-500 animate-shake">{error}</p>}
            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold transition-transform transform hover:scale-105">Register Employee</button>
          </form>

          {/* Employee Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Username</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Active</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {employees.map(e => (
                  <tr key={e.employee_id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td className="px-4 py-2">{e.full_name}</td>
                    <td className="px-4 py-2">{e.username}</td>
                    <td className="px-4 py-2">{e.role}</td>
                    <td className="px-4 py-2">{e.active ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button onClick={() => resetPassword(e.employee_id)} className="p-2 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-white transition-colors"><FaEdit /></button>
                      <button onClick={() => deleteEmployee(e.employee_id)} className="p-2 bg-red-500 hover:bg-red-600 rounded-xl text-white transition-colors"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
