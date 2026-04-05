namespace AuthService.Application.DTOs;

/// <summary>
/// DTO para actualizar el rol de un usuario (solo para administradores).
/// Soporta roles como USER_ROLE, MODERATOR_ROLE, ADMIN_ROLE.
/// </summary>
public class UpdateUserRoleDto
{
    /// <summary>
    /// Nombre del rol a asignar al usuario (ej: "USER_ROLE", "MODERATOR_ROLE", "ADMIN_ROLE").
    /// Solo un rol por usuario en el sistema actual.
    /// </summary>
    public string RoleName { get; set; } = string.Empty;
}
