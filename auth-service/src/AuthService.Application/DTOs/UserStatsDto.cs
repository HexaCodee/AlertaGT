namespace AuthService.Application.DTOs;

/// <summary>
/// DTO con estadísticas de actividad del usuario en la plataforma.
/// Se obtiene llamando al endpoint GET /profile/stats del AuthService,
/// que consume datos del PostsService.
/// </summary>
public class UserStatsDto
{
    /// <summary>
    /// Total de alertas creadas por el usuario.
    /// Se obtiene del PostsService: count de documentos con userId.
    /// </summary>
    public int TotalAlerts { get; set; } = 0;

    /// <summary>
    /// Total de comentarios realizados por el usuario en alertas de otros.
    /// Se obtiene del PostsService: count de documentos en la colección comments con userId.
    /// </summary>
    public int TotalComments { get; set; } = 0;

    /// <summary>
    /// Cantidad de usuarios que han visto las alertas del usuario.
    /// Se obtiene del PostsService: sum de views en todas las alertas del usuario.
    /// </summary>
    public int CommunityHelped { get; set; } = 0;

    /// <summary>
    /// Cantidad de acciones de moderación realizadas si el usuario es Moderator/Admin.
    /// Se obtiene del PostsService consultando registros de acciones de moderación del usuario.
    /// </summary>
    public int ModerationActions { get; set; } = 0;
}