namespace SmartGuard.WebApi.Host.Helpers;

public static class DirectoryHelpers
{
    public static void CreateSessionDirectory(string sessionId)
    {
        var path = $"sessions/{sessionId}/frames";

        if (Directory.Exists(path))
            return;
        
        Directory.CreateDirectory(path);
    }

    public static string GetFramePath(string sessionId, string frameId)
    {
        return $"sessions/{sessionId}/frames/frame_{frameId}.jpg";
    }

    public static string GetAbsoluteFilePath(string filePath)
    {
        return Path.Combine(Directory.GetCurrentDirectory(), filePath);
    }
}