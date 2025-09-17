import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Lancamentos from "./pages/Lancamentos"
import Vendas from "./pages/Vendas"
import Mecanico from "./pages/Mecanico"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lancamentos" element={<Lancamentos />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/mecanico" element={<Mecanico />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
