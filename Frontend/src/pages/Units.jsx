import React, { useState, useEffect } from 'react'
import api from '../api'
import { FaLayerGroup, FaEdit, FaTrash } from 'react-icons/fa'

export default function Units() {
  const [units, setUnits] = useState([])
  const [unitName, setUnitName] = useState('')
  const [unitType, setUnitType] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)

  async function load() {
    try {
      const res = await api.get('/units')
      setUnits(res.data.data || [])
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  useEffect(() => { load() }, [])

  async function submit(e) {
    e.preventDefault()
    try {
      if (editingId) await api.put('/units/' + editingId, { unit_name: unitName, unit_type: unitType })
      else await api.post('/units', { unit_name: unitName, unit_type: unitType })
      setUnitName(''); setUnitType(''); setEditingId(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  async function remove(id) {
    if (!confirm('Delete unit?')) return
    try {
      await api.delete('/units/' + id)
      await load()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  function edit(u) {
    setUnitName(u.unit_name); setUnitType(u.unit_type); setEditingId(u.unit_id)
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transition-colors duration-500">

        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">Units</h2>

        {/* Unit Form */}
        <form onSubmit={submit} className="space-y-4 mb-8">
          <div className="flex items-center space-x-3">
            <FaLayerGroup className="text-gray-400 dark:text-gray-200" />
            <input type="text" placeholder="Unit Name" value={unitName} onChange={e => setUnitName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-300" required
            />
          </div>
          <div className="flex items-center space-x-3">
            <FaLayerGroup className="text-gray-400 dark:text-gray-200" />
            <input type="text" placeholder="Unit Type" value={unitType} onChange={e => setUnitType(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-300" required
            />
          </div>
          {error && <p className="text-red-500 animate-shake">{error}</p>}
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold transition-transform transform hover:scale-105">
            {editingId ? 'Update Unit' : 'Create Unit'}
          </button>
        </form>

        {/* Units Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {units.map(u => (
                <tr key={u.unit_id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300">
                  <td className="px-4 py-2">{u.unit_name}</td>
                  <td className="px-4 py-2">{u.unit_type}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button onClick={() => edit(u)} className="p-2 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-white transition-colors"><FaEdit /></button>
                    <button onClick={() => remove(u.unit_id)} className="p-2 bg-red-500 hover:bg-red-600 rounded-xl text-white transition-colors"><FaTrash /></button>
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















// import React, { useState, useEffect } from 'react'
// import api from '../api'

// export default function Units(){
//   const [units, setUnits] = useState([])
//   const [unitName, setUnitName] = useState('')
//   const [unitType, setUnitType] = useState('')
//   const [editingId, setEditingId] = useState(null)
//   const [error, setError] = useState(null)

//   async function load(){
//     try {
//       const res = await api.get('/units')
//       setUnits(res.data.data || [])
//     } catch (err) {
//       setError(err.response?.data?.error || err.message)
//     }
//   }
//   useEffect(()=>{ load() }, [])

//   async function submit(e){
//     e.preventDefault()
//     try {
//       if (editingId) {
//         const res = await api.put('/units/'+editingId, { unit_name: unitName, unit_type: unitType })
//       } else {
//         const res = await api.post('/units', { unit_name: unitName, unit_type: unitType })
//       }
//       setUnitName(''); setUnitType(''); setEditingId(null)
//       await load()
//     } catch (err) {
//       setError(err.response?.data?.error || err.message)
//     }
//   }

//   async function remove(id){
//     if (!confirm('Delete unit?')) return
//     try {
//       await api.delete('/units/'+id)
//       await load()
//     } catch (err) {
//       setError(err.response?.data?.error || err.message)
//     }
//   }

//   function edit(u){ setUnitName(u.unit_name); setUnitType(u.unit_type); setEditingId(u.unit_id) }

//   return (
//     <div>
//       <h2>Units</h2>
//       <form onSubmit={submit}>
//         <div className="form-row"><label>Unit name</label><input value={unitName} onChange={e=>setUnitName(e.target.value)} /></div>
//         <div className="form-row"><label>Unit type</label><input value={unitType} onChange={e=>setUnitType(e.target.value)} /></div>
//         {error && <small className="error">{error}</small>}
//         <div><button type="submit">{editingId ? 'Update' : 'Create'}</button></div>
//       </form>

//       <table className="table">
//         <thead><tr><th>Name</th><th>Type</th><th>Actions</th></tr></thead>
//         <tbody>
//           {units.map(u=>(
//             <tr key={u.unit_id}>
//               <td>{u.unit_name}</td>
//               <td>{u.unit_type}</td>
//               <td>
//                 <button onClick={()=>edit(u)}>Edit</button>
//                 <button onClick={()=>remove(u.unit_id)}>Delete</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   )
// }
