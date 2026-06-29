using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace AuthService.Api.Extensions;

/// <summary>
/// Extensiones para configurar la autenticación JWT en la aplicación.
/// </summary>
public static class AuthenticationExtensions
{
    /// <summary>
    /// Configura la autenticación JWT con los parámetros especificados en la configuración.
    /// </summary>
    /// <param name="services">La colección de servicios.</param>
    /// <param name="configuration">La configuración de la aplicación.</param>
    /// <returns>La colección de servicios configurada.</returns>
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            var secretKey = configuration["JwtSettings:SecretKey"] ?? jwtSettings["SecretKey"];
            Console.WriteLine(">>> CLAVE CARGADA EN AUTH: " + secretKey);
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ClockSkew = TimeSpan.Zero
            };
            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    Console.WriteLine($">>> JWT Authentication Failed: {context.Exception.Message}");
                    if (context.Exception.InnerException != null)
                    {
                        Console.WriteLine($">>> Inner Exception: {context.Exception.InnerException.Message}");
                    }
                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    Console.WriteLine(">>> JWT Token Validated Successfully");
                    return Task.CompletedTask;
                },
                OnMessageReceived = context =>
                {
                    var authHeader = context.Request.Headers["Authorization"].ToString();
                    Console.WriteLine($">>> JWT Message Received. Auth Header: {authHeader}");
                    return Task.CompletedTask;
                }
            };
        });

        return services;
    }
}

