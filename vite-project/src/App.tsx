import { Routes, Route } from 'react-router-dom'
import { ROUTES } from './lib/routes'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Other from './pages/Other'

function App() {
  return (
    <div className="app-root">
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />
        <Route path="/other" element={<Other />} />
      </Routes>
    </div>
  )
}

export default App
