namespace AuthService.Application.DTOs;

/// <summary>
/// DTO con detalles completos del perfil de usuario.
/// Se utiliza al obtener el perfil actual y en la respuesta de autenticación.
/// </summary>
public class UserDetailsDto
{
    /// <summary>
    /// Identificador único del usuario (GUID).
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Nombre de usuario único en el sistema.
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Email del usuario (verificado).
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Nombre del usuario.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Apellido del usuario.
    /// </summary>
    public string Surname { get; set; } = string.Empty;

    /// <summary>
    /// URL de la foto de perfil almacenada en Cloudinary o servidor.
    /// </summary>
    public string ProfilePicture { get; set; } = string.Empty;

    /// <summary>
    /// Número de teléfono del usuario (formato Guatemala: 8 dígitos).
    /// </summary>
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Ciudad donde reside el usuario.
    /// </summary>
    public string City { get; set; } = string.Empty;

    /// <summary>
    /// Dirección completa del usuario.
    /// </summary>
    public string Address { get; set; } = string.Empty;

    /// <summary>
    /// País donde reside el usuario (por defecto Guatemala).
    /// </summary>
    public string Country { get; set; } = string.Empty;

    /// <summary>
    /// Rol del usuario en el sistema (User, Moderator, Admin).
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Preferencias del usuario para notificaciones y búsqueda.
    /// </summary>
    public UserPreferencesDto Preferences { get; set; } = null!;
}
