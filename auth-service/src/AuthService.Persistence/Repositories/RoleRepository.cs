using System;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.Persistence.Data;
using MongoDB.Driver;

namespace AuthService.Persistence.Repositories;

public class RoleRepository(MongoDbContext context) : IRoleRepository
{
    private readonly IMongoCollection<Role> _rolesCollection = context.Roles;
    private readonly IMongoCollection<UserRole> _userRolesCollection = context.UserRoles;
    private readonly IMongoCollection<User> _usersCollection = context.Users;

    public async Task<int> CountUsersInRoleAsync(string roleName)
    {
        // Obtener el rol por nombre
        var roleCursor = await _rolesCollection.FindAsync(r => r.Name == roleName);
        var role = await roleCursor.FirstOrDefaultAsync();

        if (role == null)
            return 0;

        // Contar UserRoles con ese roleId
        var count = await _userRolesCollection.CountDocumentsAsync(ur => ur.RoleId == role.Id);
        return (int)count;
    }

    public async Task<Role?> GetByNameAsync(string roleName)
    {
        var roleCursor = await _rolesCollection.FindAsync(r => r.Name == roleName);
        return await roleCursor.FirstOrDefaultAsync();
    }

    public async Task<IReadOnlyList<string>> GetUserRoleNamesAsync(string userId)
    {
        var userRolesCursor = await _userRolesCollection.FindAsync(ur => ur.UserId == userId);
        var userRoles = await userRolesCursor.ToListAsync();

        var roleNames = new List<string>();

        foreach (var userRole in userRoles)
        {
            var roleCursor = await _rolesCollection.FindAsync(r => r.Id == userRole.RoleId);
            var role = await roleCursor.FirstOrDefaultAsync();
            
            if (role != null)
            {
                roleNames.Add(role.Name);
            }
        }

        return roleNames.AsReadOnly();
    }

    public async Task<IReadOnlyList<User>> GetUsersByRoleAsync(string roleName)
    {
        // Obtener el rol
        var roleCursor = await _rolesCollection.FindAsync(r => r.Name == roleName);
        var role = await roleCursor.FirstOrDefaultAsync();

        if (role == null)
            return new List<User>().AsReadOnly();

        // Obtener todos los UserRoles para este rol
        var userRolesCursor = await _userRolesCollection.FindAsync(ur => ur.RoleId == role.Id);
        var userRoles = await userRolesCursor.ToListAsync();

        var users = new List<User>();

        // Obtener cada usuario
        foreach (var userRole in userRoles)
        {
            var userCursor = await _usersCollection.FindAsync(u => u.Id == userRole.UserId);
            var user = await userCursor.FirstOrDefaultAsync();
            
            if (user != null)
            {
                // Cargar datos relacionados del usuario
                await LoadUserRelatedData(user);
                users.Add(user);
            }
        }

        return users.AsReadOnly();
    }

    private async Task LoadUserRelatedData(User user)
    {
        // Cargar UserProfile
        var profileCursor = await context.UserProfiles.FindAsync(up => up.UserId == user.Id);
        user.UserProfile = await profileCursor.FirstOrDefaultAsync();

        // Cargar UserEmail
        var emailCursor = await context.UserEmails.FindAsync(ue => ue.UserId == user.Id);
        user.UserEmail = await emailCursor.FirstOrDefaultAsync();

        // Cargar UserRoles con información del Role
        var userRolesCursor = await _userRolesCollection.FindAsync(ur => ur.UserId == user.Id);
        var userRoles = await userRolesCursor.ToListAsync();

        foreach (var userRole in userRoles)
        {
            var roleCursor = await _rolesCollection.FindAsync(r => r.Id == userRole.RoleId);
            userRole.Role = await roleCursor.FirstOrDefaultAsync();
        }

        user.UserRoles = userRoles;
    }
}
