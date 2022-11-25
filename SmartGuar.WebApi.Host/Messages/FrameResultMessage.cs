namespace SmartGuard.WebApi.Host.Messages;

public class FrameResultMessage
{
    public string SessionId { get; set; }
    public IEnumerable<AttendeeFrameResultMessage> Attendees { get; set; }
}

public class AttendeeFrameResultMessage
{
    public string? UserId { get; set; }
    public string UserName { get; set; }
    public int X { get; set; }
    public int Y { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public IEnumerable<int> Rectangle { get; set; }
}