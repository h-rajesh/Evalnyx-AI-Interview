import {
  FilesetResolver,
  FaceLandmarker,
} from "@mediapipe/tasks-vision";

// Intercept and redirect low-level TensorFlow/MediaPipe INFO logs that are incorrectly written to console.error
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const firstArg = args[0];
    if (
      typeof firstArg === "string" &&
      (firstArg.includes("INFO: Created TensorFlow Lite") ||
        firstArg.includes("XNNPACK delegate"))
    ) {
      console.info(...args);
      return;
    }
    originalConsoleError(...args);
  };
}

let faceLandmarker: FaceLandmarker | null = null;

export async function getFaceLandmarker() {
  if (faceLandmarker) return faceLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
      },

      runningMode: "VIDEO",

      numFaces: 2,

      outputFaceBlendshapes: true,

      outputFacialTransformationMatrixes: true,
    }
  );

  console.log("✅ FaceLandmarker Ready");

  return faceLandmarker;
}