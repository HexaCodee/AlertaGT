using Microsoft.AspNetCore.Http;

namespace AuthService.Application.Exceptions;

public class BusinessException : ApiException
{
    public BusinessException(string errorCode, string message)
        : base(StatusCodes.Status400BadRequest, errorCode, message)
    {
    }

    public BusinessException(string errorCode, string message, Exception innerException)
        : base(StatusCodes.Status400BadRequest, errorCode, message, innerException)
    {
    }
}
