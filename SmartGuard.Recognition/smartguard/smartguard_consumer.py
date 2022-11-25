import pika

from smartguard import FaceRecognition, RecognitionResultMessage, AttendeeDataResultMessage
from smartguard.utils import json2obj, frameToImageFrames
import json
import time
from json import JSONEncoder

RECEIVE_FRAME_QUEUE = 'smartguard-frames'
RESULT_FRAME_QUEUE = 'smartguard-frame-results'
HOST = 'localhost'


# subclass JSONEncoder
class SgEncoder(JSONEncoder):
    def default(self, o):
        return o.__dict__


def consume():
    # recognition initialization
    recognition = FaceRecognition()

    connection = pika.BlockingConnection(pika.ConnectionParameters(host=HOST))
    channel = connection.channel()

    channel.queue_declare(queue=RECEIVE_FRAME_QUEUE, exclusive=False, auto_delete=False, durable=False)
    channel.queue_declare(queue=RESULT_FRAME_QUEUE, exclusive=False, auto_delete=False, durable=False)

    def callback(ch, method, properties, body):
        body = body.decode('utf-8')
        request = json2obj(body)

        print("[{0}] Received frame. SessionId: {1}".format(RECEIVE_FRAME_QUEUE, request.sessionId))

        if len(request.attendees) == 0:
            print("[{0}] No attendees in frame. SessionId: {1}".format(RECEIVE_FRAME_QUEUE, request.sessionId))
            return

        start_time = time.time()

        attendee_data = frameToImageFrames(request)
        result = RecognitionResultMessage(request)

        for data in attendee_data:
            rectangles, _ = recognition.detect_face(data.frame, write_labels=False)
            result.attendees.append(AttendeeDataResultMessage(data, map(lambda x: list(x), rectangles)))

        print ("[{0}] Sending result. SessionId: {1}".format(RESULT_FRAME_QUEUE, request.sessionId))

        result_json = json.dumps(result, indent=4, cls=SgEncoder)
        channel.basic_publish(exchange='', routing_key=RESULT_FRAME_QUEUE, body=result_json)

        result_time = (time.time() - start_time) * 1000

        print("[{0}] Result sent. SessionId: {1}. Time: {2} ms".format(RESULT_FRAME_QUEUE, request.sessionId,
                                                                       result_time))

    channel.basic_consume(queue=RECEIVE_FRAME_QUEUE, on_message_callback=callback, auto_ack=True)

    print('[*] Waiting for messages. To exit press Control+C')
    channel.start_consuming()
