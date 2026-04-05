using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

/// <summary>
/// DTO para autenticación de usuario con email/username y contraseña.
/// </summary>
public class LoginDto
{
    /// <summary>
    /// Email o nombre de usuario del usuario para autenticarse.
    /// </summary>
    [Required(ErrorMessage = "El email o usuario es requerido")]
    public string EmailOrUsername { get; set; } = string.Empty;

    /// <summary>
    /// Contraseña del usuario (será validada con Argon2).
    /// </summary>
    [Required(ErrorMessage = "La contraseña es requerida")]
    public string Password { get; set; } = string.Empty;
}
