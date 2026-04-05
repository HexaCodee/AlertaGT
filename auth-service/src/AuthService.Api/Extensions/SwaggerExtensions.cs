using Microsoft.OpenApi.Models;

namespace AuthService.Api.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            // Información de la API
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "AlertaGT - Authentication Service API",
                Version = "v1.0.0",
                Description = "API de autenticación y gestión de usuarios para AlertaGT. Sistema de alertas geolocalizadas de Guatemala.",
                TermsOfService = new Uri("https://alertagt.example.com/terms"),
                Contact = new OpenApiContact
                {
                    Name = "AlertaGT Support",
                    Email = "support@alertagt.example.com",
                    Url = new Uri("https://alertagt.example.com")
                },
                License = new OpenApiLicense
                {
                    Name = "Apache 2.0",
                    Url = new Uri("https://www.apache.org/licenses/LICENSE-2.0.html")
                }
            });

            // Configuración de JWT Security Scheme
            var jwtSecurityScheme = new OpenApiSecurityScheme
            {
                Name = "JWT Authentication",
                Description = "Enter a valid JWT token",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Reference = new OpenApiReference
                {
                    Id = JwtBearerDefaults.AuthenticationScheme,
                    Type = ReferenceType.SecurityScheme
                }
            };

            options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, jwtSecurityScheme);

            var securityRequirement = new OpenApiSecurityRequirement
            {
                { jwtSecurityScheme, Array.Empty<string>() }
            };

            options.AddSecurityRequirement(securityRequirement);

            // Incluir comentarios XML si existen
            var xmlFilename = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath);
            }

            // Esquema personalizado
            options.UseOneOfForPolymorphism();
            options.SelectDiscriminatorNameUsing((baseType) => "discriminator");
            options.SelectEnumMemberName();

            // Tags de operaciones
            options.TagActionsBy(api =>
            {
                if (api.GroupName != null)
                {
                    return new[] { api.GroupName };
                }

                var controllerActionDescriptor = api.ActionDescriptor as Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor;
                var controllerName = controllerActionDescriptor?.ControllerName ?? string.Empty;
                return controllerName.EndsWith("Controller", StringComparison.OrdinalIgnoreCase)
                    ? new[] { controllerName[..^10] }
                    : new[] { controllerName };
            });
        });

        return services;
    }
}
