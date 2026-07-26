using AuthService.Domain.Entities;

namespace AuthService.Domain.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken> CreateAsync(RefreshToken refreshToken);
    Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);
    Task RevokeAsync(string id);
    Task RevokeAllForUserAsync(string userId);
}
