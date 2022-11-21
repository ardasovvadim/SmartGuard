using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

Console.WriteLine("Starting RabbitMQ Consumer");

const string smartGuardQueue = "smartguard";
const string zoomQueue = "zoom";
const string zoom2Queue = "zoom2";

var factory = new ConnectionFactory { HostName = "localhost" }; 
var connection = factory.CreateConnection(); 
using var channel = connection.CreateModel();

channel.QueueDeclare(smartGuardQueue, exclusive: false);
channel.QueueDeclare(zoomQueue, exclusive: false, autoDelete: false, durable: false);
channel.QueueDeclare(zoom2Queue, exclusive: false, autoDelete: false, durable: false);

var smartGuardConsumer = new EventingBasicConsumer(channel);
smartGuardConsumer.Received += (_, eventArgs) =>
{
    var body = eventArgs.Body.ToArray();
    var message = Encoding.UTF8.GetString(body);
    
    channel.BasicPublish("", zoomQueue, null, body);
    channel.BasicPublish("", zoom2Queue, null, body);
    
    Console.WriteLine("[smartguard] Received {0}", message);
};


channel.BasicConsume(queue: "smartguard", autoAck: true, consumer: smartGuardConsumer);
Console.WriteLine("Press [enter] to exit.");
Console.ReadKey();