using System;
using Microsoft.AspNetCore.Mvc;
 
namespace AuthService.Api.Controllers;

/// <summary>
/// Controlador para verificar la salud del servicio de autenticación.
/// Utilizado por load balancers y servicios de monitoreo.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Verifica si el servicio AuthService está activo y respondiendo.
    /// </summary>
    /// <returns>Estado del servicio (Healthy) con timestamp.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetHealth()
    {
        var response = new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffz"),
            service = "AlertaGT AuthService"
        };
        return Ok(response);
    }
}
 