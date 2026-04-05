using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs.Email;

/// <summary>
/// DTO para verificar la identidad del usuario mediante token de verificación enviado al email.
/// El token se genera durante el registro y es válido por 24 horas.
/// </summary>
public class VerifyEmailDto
{
    /// <summary>
    /// Token de verificación de email (generado y enviado durante el registro).
    /// El token es un JWT válido por 24 horas.
    /// </summary>
    [Required(ErrorMessage = "El token de verificación es requerido")]
    public string Token { get; set; } = string.Empty;
}
