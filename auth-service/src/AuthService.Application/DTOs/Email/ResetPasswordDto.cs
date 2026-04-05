using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs.Email;

/// <summary>
/// DTO para cambiar la contraseña del usuario utilizando un token de recuperación.
/// El token se obtiene del proceso de recuperación de contraseña olvidada.
/// </summary>
public class ResetPasswordDto
{
    /// <summary>
    /// Token de recuperación de contraseña (generado y enviado al email del usuario).
    /// El token es un JWT válido por 24 horas.
    /// </summary>
    [Required(ErrorMessage = "El token de recuperación es requerido")]
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Nueva contraseña del usuario (mínimo 8 caracteres, será hasheada con Argon2).
    /// </summary>
    [Required(ErrorMessage = "La nueva contraseña es requerida")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener mínimo 8 caracteres")]
    public string NewPassword { get; set; } = string.Empty;
}
