using Microsoft.AspNetCore.Http;

namespace AuthService.Application.Exceptions;

public class CircuitBreakerOpenException : ApiException
{
    public CircuitBreakerOpenException(string errorCode, string message)
        : base(StatusCodes.StatusServiceUnavailable, errorCode, message)
    {
    }
}
