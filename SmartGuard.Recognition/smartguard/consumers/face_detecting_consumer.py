from smartguard.consumers import consumer
from smartguard.consumers.consumer import DEFAULT_HOST
from smartguard.faceDetecting import prepareDetectingModel, detect
from smartguard.consumers.utils import parseImageFrame

DEFAULT_RECEIVE_DETECTING_QUEUE = 'sg-face-detecting-queue'
DEFAULT_RESULT_DETECTING_QUEUE = 'sg-face-detecting-result-queue'


def prepare(receiveDetectingQueue=DEFAULT_RECEIVE_DETECTING_QUEUE,
            resultDetectingQueue=DEFAULT_RESULT_DETECTING_QUEUE,
            # model='mediapipe',
            model='mtcnn',
            host=DEFAULT_HOST):

    detectingModel = prepareDetectingModel(model)

    def onReceive(request):
        sessionId = request['sessionId']
        attendees = request['attendees']
        frameId = request['frameId']

        if len(attendees) == 0:
            print(f'[{receiveDetectingQueue}] No attendees found. SessionId: {sessionId}. FrameId: {frameId}')
            return

        frameAttendees = parseImageFrame(request)
        for attendee, frame in frameAttendees:
            try:
                attendee['faces'] = detect(frame, model, detectingModel)
            except Exception as e:
                print(f'[{receiveDetectingQueue}] Error while detecting. SessionId: {sessionId}. FrameId: {frameId}')
                attendee['faces'] = None
                attendee['error'] = str(e)

        return request

    return consumer.prepare(receiveDetectingQueue, resultDetectingQueue, onReceive, host)
