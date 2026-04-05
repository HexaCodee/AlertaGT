using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class ProfileController(IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserDetailsDto>> GetProfile()
    {
        var userId = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await userService.GetUserProfileAsync(userId);
        return Ok(result);
    }

    [HttpPut]
    public async Task<ActionResult<UserDetailsDto>> UpdateProfile([FromBody] UpdateProfileDto updateDto)
    {
        var userId = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await userService.UpdateUserProfileAsync(userId, updateDto);
        return Ok(result);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<UserStatsDto>> GetStats()
    {
        var userId = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await userService.GetUserStatsAsync(userId);
        return Ok(result);
    }

    [HttpPut("preferences")]
    public async Task<ActionResult<UserPreferencesDto>> UpdatePreferences([FromBody] UserPreferencesDto preferencesDto)
    {
        var userId = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await userService.UpdateUserPreferencesAsync(userId, preferencesDto);
        return Ok(result);
    }
}