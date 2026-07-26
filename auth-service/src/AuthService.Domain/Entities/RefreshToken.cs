using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

public class RefreshToken
{
    [Key]
    [MaxLength(16)]
    public string Id { get; set; } = string.Empty;

    [MaxLength(16)]
    public string UserId { get; set; } = string.Empty;

    // Nunca se guarda el token en texto plano: solo el hash SHA-256, para que
    // filtrar la base de datos no permita reusar sesiones directamente.
    [MaxLength(64)]
    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
