using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

namespace SmartGuard.WebApi.Host.Producers;

public class ZoomMessageProducer : IZoomMessageProducer
{
    public void SendMessage<T>(T message)
    {
        var factory = new ConnectionFactory { HostName = "localhost" };
        using var connection = factory.CreateConnection();
        using var channel = connection.CreateModel();
        channel.QueueDeclare("smartguard", exclusive: false);

        var json = JsonSerializer.Serialize(message);
        var body = Encoding.UTF8.GetBytes(json);
        
        channel.BasicPublish("", "smartguard", null, body);
    }
}