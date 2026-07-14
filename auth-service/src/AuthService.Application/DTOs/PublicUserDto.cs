namespace AuthService.Application.DTOs;

/// <summary>
/// Subconjunto público y mínimo del perfil de un usuario, seguro para mostrar
/// a otros usuarios (por ejemplo, el autor de una alerta o un comentario).
/// No incluye datos sensibles como email, teléfono o dirección.
/// </summary>
public class PublicUserDto
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string ProfilePicture { get; set; } = string.Empty;
}
