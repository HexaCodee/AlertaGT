using System;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson.Serialization.Attributes;

namespace AuthService.Domain.Entities;

public class UserProfile
{
    [BsonId]
    [BsonElement("_id")]
    [Key]
    [MaxLength(16)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("UserId")]
    [MaxLength(16)]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("ProfilePicture")]
    [MaxLength(255)]
    public string ProfilePicture { get; set; } = string.Empty;

    [BsonElement("Phone")]
    [StringLength(8, MinimumLength = 8, ErrorMessage = "El teléfono debe tener 8 dígitos exactos.")]
    [RegularExpression(@"^\d{8}$", ErrorMessage = "El teléfono debe contener solo números.")]
    public string Phone { get; set; } = string.Empty;

    [BsonElement("City")]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [BsonElement("Address")]
    [MaxLength(255)]
    public string Address { get; set; } = string.Empty;

    [BsonElement("Country")]
    [MaxLength(50)]
    public string Country { get; set; } = "Guatemala";

    [BsonElement("CreatedAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("UpdatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonIgnore]
    public User User { get; set; } = null!;
}