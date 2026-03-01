using AuthService.Application.Services;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.Persistence.Data;
using MongoDB.Driver;
using Microsoft.Extensions.Logging;

namespace AuthService.Persistence.Repositories;

public class UserRepository(MongoDbContext context, ILogger<UserRepository> logger) : IUserRepository
{
    private readonly IMongoCollection<User> _usersCollection = context.Users;
    private readonly IMongoCollection<UserRole> _userRolesCollection = context.UserRoles;
    private readonly IMongoCollection<Role> _rolesCollection = context.Roles;

    public async Task<User> GetByIdAsync(string id)
    {
        var user = await _usersCollection.FindAsync(u => u.Id == id);
        var userDoc = await user.FirstOrDefaultAsync();
        
        if (userDoc == null)
            throw new InvalidOperationException($"User with id {id} not found.");

        // Obtener datos relacionados
        await LoadRelatedData(userDoc);
        return userDoc;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var user = await _usersCollection.FindAsync(u => u.Email.ToLower() == email.ToLower());
        var userDoc = await user.FirstOrDefaultAsync();
        
        if (userDoc != null)
        {
            await LoadRelatedData(userDoc);
        }
        
        return userDoc;
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        var user = await _usersCollection.FindAsync(u => u.Username.ToLower() == username.ToLower());
        var userDoc = await user.FirstOrDefaultAsync();
        
        if (userDoc != null)
        {
            await LoadRelatedData(userDoc);
        }
        
        return userDoc;
    }

    public async Task<User?> GetByEmailVerificationTokenAsync(string token)
    {
        // Log del token buscado
        logger.LogInformation("Buscando token de verificación: {Token} (longitud: {Length})", token, token?.Length ?? 0);
        
        // Intentar múltiples variaciones del token para robustez
        var tokensToTry = new[]
        {
            token,
            token?.Trim(),
            token?.Replace(" ", ""),
            token?.Replace("\r", "").Replace("\n", ""),
            token?.Replace(" ", "").Replace("\r", "").Replace("\n", "")
        }.Distinct().Where(t => !string.IsNullOrEmpty(t)).ToList();
        
        logger.LogInformation("Intentando {Count} variaciones del token", tokensToTry.Count);
        
        foreach (var tokenVariation in tokensToTry)
        {
            logger.LogInformation("Intentando variación del token: {TokenVariation}", tokenVariation);
            
            // Primero intentar encontrar en el documento embebido dentro de la colección `users`
            var userCursor = await _usersCollection.FindAsync(u => u.UserEmail != null && u.UserEmail.EmailVerificationToken == tokenVariation);
            var userDoc = await userCursor.FirstOrDefaultAsync();
            
            if (userDoc != null)
            {
                logger.LogInformation("Usuario encontrado en colección 'users' con variación de token. Token en BD: {DbToken} (longitud: {DbLength})", 
                    userDoc.UserEmail?.EmailVerificationToken, userDoc.UserEmail?.EmailVerificationToken?.Length ?? 0);
                
                // Validar manualmente la expiración para evitar problemas de zonas horarias
                var expiry = userDoc.UserEmail?.EmailVerificationTokenExpiry;
                if (expiry == null)
                {
                    await LoadRelatedData(userDoc);
                    return userDoc;
                }

                var expiryUtc = DateTime.SpecifyKind(expiry.Value, DateTimeKind.Utc).ToUniversalTime();
                if (expiryUtc > DateTime.UtcNow)

                {
                    await LoadRelatedData(userDoc);
                    return userDoc;
                }

                // Token expirado - continuar intentando otras variaciones
                logger.LogInformation("Token expirado para variación: {TokenVariation}", tokenVariation);
                continue;
            }
        }

        // Si no se encontró en users, buscar en la colección `user_emails` (datos separados)
        foreach (var tokenVariation in tokensToTry)
        {
            var emailCursor = await context.UserEmails.FindAsync(ue => ue.EmailVerificationToken == tokenVariation);
            var emailDoc = await emailCursor.FirstOrDefaultAsync();
            if (emailDoc == null) continue;

            // Verificar expiración manualmente
            if (emailDoc.EmailVerificationTokenExpiry != null)
            {
                var emailExpiryUtc = DateTime.SpecifyKind(emailDoc.EmailVerificationTokenExpiry.Value, DateTimeKind.Utc).ToUniversalTime();
                if (emailExpiryUtc <= DateTime.UtcNow) continue; // expirado
            }

            // Obtener el usuario por UserId y cargar datos relacionados
            var userByIdCursor = await _usersCollection.FindAsync(u => u.Id == emailDoc.UserId);
            var userById = await userByIdCursor.FirstOrDefaultAsync();
            if (userById != null)
            {
                await LoadRelatedData(userById);
                return userById;
            }
        }

        return null;
    }

