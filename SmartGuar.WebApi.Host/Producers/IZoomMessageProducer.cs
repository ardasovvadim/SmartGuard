using SmartGuard.WebApi.Host.Messages;

namespace SmartGuard.WebApi.Host.Producers;

public interface IZoomMessageProducer
{
    void SendMessage<T> (T message);
    void SendDetectingFrameMessage(FrameMessage frameMessage);
    void SendVerifyFrameMessage(FrameMessage frameMessage);
    void SendAnalysingFrameMessage(FrameMessage message);
}