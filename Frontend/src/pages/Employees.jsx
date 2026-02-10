import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import {
  FaUser, FaLock, FaUserTie, FaEdit, FaTrash,
  FaBars, FaTimes, FaHome, FaBoxes,
  FaCashRegister, FaUsers, FaChartBar
} from 'react-icons/fa';

export default function Employees() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navItems = [
    { label: 'Home', icon: <FaHome />, link: '/' },
    { label: 'Units', icon: <FaBoxes />, link: '/units' },
    { label: 'Products', icon: <FaBoxes />, link: '/products' },
    { label: 'Transactions', icon: <FaCashRegister />, link: '/transactions' },
    { label: 'Employees', icon: <FaUsers />, link: '/employees' },
    { label: 'Reports', icon: <FaChartBar />, link: '/reports' },
  ];

  // ✅ SAFE loader (never crashes React)
  async function loadEmployees() {
    try {
      setError('');
      const res = await api.get('/employees');

      if (Array.isArray(res.data?.data)) {
        setEmployees(res.data.data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error('Load employees error:', err);
      setEmployees([]);
      setError(
        err.response?.data?.error ||
        'Unable to load employees (check permissions)'
      );
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  // ✅ REGISTER (endpoint unchanged)
  async function register(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', {
        full_name: fullName,
        username,
        password,
        role
      });

      setFullName('');
      setUsername('');
      setPassword('');
      setRole('staff');

      // reload employees safely
      await loadEmployees();
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(id) {
    const new_password = prompt('Enter new password:');
    if (!new_password) return;

    try {
      await api.put(`/employees/${id}/password`, { new_password });
      alert('Password reset successful');
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed');
    }
  }

  async function deleteEmployee(id) {
    if (!window.confirm('Delete this employee?')) return;

    try {
      await api.delete(`/employees/${id}`);
      setEmployees(prev => prev.filter(e => e.employee_id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-gray-800">
        <h2 className="font-bold text-lg text-gray-800 dark:text-white">Dashboard</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 w-64 h-full bg-white dark:bg-gray-800 p-6
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <nav className="space-y-2">
          {navItems.map((item, i) => (
            <Link
              key={i}
              to={item.link}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-500 hover:text-white"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:ml-64">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow">

          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Employees
          </h1>

          {/* Form */}
          <form onSubmit={register} className="space-y-3 mb-6">
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Full name"
              required
              className="w-full p-2 rounded border"
            />
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="w-full p-2 rounded border"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-2 rounded border"
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full p-2 rounded border"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </select>

            {error && <p className="text-red-500">{error}</p>}

            <button
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            >
              {loading ? 'Registering...' : 'Register Employee'}
            </button>
          </form>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.employee_id} className="border-t">
                    <td>{emp.full_name}</td>
                    <td>{emp.username}</td>
                    <td>{emp.role}</td>
                    <td>{emp.active ? 'Yes' : 'No'}</td>
                    <td className="flex gap-2">
                      <button onClick={() => resetPassword(emp.employee_id)}>
                        <FaEdit />
                      </button>
                      <button onClick={() => deleteEmployee(emp.employee_id)}>
                        <FaTrash />
                      </button>
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