    public async Task<User?> GetByPasswordResetTokenAsync(string token)
    {
        var user = await _usersCollection.FindAsync(u => 
            u.UserPasswordReset != null &&
            u.UserPasswordReset.PasswordResetToken == token &&
            u.UserPasswordReset.PasswordResetTokenExpiry > DateTime.UtcNow);
        
        var userDoc = await user.FirstOrDefaultAsync();
        
        if (userDoc != null)
        {
            await LoadRelatedData(userDoc);
        }
        
        return userDoc;
    }

    public async Task<User> CreateAsync(User user)
    {
        await _usersCollection.InsertOneAsync(user);
        return await GetByIdAsync(user.Id);
    }

    public async Task<User> UpdateAsync(User user)
    {
        var result = await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);
        
        if (result.ModifiedCount == 0)
            throw new InvalidOperationException($"User with id {user.Id} not found for update.");

        return await GetByIdAsync(user.Id);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        // Verificar que el usuario existe
        await GetByIdAsync(id);

        // Eliminar el usuario
        var result = await _usersCollection.DeleteOneAsync(u => u.Id == id);
        
        return result.DeletedCount > 0;
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        var count = await _usersCollection.CountDocumentsAsync(u => u.Email.ToLower() == email.ToLower());
        return count > 0;
    }

    public async Task<bool> ExistsByUsernameAsync(string username)
    {
        var count = await _usersCollection.CountDocumentsAsync(u => u.Username.ToLower() == username.ToLower());
        return count > 0;
    }

    public async Task UpdateUserRoleAsync(string userId, string roleId)
    {
        // Obtener el usuario
        var user = await GetByIdAsync(userId);
        
        // Eliminar roles existentes
        await _userRolesCollection.DeleteManyAsync(ur => ur.UserId == userId);

        // Crear nuevo UserRole
        var newUserRole = new UserRole
        {
            Id = UuidGenerator.GenerateUserId(),
            UserId = userId,
            RoleId = roleId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Insertar nuevo rol
        await _userRolesCollection.InsertOneAsync(newUserRole);

        // Actualizar la relación en el documento User
        user.UserRoles = await GetUserRolesAsync(userId);
        await _usersCollection.ReplaceOneAsync(u => u.Id == userId, user);
    }

    private async Task LoadRelatedData(User user)
    {
        // Cargar UserRoles con información del Role
        user.UserRoles = await GetUserRolesAsync(user.Id);

        // Cargar UserProfile
        if (!string.IsNullOrEmpty(user.Id))
        {
            var profileCursor = await context.UserProfiles.FindAsync(up => up.UserId == user.Id);
            user.UserProfile = await profileCursor.FirstOrDefaultAsync();
        }

        // Cargar UserEmail
        if (!string.IsNullOrEmpty(user.Id))
        {
            // Si ya viene embedido en el documento (por ejemplo después del registro),
            // no sobrescribimos para evitar perder datos (token, expiry) que aún no estén reflejados en la colección separada `user_emails`.
            if (user.UserEmail == null)
            {
                var emailCursor = await context.UserEmails.FindAsync(ue => ue.UserId == user.Id);
                user.UserEmail = await emailCursor.FirstOrDefaultAsync();
            }
        }

        // Cargar UserPasswordReset
        if (!string.IsNullOrEmpty(user.Id))
        {
            var passwordResetCursor = await context.UserPasswordResets.FindAsync(upr => upr.UserId == user.Id);
            user.UserPasswordReset = await passwordResetCursor.FirstOrDefaultAsync();
        }
    }

    private async Task<ICollection<UserRole>> GetUserRolesAsync(string userId)
    {
        var userRolesCursor = await _userRolesCollection.FindAsync(ur => ur.UserId == userId);
        var userRoles = await userRolesCursor.ToListAsync();

        // Cargar información del Role para cada UserRole
        foreach (var userRole in userRoles)
        {
            var roleCursor = await _rolesCollection.FindAsync(r => r.Id == userRole.RoleId);
            userRole.Role = await roleCursor.FirstOrDefaultAsync();
        }

        return userRoles;
    }
}
