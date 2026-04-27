import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

// No prerenderizar este endpoint (necesita ser dinámico para POST)
export const prerender = false;

// Configurar transporte de Nodemailer con Zoho
const transporter = nodemailer.createTransport({
  host: import.meta.env.ZOHO_SMTP_HOST,
  port: parseInt(import.meta.env.ZOHO_SMTP_PORT),
  secure: true,
  auth: {
    user: import.meta.env.ZOHO_EMAIL,
    pass: import.meta.env.ZOHO_APP_PASSWORD,
  },
});

export const POST: APIRoute = async ({ request }) => {
  // Verificar que es una solicitud POST
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Parsear el cuerpo de la solicitud
    const data = await request.json();
    const { name, email, phone, service, message } = data;

    // Validación básica
    if (!name || !email || !service || !message) {
      return new Response(
        JSON.stringify({ error: "Faltan campos requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Validar que sea un email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Crear el contenido del email
    const htmlContent = `
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<style>
						* { margin: 0; padding: 0; box-sizing: border-box; }
						body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f0f0; }
						.wrapper { background-color: #f0f0f0; padding: 20px; }
						.container { background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 0; overflow: hidden; }
						.header { background-color: #1a1a2e; padding: 60px 20px; text-align: left; border-bottom: 3px solid #5a3aad; }
						.header-logo { font-size: 28px; font-weight: 700; color: #ffffff; margin-bottom: 25px; letter-spacing: 2px; }
						.header h2 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; line-height: 1.3; }
						.header p { color: #b0b0b0; margin: 12px 0 0 0; font-size: 13px; font-weight: 400; }
						.content { padding: 40px 30px; }
						.section-title { color: #5a3aad; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; margin-top: 0; }
						.section-title:not(:first-of-type) { margin-top: 30px; }
						.info-box { background-color: #f9f9f9; border-left: 3px solid #5a3aad; padding: 20px; margin-bottom: 30px; }
						.field { margin-bottom: 14px; display: flex; align-items: flex-start; }
						.field:last-child { margin-bottom: 0; }
						.field-label { color: #5a3aad; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; min-width: 90px; padding-right: 15px; }
						.field-value { color: #2c2c2c; font-size: 13px; flex: 1; }
						.field-value a { color: #5a3aad; text-decoration: none; font-weight: 600; }
						.field-value a:hover { text-decoration: underline; }
						.message-box { background-color: #f9f9f9; padding: 20px; border-left: 3px solid #e0e0e0; color: #3a3a3a; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word; font-size: 13px; }
						.cta-section { text-align: center; margin: 35px 0; }
						.cta-button { display: inline-block; background-color: #5a3aad; color: #ffffff; padding: 12px 36px; text-decoration: none; border-radius: 3px; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #5a3aad; transition: all 0.3s; }
						.cta-button:hover { background-color: #4a2a8d; border-color: #4a2a8d; }
						.footer { background-color: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0; }
						.footer p { color: #666666; margin: 6px 0; font-size: 12px; line-height: 1.6; }
						.footer-brand { color: #5a3aad; font-weight: 600; }
						.divider { height: 1px; background-color: #e0e0e0; margin: 20px 0; }
					</style>
				</head>
				<body>
					<div class="wrapper">
						<div class="container">
							<!-- Header -->
							<div class="header">
								<div class="header-logo">NETAGORA</div>
								<h2>Solicitud de Contacto</h2>
								<p>Nueva consulta de cliente</p>
							</div>

							<!-- Contenido Principal -->
							<div class="content">
								<div class="section-title">Datos del Contacto</div>
								<div class="info-box">
									<div class="field">
										<div class="field-label">Nombre</div>
										<div class="field-value">${escapeHtml(name)}</div>
									</div>

									<div class="field">
										<div class="field-label">Email</div>
										<div class="field-value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
									</div>

									<div class="field">
										<div class="field-label">Teléfono</div>
										<div class="field-value">${phone ? escapeHtml(phone) : "—"}</div>
									</div>

									<div class="field">
										<div class="field-label">Servicio</div>
										<div class="field-value">${escapeHtml(service)}</div>
									</div>
								</div>

								<div class="section-title">Mensaje del Cliente</div>
								<div class="message-box">${escapeHtml(message).replace(/\n/g, "\n")}</div>

								<div class="cta-section">
									<a href="mailto:${escapeHtml(email)}" class="cta-button">Responder a este contacto</a>
								</div>
							</div>

							<!-- Footer -->
							<div class="footer">
								<div class="divider"></div>
								<p>Este mensaje contiene una solicitud de contacto recibida a través de tu formulario web.</p>
								<p style="margin-top: 12px;"><span class="footer-brand">Netagora</span> © 2026 — Soluciones Digitales Profesionales</p>
							</div>
						</div>
					</div>
				</body>
			</html>
		`;

    const textContent = `
Nueva solicitud de contacto

Nombre: ${name}
Email: ${email}
Teléfono: ${phone || "No proporcionado"}
Servicio: ${service}

Mensaje:
${message}
		`.trim();

    // Enviar email
    const info = await transporter.sendMail({
      from: import.meta.env.ZOHO_EMAIL,
      to: import.meta.env.CONTACT_RECEIVER_EMAIL,
      replyTo: email,
      subject: `Nueva solicitud de contacto de ${name}`,
      text: textContent,
      html: htmlContent,
    });

    console.log("Email enviado:", info.response);

    return new Response(
      JSON.stringify({
        success: true,
        message: "¡Email enviado correctamente!",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error al enviar email:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Error al enviar el email. Por favor intenta de nuevo.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

// Función auxiliar para escapar HTML
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
