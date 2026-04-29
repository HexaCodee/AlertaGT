using System.Diagnostics;

namespace AuthService.Api.Models;

/// <summary>
/// Modelo de respuesta de error estandarizado para la API.
/// </summary>
public class ErrorResponse
{
    /// <summary>
    /// Obtiene o establece el código de estado HTTP.
    /// </summary>
    public int StatusCode { get; set; }

    /// <summary>
    /// Obtiene o establece el título del error.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción detallada del error.
    /// </summary>
    public string Detail { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el código de error de la aplicación.
    /// </summary>
    public string? ErrorCode { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de rastreo de la solicitud.
    /// </summary>
    public string TraceId { get; set; } = Activity.Current?.Id ?? string.Empty;

    /// <summary>
    /// Obtiene o establece la marca de tiempo de cuando se produjo el error.
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
