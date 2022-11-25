import json
import pika
from json import JSONEncoder

DEFAULT_HOST = 'localhost'


def prepare(receive_frame_queue, result_frame_queue, on_receive, host=DEFAULT_HOST):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=host))
    channel = connection.channel()

    channel.queue_declare(queue=receive_frame_queue, exclusive=False, auto_delete=False, durable=False)
    channel.queue_declare(queue=result_frame_queue, exclusive=False, auto_delete=False, durable=False)

    def callback(ch, method, properties, body):
        body = body.decode('utf-8')
        request = json.loads(body)
        sessionId = request['sessionId']
        frameId = request['frameId']

        print(f"[{receive_frame_queue}] Received frame. SessionId: {sessionId}. FrameId: {frameId}")

        result = on_receive(request)

        if result is not None:
            result = json.dumps(result, cls=JSONEncoder)
            channel.basic_publish(exchange='', routing_key=result_frame_queue, body=result.encode('utf-8'))

            print(f"[{result_frame_queue}] Result sent. SessionId: {sessionId}. FrameId: {frameId}")

    channel.basic_consume(queue=receive_frame_queue, on_message_callback=callback, auto_ack=True)

    def runnable():
        print(f'[{receive_frame_queue}] Waiting for messages. To exit press Control+C')
        channel.start_consuming()

    return runnable
