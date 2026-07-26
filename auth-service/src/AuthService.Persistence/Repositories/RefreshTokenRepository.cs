using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.Persistence.Data;
using MongoDB.Driver;

namespace AuthService.Persistence.Repositories;

public class RefreshTokenRepository(MongoDbContext context) : IRefreshTokenRepository
{
    private readonly IMongoCollection<RefreshToken> _refreshTokensCollection = context.RefreshTokens;

    public async Task<RefreshToken> CreateAsync(RefreshToken refreshToken)
    {
        await _refreshTokensCollection.InsertOneAsync(refreshToken);
        return refreshToken;
    }

    public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash)
    {
        var cursor = await _refreshTokensCollection.FindAsync(rt => rt.TokenHash == tokenHash);
        return await cursor.FirstOrDefaultAsync();
    }

    public async Task RevokeAsync(string id)
    {
        var update = Builders<RefreshToken>.Update.Set(rt => rt.RevokedAt, DateTime.UtcNow);
        await _refreshTokensCollection.UpdateOneAsync(rt => rt.Id == id, update);
    }

    public async Task RevokeAllForUserAsync(string userId)
    {
        var update = Builders<RefreshToken>.Update.Set(rt => rt.RevokedAt, DateTime.UtcNow);
        await _refreshTokensCollection.UpdateManyAsync(
            rt => rt.UserId == userId && rt.RevokedAt == null,
            update);
    }
}
