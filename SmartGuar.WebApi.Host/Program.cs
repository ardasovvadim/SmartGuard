using SmartGuard.WebApi.Host.Extensions;
using SmartGuard.WebApi.Host.HostedServices;
using SmartGuard.WebApi.Host.Hubs;
using SmartGuard.WebApi.Host.Producers;
using SmartGuard.WebApi.Host.Services;

const string corsName = "AllowAll";

var builder = WebApplication.CreateBuilder(args);
var env = builder.Environment;
// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddTransient<IZoomMessageProducer, ZoomMessageProducer>();
builder.Services.AddTransient<IUserService, UserService>();
builder.Services.AddTransient<IZoomService, ZoomService>();
builder.Services.AddHostedService<ZoomHostedService>();
builder.Services.AddStackExchangeRedisCache(opts =>
{
    opts.Configuration = builder.Configuration.GetConnectionString("Redis");
    opts.InstanceName = "SmartGuard";
});
builder.Services.AddMemoryCache();

if (env.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(corsName, b =>
        {
            b
                .WithOrigins("http://localhost:4200")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                ;
        });
    });
}

builder.Services.AddSignalR(cfg =>
{
    cfg.EnableDetailedErrors = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

if (env.IsDevelopment())
{
    app.UseCors(corsName);
}

app.UseAuthorization();

app.MapControllers();
app.MapHub<ZoomHub>("/hub/zoom");

await app.PopulateLocalDbAsync();

app.Run();
