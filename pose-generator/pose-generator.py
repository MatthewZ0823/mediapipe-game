# STEP 1: Import the necessary modules.
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import json
import os

# STEP 2: Create an PoseLandmarker object.
base_options = python.BaseOptions(model_asset_path='pose_landmarker.task')
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    output_segmentation_masks=True)
detector = vision.PoseLandmarker.create_from_options(options)

json_arr = []

# STEP 3: Loop through each image in the images directory
for filename in os.listdir('images'):
    file = os.path.join('images', filename)

    # STEP 4: Load the input image.
    image = mp.Image.create_from_file(file)

    # STEP 5: Detect pose landmarks from the input image.
    detection_result = detector.detect(image)
    pose_landmarks = detection_result.pose_landmarks

    # STEP 6: Append the landmarks to the json array in a json serializable format
    landmarks_arr = []
    for landmark in pose_landmarks[0]:
        landmarks_arr.append({
            'x': landmark.x,
            'y': landmark.y,
            'z': landmark.z,
            'visibility': landmark.visibility,
            'presence': landmark.presence,
        })

    json_arr.append(landmarks_arr)

# STEP 7: Write the json array to the pose_landmarks.json file
f = open("all_pose_landmarks.json", "w")
f.write(json.dumps(json_arr))
f.close()
