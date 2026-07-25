using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using AuthService.Application.Interfaces;
 
namespace AuthService.Application.Services;
 
public class EmailService(IConfiguration configuration, ILogger<EmailService> logger) : IEmailService
{
    // Marca de AlertaGT: mismo rojo (#d30000) que usan client-admin/client-user en
    // headers y botones primarios, para que los correos se vean consistentes con la app.
    private const string BrandColor = "#d30000";

    public async Task SendEmailVerificationAsync(string email, string username, string token)
    {
        var subject = "Verifica tu correo — AlertaGT";
        var verificationUrl = $"{configuration["AppSettings:FrontendUrl"]}/verify-email?token={token}";

        var content = $@"
<h2 style='margin-top:0;color:#111827;'>¡Bienvenido a AlertaGT, {username}!</h2>
<p style='color:#4b5563;line-height:1.6;'>Gracias por unirte a la comunidad de AlertaGT. Para activar tu cuenta y empezar a reportar y ver alertas cerca de ti, verificá tu correo electrónico:</p>
<p style='text-align:center;margin:32px 0;'>
  <a href='{verificationUrl}' style='background-color:{BrandColor};color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;'>Verificar mi correo</a>
</p>
<p style='color:#6b7280;font-size:13px;'>Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br><a href='{verificationUrl}' style='color:{BrandColor};'>{verificationUrl}</a></p>
<p style='color:#6b7280;font-size:13px;'>Este enlace expira en 24 horas. Si no creaste esta cuenta, podés ignorar este correo.</p>
        ";

        await SendEmailAsync(email, subject, WrapInBrandedTemplate(content));
    }

    public async Task SendPasswordResetAsync(string email, string username, string token)
    {
        var subject = "Restablece tu contraseña — AlertaGT";
        var resetUrl = $"{configuration["AppSettings:FrontendUrl"]}/reset-password?token={token}";

        var content = $@"
<h2 style='margin-top:0;color:#111827;'>Restablecer tu contraseña</h2>
<p style='color:#4b5563;line-height:1.6;'>Hola {username}, recibimos una solicitud para restablecer la contraseña de tu cuenta de AlertaGT.</p>
<p style='text-align:center;margin:32px 0;'>
  <a href='{resetUrl}' style='background-color:#dc2626;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;'>Restablecer contraseña</a>
</p>
<p style='color:#6b7280;font-size:13px;'>Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br><a href='{resetUrl}' style='color:{BrandColor};'>{resetUrl}</a></p>
<p style='color:#6b7280;font-size:13px;'>Este enlace expira en 1 hora. Si no solicitaste este cambio, ignorá este correo — tu contraseña seguirá igual.</p>
        ";

        await SendEmailAsync(email, subject, WrapInBrandedTemplate(content));
    }

    public async Task SendWelcomeEmailAsync(string email, string username)
    {
        var subject = "¡Bienvenido a AlertaGT!";

        var content = $@"
<h2 style='margin-top:0;color:#111827;'>¡Tu cuenta ya está activa, {username}!</h2>
<p style='color:#4b5563;line-height:1.6;'>Verificamos tu correo y tu cuenta de AlertaGT quedó activada. Ya podés reportar alertas, ver el mapa comunitario y recibir notificaciones cerca de tu ubicación.</p>
<p style='color:#6b7280;font-size:13px;'>¿Tenés alguna pregunta? Escribinos, con gusto te ayudamos.</p>
        ";

        await SendEmailAsync(email, subject, WrapInBrandedTemplate(content));
    }

