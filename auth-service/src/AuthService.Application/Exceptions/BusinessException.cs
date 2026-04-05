using Microsoft.AspNetCore.Http;

namespace AuthService.Application.Exceptions;

public class BusinessException : ApiException
{
    public BusinessException(string errorCode, string message)
        : base(StatusCodes.StatusBadRequest, errorCode, message)
    {
    }

    public BusinessException(string errorCode, string message, Exception innerException)
        : base(StatusCodes.StatusBadRequest, errorCode, message, innerException)
    {
    }
}
