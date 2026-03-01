using System;
using AuthService.Domain.Entities;
using AuthService.Application.Services;
using AuthService.Domain.Constants;
using MongoDB.Driver;

namespace AuthService.Persistence.Data;

public class DataSeeder
{
    public static async Task SeedAsync(MongoDbContext context)
    {
        var rolesCount = await context.Roles.CountDocumentsAsync(_ => true);
        
        if (rolesCount == 0)
        {
            var roles = new List<Role>
            {
                new()
                {
                    Id = UuidGenerator.GenerateRoleId(),
                    Name = RoleConstants.ADMIN_ROLE,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = UuidGenerator.GenerateRoleId(),
                    Name = RoleConstants.USER_ROLE,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            await context.Roles.InsertManyAsync(roles);
        }

        var usersCount = await context.Users.CountDocumentsAsync(_ => true);
        
        if (usersCount == 0)
        {
            var adminRoleCursor = await context.Roles.FindAsync(r => r.Name == RoleConstants.ADMIN_ROLE);
            var adminRole = await adminRoleCursor.FirstOrDefaultAsync();
            
            if (adminRole != null)
            {
                var passwordHasher = new PasswordHashService();
                var userId = UuidGenerator.GenerateUserId();
                var profileId = UuidGenerator.GenerateUserId();
                var emailId = UuidGenerator.GenerateUserId();
                var userRoleId = UuidGenerator.GenerateUserId();

                var adminUser = new User
                {
                    Id = userId,
                    Name = "Admin Name",
                    Surname = "Admin Surname",
                    Username = "admin",
                    Email = "admin@local.com",
                    Password = passwordHasher.HashPassword("Informatica2026?"),
                    Status = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,

                    UserProfile = new UserProfile
                    {
                        Id = profileId,
                        UserId = userId,
                        ProfilePicture = string.Empty,
                        Phone = "00000000",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },

                    UserEmail = new UserEmail
                    {
                        Id = emailId,
                        UserId = userId,
                        EmailVerified = true,
                        EmailVerificationToken = null,
                        EmailVerificationTokenExpiry = null,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },

                    UserRoles =
                    [
                        new UserRole
                        {
                            Id = userRoleId,
                            UserId = userId,
                            RoleId = adminRole.Id,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        }
                    ]
                };
                
                await context.Users.InsertOneAsync(adminUser);
                
                // También insertar los relacionados en sus colecciones
                await context.UserProfiles.InsertOneAsync(adminUser.UserProfile);
                await context.UserEmails.InsertOneAsync(adminUser.UserEmail);
                
                foreach (var userRole in adminUser.UserRoles)
                {
                    await context.UserRoles.InsertOneAsync(userRole);
                }
            }
        }
    }
}
