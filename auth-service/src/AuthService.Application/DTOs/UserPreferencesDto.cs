namespace AuthService.Application.DTOs;

/// <summary>
/// DTO con preferencias del usuario para notificaciones, ubicación y búsqueda.
/// Se almacena en la entidad UserPreferences y se obtiene como parte de UserDetailsDto.
/// </summary>
public class UserPreferencesDto
{
    /// <summary>
    /// Indica si el usuario desea recibir notificaciones de nuevas alertas cercanas.
    /// Por defecto: true
    /// </summary>
    public bool NotifyNewAlerts { get; set; } = true;

    /// <summary>
    /// Indica si el usuario desea recibir notificaciones de nuevos comentarios en sus alertas.
    /// Por defecto: true
    /// </summary>
    public bool NotifyComments { get; set; } = true;

    /// <summary>
    /// Indica si el usuario desea recibir notificaciones sobre acciones de moderación.
    /// Por defecto: true
    /// </summary>
    public bool NotifyModeration { get; set; } = true;

    /// <summary>
    /// Indica si el usuario desea recibir notificaciones específicas de alertas críticas cercanas.
    /// Por defecto: true
    /// </summary>
    public bool NotifyNearbyAlerts { get; set; } = true;

    /// <summary>
    /// Radio de búsqueda preferido en metros para encontrar alertas cercanas (500-50000 metros).
    /// Por defecto: 2000 metros (2 km)
    /// </summary>
    public int PreferredSearchRadius { get; set; } = 2000;

    /// <summary>
    /// Indica si el usuario desea compartir su ubicación actual con otros usuarios.
    /// Se utiliza en el GeoService para mostrar usuarios cercanos.
    /// Por defecto: true
    /// </summary>
    public bool ShareLocation { get; set; } = true;
}