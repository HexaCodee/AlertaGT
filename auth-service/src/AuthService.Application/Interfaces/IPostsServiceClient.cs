namespace AuthService.Application.Interfaces;

public interface IPostsServiceClient
{
    Task<int> GetUserAlertsCountAsync(string userId);
    Task<int> GetUserCommentsCountAsync(string userId);
    Task<int> GetUserCommunityHelpedAsync(string userId);
}
