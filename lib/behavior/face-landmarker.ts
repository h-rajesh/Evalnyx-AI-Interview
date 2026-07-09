import {
  FilesetResolver,
  FaceLandmarker,
} from "@mediapipe/tasks-vision";

let detector: FaceLandmarker | null = null;

export async function getFaceLandmarker() {
  if (detector) return detector;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  detector =
    await FaceLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
        },

        runningMode: "VIDEO",

        numFaces: 1,

        outputFaceBlendshapes: true,

        outputFacialTransformationMatrixes: true,
      }
    );

  return detector;
}