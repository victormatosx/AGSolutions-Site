import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request) {
  try {
    console.log("=== API ROUTE CHAMADA ===")
    console.log("Iniciando processo de envio de email...")

    // Verificar variáveis de ambiente
    console.log("Verificando variáveis de ambiente...")
    console.log("EMAIL_USER existe:", !!process.env.EMAIL_USER)
    console.log("EMAIL_PASS existe:", !!process.env.EMAIL_PASS)

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Variáveis de ambiente EMAIL_USER ou EMAIL_PASS não configuradas")
      return NextResponse.json(
        {
          success: false,
          message: "Configuração de email não encontrada. Verifique as variáveis de ambiente.",
        },
        { status: 500 },
      )
    }

    console.log("✅ Variáveis de ambiente OK")

    const body = await request.json()
    console.log("Body recebido:", {
      hasPDF: !!body.pdfBase64,
      fileName: body.fileName,
      propriedadeNome: body.propriedadeNome,
      periodo: body.periodo,
    })

    const { pdfBase64, fileName, propriedadeNome, periodo } = body

    if (!pdfBase64 || !fileName) {
      console.error("❌ Dados do PDF não fornecidos")
      return NextResponse.json(
        {
          success: false,
          message: "Dados do PDF não fornecidos",
        },
        { status: 400 },
      )
    }

    console.log("✅ Dados do PDF OK")
    console.log("Configurando transportador de email...")

    // Configurar o transportador de email
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Verificar conexão
    console.log("Verificando conexão com o servidor de email...")
    try {
      await transporter.verify()
      console.log("✅ Conexão verificada com sucesso!")
    } catch (verifyError) {
      console.error("❌ Erro na verificação da conexão:", verifyError)
      return NextResponse.json(
        {
          success: false,
          message: `Erro de conexão com o servidor de email: ${verifyError.message}`,
        },
        { status: 500 },
      )
    }

    const emailsDestino = ["victor.matos3112@gmail.com"]
    console.log("Emails de destino:", emailsDestino)

    // Configurar o email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailsDestino.join(", "),
      subject: `Relatório de Atividades - ${propriedadeNome || "Sistema"} - ${periodo || "Período"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #2e7d32; margin: 0;">📊 Relatório de Atividades Semanais</h2>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">Olá,</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Segue em anexo o relatório de atividades semanais 
            ${propriedadeNome ? `da propriedade <strong>${propriedadeNome}</strong>` : ""} 
            ${periodo ? `referente ao período de <strong>${periodo}</strong>` : ""}.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2e7d32;">
            <h3 style="margin-top: 0; color: #2e7d32; font-size: 18px;">📋 Informações do Relatório</h3>
            <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
              ${propriedadeNome ? `<li><strong>Propriedade:</strong> ${propriedadeNome}</li>` : ""}
              ${periodo ? `<li><strong>Período:</strong> ${periodo}</li>` : ""}
              <li><strong>Gerado em:</strong> ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</li>
            </ul>
          </div>
          
          <div style="margin: 25px 0;">
            <h3 style="color: #2e7d32; font-size: 16px;">📋 Este relatório contém:</h3>
            <ul style="line-height: 1.8; color: #555;">
              <li>✅ Atividades realizadas por operadores/máquinas</li>
              <li>📝 Justificativas de ausências</li>
              <li>📈 Análise de performance semanal</li>
              <li>📊 Estatísticas detalhadas</li>
            </ul>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; color: #1565c0; font-size: 14px;">
              💡 <strong>Dica:</strong> Em caso de dúvidas sobre o relatório, entre em contato conosco.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <div style="text-align: center; color: #666; font-size: 12px; line-height: 1.5;">
            <p style="margin: 5px 0;">🤖 Este email foi gerado automaticamente pelo sistema de gestão agrícola.</p>
            <p style="margin: 5px 0;">📅 Data de envio: ${new Date().toLocaleString("pt-BR")}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ],
    }

    console.log("Enviando email...")
    console.log("Assunto:", mailOptions.subject)

    // Enviar o email
    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Email enviado com sucesso!")
    console.log("Message ID:", info.messageId)

    return NextResponse.json({
      success: true,
      message: "✅ Relatório enviado com sucesso para os emails cadastrados!",
      messageId: info.messageId,
      emailsDestino: emailsDestino,
    })
  } catch (error) {
    console.error("❌ Erro detalhado ao enviar email:", error)
    console.error("Stack trace:", error.stack)

    let errorMessage = "Erro interno do servidor"

    if (error.code === "EAUTH") {
      errorMessage = "❌ Erro de autenticação do email. Verifique suas credenciais Gmail."
    } else if (error.code === "ECONNECTION") {
      errorMessage = "❌ Erro de conexão com o servidor de email."
    } else if (error.code === "ESOCKET") {
      errorMessage = "❌ Erro de socket. Verifique sua conexão com a internet."
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        message: `Erro ao enviar email: ${errorMessage}`,
        error: error.code || "UNKNOWN_ERROR",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Adicionar método GET para teste
export async function GET() {
  console.log("=== API ROUTE GET CHAMADA ===")
  return NextResponse.json({
    message: "API Route funcionando!",
    timestamp: new Date().toISOString(),
    env: {
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS,
    },
  })
}
