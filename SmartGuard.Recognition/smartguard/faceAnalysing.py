from deepface import DeepFace

from smartguard.faceDetecting import prepareDetectingModel


def prepareAnalysingModel(detectingModel):
    models = {
        'emotion': DeepFace.build_model('Emotion'),
        'age': DeepFace.build_model('Age'),
        'gender': DeepFace.build_model('Gender'),
        'race': DeepFace.build_model('Race')
    }

    prepareDetectingModel(detectingModel)

    return models


def detect(img1,
           models,
           detectingModel,
           actions=('emotion', 'age', 'gender', 'race')):
    return DeepFace.analyze(
        img1,
        actions=actions,
        models=models,
        detector_backend=detectingModel,
        enforce_detection=True,
        prog_bar=False
    )
