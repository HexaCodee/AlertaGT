namespace AuthService.Application.DTOs;

/// <summary>
/// DTO de respuesta para operación de autenticación (login).
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// Indica si la autenticación fue exitosa.
    /// </summary>
    public bool Success { get; set; } = true;

    /// <summary>
    /// Mensaje de estado o error de la operación.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Token JWT válido para realizar peticiones autenticadas.
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Detalles compactos del usuario autenticado.
    /// </summary>
    public UserDetailsDto UserDetails { get; set; } = new();

    /// <summary>
    /// Fecha y hora de expiración del token JWT.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Token de larga duración usado para obtener un nuevo access token sin
    /// volver a pedir credenciales.
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Fecha y hora de expiración del refresh token.
    /// </summary>
    public DateTime RefreshTokenExpiresAt { get; set; }
}
