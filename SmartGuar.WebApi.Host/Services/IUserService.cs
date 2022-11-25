using SmartGuard.WebApi.Host.Models;

namespace SmartGuard.WebApi.Host.Services;

public interface IUserService
{
    Task WarmUserDataAsync();
    Task<List<string>> PopulateAttendeeImagesAsync(IEnumerable<FrameAttendedDataDto> messageAttendees);
}