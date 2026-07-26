using System;
using AuthService.Application.DTOs;
using AuthService.Application.DTOs.Email;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AuthService.Api.Controllers;

/// <summary>
/// Controlador para las operaciones de autenticación: login, registro, y verificación de email.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    /// <summary>
    /// Autentica un usuario con email/usuario y contraseña.
    /// </summary>
    /// <param name="loginDto">Credenciales del usuario (email/usuario y contraseña).</param>
    /// <returns>Token JWT y detalles del usuario si la autenticación es exitosa.</returns>
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AuthResponseDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var result = await authService.LoginAsync(loginDto);
        return Ok(result);
    }

    /// <summary>
    /// Canjea un refresh token vigente por un access token nuevo (y un refresh
    /// token nuevo, por rotación). No requiere que el access token anterior
    /// siga siendo válido.
    /// </summary>
    /// <param name="refreshTokenDto">Refresh token emitido en un login/refresh previo.</param>
    /// <returns>Nuevo token JWT y detalles del usuario.</returns>
    [HttpPost("refresh")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AuthResponseDto))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<AuthResponseDto>> Refresh([FromBody] RefreshTokenDto refreshTokenDto)
    {
        var result = await authService.RefreshTokenAsync(refreshTokenDto);
        return Ok(result);
    }

    /// <summary>
    /// Cierra sesión revocando el refresh token indicado. El access token en
    /// uso sigue siendo válido hasta que expire por su cuenta (no hay
    /// blacklist de access tokens).
    /// </summary>
    /// <param name="logoutDto">Refresh token de la sesión a cerrar.</param>
    [HttpPost("logout")]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout([FromBody] LogoutDto logoutDto)
    {
        await authService.LogoutAsync(logoutDto);
        return Ok(new { success = true, message = "Sesión cerrada" });
    }

    /// <summary>
    /// Registra un nuevo usuario en la plataforma.
    /// </summary>
    /// <param name="registerDto">Información del nuevo usuario (nombre, email, teléfono, etc.).</param>
    /// <returns>Datos del usuario creado y requerimiento de verificación de email.</returns>
    [HttpPost("register")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(RegisterResponseDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<RegisterResponseDto>> Register([FromForm] RegisterDto registerDto)
    {
        var result = await authService.RegisterAsync(registerDto);
        return StatusCode(201, result);
    }

    /// <summary>
    /// Verifica el email del usuario utilizando un token de verificación.
    /// </summary>
    /// <param name="verifyEmailDto">Token de verificación recibido en el email.</param>
    /// <returns>Confirmación de email verificado.</returns>
    [HttpPost("verify-email")]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(EmailResponseDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<EmailResponseDto>> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
    {
        var result = await authService.VerifyEmailAsync(verifyEmailDto);
        return Ok(result);
    }

    /// <summary>
    /// Reenvía el email de verificación si el usuario no lo recibió o expiró el token.
    /// </summary>
    /// <param name="resendDto">Email del usuario que solicita reenviar verificación.</param>
    /// <returns>Confirmación de reenvío del email.</returns>
    [HttpPost("resend-verification")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(EmailResponseDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<EmailResponseDto>> ResendVerification([FromBody] ResendVerificationDto resendDto)
    {
        var result = await authService.ResendVerificationEmailAsync(resendDto);
        if (result.Success)
            return Ok(result);

        return BadRequest(result);
    }

    /// <summary>
    /// Verifica la validez de un token JWT y retorna información del usuario.
    /// </summary>
    /// <param name="verifyTokenDto">Token JWT a verificar.</param>
    /// <returns>Información del usuario si el token es válido.</returns>
    [HttpPost("verify")]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(VerifyTokenResponseDto))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<VerifyTokenResponseDto>> VerifyToken([FromBody] VerifyTokenDto verifyTokenDto)
    {
        var result = await authService.VerifyTokenAsync(verifyTokenDto);

        if (!result.Success)
        {
            return Unauthorized(result);
        }

        return Ok(result);
    }
}
