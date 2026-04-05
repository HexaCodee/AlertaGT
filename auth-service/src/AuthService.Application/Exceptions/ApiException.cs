using Microsoft.AspNetCore.Http;

namespace AuthService.Application.Exceptions;

public abstract class ApiException : Exception
{
    public int StatusCode { get; }
    public string ErrorCode { get; }

    protected ApiException(int statusCode, string errorCode, string message)
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }

    protected ApiException(int statusCode, string errorCode, string message, Exception innerException)
        : base(message, innerException)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }
}
