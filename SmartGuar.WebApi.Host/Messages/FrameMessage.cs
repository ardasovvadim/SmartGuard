using SmartGuard.WebApi.Host.Models;

namespace SmartGuard.WebApi.Host.Messages;

public class FrameMessage
{
    public string FrameId { get; set; }
    
    public string SessionId { get; set; }
    
    public string FilePath { get; set; }

    public IEnumerable<string>? Actions { get; set; }
    
    public IEnumerable<FrameAttendedDataDto> Attendees { get; set; }
    public bool PartialResult { get; set; } = false;
}