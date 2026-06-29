using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Api.Controllers;

/// <summary>
/// Controlador para operaciones del perfil del usuario autenticado.
/// Requiere JWT token válido en el header Authorization.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class ProfileController(IUserService userService) : ControllerBase
{
    private string? GetUserId()
    {
        return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;
    }

    /// <summary>
    /// Obtiene el perfil completo del usuario autenticado.
    /// </summary>
    /// <returns>Detalles del usuario incluyendo preferencias.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserDetailsDto))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserDetailsDto>> GetProfile()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await userService.GetUserProfileAsync(userId);
        return Ok(result);
    }

    /// <summary>
    /// Actualiza la información del perfil del usuario (teléfono, ciudad, dirección, país).
    /// </summary>
    /// <param name="updateDto">Nueva información del perfil.</param>
    /// <returns>Perfil actualizado del usuario.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserDetailsDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserDetailsDto>> UpdateProfile([FromBody] UpdateProfileDto updateDto)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await userService.UpdateUserProfileAsync(userId, updateDto);
        return Ok(result);
    }

    /// <summary>
    /// Obtiene las estadísticas de actividad del usuario (alertas, comentarios, alcance).
    /// </summary>
    /// <returns>Estadísticas del usuario (alertas creadas, comentarios, usuarios ayudados, etc.).</returns>
    [HttpGet("stats")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserStatsDto))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserStatsDto>> GetStats()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await userService.GetUserStatsAsync(userId);
        return Ok(result);
    }

    /// <summary>
    /// Actualiza las preferencias del usuario (notificaciones, radio de búsqueda, compartir ubicación).
    /// </summary>
    /// <param name="preferencesDto">Nuevas preferencias del usuario.</param>
    /// <returns>Preferencias actualizadas.</returns>
    [HttpPut("preferences")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserPreferencesDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserPreferencesDto>> UpdatePreferences([FromBody] UserPreferencesDto preferencesDto)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await userService.UpdateUserPreferencesAsync(userId, preferencesDto);
        return Ok(result);
    }
}