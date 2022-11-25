class AttendeeFrameData:
    def __init__(self, attendee, frame):
        self.userId = attendee.userId
        self.userName = attendee.userName
        self.x = attendee.x
        self.y = attendee.y
        self.width = attendee.width
        self.height = attendee.height
        self.frame = frame
        pass


class RecognitionResultMessage:
    def __init__(self, request):
        self.sessionId = request.sessionId
        self.attendees = []
        pass


class AttendeeDataResultMessage:
    def __init__(self, attendee, rectangle):
        self.userId = attendee.userId
        self.userName = attendee.userName
        self.x = attendee.x
        self.y = attendee.y
        self.width = attendee.width
        self.height = attendee.height
        self.rectangle = rectangle
        pass
