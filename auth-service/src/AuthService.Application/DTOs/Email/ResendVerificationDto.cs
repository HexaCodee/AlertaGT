using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs.Email;

/// <summary>
/// DTO para solicitar el reenvío de un email de verificación.
/// Se utiliza cuando el usuario no recibió el email inicial o el token expiró.
/// </summary>
public class ResendVerificationDto
{
    /// <summary>
    /// Email del usuario que solicita reenviar el email de verificación.
    /// Se valida si existe en el sistema y si aún no ha sido verificado.
    /// </summary>
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "El email no es válido")]
    public string Email { get; set; } = string.Empty;
}
