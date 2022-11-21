using System.Globalization;
using Microsoft.AspNetCore.SignalR;

namespace SmartGuard.WebApi.Host.Hubs;

public class ZoomHub : Hub
{
    private readonly ILogger<ZoomHub> _logger;

    public ZoomHub(ILogger<ZoomHub> logger)
    {
        _logger = logger;
    }

    public async Task Test(string message)
    {
        _logger.LogInformation("Test: {message}", message);
        await Clients.Client(Context.ConnectionId).SendAsync("Test", message);
    }

    public async Task SendFrame(string frameBase64)
    {
        var bytes = Convert.FromBase64String(frameBase64);
        var fileName = $"frames/frame_{DateTime.Now.ToString(CultureInfo.InvariantCulture)}.jpg";
        await File.WriteAllBytesAsync(fileName, bytes);
        
        _logger.LogInformation("Frame saved to {fileName}", fileName);
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