    // Plantilla común: header rojo con el nombre "AlertaGT" + tarjeta blanca con el
    // contenido de cada correo + pie de página. La usan los 3 correos para que
    // todos se vean consistentes con la marca (antes solo el de bienvenida la tenía).
    private static string WrapInBrandedTemplate(string innerContent) => $@"
<!DOCTYPE html>
<html>
<body style='margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f3f4f6;padding:32px 0;'>
    <tr>
      <td align='center'>
        <table width='480' cellpadding='0' cellspacing='0' style='background-color:#ffffff;border-radius:16px;overflow:hidden;max-width:480px;border:1px solid #e5e7eb;'>
          <tr>
            <td style='background-color:{BrandColor};padding:28px 24px;text-align:center;'>
              <span style='color:#ffffff;font-size:15px;'>🚨</span>
              <div style='color:#ffffff;font-size:26px;font-weight:bold;letter-spacing:0.5px;margin-top:4px;'>AlertaGT</div>
              <div style='color:rgba(255,255,255,0.85);font-size:12px;margin-top:2px;letter-spacing:0.3px;'>Alertas comunitarias en tiempo real</div>
            </td>
          </tr>
          <tr>
            <td style='padding:36px 28px;'>
              {innerContent}
            </td>
          </tr>
          <tr>
            <td style='padding:0 28px;'>
              <div style='border-top:1px solid #f0f1f3;'></div>
            </td>
          </tr>
          <tr>
            <td style='padding:18px 24px 24px;background-color:#ffffff;text-align:center;'>
              <p style='margin:0;font-size:12px;color:#9ca3af;'>AlertaGT — tu comunidad más segura</p>
              <p style='margin:4px 0 0;font-size:11px;color:#c1c5cb;'>Este es un correo automático, por favor no respondas a esta dirección.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

    private async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpSettings = configuration.GetSection("SmtpSettings");
 
        try
        {
            // Verificar si el email está habilitado
            var enabled = bool.Parse(smtpSettings["Enabled"] ?? "true");
            if (!enabled)
            {
                logger.LogInformation("El envío de emails está deshabilitado en la configuración. Omitiendo envío");
                return;
            }
 
            // Validar configuración
            var host = smtpSettings["Host"];
            var portString = smtpSettings["Port"];
            var username = smtpSettings["Username"];
            var password = smtpSettings["Password"];
            var fromEmail = smtpSettings["FromEmail"];
            var fromName = smtpSettings["FromName"];
 
            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                logger.LogError("La configuración SMTP no está configurada correctamente");
                throw new InvalidOperationException("La configuración SMTP no está configurada correctamente");
            }
 
            // Avoid logging sensitive SMTP details
 
            var port = int.Parse(portString ?? "587");
 
            using var client = new SmtpClient();
 
            // Configurar timeout
            var timeoutMs = int.Parse(smtpSettings["Timeout"] ?? "30000");
            client.Timeout = timeoutMs;
 
            try
            {
                // Configurar validación de certificados SSL
                var ignoreCertErrors = bool.Parse(smtpSettings["IgnoreCertificateErrors"] ?? "false");
                if (ignoreCertErrors)
                {
                    logger.LogWarning("Validación de certificados SSL deshabilitada. Solo usar en desarrollo.");
                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                }
 
                // Verificar configuración de SSL implícito
                var useImplicitSsl = bool.Parse(smtpSettings["UseImplicitSsl"] ?? "false");
 
                // Configuración específica por puerto y SSL
                if (useImplicitSsl || port == 465)
                {
                    await client.ConnectAsync(host, port, SecureSocketOptions.SslOnConnect);
                }
                else if (port == 587)
                {
                    await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
                }
                else
                {
                    await client.ConnectAsync(host, port, SecureSocketOptions.Auto);
                }
 
                // Autenticación
                await client.AuthenticateAsync(username, password);
 
                // Crear mensaje con MimeKit
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;
                message.Body = new TextPart("html") { Text = body };
 
                // Enviar
                await client.SendAsync(message);
                logger.LogInformation("Email enviado exitosamente");
 
                await client.DisconnectAsync(true);
                logger.LogInformation("Pipeline de email completado");
            }
            catch (MailKit.Security.AuthenticationException authEx)
            {
                logger.LogError(authEx, "La autenticación de Gmail falló. Verifica la contraseña de aplicación.");
                throw new InvalidOperationException($"La autenticación de Gmail falló: {authEx.Message}. Por favor, verifica la contraseña de aplicación.", authEx);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al enviar el email");
                throw;
            }
            logger.LogInformation("Email processed");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al enviar el email");
 
            // Verificar si usar fallback
            var useFallback = bool.Parse(smtpSettings["UseFallback"] ?? "false");
            if (useFallback)
            {
                logger.LogWarning("Usando respaldo de email");
                return; // No fallar, solo logear
            }
 
            throw new InvalidOperationException($"Error al enviar el email: {ex.Message}", ex);
        }
    }
}