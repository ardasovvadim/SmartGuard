import cv2


def parseImageFrame(request):
    img = cv2.imread(request['filePath'])
    frames = []

    for attendee in request['attendees']:
        try:
            x = attendee['x']
            y = attendee['y']
            width = attendee['width']
            height = attendee['height']
            frame = img[y:y + height, x:x + width, :]
            frames.append((attendee, frame))
        except:
            userName = attendee['userName']
            frameId = request['frameId']
            print(f'Error while parsing attendee. Attendee: {userName}. FrameId: {frameId}')

    return frames