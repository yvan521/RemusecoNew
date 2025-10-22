import React, { useState, useEffect } from 'react'
import api from '../api'
import { FaBox, FaHistory, FaSearch } from 'react-icons/fa'

export default function Reports() {
  const [stock, setStock] = useState([])
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)
  const [searchProduct, setSearchProduct] = useState("")
  const [searchLog, setSearchLog] = useState("")
  const [activeTab, setActiveTab] = useState("reports") // "reports" or "logs"

  async function load() {
    try {
      const [sRes, lRes, tRes] = await Promise.all([
        api.get('/reports/stock-balance'),
        api.get('/reports/logs'),
        api.get('/transactions'),
      ])

      const products = sRes.data.data || []
      const logsData = lRes.data.data || []
      const transactions = tRes.data.data || []

      const balance = products.map(p => {
        const productTx = transactions.filter(t => t.product_id === p.product_id)

        const total_in = productTx
          .filter(t => t.transaction_type === 'IN')
          .reduce((sum, t) => sum + Number(t.quantity || 0), 0)

        const total_out = productTx
          .filter(t => t.transaction_type === 'OUT')
          .reduce((sum, t) => sum + Number(t.quantity || 0), 0)

        return {
          ...p,
          total_in: Number(total_in) || 0,
          total_out: Number(total_out) || 0,
          remaining: Number(total_in) - Number(total_out) || 0,
        }
      })

      setStock(balance)
      setLogs(logsData)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  useEffect(() => { load() }, [])

  const filteredStock = stock.filter(s =>
    s.product_name?.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const filteredLogs = logs.filter(l =>
    l.employee_name?.toLowerCase().includes(searchLog.toLowerCase()) ||
    l.action?.toLowerCase().includes(searchLog.toLowerCase()) ||
    l.details?.toLowerCase().includes(searchLog.toLowerCase())
  )

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-8">

        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">Reports</h2>
        {error && <p className="text-red-500 animate-shake">{error}</p>}

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 font-semibold ${activeTab === "reports"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"}`}
          >
            Stock Reports
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 font-semibold ${activeTab === "logs"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"}`}
          >
            Activity Logs
          </button>
        </div>

        {/* Reports Section */}
        {activeTab === "reports" && (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <FaSearch className="text-gray-500 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Search product..."
                value={searchProduct}
                onChange={e => setSearchProduct(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStock.map(s => (
                <div key={s.product_id} className="p-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                  <FaBox className="text-3xl mb-2" />
                  <h3 className="font-bold text-lg">{s.product_name}</h3>
                  <p>In: {s.total_in}</p>
                  <p>Out: {s.total_out}</p>
                  <p>Remaining: {s.remaining}</p>
                </div>
              ))}
              {filteredStock.length === 0 && (
                <p className="col-span-full text-center text-gray-500 dark:text-gray-400">No products found</p>
              )}
            </div>
          </>
        )}

        {/* Logs Section */}
        {activeTab === "logs" && (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <FaSearch className="text-gray-500 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchLog}
                onChange={e => setSearchLog(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center space-x-2">
                <FaHistory /> <span>Activity Logs</span>
              </h3>

              <div className="space-y-4">
                {filteredLogs.map(l => (
                  <div key={l.log_id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700 shadow">
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      {new Date(l.created_at).toLocaleString()}
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {l.employee_name} <span className="text-blue-500">{l.action}</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">{l.details}</p>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400">No logs found</p>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}