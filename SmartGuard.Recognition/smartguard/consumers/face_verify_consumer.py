from smartguard.consumers import consumer
from smartguard.consumers.consumer import DEFAULT_HOST
from smartguard.consumers.utils import parseImageFrame
from smartguard.faceVeryfing import prepareVerifyingModel, detect

DEFAULT_RECEIVE_DETECTING_QUEUE = 'sg-face-verify-queue'
DEFAULT_RESULT_DETECTING_QUEUE = 'sg-face-verify-result-queue'


def prepare(receiveDetectingQueue=DEFAULT_RECEIVE_DETECTING_QUEUE,
            resultDetectingQueue=DEFAULT_RESULT_DETECTING_QUEUE,
            verifyingModel='VGG-Face',
            detectingModel='mediapipe',
            host=DEFAULT_HOST):
    prepareVerifyingModel(verifyingModel, detectingModel)

    def onReceive(request):
        sessionId = request['sessionId']
        frameId = request['frameId']
        attendees = request['attendees']

        if len(attendees) == 0:
            print(f'[{receiveDetectingQueue}] No attendees found. SessionId: {sessionId}. FrameId: {frameId}')
            return

        frameAttendees = parseImageFrame(request)

        for attendee, frame in frameAttendees:
            imagePath = attendee['imagePath']

            try:
                attendee['verifyingInfo'] = detect(frame, imagePath, verifyingModel, detectingModel)
            except Exception as e:
                print(f'[{receiveDetectingQueue}] Error while verifying. SessionId: {sessionId}. FrameId: {frameId}')
                attendee['verifyingInfo'] = None
                attendee['error'] = str(e)

        return request

    return consumer.prepare(receiveDetectingQueue, resultDetectingQueue, onReceive, host)
