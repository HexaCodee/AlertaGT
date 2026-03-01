using MongoDB.Driver;
using AuthService.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace AuthService.Persistence.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    private readonly IMongoClient _mongoClient;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var databaseName = configuration.GetConnectionString("MongoDbDatabase");

        _mongoClient = new MongoClient(connectionString);
        _database = _mongoClient.GetDatabase(databaseName);

        // Crear índices únicos y de rendimiento
        CreateIndexes();
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<Role> Roles => _database.GetCollection<Role>("roles");
    public IMongoCollection<UserRole> UserRoles => _database.GetCollection<UserRole>("user_roles");
    public IMongoCollection<UserProfile> UserProfiles => _database.GetCollection<UserProfile>("user_profiles");
    public IMongoCollection<UserEmail> UserEmails => _database.GetCollection<UserEmail>("user_emails");
    public IMongoCollection<UserPasswordReset> UserPasswordResets => _database.GetCollection<UserPasswordReset>("user_password_resets");

    private void CreateIndexes()
    {
        try
        {
            // Índices para Users
            var usersIndexModel = new[]
            {
                new CreateIndexModel<User>(
                    Builders<User>.IndexKeys.Ascending(u => u.Username),
                    new CreateIndexOptions { Unique = true, Sparse = true }),
                new CreateIndexModel<User>(
                    Builders<User>.IndexKeys.Ascending(u => u.Email),
                    new CreateIndexOptions { Unique = true, Sparse = true })
            };
            Users.Indexes.CreateMany(usersIndexModel);

            // Índices para Roles
            var rolesIndexModel = new[]
            {
                new CreateIndexModel<Role>(
                    Builders<Role>.IndexKeys.Ascending(r => r.Name),
                    new CreateIndexOptions { Unique = true, Sparse = true })
            };
            Roles.Indexes.CreateMany(rolesIndexModel);

            // Índices para UserEmails
            var userEmailsIndexModel = new[]
            {
                new CreateIndexModel<UserEmail>(
                    Builders<UserEmail>.IndexKeys.Ascending(ue => ue.UserId),
                    new CreateIndexOptions { Unique = true, Sparse = true })
            };
            UserEmails.Indexes.CreateMany(userEmailsIndexModel);

            // Índices para UserPasswordResets
            var userPasswordResetsIndexModel = new[]
            {
                new CreateIndexModel<UserPasswordReset>(
                    Builders<UserPasswordReset>.IndexKeys.Ascending(upr => upr.UserId),
                    new CreateIndexOptions { Unique = true, Sparse = true })
            };
            UserPasswordResets.Indexes.CreateMany(userPasswordResetsIndexModel);
        }
        catch (Exception ex)
        {
            // Los índices pueden ya existir, ignorar errores
            Console.WriteLine($"Index creation warning: {ex.Message}");
        }
    }
}
