from deepface import DeepFace

from smartguard.faceDetecting import prepareDetectingModel


def prepareVerifyingModel(verifyingModel, detectingModel):
    # models = ["VGG-Face", "Facenet", "OpenFace", "DeepFace"]

    prepareDetectingModel(detectingModel)

    return DeepFace.build_model(verifyingModel)


def detect(img1, img2, verifyingModel, detectingModel):
    return DeepFace.verify(
        img1,
        img2,
        model_name=verifyingModel,
        detector_backend=detectingModel,
        enforce_detection=True,
        prog_bar=False
    )