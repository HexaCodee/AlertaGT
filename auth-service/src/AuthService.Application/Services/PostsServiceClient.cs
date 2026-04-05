using System.Net;
using System.Net.Http;
using System.Text.Json;
using AuthService.Application.Exceptions;
using AuthService.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AuthService.Application.Services;

public class PostsServiceClient(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<PostsServiceClient> logger) : IPostsServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<PostsServiceClient> _logger;
    private readonly int _maxRetries = 3;
    private readonly int _retryDelayMs = 1000;
    private readonly int _failureThreshold = 3;
    private readonly TimeSpan _circuitResetDelay = TimeSpan.FromSeconds(20);
    private int _failureCount;
    private DateTime _circuitOpenedAt = DateTime.MinValue;

    public PostsServiceClient(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<PostsServiceClient> logger)
    {
        _httpClient = httpClientFactory.CreateClient("PostsServiceClient");
        _httpClient.BaseAddress ??= new Uri(configuration["PostsServiceUrl"] ?? "http://localhost:3020/api/v1");
        _logger = logger;
    }

    public async Task<int> GetUserAlertsCountAsync(string userId)
    {
        return await ExecuteWithRetryAsync(async () =>
        {
            var response = await _httpClient.GetAsync($"/posts/user/{Uri.EscapeDataString(userId)}/count");
            return await ParseCountResponseAsync(response);
        }, "GetUserAlertsCountAsync");
    }

    public async Task<int> GetUserCommentsCountAsync(string userId)
    {
        return await ExecuteWithRetryAsync(async () =>
        {
            var response = await _httpClient.GetAsync($"/comments/user/{Uri.EscapeDataString(userId)}/count");
            return await ParseCountResponseAsync(response);
        }, "GetUserCommentsCountAsync");
    }

    public async Task<int> GetUserCommunityHelpedAsync(string userId)
    {
        return await ExecuteWithRetryAsync(async () =>
        {
            var response = await _httpClient.GetAsync($"/posts/user/{Uri.EscapeDataString(userId)}/views");
            return await ParseCountResponseAsync(response);
        }, "GetUserCommunityHelpedAsync");
    }

    private async Task<int> ExecuteWithRetryAsync(Func<Task<int>> operation, string operationName)
    {
        if (IsCircuitOpen())
        {
            _logger.LogWarning("Circuit breaker abierto para PostsServiceClient en {Operation}. Fallback a datos por defecto.", operationName);
            return 0;
        }

        int attempt = 0;
        while (attempt < _maxRetries)
        {
            try
            {
                var result = await operation();
                ResetCircuit();
                return result;
            }
            catch (HttpRequestException ex)
            {
                attempt++;
                _logger.LogWarning(ex, "Intento {Attempt}/{MaxRetries} falló en {Operation}. Reintentando...", attempt, _maxRetries, operationName);
                if (attempt >= _maxRetries)
                {
                    RecordFailure(ex);
                    return 0;
                }

                await Task.Delay(_retryDelayMs * attempt);
            }
            catch (TaskCanceledException ex)
            {
                attempt++;
                _logger.LogWarning(ex, "Timeout en intento {Attempt}/{MaxRetries} para {Operation}.", attempt, _maxRetries, operationName);
                if (attempt >= _maxRetries)
                {
                    RecordFailure(ex);
                    return 0;
                }

                await Task.Delay(_retryDelayMs * attempt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado en {Operation}.", operationName);
                return 0;
            }
        }

        return 0;
    }

    private async Task<int> ParseCountResponseAsync(HttpResponseMessage response)
    {
        if (!response.IsSuccessStatusCode)
        {
            throw new ExternalServiceException("PostsServiceError", $"Posts service returned {(int)response.StatusCode} {response.ReasonPhrase}");
        }

        var content = await response.Content.ReadAsStringAsync();
        if (string.IsNullOrWhiteSpace(content))
        {
            return 0;
        }

        try
        {
            using var document = JsonDocument.Parse(content);
            if (document.RootElement.TryGetProperty("count", out var countProperty) && countProperty.TryGetInt32(out var count))
            {
                return count;
            }

            if (document.RootElement.TryGetProperty("data", out var dataProperty) &&
                dataProperty.TryGetProperty("count", out var countInner) && countInner.TryGetInt32(out var countValue))
            {
                return countValue;
            }
        }
        catch (JsonException ex)
        {
            throw new ExternalServiceException("PostsServiceMalformedResponse", $"Invalid JSON from PostsService: {ex.Message}");
        }

        return 0;
    }

    private bool IsCircuitOpen()
    {
        return _circuitOpenedAt > DateTime.UtcNow && _failureCount >= _failureThreshold;
    }

    private void ResetCircuit()
    {
        _failureCount = 0;
        _circuitOpenedAt = DateTime.MinValue;
    }

    private void RecordFailure(Exception exception)
    {
        _failureCount++;
        if (_failureCount >= _failureThreshold)
        {
            _circuitOpenedAt = DateTime.UtcNow.Add(_circuitResetDelay);
            _logger.LogWarning(exception, "Circuit breaker activado para PostsServiceClient durante {Cooldown}ms.", _circuitResetDelay.TotalMilliseconds);
        }
    }
}
