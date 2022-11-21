using System.ComponentModel.DataAnnotations;

namespace SmartGuard.WebApi.Host.Models.Zoom;

public class ZoomSignatureRequestDto
{
    [Required]
    public string MeetingNumber { get; set; }
    [Required]
    public string Role { get; set; }
}