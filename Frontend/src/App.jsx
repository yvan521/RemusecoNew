import React from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Units from './pages/Units'
import Products from './pages/Products'
import Transactions from './pages/Transactions'
import Employees from './pages/Employees'
import Reports from './pages/Reports'

function useAuth() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  return { logout };
}

export default function App() {
  const token = localStorage.getItem('token');
  const { logout } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-500">

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">REMUSECO COMPANY</h1>
            <nav className="hidden md:flex space-x-4">
              <Link to="/" className="px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300">Dashboard</Link>
              {token && <>
                <Link to="/units" className="px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300">Units</Link>
                <Link to="/products" className="px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300">Products</Link>
                <Link to="/transactions" className="px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300">Transactions</Link>
                <Link to="/reports" className="px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300">Reports</Link>
                <Link to="/employees" className="px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300">Employees</Link>
              </>}
            </nav>
          </div>

          {/* Login / Logout */}
          <div>
            {token ? (
              <button 
                onClick={logout} 
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-300"
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/login" 
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors duration-300"
              >
                Login
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/units" element={token ? <Units /> : <Navigate to="/login" />} />
          <Route path="/products" element={token ? <Products /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={token ? <Transactions /> : <Navigate to="/login" />} />
          <Route path="/employees" element={token ? <Employees /> : <Navigate to="/login" />} />
          <Route path="/reports" element={token ? <Reports /> : <Navigate to="/login" />} />
        </Routes>
      </main>

    </div>
  )
}




// import React from 'react'
// import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
// import Login from './pages/Login'
// import Dashboard from './pages/Dashboard'
// import Units from './pages/Units'
// import Products from './pages/Products'
// import Transactions from './pages/Transactions'
// import Employees from './pages/Employees'
// import Reports from './pages/Reports'

// function useAuth() {
//   const navigate = useNavigate();
//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login');
//   };
//   return { logout };
// }

// export default function App() {
//   const token = localStorage.getItem('token');
//   const { logout } = useAuth();
//   return (
//     <div>
//       <div className="container">
//         <div className="header">
//           <div>
//             <h1>REMUSCO COMPANY</h1>
//             <nav>
//               <Link to="/">Dashboard</Link>
//               {token ? <>
//                 <Link to="/units">Units</Link>
//                 <Link to="/products">Products</Link>
//                 <Link to="/transactions">Transactions</Link>
//                 <Link to="/reports">Reports</Link>
//                 <Link to="/employees">Employees</Link>
//               </> : null}
//             </nav>
//           </div>
//           <div className="right">
//             {token ? <button onClick={logout}>Logout</button> : <Link to="/login">Login</Link>}
//           </div>
//         </div>

//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
//           <Route path="/units" element={token ? <Units /> : <Navigate to="/login" />} />
//           <Route path="/products" element={token ? <Products /> : <Navigate to="/login" />} />
//           <Route path="/transactions" element={token ? <Transactions /> : <Navigate to="/login" />} />
//           <Route path="/employees" element={token ? <Employees /> : <Navigate to="/login" />} />
//           <Route path="/reports" element={token ? <Reports /> : <Navigate to="/login" />} />
//         </Routes>
//       </div>
//     </div>
//   )
// }
