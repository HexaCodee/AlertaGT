using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using AuthService.Application.Interfaces;

namespace AuthService.Application.Services;

// Envia correos via la API HTTPS de Brevo (antes Sendinblue) en vez de SMTP:
// Render bloquea las conexiones SMTP salientes (puertos 465/587) en su plan
// gratuito, causando System.TimeoutException al conectar. HTTPS (443) si
// funciona, por eso se usa la API REST de Brevo.
public class EmailService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<EmailService> logger) : IEmailService
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

        // Verificar si el email está habilitado
        var enabled = bool.Parse(smtpSettings["Enabled"] ?? "true");
        if (!enabled)
        {
            logger.LogInformation("El envío de emails está deshabilitado en la configuración. Omitiendo envío");
            return;
        }

        var apiKey = configuration["BrevoSettings:ApiKey"];
        var fromEmail = smtpSettings["FromEmail"];
        var fromName = smtpSettings["FromName"];

        if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(fromEmail))
        {
            logger.LogError("La configuración de Brevo no está configurada correctamente");
            throw new InvalidOperationException("La configuración de Brevo no está configurada correctamente");
        }

        try
        {
            var client = httpClientFactory.CreateClient("BrevoClient");
            client.BaseAddress ??= new Uri("https://api.brevo.com/v3/");
            client.DefaultRequestHeaders.Remove("api-key");
            client.DefaultRequestHeaders.Add("api-key", apiKey);
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var payload = new
            {
                sender = new { name = fromName, email = fromEmail },
                to = new[] { new { email = to } },
                subject,
                htmlContent = body
            };

            using var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await client.PostAsync("smtp/email", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                logger.LogError("Brevo respondió con error {StatusCode}: {Body}", response.StatusCode, errorBody);
                throw new InvalidOperationException($"Brevo respondió con error {response.StatusCode}: {errorBody}");
            }

            logger.LogInformation("Email enviado exitosamente via Brevo");
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