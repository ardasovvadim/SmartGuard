namespace SmartGuard.WebApi.Host.Models;

public class AlertDto
{
    public string Text { get; set; }
    public AlertColor Color { get; set; }
    public AlertCode Code { get; set; }
    public object? Data { get; set; }
    public DateTime Time { get; set; } = DateTime.UtcNow;
}

public enum AlertCode
{
    None = 0,
    MissedUserData
}

public enum AlertColor
{
    None = 0,
    Red,
    Yellow,
    Green
}