"use client"

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { ref, get } from "firebase/database"
import { auth, database } from "../firebase/firebase"
import MecanicoComponent from "../components/MecanicoComponent"

const Mecanico = () => {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setAuthorized(false)
          navigate("/login", { replace: true }) 
          return
        }

        // Encontrar o usuário em quaisquer propriedades e checar a role
        const propriedadesRef = ref(database, "propriedades")
        const propriedadesSnapshot = await get(propriedadesRef)

        if (!propriedadesSnapshot.exists()) {
          setAuthorized(false)
          await signOut(auth)
          navigate("/login", { replace: true })
          return
        }

        const propriedades = propriedadesSnapshot.val()
        let userData = null

        for (const propriedadeData of Object.values(propriedades)) {
          if (propriedadeData.users && propriedadeData.users[user.uid]) {
            userData = propriedadeData.users[user.uid]
            break
          }
        }

        const role = userData?.role
        if (role === "mecanico") {
          setAuthorized(true)
        } else {
          setAuthorized(false)
          // Redireciona baseado em outras roles, se desejar
          if (role === "manager") navigate("/dashboard", { replace: true })
          else if (role === "user") navigate("/lancamentos", { replace: true })
          else if (role === "seller") navigate("/vendas", { replace: true })
          else navigate("/login", { replace: true })
        }
      } catch (e) {
        console.error("Erro ao verificar permissão do mecânico:", e)
        setAuthorized(false)
        navigate("/login", { replace: true })
      } finally {
        setChecking(false)
      }
    })

    return () => unsubscribe()
  }, [navigate])

  if (checking) {
    return null; // Let the component handle the loading state
  }

  if (!authorized) return null

  return <MecanicoComponent />
}

export default Mecanico
