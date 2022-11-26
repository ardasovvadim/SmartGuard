using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using SmartGuard.WebApi.Host.Hubs;
using SmartGuard.WebApi.Host.Models;
using SmartGuard.WebApi.Host.Extensions;
using SmartGuard.WebApi.Host.Helpers;

namespace SmartGuard.WebApi.Host.Services;

public interface IZoomService
{
    Task NotifyMissedAttendeeDataAsync(string sessionId, string frameId, List<string> missedAttendees);
    Task<ZoomSession?> RefreshSessionAsync(string sessionId, RefreshSessionDto dto);
    Task StopSessionAsync(string sessionId);
    Task<ZoomSession> CreateSessionAsync(CreateSessionDto dto);
}

public class ZoomService : IZoomService
{
    private readonly IDistributedCache _cache;
    private readonly IHubContext<ZoomHub> _hubContext;
    private readonly ILogger<ZoomService> _logger;
    private readonly IMemoryCache _memoryCache;

    public ZoomService(IDistributedCache cache, IHubContext<ZoomHub> hubContext, ILogger<ZoomService> logger, IMemoryCache memoryCache)
    {
        _cache = cache;
        _hubContext = hubContext;
        _logger = logger;
        _memoryCache = memoryCache;
    }

    private string Key(string sessionId, List<string> missedAttendees) => $"{sessionId}_{string.Join("_", missedAttendees)}";
    
    public async Task NotifyMissedAttendeeDataAsync(string sessionId, string frameId, List<string> missedAttendees)
    {
        var key = Key(sessionId, missedAttendees);
        var notified = _memoryCache.Get<bool>(key);

        if (notified)
        {
            _logger.LogInformation("Already notified for session {sessionId} and attendees {attendees}", sessionId, missedAttendees);
            return;
        }
        
        _memoryCache.Set(key, true);
        var session = await _cache.GetAsync<ZoomSession>(sessionId);

        if (session == null)
        {
            _logger.LogWarning("Session {sessionId} not found. Can't notify {AlertCode}", sessionId, AlertCode.MissedUserData);
            return;
        }

        await _hubContext.Clients.All.SendAsync("Alert", new AlertDto
        {
            Text = "Users can't be verified. Missed user data. User names: " + string.Join(", ", missedAttendees),
            Code = AlertCode.MissedUserData,
            Color = AlertColor.Red,
            Data = missedAttendees,
            FrameId = frameId
        });
    }

    public async Task<ZoomSession?> RefreshSessionAsync(string sessionId, RefreshSessionDto dto)
    {
        var zoomSession = await _cache.GetAsync<ZoomSession>(sessionId);

        if (zoomSession == null)
            return null;

        zoomSession.UpdatedTime = DateTime.UtcNow;
        zoomSession.ConnectionId = dto.ConnectionId;

        await _cache.SetAsync(sessionId, zoomSession, new DistributedCacheEntryOptions
        {
            SlidingExpiration = TimeSpan.FromHours(1)
        });

        return zoomSession;
    }

    public async Task StopSessionAsync(string sessionId)
    {
        await _cache.RemoveAsync(sessionId);
    }

    public async Task<ZoomSession> CreateSessionAsync(CreateSessionDto dto)
    {
        var sessionId = Guid.NewGuid().ToString("N").ToUpper();
        
        var zoomSession = new ZoomSession
        {
            SessionId = sessionId,
            ConnectionId = dto.ConnectionId,
            CreatedTime = DateTime.UtcNow,
            UpdatedTime = DateTime.UtcNow
        };

        DirectoryHelpers.CreateSessionDirectory(sessionId);

        await _cache.SetAsync(sessionId, zoomSession, new DistributedCacheEntryOptions
        {
            SlidingExpiration = TimeSpan.FromHours(1)
        });

        return zoomSession;
    }
}