"use client"
import { MessageCircle } from "lucide-react"

const WhatsAppFloat = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "5534996532577" // Replace with actual WhatsApp number
    const message = "Olá! Gostaria de saber mais sobre as soluções da J.R. AgroSolutions."
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:animate-none transform hover:scale-110"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  )
}

export default WhatsAppFloat