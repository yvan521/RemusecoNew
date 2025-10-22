import React, { useState, useEffect } from 'react'
import api from '../api'
import { FaBox, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'

export default function Products() {
  const [products, setProducts] = useState([])
  const [units, setUnits] = useState([])
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [unitId, setUnitId] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('') // 🔍 new state for search input

  async function load() {
    try {
      const [pRes, uRes] = await Promise.all([api.get('/products'), api.get('/units')])
      setProducts(pRes.data.data || [])
      setUnits(uRes.data.data || [])
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  useEffect(() => { load() }, [])

  async function submit(e) {
    e.preventDefault()
    try {
      if (editingId) await api.put('/products/' + editingId, { product_name: productName, description, unit_id: unitId })
      else await api.post('/products', { product_name: productName, description, unit_id: unitId })
      setProductName(''); setDescription(''); setUnitId(''); setEditingId(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  async function remove(id) {
    if (!confirm('Delete product?')) return
    try {
      await api.delete('/products/' + id)
      await load()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  function edit(p) {
    setProductName(p.product_name)
    setDescription(p.description || '')
    setUnitId(p.unit_id)
    setEditingId(p.product_id)
  }

  // filter products by search query
  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transition-colors duration-500">

        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">Products</h2>

        

        {/* Product Form */}
        <form onSubmit={submit} className="space-y-4 mb-8">
          <div className="flex items-center space-x-3">
            <FaBox className="text-gray-400 dark:text-gray-200" />
            <input type="text" placeholder="Product Name" value={productName} onChange={e => setProductName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-300" required
            />
          </div>
          <div className="flex items-center space-x-3">
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-300" required
            />
          </div>
          <div className="flex items-center space-x-3">
            <select value={unitId} onChange={e => setUnitId(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
            >
              <option value="">-- Select Unit --</option> 
              {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>)}
            </select>
          </div>
          {error && <p className="text-red-500 animate-shake">{error}</p>}
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400 text-white font-bold transition-transform transform hover:scale-105">
            {editingId ? 'Update Product' : 'Create Product'}
          </button>
          {/* Search Bar */}
        <div className="mb-6 flex items-center space-x-3">
          <FaSearch className="text-gray-400 dark:text-gray-200" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-300"
          />
        </div>
        </form>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Unit</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map(p => (
                <tr key={p.product_id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300">
                  <td className="px-4 py-2">{p.product_name}</td>
                  <td className="px-4 py-2">{p.unit_name}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button onClick={() => edit(p)} className="p-2 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-white transition-colors"><FaEdit /></button>
                    <button onClick={() => remove(p.product_id)} className="p-2 bg-red-500 hover:bg-red-600 rounded-xl text-white transition-colors"><FaTrash /></button>
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
