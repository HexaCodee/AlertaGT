using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace AuthService.Application.Services;

public class UserService(
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    IPostsServiceClient postsServiceClient) : IUserService
{
    public async Task<UserDetailsDto> GetUserProfileAsync(string userId)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Usuario no encontrado");

        var roleNames = await roleRepository.GetUserRoleNamesAsync(userId);
        var primaryRole = roleNames?.FirstOrDefault() ?? "USER_ROLE";

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
            Role = primaryRole,
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
        // Obtener estadísticas del posts-service con retry logic
        var totalAlerts = await postsServiceClient.GetUserAlertsCountAsync(userId);
        var totalComments = await postsServiceClient.GetUserCommentsCountAsync(userId);
        var communityHelped = await postsServiceClient.GetUserCommunityHelpedAsync(userId);

        // ModerationActions solo para ADMIN/MODERATOR
        var roleNames = await roleRepository.GetUserRoleNamesAsync(userId);
        var isModerator = roleNames?.Contains("ADMIN_ROLE") == true || roleNames?.Contains("MODERATOR_ROLE") == true;
        var moderationActions = isModerator ? await postsServiceClient.GetUserAlertsCountAsync(userId) : 0; // Placeholder

        return new UserStatsDto
        {
            TotalAlerts = totalAlerts,
            TotalComments = totalComments,
            CommunityHelped = communityHelped,
            ModerationActions = moderationActions
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