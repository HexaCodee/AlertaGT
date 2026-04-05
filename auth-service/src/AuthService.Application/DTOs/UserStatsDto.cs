namespace AuthService.Application.DTOs;

public class UserStatsDto
{
    public int TotalAlerts { get; set; } = 0;
    public int TotalComments { get; set; } = 0;
    public int CommunityHelped { get; set; } = 0; // Usuarios que vieron sus alertas
    public int ModerationActions { get; set; } = 0;
}