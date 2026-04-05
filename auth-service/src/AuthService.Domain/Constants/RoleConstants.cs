using System;

namespace AuthService.Domain.Constants;

public class RoleConstants
{
    public const string USER_ROLE = "USER_ROLE";
    public const string ADMIN_ROLE = "ADMIN_ROLE";
    public const string MODERATOR_ROLE = "MODERATOR_ROLE";

    public static readonly string[]AllowedRoles = [USER_ROLE, ADMIN_ROLE, MODERATOR_ROLE];
    
}
