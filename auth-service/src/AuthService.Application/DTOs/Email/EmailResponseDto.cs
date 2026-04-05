namespace AuthService.Application.DTOs.Email;

/// <summary>
/// DTO de respuesta genérica para operaciones relacionadas con email (verificación, cambio de contraseña, etc.).
/// </summary>
public class EmailResponseDto
{
    /// <summary>
    /// Indica si la operación de email fue exitosa.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Mensaje de estado o descripción del resultado de la operación.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Datos adicionales opcionales sobre la operación (ej: email verificado, información del token, etc.).
    /// </summary>
    public object? Data { get; set; }
}
