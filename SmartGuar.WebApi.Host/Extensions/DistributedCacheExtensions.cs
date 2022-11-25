using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace SmartGuard.WebApi.Host.Extensions;

public static class DistributedCacheExtensions
{
    public static async Task<T?> GetAsync<T>(this IDistributedCache cache, string key)
    {
        var data = await cache.GetAsync(key);
        return data == null ? default : JsonSerializer.Deserialize<T>(Encoding.UTF8.GetString(data));
    }
    
    public static Task SetAsync<T>(this IDistributedCache cache, string key, T value, DistributedCacheEntryOptions options)
    {
        return cache.SetAsync(key, Encoding.UTF8.GetBytes(JsonSerializer.Serialize(value)), options);
    }
}