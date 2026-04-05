namespace AuthService.Application.DTOs;

/// <summary>
/// DTO de respuesta para la operación de registro de nuevo usuario.
/// Incluye detalles del usuario creado y estado de verificación de email.
/// </summary>
public class RegisterResponseDto
{
    /// <summary>
    /// Indica si el registro fue exitoso.
    /// </summary>
    public bool Success { get; set; } = false;

    /// <summary>
    /// Información del usuario registrado.
    /// </summary>
    public UserResponseDto User { get; set; } = new();

    /// <summary>
    /// Mensaje de estado o descripción del resultado del registro.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Indica si se requiere verificación de email antes de poder usar la cuenta.
    /// Por defecto: true
    /// </summary>
    public bool EmailVerificationRequired { get; set; } = true;
}
