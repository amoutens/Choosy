import { Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Other from './pages/Other'

function App() {
  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/other" element={<Other />} />
      </Routes>
    </div>
  )
}

export default App
