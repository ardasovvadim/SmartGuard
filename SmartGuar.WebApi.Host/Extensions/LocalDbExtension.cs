using SmartGuard.WebApi.Host.Services;

namespace SmartGuard.WebApi.Host.Extensions;

public static class LocalDbExtension
{
    public static async Task<WebApplication> PopulateLocalDbAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var sp = scope.ServiceProvider;
        
        var userService = sp.GetRequiredService<IUserService>();
        await userService.WarmUserDataAsync();

        return app;
    }
}