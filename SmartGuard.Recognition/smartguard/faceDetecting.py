import cv2
from deepface.detectors import FaceDetector


def prepareDetectingModel(model):
    builders = {
        'opencv': FaceDetector.build_model,
        'ssd': FaceDetector.build_model,
        'dlib': FaceDetector.build_model,
        'mtcnn': FaceDetector.build_model,
        'retinaface': FaceDetector.build_model,
        'mediapipe': FaceDetector.build_model
    }

    builder = builders.get(model)

    return builder(model)


def detect(img, model, detectorModel):
    detectors = {
        'opencv': detectFaceOpenCv,
        'ssd': detectFaceSsd,
        'dlib': detectFaceDlib,
        'mtcnn': detectFaceMtcnn,
        'retinaface': detectFaceRetinaFace,
        'mediapipe': detectFaceMediapipe
    }
    detector = detectors.get(model)
    return detector(img, detectorModel)


def detectFaceOpenCv(img, detectorModel):
    resp = []

    faces = detectorModel["face_detector"].detectMultiScale(img, 1.1, 10)

    if len(faces) > 0:

        for x, y, w, h in faces:
            img_region = [x, y, w, h]
            resp.append(img_region)

    return resp


def detectFaceMtcnn(img, detectorModel):
    resp = []
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # mtcnn expects RGB but OpenCV read BGR

    detections = detectorModel.detect_faces(img_rgb)

    if len(detections) > 0:

        for detection in detections:
            x, y, w, h = detection["box"]
            img_region = [x, y, w, h]
            resp.append(img_region)

    return resp


def detectFaceRetinaFace(img, detectorModel):
    from retinaface import RetinaFace

    resp = []

    obj = RetinaFace.detect_faces(img, model=detectorModel, threshold=0.9)

    if type(obj) == dict:
        for key in obj:
            identity = obj[key]
            facial_area = identity["facial_area"]

            y = facial_area[1]
            h = facial_area[3] - y
            x = facial_area[0]
            w = facial_area[2] - x
            img_region = [x, y, w, h]

            resp.append(img_region)

    return resp


def detectFaceSsd(img, detectorModel):
    import pandas as pd

    resp = []

    ssd_labels = ["img_id", "is_face", "confidence", "left", "top", "right", "bottom"]

    target_size = (300, 300)

    base_img = img.copy()  # we will restore base_img to img later

    original_size = img.shape

    img = cv2.resize(img, target_size)

    aspect_ratio_x = (original_size[1] / target_size[1])
    aspect_ratio_y = (original_size[0] / target_size[0])

    imageBlob = cv2.dnn.blobFromImage(image=img)

    face_detector = detectorModel["face_detector"]
    face_detector.setInput(imageBlob)
    detections = face_detector.forward()

    detections_df = pd.DataFrame(detections[0][0], columns=ssd_labels)

    detections_df = detections_df[detections_df['is_face'] == 1]  # 0: background, 1: face
    detections_df = detections_df[detections_df['confidence'] >= 0.90]

    detections_df['left'] = (detections_df['left'] * 300).astype(int)
    detections_df['bottom'] = (detections_df['bottom'] * 300).astype(int)
    detections_df['right'] = (detections_df['right'] * 300).astype(int)
    detections_df['top'] = (detections_df['top'] * 300).astype(int)

    if detections_df.shape[0] > 0:

        for index, instance in detections_df.iterrows():
            left = instance["left"]
            right = instance["right"]
            bottom = instance["bottom"]
            top = instance["top"]
            img_region = [int(left * aspect_ratio_x), int(top * aspect_ratio_y),
                          int(right * aspect_ratio_x) - int(left * aspect_ratio_x),
                          int(bottom * aspect_ratio_y) - int(top * aspect_ratio_y)]

            resp.append(img_region)

    return resp


def detectFaceDlib(img, detectorModel):
    resp = []
    face_detector = detectorModel["face_detector"]
    detections = face_detector(img, 1)

    if len(detections) > 0:

        for idx, d in enumerate(detections):
            left = d.left();
            right = d.right()
            top = d.top();
            bottom = d.bottom()

            img_region = [left, top, right - left, bottom - top]

            resp.append(img_region)

    return resp


def detectFaceMediapipe(img, detectorModel):
    resp = []

    img_width = img.shape[1]
    img_height = img.shape[0]

    results = detectorModel.process(img)

    if results.detections:
        for detection in results.detections:

            confidence = detection.score
            bounding_box = detection.location_data.relative_bounding_box
            landmarks = detection.location_data.relative_keypoints

            x = int(bounding_box.xmin * img_width)
            w = int(bounding_box.width * img_width)
            y = int(bounding_box.ymin * img_height)
            h = int(bounding_box.height * img_height)

            if x > 0 and y > 0:
                img_region = [x, y, w, h]

                resp.append(img_region)

    return resp
