namespace AuthService.Application.DTOs;

/// <summary>
/// DTO para actualizar información del perfil del usuario autenticado.
/// Solo permite actualizar campos de ubicación y contacto.
/// </summary>
public class UpdateProfileDto
{
    /// <summary>
    /// Número de teléfono del usuario (8 dígitos para Guatemala).
    /// </summary>
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Ciudad de residencia del usuario.
    /// </summary>
    public string City { get; set; } = string.Empty;

    /// <summary>
    /// Dirección completa del usuario.
    /// </summary>
    public string Address { get; set; } = string.Empty;

    /// <summary>
    /// País de residencia del usuario.
    /// </summary>
    public string Country { get; set; } = string.Empty;
}