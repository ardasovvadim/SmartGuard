using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;
using SmartGuard.WebApi.Host.Extensions;
using SmartGuard.WebApi.Host.Models.Zoom;
using SmartGuard.WebApi.Host.Producers;

namespace SmartGuard.WebApi.Host.Controllers;

[ApiController, Route("api/[controller]")]
public class ZoomController : ControllerBase
{
    private readonly IDistributedCache _cache;
    private readonly IZoomMessageProducer _zoomMessageProducer;

    public ZoomController(IDistributedCache cache, IZoomMessageProducer zoomMessageProducer)
    {
        _cache = cache;
        _zoomMessageProducer = zoomMessageProducer;
    }

    [HttpGet("signature")]
    public ZoomSignatureDto GetSignature([FromQuery] ZoomSignatureRequestDto request)
    {
        var key = new SymmetricSecurityKey("mAY9tZsCHaAmvnCjEOtwSEEOqykd1OAJdp7v"u8.ToArray());
        var expires = DateTimeOffset.UtcNow.AddDays(1);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new Claim[]
            {
                new ("sdkKey", "PJ9u0n5V7ESkDkdlYYBpgjVOmDoRUQvwyZz2"),
                new ("mn", request.MeetingNumber),
                new ("role", request.Role),
                new ("appKey", "PJ9u0n5V7ESkDkdlYYBpgjVOmDoRUQvwyZz2"),
                new ("tokenExp", expires.ToUnixTimeSeconds().ToString())
            }),
            Expires = DateTime.UtcNow.AddDays(1),
            IssuedAt = DateTime.UtcNow,
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
        };
        var handler = new JwtSecurityTokenHandler();
        var token = handler.CreateToken(tokenDescriptor);
        var jwtToken = handler.WriteToken(token);
    
        return new ZoomSignatureDto
        {
            Signature = jwtToken
        };
    }

    [HttpPost("session")]
    public async Task<ZoomSession> CreateSessionAsync()
    {
        var sessionId = Guid.NewGuid().ToString("N").ToUpper();
        var zoomSession = new ZoomSession
        {
            Id = sessionId,
            ConnectionId = "test",
            CreateTime = DateTime.UtcNow
        };
        
        await _cache.SetAsync(sessionId, zoomSession, new DistributedCacheEntryOptions
        {
            SlidingExpiration = TimeSpan.FromHours(1)
        });

        return zoomSession;
    }

    [HttpPost("session/{sessionId}/frame")]
    public async Task NextFrameAsync([FromRoute] string sessionId, [FromBody] FrameDataDto frameDataDto)
    {
        var bytes = Convert.FromBase64String(frameDataDto.Content);
        var fileName = $"sessions/{sessionId}/frames/frame_{DateTime.Now.ToString(CultureInfo.InvariantCulture)}.jpg";
        await System.IO.File.WriteAllBytesAsync(fileName, bytes);
    }
    
    [HttpPost("mq-test")]
    public async Task MqTestAsync([FromBody] TestMqMessageDto request)
    {
        _zoomMessageProducer.SendMessage(request.Message);
        await Task.CompletedTask;
    }
}