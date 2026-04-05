using AuthService.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AuthService.Application.Services;

public class PostsServiceClient(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<PostsServiceClient> logger) : IPostsServiceClient
{
    private readonly string _baseUrl = configuration["PostsServiceUrl"] ?? "http://localhost:3020/api/v1";
    private readonly int _maxRetries = 3;
    private readonly int _retryDelayMs = 1000;

    public async Task<int> GetUserAlertsCountAsync(string userId)
    {
        return await ExecuteWithRetryAsync(async () =>
        {
            using var client = httpClientFactory.CreateClient();
            var response = await client.GetAsync($"{_baseUrl}/posts/user/{userId}/count");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            
            // Parse JSON: { "count": 5 }
            if (int.TryParse(content, out var count))
                return count;

            return 0;
        }, "GetUserAlertsCountAsync");
    }

    public async Task<int> GetUserCommentsCountAsync(string userId)
    {
        return await ExecuteWithRetryAsync(async () =>
        {
            using var client = httpClientFactory.CreateClient();
            var response = await client.GetAsync($"{_baseUrl}/comments/user/{userId}/count");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            
            if (int.TryParse(content, out var count))
                return count;

            return 0;
        }, "GetUserCommentsCountAsync");
    }

    public async Task<int> GetUserCommunityHelpedAsync(string userId)
    {
        return await ExecuteWithRetryAsync(async () =>
        {
            using var client = httpClientFactory.CreateClient();
            // Calcular cuántas personas vieron sus alertas basado en visualizaciones
            var response = await client.GetAsync($"{_baseUrl}/posts/user/{userId}/views");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            
            if (int.TryParse(content, out var count))
                return count;

            return 0;
        }, "GetUserCommunityHelpedAsync");
    }

    private async Task<int> ExecuteWithRetryAsync(Func<Task<int>> operation, string operationName)
    {
        int attempt = 0;
        while (attempt < _maxRetries)
        {
            try
            {
                return await operation();
            }
            catch (HttpRequestException ex) when (attempt < _maxRetries - 1)
            {
                attempt++;
                logger.LogWarning($"Intento {attempt}/{_maxRetries} falló para {operationName}: {ex.Message}. Reintentando en {_retryDelayMs}ms...");
                await Task.Delay(_retryDelayMs * attempt); // Exponential backoff
            }
            catch (Exception ex)
            {
                logger.LogError($"Error en {operationName}: {ex.Message}");
                return 0; // Graceful degradation
            }
        }

        return 0; // Fallback
    }
}
