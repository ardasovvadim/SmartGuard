using Microsoft.AspNetCore.SignalR;

namespace SmartGuard.WebApi.Host.Hubs;

public class ZoomHub : Hub
{
    private readonly ILogger<ZoomHub> _logger;

    public ZoomHub(ILogger<ZoomHub> logger)
    {
        _logger = logger;
    }

    public override Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {connectionId}", Context.ConnectionId);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {connectionId}", Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }
}