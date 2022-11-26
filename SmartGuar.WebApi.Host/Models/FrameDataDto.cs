namespace SmartGuard.WebApi.Host.Models;

public class FrameDataDto
{
    public string Content { get; set; }
    public bool PartialResult { get; set; } = false;
    public IEnumerable<string>? Actions { get; set; }
    public IEnumerable<FrameAttendedDataDto> Attendees { get; set; }
}

public class FrameAttendedDataDto
{
    public string? UserId { get; set; }
    public string UserName { get; set; }
    public int Height { get; set; }
    public int Width { get; set; }
    public int X { get; set; }
    public int Y { get; set; }

    public string? ImagePath { get; set; }
}