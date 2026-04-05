using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces;

public interface IUserService
{
    Task<UserDetailsDto> GetUserProfileAsync(string userId);
    Task<UserDetailsDto> UpdateUserProfileAsync(string userId, UpdateProfileDto updateDto);
    Task<UserStatsDto> GetUserStatsAsync(string userId);
    Task<UserPreferencesDto> UpdateUserPreferencesAsync(string userId, UserPreferencesDto preferencesDto);
}