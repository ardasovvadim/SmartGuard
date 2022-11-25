import json
from collections import namedtuple

import cv2

from smartguard import AttendeeFrameData


# json to obj
def _json_object_hook(d):
    return namedtuple('X', d.keys())(*d.values())


def json2obj(data):
    return json.loads(data, object_hook=_json_object_hook)


def frameToImageFrames(request):
    img = cv2.imread(request.filePath)
    attendee_data = []

    for attendee in request.attendees:
        attendee_frame = img[attendee.y:attendee.y + attendee.height, attendee.x:attendee.x + attendee.width, :]
        attendee_data.append(AttendeeFrameData(attendee, attendee_frame))

    return attendee_data
