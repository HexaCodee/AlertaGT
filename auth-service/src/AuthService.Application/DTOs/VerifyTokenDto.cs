namespace AuthService.Application.DTOs;

/// <summary>
/// DTO para verificación de token JWT
/// </summary>
public class VerifyTokenDto
{
    /// <summary>
    /// Token JWT a verificar
    /// </summary>
    public required string Token { get; set; }
}

/// <summary>
/// Respuesta de verificación de token JWT
/// </summary>
public class VerifyTokenResponseDto
{
    /// <summary>
    /// Indica si la verificación fue exitosa
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Datos del usuario si el token es válido
    /// </summary>
    public UserDetailsDto? User { get; set; }

    /// <summary>
    /// Mensaje de error si la verificación falla
    /// </summary>
    public string? Message { get; set; }
}