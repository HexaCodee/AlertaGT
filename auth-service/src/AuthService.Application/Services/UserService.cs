using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace AuthService.Application.Services;

public class UserService(
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    ILogger<UserService> logger) : IUserService
{
    public async Task<UserDetailsDto> GetUserProfileAsync(string userId)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Usuario no encontrado");

        var role = await roleRepository.GetByUserIdAsync(userId);

        return new UserDetailsDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Name = user.Name,
            Surname = user.Surname,
            ProfilePicture = user.UserProfile?.ProfilePicture ?? string.Empty,
            Phone = user.UserProfile?.Phone ?? string.Empty,
            City = user.UserProfile?.City ?? string.Empty,
            Address = user.UserProfile?.Address ?? string.Empty,
            Country = user.UserProfile?.Country ?? "Guatemala",
            Role = role?.Name ?? "USER_ROLE",
            Preferences = user.UserPreferences != null ? new UserPreferencesDto
            {
                NotifyNewAlerts = user.UserPreferences.NotifyNewAlerts,
                NotifyComments = user.UserPreferences.NotifyComments,
                NotifyModeration = user.UserPreferences.NotifyModeration,
                NotifyNearbyAlerts = user.UserPreferences.NotifyNearbyAlerts,
                PreferredSearchRadius = user.UserPreferences.PreferredSearchRadius,
                ShareLocation = user.UserPreferences.ShareLocation
            } : new UserPreferencesDto()
        };
    }

    public async Task<UserDetailsDto> UpdateUserProfileAsync(string userId, UpdateProfileDto updateDto)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Usuario no encontrado");

        if (user.UserProfile == null)
        {
            user.UserProfile = new UserProfile
            {
                Id = Guid.NewGuid().ToString("N").Substring(0, 16),
                UserId = userId
            };
        }

        user.UserProfile.Phone = updateDto.Phone;
        user.UserProfile.City = updateDto.City;
        user.UserProfile.Address = updateDto.Address;
        user.UserProfile.Country = updateDto.Country;
        user.UserProfile.UpdatedAt = DateTime.UtcNow;

        await userRepository.UpdateAsync(user);

        return await GetUserProfileAsync(userId);
    }

    public async Task<UserStatsDto> GetUserStatsAsync(string userId)
    {
        // Nota: Estos cálculos requerirían llamadas a otros servicios (posts, comments)
        // Por ahora retornamos valores por defecto - se implementarían con llamadas HTTP
        return new UserStatsDto
        {
            TotalAlerts = 0, // Se obtendría del posts-service
            TotalComments = 0, // Se obtendría del posts-service
            CommunityHelped = 0, // Se calcularía basado en vistas de alertas
            ModerationActions = 0 // Para moderadores/admin
        };
    }

    public async Task<UserPreferencesDto> UpdateUserPreferencesAsync(string userId, UserPreferencesDto preferencesDto)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Usuario no encontrado");

        if (user.UserPreferences == null)
        {
            user.UserPreferences = new UserPreferences
            {
                Id = Guid.NewGuid().ToString("N").Substring(0, 16),
                UserId = userId
            };
        }

        user.UserPreferences.NotifyNewAlerts = preferencesDto.NotifyNewAlerts;
        user.UserPreferences.NotifyComments = preferencesDto.NotifyComments;
        user.UserPreferences.NotifyModeration = preferencesDto.NotifyModeration;
        user.UserPreferences.NotifyNearbyAlerts = preferencesDto.NotifyNearbyAlerts;
        user.UserPreferences.PreferredSearchRadius = preferencesDto.PreferredSearchRadius;
        user.UserPreferences.ShareLocation = preferencesDto.ShareLocation;
        user.UserPreferences.UpdatedAt = DateTime.UtcNow;

        await userRepository.UpdateAsync(user);

        return preferencesDto;
    }
}