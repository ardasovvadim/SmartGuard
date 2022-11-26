using Microsoft.AspNetCore.Mvc;
using SmartGuard.WebApi.Host.Helpers;

namespace SmartGuard.WebApi.Host.Controllers;

[ApiController, Route("api/[controller]")]
public class StatisticController : ControllerBase
{
    [HttpGet("{sessionId}/{frameId}")]
    public IActionResult Get(string sessionId, string frameId)
    {
        var framePath = DirectoryHelpers.GetFramePath(sessionId, frameId);
        
        if (!System.IO.File.Exists(framePath))
            return BadRequest();
        
        return PhysicalFile(Path.GetFullPath(framePath), "image/jpeg");
    }
}