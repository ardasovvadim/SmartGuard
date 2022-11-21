namespace SmartGuard.WebApi.Host.Models.Zoom;

public class ZoomSession
{
    public string Id { get; set; }
    public string ConnectionId { get; set; }
    public DateTime CreateTime { get; init; }
}