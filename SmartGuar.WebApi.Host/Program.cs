using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SmartGuard.WebApi.Host.HostedServices;
using SmartGuard.WebApi.Host.Hubs;
using SmartGuard.WebApi.Host.Producers;

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
builder.Services.AddHostedService<ZoomHostedService>();

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

app.Run();
