using System.Text;
using RabbitMQ.Client;
using SmartGuard.WebApi.Host.Helpers;
using SmartGuard.WebApi.Host.Messages;

namespace SmartGuard.WebApi.Host.Producers;

public class ZoomMessageProducer : IZoomMessageProducer
{
    private readonly ConnectionFactory _factory = new() { HostName = "localhost" };
    private IConnection Connection() => _factory.CreateConnection();

    public void SendMessage<T>(T message)
    {
        const string queueName = "smartguard";
        
        SendBase(queueName, message);
    }

    public void SendDetectingFrameMessage(FrameMessage frameMessage)
    {
        const string queueName = "sg-face-detecting-queue";
        
        SendBase(queueName, frameMessage);
    }

    public void SendVerifyFrameMessage(FrameMessage frameMessage)
    {
        const string queueName = "sg-face-verify-queue";
        
        SendBase(queueName, frameMessage);
    }

    public void SendAnalysingFrameMessage(FrameMessage message)
    {
        const string queueName = "sg-face-analysing-queue";
        
        SendBase(queueName, message);
    }

    private void SendBase<T>(string queueName, T frameMessage)
    {
        using var connection = Connection();
        using var channel = connection.CreateModel();
        channel.QueueDeclare(queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);
        
        var json = JsonHelper.Serialize(frameMessage);
        var body = Encoding.UTF8.GetBytes(json);
        
        channel.BasicPublish("", queueName, null, body);
    }
}