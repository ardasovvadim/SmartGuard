from smartguard.consumers import consumer
from smartguard.consumers.consumer import DEFAULT_HOST
from smartguard.consumers.utils import parseImageFrame
from smartguard.faceAnalysing import prepareAnalysingModel, detect

DEFAULT_RECEIVE_DETECTING_QUEUE = 'sg-face-analysing-queue'
DEFAULT_RESULT_DETECTING_QUEUE = 'sg-face-analysing-result-queue'


def prepare(receiveDetectingQueue=DEFAULT_RECEIVE_DETECTING_QUEUE,
            resultDetectingQueue=DEFAULT_RESULT_DETECTING_QUEUE,
            detectingModel='mediapipe',
            host=DEFAULT_HOST):

    models = prepareAnalysingModel(detectingModel)

    def onReceive(request):
        sessionId = request['sessionId']
        frameId = request['frameId']
        attendees = request['attendees']
        actions = request['actions']

        if len(attendees) == 0:
            print(f'[{receiveDetectingQueue}] No attendees found. SessionId: {sessionId}. FrameId: {frameId}')
            return

        if actions is None or len(actions) == 0:
            actions = ['emotion', 'age', 'gender', 'race']

        actions = tuple(actions)
        actionModels = {action: models[action] for action in actions}

        frameAttendees = parseImageFrame(request)

        for attendee, frame in frameAttendees:
            try:
                result = detect(frame, actionModels, detectingModel, actions)
                attendee['statisticInfo'] = result
            except Exception as e:
                print(f'[{receiveDetectingQueue}] Error while analysing. SessionId: {sessionId}. FrameId: {frameId}')
                attendee['statisticInfo'] = None
                attendee['error'] = str(e)

        return request

    return consumer.prepare(receiveDetectingQueue, resultDetectingQueue, onReceive, host)
