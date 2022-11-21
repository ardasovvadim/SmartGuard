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
    private const string QueueName = "zoom";

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
        _channel.QueueDeclare(queue: QueueName, exclusive: false, autoDelete: false, durable: false);
    }

    protected override Task ExecuteAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        
        // create a consumer that listens on the channel (queue)
        var consumer = new EventingBasicConsumer(_channel);

        // handle the Received event on the consumer
        // this is triggered whenever a new message
        // is added to the queue by the producer
        consumer.Received += (model, ea) =>
        {
            // read the message bytes
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            
            _logger.LogInformation("[{0}] Received {1}", QueueName, message);

            Task.Run(async () =>
            {
                using var scope = _sp.CreateScope();
                var zoomHub = scope.ServiceProvider.GetRequiredService<IHubContext<ZoomHub>>();
                
                await zoomHub.Clients.All.SendCoreAsync("ReceiveMessage", new object[] { message }, cancellationToken: cancellationToken);
            }, cancellationToken);
        };

        _channel.BasicConsume(queue: QueueName, autoAck: true, consumer: consumer);

        return Task.CompletedTask;
    }

    public override void Dispose()
    {
        _channel.Dispose();
        _connection.Dispose();
    }
}