using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SmartGuard.WebApi.Host.Helpers;
using SmartGuard.WebApi.Host.Messages;
using SmartGuard.WebApi.Host.Models;
using SmartGuard.WebApi.Host.Producers;
using SmartGuard.WebApi.Host.Services;

namespace SmartGuard.WebApi.Host.Controllers;

[ApiController, Route("api/[controller]")]
public class ZoomController : ControllerBase
{
    private readonly IZoomMessageProducer _zoomMessageProducer;
    private readonly ILogger<ZoomController> _logger;
    private readonly IUserService _userService;
    private readonly IZoomService _zoomService;

    public ZoomController(IZoomMessageProducer zoomMessageProducer, ILogger<ZoomController> logger, IUserService userService, IZoomService zoomService)
    {
        _zoomMessageProducer = zoomMessageProducer;
        _logger = logger;
        _userService = userService;
        _zoomService = zoomService;
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
    public async Task<ZoomSession> CreateSessionAsync(CreateSessionDto dto)
    {
        var zoomSession = await _zoomService.CreateSessionAsync(dto);
        
        _logger.LogInformation("Created session {SessionId}", zoomSession.SessionId);

        return zoomSession;
    }
    
    [HttpPost("session/{sessionId}/refresh")]
    public async Task<IActionResult> RefreshSessionAsync([FromRoute] string sessionId, [FromBody] RefreshSessionDto dto)
    {
        var zoomSession = await _zoomService.RefreshSessionAsync(sessionId, dto);
        
        if (zoomSession == null)
            return NotFound();
        
        _logger.LogInformation("Refreshed session {SessionId}", sessionId);
        
        return Ok(zoomSession);
    }
    
    [HttpDelete("session/{sessionId}/message")]
    public async Task<IActionResult> StopSessionAsync([FromRoute] string sessionId)
    {
        await _zoomService.StopSessionAsync(sessionId);
        
        _logger.LogInformation("Stopped session {SessionId}", sessionId);
        
        return Ok();
    }


    [HttpPost("session/{sessionId}/detecting-frame")]
    public async Task NextDetectingFrameAsync([FromRoute] string sessionId, [FromBody] FrameDataDto frameDataDto)
    {
        var message = await GetDefaultMessageAsync(sessionId, frameDataDto);
        
        _zoomMessageProducer.SendDetectingFrameMessage(message);
        
        _logger.LogInformation("Received detecting frame: {frameId}. SessionId: {SessionId}", message.FrameId, sessionId);
    }

    [HttpPost("session/{sessionId}/verifying-frame")]
    public async Task NextVerifyingFrameAsync([FromRoute] string sessionId, [FromBody] FrameDataDto frameDataDto)
    {
        var message = await GetDefaultMessageAsync(sessionId, frameDataDto);
        var missedAttendees = await _userService.PopulateAttendeeImagesAsync(message.Attendees);
        
        if (missedAttendees.Count > 0)
            message.Attendees = message.Attendees.Where(a => !missedAttendees.Contains(a.UserName)).ToList();

        _zoomMessageProducer.SendVerifyFrameMessage(message);

        _logger.LogInformation("Received verify frame: {frameId}. SessionId: {SessionId}", message.FrameId, sessionId);

        if (missedAttendees.Count > 0)
        {
            _logger.LogInformation("Missed attendees: {Attendees}. Trying to notify", string.Join(", ", missedAttendees));
            await _zoomService.NotifyMissedAttendeeDataAsync(sessionId, message.FrameId, missedAttendees);
        }
    }
    
    [HttpPost("session/{sessionId}/analysing-frame")]
    public async Task NextAnalysingFrameAsync([FromRoute] string sessionId, [FromBody] FrameDataDto frameDataDto)
    {
        var message = await GetDefaultMessageAsync(sessionId, frameDataDto);

        _zoomMessageProducer.SendAnalysingFrameMessage(message);

        _logger.LogInformation("Received analysing frame: {frameId}. SessionId: {SessionId}", message.FrameId, sessionId);
    }

    private async Task<FrameMessage> GetDefaultMessageAsync(string sessionId, FrameDataDto frameDataDto)
    {
        var frameId = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        var bytes = Convert.FromBase64String(frameDataDto.Content);
        var fileName = DirectoryHelpers.GetFramePath(sessionId, frameId);
        await System.IO.File.WriteAllBytesAsync(fileName, bytes);
        return new FrameMessage
        {
            FrameId = frameId,
            SessionId = sessionId,
            FilePath = DirectoryHelpers.GetAbsoluteFilePath(fileName),
            Attendees = frameDataDto.Attendees,
            PartialResult = frameDataDto.PartialResult,
            Actions = frameDataDto.Actions
        };
    }
    
    [HttpPost("reset-user-data")]
    public Task ResetUserDataAsync()
    {
        return _userService.WarmUserDataAsync();
    }

    [HttpPost("mq-test")]
    public async Task MqTestAsync([FromBody] TestMqMessageDto request)
    {
        _zoomMessageProducer.SendMessage(request.Message);
        await Task.CompletedTask;
    }
}