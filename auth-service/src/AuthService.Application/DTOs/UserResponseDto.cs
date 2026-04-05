namespace AuthService.Application.DTOs;

/// <summary>
/// DTO con información completa del usuario para respuestas de operaciones de registro.
/// Similar a UserDetailsDto pero incluye información adicional como auditoría y estado de verificación.
/// </summary>
public class UserResponseDto
{
    /// <summary>
    /// Identificador único del usuario (GUID).
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Nombre del usuario.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Apellido del usuario.
    /// </summary>
    public string Surname { get; set; } = string.Empty;

    /// <summary>
    /// Nombre de usuario único en el sistema.
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Email registrado del usuario.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// URL de la foto de perfil en Cloudinary o servidor.
    /// </summary>
    public string ProfilePicture { get; set; } = string.Empty;

    /// <summary>
    /// Número de teléfono del usuario (8 dígitos para Guatemala).
    /// </summary>
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Rol del usuario (USER_ROLE, MODERATOR_ROLE, ADMIN_ROLE).
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Indica si la cuenta del usuario está activa o desactivada.
    /// </summary>
    public bool Status { get; set; }

    /// <summary>
    /// Indica si el email del usuario ha sido verificado.
    /// Requerido antes de poder usar todas las funciones.
    /// </summary>
    public bool IsEmailVerified { get; set; }

    /// <summary>
    /// Fecha y hora de creación de la cuenta (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Fecha y hora de última actualización del perfil (UTC).
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
