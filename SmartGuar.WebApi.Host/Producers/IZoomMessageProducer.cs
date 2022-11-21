namespace SmartGuard.WebApi.Host.Producers;

public interface IZoomMessageProducer
{
    void SendMessage<T> (T message);
}