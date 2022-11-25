using System.Text;
using Microsoft.AspNetCore.SignalR;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using SmartGuard.WebApi.Host.Hubs;

namespace SmartGuard.WebApi.Host.HostedServices;

public class ZoomHostedService : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly ILogger<ZoomHostedService> _logger;
    // private const string QueueName = "zoom";
    private const string DetectingQueueName = "sg-face-detecting-result-queue";
    private const string VerifyQueueName = "sg-face-verify-result-queue";

    // initialize the connection, channel and queue 
    // inside the constructor to persist them 
    // for until the service (or the application) runs
    public ZoomHostedService(IServiceProvider sp, ILogger<ZoomHostedService> logger)
    {
        _sp = sp;
        _logger = logger;
        var factory = new ConnectionFactory { HostName = "localhost" };
        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();
        _channel.QueueDeclare(queue: DetectingQueueName, exclusive: false, autoDelete: false, durable: false);
        _channel.QueueDeclare(queue: VerifyQueueName, exclusive: false, autoDelete: false, durable: false);
    }

    protected override Task ExecuteAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        
        var detectingConsumer = new EventingBasicConsumer(_channel);

        detectingConsumer.Received += (model, ea) =>
        {
            // read the message bytes
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            
            _logger.LogDebug("[{0}] Received {1}", DetectingQueueName, message);

            Task.Run(async () =>
            {
                using var scope = _sp.CreateScope();
                var zoomHub = scope.ServiceProvider.GetRequiredService<IHubContext<ZoomHub>>();
                
                await zoomHub.Clients.All.SendCoreAsync("Detected", new object[] { message }, cancellationToken: cancellationToken);
            }, cancellationToken);
        };

        _channel.BasicConsume(queue: DetectingQueueName, autoAck: true, consumer: detectingConsumer);
        
        var verifyConsumer = new EventingBasicConsumer(_channel);
        
        verifyConsumer.Received += (model, ea) =>
        {
            // read the message bytes
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            
            _logger.LogDebug("[{0}] Received {1}", VerifyQueueName, message);

            Task.Run(async () =>
            {
                using var scope = _sp.CreateScope();
                var zoomHub = scope.ServiceProvider.GetRequiredService<IHubContext<ZoomHub>>();
                
                await zoomHub.Clients.All.SendCoreAsync("Verified", new object[] { message }, cancellationToken: cancellationToken);
            }, cancellationToken);
        };
        
        _channel.BasicConsume(queue: VerifyQueueName, autoAck: true, consumer: verifyConsumer);

        return Task.CompletedTask;
    }

    public override void Dispose()
    {
        _channel.Dispose();
        _connection.Dispose();
    }
}