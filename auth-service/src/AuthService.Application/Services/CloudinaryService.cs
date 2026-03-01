using System;
using System.IO;
using System.Linq;
using AuthService.Application.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
namespace AuthService.Application.Services;

public class CloudinaryService(IConfiguration configuration) : ICloudinaryService
{
    private readonly Cloudinary _cloudinary = new(new Account(
        configuration["CloudinarySettings:CloudName"],
        configuration["CloudinarySettings:ApiKey"],
        configuration["CloudinarySettings:ApiSecret"]
    ));

    public async Task<string> UploadImageAsync(IFileData imageFile, string fileName)
    {
        try
        {
            using var stream = new MemoryStream(imageFile.Data);

            var folder = configuration["CloudinarySettings:Folder"] ?? "auth_service/profiles";
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(imageFile.FileName, stream),
                PublicId = $"{folder}/{fileName}",
                Folder = folder,
                Transformation = new Transformation()
                    .Width(400)
                    .Height(400)
                    .Crop("fill")
                    .Gravity("face")
                    .Quality("auto")
                    .FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new InvalidOperationException($"Error uploading image: {uploadResult.Error.Message}");
            }

            // Retornar sólo el nombre variable (filename) para almacenar en la DB
            return fileName;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to upload image to Cloudinary: {ex.Message}", ex);
        }
    }

    public async Task<bool> DeleteImageAsync(string publicId)
    {
        try
        {
            var deleteParams = new DelResParams
            {
                PublicIds = [publicId]
            };

            var result = await _cloudinary.DeleteResourcesAsync(deleteParams);
            return result.Deleted?.ContainsKey(publicId) == true;
        }
        catch
        {
            return false;
        }
    }

    public string GetDefaultAvatarUrl()
    {

        var defaultPath = configuration["CloudinarySettings:DefaultAvatarPath"] ?? "default-avatar_ewzxwx.png";
        // Si la ruta es una URL absoluta, devolverla tal cual
        if (Uri.IsWellFormedUriString(defaultPath, UriKind.Absolute)) return defaultPath;

        // Si la ruta es relativa y contiene carpetas, devolver sólo el nombre de archivo
        if (defaultPath.Contains('/')) return defaultPath.Split('/').Last();

        return defaultPath;
    }

    public string GetFullImageUrl(string imagePath)
    {
        var baseUrl = configuration["CloudinarySettings:BaseUrl"] ?? "https://res.cloudinary.com/dug3apxt3/image/upload/";
        var folder = configuration["CloudinarySettings:Folder"] ?? "auth_service/profiles";
        var defaultPath = configuration["CloudinarySettings:DefaultAvatarPath"] ?? "default-avatar_ewzxwx.png";

        // Si el imagePath ya es una URL absoluta o ya contiene la parte /image/upload/, devolverla tal cual
        if (!string.IsNullOrWhiteSpace(imagePath))
        {
            if (Uri.IsWellFormedUriString(imagePath, UriKind.Absolute)) return imagePath;
            if (imagePath.Contains("/image/upload/")) return imagePath;
        }

        var pathToUse = string.IsNullOrWhiteSpace(imagePath) ? defaultPath : imagePath;

        // Si el defaultPath es una URL absoluta, devolverla directamente
        if (Uri.IsWellFormedUriString(pathToUse, UriKind.Absolute)) return pathToUse;

        // Asegurar que use folder/file cuando corresponda
        if (!pathToUse.Contains('/')) pathToUse = $"{folder}/{pathToUse}";

        if (!baseUrl.EndsWith('/')) baseUrl += '/';

        return $"{baseUrl}{pathToUse}";
    }

    private static string SanitizeFileName(string fileName)
    {
        return fileName
            .Trim()
            .Replace(" ", "_")
            .Replace("-", "_")
            .ToLowerInvariant();
    }
}

