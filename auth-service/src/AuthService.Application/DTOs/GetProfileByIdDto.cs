using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

/// <summary>
/// DTO para solicitar el perfil de un usuario específico por su ID.
/// Utilizado en endpoints administrativos para obtener información de otros usuarios.
/// </summary>
public class GetProfileByIdDto
{
    /// <summary>
    /// Identificador único (GUID) del usuario cuyo perfil se desea obtener.
    /// </summary>
    [Required(ErrorMessage = "El userId es requerido")]
    public string UserId { get; set; } = string.Empty;
}
