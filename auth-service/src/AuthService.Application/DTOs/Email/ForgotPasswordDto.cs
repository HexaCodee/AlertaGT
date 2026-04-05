using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs.Email;

/// <summary>
/// DTO para iniciar el proceso de recuperación de contraseña olvidada.
/// El usuario proporciona su email y recibe un token para cambiar la contraseña.
/// </summary>
public class ForgotPasswordDto
{
    /// <summary>
    /// Email del usuario que olvidó su contraseña.
    /// Se busca en la base de datos y se envía un token de recuperación a este email.
    /// </summary>
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "El email no es válido")]
    public string Email { get; set; } = string.Empty;
}
