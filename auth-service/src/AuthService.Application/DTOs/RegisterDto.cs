using System.ComponentModel.DataAnnotations;
using AuthService.Application.Interfaces;

namespace AuthService.Application.DTOs;

/// <summary>
/// DTO para registro de nuevo usuario en la plataforma AlertaGT.
/// </summary>
public class RegisterDto
{
    /// <summary>
    /// Nombre del usuario (máximo 25 caracteres).
    /// </summary>
    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(25, ErrorMessage = "El nombre no debe exceder 25 caracteres")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Apellido del usuario (máximo 25 caracteres).
    /// </summary>
    [Required(ErrorMessage = "El apellido es requerido")]
    [MaxLength(25, ErrorMessage = "El apellido no debe exceder 25 caracteres")]
    public string Surname { get; set; } = string.Empty;

    /// <summary>
    /// Nombre de usuario único para autenticación.
    /// </summary>
    [Required(ErrorMessage = "El nombre de usuario es requerido")]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Email del usuario (debe ser válido y único).
    /// </summary>
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "El email no es válido")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Contraseña del usuario (mínimo 8 caracteres, será hashada con Argon2).
    /// </summary>
    [Required(ErrorMessage = "La contraseña es requerida")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener mínimo 8 caracteres")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Número de teléfono (formato: 8 dígitos para Guatemala).
    /// </summary>
    [Required(ErrorMessage = "El número de teléfono es requerido")]
    [StringLength(8, MinimumLength = 8, ErrorMessage = "El teléfono debe tener exactamente 8 dígitos")]
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Ciudad del usuario (máximo 100 caracteres, por defecto "Guatemala").
    /// </summary>
    [MaxLength(100, ErrorMessage = "La ciudad no debe exceder 100 caracteres")]
    public string City { get; set; } = "Guatemala";

    /// <summary>
    /// Dirección del usuario (máximo 255 caracteres).
    /// </summary>
    [MaxLength(255, ErrorMessage = "La dirección no debe exceder 255 caracteres")]
    public string Address { get; set; } = string.Empty;

    /// <summary>
    /// País del usuario (máximo 50 caracteres, por defecto "Guatemala").
    /// </summary>
    [MaxLength(50, ErrorMessage = "El país no debe exceder 50 caracteres")]
    public string Country { get; set; } = "Guatemala";

    /// <summary>
    /// Foto de perfil del usuario (opcional, archivo).
    /// </summary>
    public IFileData? ProfilePicture { get; set; }
}
