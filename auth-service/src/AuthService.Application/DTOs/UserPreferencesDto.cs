namespace AuthService.Application.DTOs;

public class UserPreferencesDto
{
    public bool NotifyNewAlerts { get; set; } = true;
    public bool NotifyComments { get; set; } = true;
    public bool NotifyModeration { get; set; } = true;
    public bool NotifyNearbyAlerts { get; set; } = true;
    public int PreferredSearchRadius { get; set; } = 2000;
    public bool ShareLocation { get; set; } = true;
}