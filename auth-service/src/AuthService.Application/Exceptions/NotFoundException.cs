using Microsoft.AspNetCore.Http;

namespace AuthService.Application.Exceptions;

public class NotFoundException : ApiException
{
    public NotFoundException(string errorCode, string message)
        : base(StatusCodes.StatusNotFound, errorCode, message)
    {
    }
}
