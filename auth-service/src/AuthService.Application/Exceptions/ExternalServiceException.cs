using Microsoft.AspNetCore.Http;

namespace AuthService.Application.Exceptions;

public class ExternalServiceException : ApiException
{
    public ExternalServiceException(string errorCode, string message)
        : base(StatusCodes.Status502BadGateway, errorCode, message)
    {
    }
}
