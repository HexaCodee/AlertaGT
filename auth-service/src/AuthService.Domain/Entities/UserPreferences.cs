using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

public class UserPreferences
{
    [Key]
    [MaxLength(16)]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MaxLength(16)]
    public string UserId { get; set; } = string.Empty;

    // Preferencias de notificaciones
    public bool NotifyNewAlerts { get; set; } = true;
    public bool NotifyComments { get; set; } = true;
    public bool NotifyModeration { get; set; } = true;
    public bool NotifyNearbyAlerts { get; set; } = true;

    // Radio de búsqueda preferido (en metros)
    public int PreferredSearchRadius { get; set; } = 2000;

    // Compartir ubicación
    public bool ShareLocation { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}