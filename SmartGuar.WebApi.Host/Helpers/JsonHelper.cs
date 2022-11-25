using System.Text.Json;

namespace SmartGuard.WebApi.Host.Helpers;

public static class JsonHelper
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);
    
    public static string Serialize<T>(T obj)
    {
        return JsonSerializer.Serialize(obj, Options);
    }
    
    public static T? Deserialize<T>(string json)
    {
        return JsonSerializer.Deserialize<T>(json, Options);
    }
}