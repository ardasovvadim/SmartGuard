from smartguard.consumers import consumer
from smartguard.consumers.consumer import DEFAULT_HOST
from smartguard.faceDetecting import prepareDetectingModel, detect
from smartguard.consumers.utils import parseImageFrame

DEFAULT_RECEIVE_DETECTING_QUEUE = 'sg-face-detecting-queue'
DEFAULT_RESULT_DETECTING_QUEUE = 'sg-face-detecting-result-queue'


def prepare(receiveDetectingQueue=DEFAULT_RECEIVE_DETECTING_QUEUE,
            resultDetectingQueue=DEFAULT_RESULT_DETECTING_QUEUE,
            model='mediapipe',
            host=DEFAULT_HOST):

    detectingModel = prepareDetectingModel(model)

    def onReceive(request):
        sessionId = request['sessionId']
        attendees = request['attendees']

        if len(attendees) == 0:
            print(f'[{receiveDetectingQueue}] No attendees found. SessionId: {sessionId}')
            return

        frameAttendees = parseImageFrame(request)
        for attendee, frame in frameAttendees:
            attendee['faces'] = detect(frame, model, detectingModel)

        return request

    return consumer.prepare(receiveDetectingQueue, resultDetectingQueue, onReceive, host)
