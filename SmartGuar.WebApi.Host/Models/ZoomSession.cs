namespace SmartGuard.WebApi.Host.Models;

public class ZoomSession
{
    public string SessionId { get; set; }
    public string ConnectionId { get; set; }
    public DateTime CreatedTime { get; init; }
    public DateTime UpdatedTime { get; set; }
}