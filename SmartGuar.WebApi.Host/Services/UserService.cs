using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using SmartGuard.WebApi.Host.Models;

namespace SmartGuard.WebApi.Host.Services;

public class UserService : IUserService
{
    private readonly IMemoryCache _cache;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UserService> _logger;

    private const string DbPathKey = "DbPath";
    private readonly List<string> _imageExtensions = new() { ".jpg", ".jpeg", ".png", ".gif" };

    public UserService(IMemoryCache cache, IConfiguration configuration, ILogger<UserService> logger)
    {
        _cache = cache;
        _configuration = configuration;
        _logger = logger;
    }

    public Task WarmUserDataAsync()
    {
        var dbPath = _configuration[DbPathKey];
        
        if (!Directory.Exists(dbPath))
            throw new DirectoryNotFoundException($"The directory {dbPath} does not exist.");
        
        var userDirectories = Directory.GetDirectories(dbPath);
        
        _logger.LogInformation("Found {Count} user directories.", userDirectories.Length);

        var foundUserWithData = 0;
        
        foreach (var userDirectory in userDirectories)
        {
            var files = Directory.GetFiles(userDirectory);
            var userImagePath = files.FirstOrDefault(f => _imageExtensions.Any(f.EndsWith));
            var userName = userDirectory.Split(Path.DirectorySeparatorChar).Last();

            if (userImagePath == null)
            {
                _logger.LogWarning("No image found for user {User}", userName);
                continue;
            }
            
            var user = new UserData
            {
                UserName = userName,
                ImagePath = userImagePath
            };

            _cache.Set(userName, user);

            ++foundUserWithData;
        }
        
        _logger.LogInformation("Finished warming user data. Found {Count} users with data.", foundUserWithData);
        
        return Task.CompletedTask;
    }

    public Task<List<string>> PopulateAttendeeImagesAsync(IEnumerable<FrameAttendedDataDto> messageAttendees)
    {
        var missedAttendees = new List<string>();
        
        foreach (var attendee in messageAttendees)
        {
            var userData = _cache.Get<UserData>(attendee.UserName);

            if (userData == null)
            {
                missedAttendees.Add(attendee.UserName);
                continue;
            }

            attendee.ImagePath = userData.ImagePath;
        }

        return Task.FromResult(missedAttendees);
    }
}