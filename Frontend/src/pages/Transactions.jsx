import React, { useState, useEffect } from 'react'
import api from '../api'
import { FaBox, FaArrowUp, FaArrowDown, FaTrash, FaSearch } from 'react-icons/fa'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState('')
  const [productName, setProductName] = useState('') // show product name in input
  const [transactionType, setTransactionType] = useState('IN')
  const [quantity, setQuantity] = useState(0)
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  async function load() {
    try {
      const [tRes, pRes] = await Promise.all([api.get('/transactions'), api.get('/products')])
      setTransactions(tRes.data.data || [])
      setProducts(pRes.data.data || [])
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  useEffect(() => { load() }, [])

  async function submit(e) {
    e.preventDefault()
    try {
      await api.post('/transactions', { product_id: productId, transaction_type: transactionType, quantity, remarks })
      setProductId(''); setProductName(''); setTransactionType('IN'); setQuantity(0); setRemarks('')
      await load()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  async function remove(id) {
    if (!confirm('Delete transaction?')) return
    try {
      await api.delete('/transactions/' + id)
      await load()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transition-colors duration-500">

        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">Transactions</h2>

        {/* Transaction Form */}
        <form onSubmit={submit} className="space-y-4 mb-8">

          {/* 🔍 Searchable Product Input */}
          <div className="relative">
            <div className="flex items-center space-x-3">
              <FaBox className="text-gray-400 dark:text-gray-200" />
              <input
                type="text"
                placeholder="Search Product..."
                value={productName || searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value)
                  setProductName(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-300"
              />
            </div>

            {/* Dropdown List */}
            {showDropdown && filteredProducts.length > 0 && (
              <ul className="absolute z-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 mt-2 rounded-xl shadow-lg w-full max-h-48 overflow-y-auto">
                {filteredProducts.map(p => (
                  <li
                    key={p.product_id}
                    onClick={() => {
                      setProductId(p.product_id)
                      setProductName(p.product_name)
                      setSearchTerm('')
                      setShowDropdown(false)
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {p.product_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {transactionType === 'IN' ? <FaArrowDown className="text-green-400" /> : <FaArrowUp className="text-red-400" />}
            <select value={transactionType} onChange={e => setTransactionType(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-300"
            >
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-300" required
            />
          </div>

          <div className="flex items-center space-x-3">
            <input type="text" placeholder="Remarks" value={remarks} onChange={e => setRemarks(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-300" 
            />
          </div>

          {error && <p className="text-red-500 animate-shake">{error}</p>}

          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-orange-500 hover:to-yellow-400 text-white font-bold transition-transform transform hover:scale-105">
            Add Transaction
          </button>

        </form>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">By</th>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map(t => (
                <tr key={t.transaction_id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300">
                  <td className="px-4 py-2">{t.product_name}</td>
                  <td className="px-4 py-2">{t.transaction_type}</td>
                  <td className="px-4 py-2">{t.quantity}</td>
                  <td className="px-4 py-2">{t.employee_name}</td>
                  <td className="px-4 py-2">{t.created_at}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => remove(t.transaction_id)} className="p-2 bg-red-500 hover:bg-red-600 rounded-xl text-white transition-colors"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
