"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router-dom"
import { ref, get } from "firebase/database"
import { auth, database } from "../firebase/firebase"
import { Loader2, AlertTriangle } from "lucide-react"

const ProtectedRoute = ({ children, requiredRole = "manager" }) => {
  const [user, loading, error] = useAuthState(auth)
  const [userRole, setUserRole] = useState(null)
  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const navigate = useNavigate()

  // Verificar role do usuário
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsCheckingRole(false)
        return
      }

      try {
        // Buscar em todas as propriedades para encontrar o usuário
        const propriedadesRef = ref(database, "propriedades")
        const propriedadesSnapshot = await get(propriedadesRef)

        if (propriedadesSnapshot.exists()) {
          const propriedades = propriedadesSnapshot.val()
          let userData = null

          // Percorrer todas as propriedades para encontrar o usuário
          for (const [propriedadeName, propriedadeData] of Object.entries(propriedades)) {
            if (propriedadeData.users && propriedadeData.users[user.uid]) {
              userData = propriedadeData.users[user.uid]
              break
            }
          }

          if (userData && userData.role) {
            setUserRole(userData.role)

            // Verificar se o usuário tem a role necessária
            if (userData.role !== requiredRole) {
              setAccessDenied(true)
              // Fazer logout do usuário
              setTimeout(async () => {
                await auth.signOut()
                navigate("/login")
              }, 3000)
            }
          } else {
            setAccessDenied(true)
            // Fazer logout se não encontrar dados do usuário
            setTimeout(async () => {
              await auth.signOut()
              navigate("/login")
            }, 3000)
          }
        } else {
          setAccessDenied(true)
          setTimeout(async () => {
            await auth.signOut()
            navigate("/login")
          }, 3000)
        }
      } catch (error) {
        console.error("Erro ao verificar role do usuário:", error)
        setAccessDenied(true)
        setTimeout(async () => {
          await auth.signOut()
          navigate("/login")
        }, 3000)
      } finally {
        setIsCheckingRole(false)
      }
    }

    if (!loading) {
      if (!user) {
        // Usuário não está logado, redirecionar para login
        navigate("/login")
      } else {
        // Usuário está logado, verificar role
        checkUserRole()
      }
    }
  }, [user, loading, navigate, requiredRole])

  // Mostrar loading enquanto verifica autenticação
  if (loading || isCheckingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">Verificando acesso</h3>
          <p className="text-slate-500">Aguarde enquanto validamos suas credenciais...</p>
        </div>
      </div>
    )
  }

  // Mostrar erro se não tiver acesso
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Acesso Negado</h2>
          <p className="text-red-600 mb-6 leading-relaxed">
            Você não tem permissão para acessar esta página. Apenas usuários com nível "manager" podem acessar o
            sistema.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700">Você será redirecionado para a página de login em alguns segundos...</p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors duration-200"
          >
            Ir para Login
          </button>
        </div>
      </div>
    )
  }

  // Mostrar erro se houver erro de autenticação
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Erro de Autenticação</h2>
          <p className="text-red-600 mb-6 leading-relaxed">
            Ocorreu um erro ao verificar suas credenciais. Tente fazer login novamente.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors duration-200"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  // Se chegou até aqui, usuário está autenticado e tem permissão
  return <div className="protected-content">{children}</div>
}

export default ProtectedRoute
