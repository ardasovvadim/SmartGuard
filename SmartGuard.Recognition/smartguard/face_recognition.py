import cv2
import numpy as np


class FaceRecognition:

    def __init__(self):
        # TODO: move to config
        ssn_dep_path = 'models/ssn_face_detector/deploy.prototxt'
        ssn_weights_path = 'models/ssn_face_detector/res10_300x300_ssd_iter_140000.caffemodel'
        self.ssn_face_detector = cv2.dnn.readNet(ssn_dep_path, ssn_weights_path)
        self.ssn_confidence = 0.7

        pass

    def detect_face(self, detecting_img, write_labels=False):
        face_rectangles = []
        detecting_img = detecting_img.copy()
        color = (0, 255, 0)
        (h, w) = detecting_img.shape[:2]
        blob = cv2.dnn.blobFromImage(detecting_img, 1.0, (300, 300), (104.0, 177.0, 123.0))
        self.ssn_face_detector.setInput(blob)
        detections = self.ssn_face_detector.forward()
        face_i = 0

        for i in range(0, detections.shape[2]):
            confidence = detections[0, 0, i, 2]

            if confidence >= self.ssn_confidence:
                face_i += 1
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                (startX, startY, endX, endY) = box.astype("int")
                (startX, startY) = (max(0, startX), max(0, startY))
                (endX, endY) = (min(w - 1, endX), min(h - 1, endY))

                face_rectangles.append((startX, startY, endX, endY))

                if write_labels:
                    detecting_img = cv2.putText(detecting_img, 'Face {0}'.format(face_i), (startX, startY - 10),
                                                cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 2)
                    detecting_img = cv2.rectangle(detecting_img, (startX, startY), (endX, endY), color, 2)

        return face_rectangles, detecting_img
