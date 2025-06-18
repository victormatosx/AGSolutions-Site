"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { ref, get } from "firebase/database"
import { auth, database } from "../firebase/firebase"
import logo from "../../public/logoVerde.png"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Limpar erro quando usuário começar a digitar
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Autenticar com Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      console.log("Usuário logado:", user)

      // Buscar em todas as propriedades para encontrar o usuário
      const propriedadesRef = ref(database, "propriedades")
      const propriedadesSnapshot = await get(propriedadesRef)

      if (propriedadesSnapshot.exists()) {
        const propriedades = propriedadesSnapshot.val()
        let userData = null
        let userProperty = null

        // Percorrer todas as propriedades para encontrar o usuário
        for (const [propriedadeName, propriedadeData] of Object.entries(propriedades)) {
          if (propriedadeData.users && propriedadeData.users[user.uid]) {
            userData = propriedadeData.users[user.uid]
            userProperty = propriedadeName
            break
          }
        }

        if (userData) {
          const userRole = userData.role

          console.log("Role do usuário:", userRole)
          console.log("Propriedade do usuário:", userProperty)

          // Verificar se o usuário tem role "manager"
          if (userRole === "manager") {
            // Redirecionar para dashboard apenas se for manager
            navigate("/dashboard")
          } else {
            // Fazer logout do usuário e mostrar erro para roles diferentes de manager
            await auth.signOut()
            setError("Seu nível de usuário não permite acesso a esta página.")
          }
        } else {
          // Caso não encontre o usuário em nenhuma propriedade
          await auth.signOut()
          setError("Dados do usuário não encontrados. Entre em contato com o suporte.")
        }
      } else {
        // Caso não encontre nenhuma propriedade
        await auth.signOut()
        setError("Dados do sistema não encontrados. Entre em contato com o suporte.")
      }
    } catch (error) {
      console.error("Erro no login:", error)

      // Tratar diferentes tipos de erro
      switch (error.code) {
        case "auth/user-not-found":
          setError("Usuário não encontrado. Verifique seu email.")
          break
        case "auth/wrong-password":
          setError("Senha incorreta. Tente novamente.")
          break
        case "auth/invalid-email":
          setError("Email inválido. Verifique o formato do email.")
          break
        case "auth/user-disabled":
          setError("Esta conta foi desabilitada. Entre em contato com o suporte.")
          break
        case "auth/too-many-requests":
          setError("Muitas tentativas de login. Tente novamente mais tarde.")
          break
        case "auth/invalid-credential":
          setError("Credenciais inválidas. Verifique seu email e senha.")
          break
        default:
          setError("Erro ao fazer login. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar ao site</span>
      </Link>

      <div className="w-full max-w-md mx-auto p-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logo || "/placeholder.svg"} alt="J.R. AgroSolutions" />
            <p className="text-gray-600">Acesse sua conta para gerenciar suas soluções</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-600">Lembrar-me</span>
              </label>
              <a href="#" className="text-sm text-green-600 hover:text-green-700 transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[linear-gradient(to_right,_#0EAB72,_#0EAB72)] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#0c955f] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Help Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Precisa de ajuda?{" "}
              <a href="#" className="text-green-600 hover:text-green-700 transition-colors">
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
