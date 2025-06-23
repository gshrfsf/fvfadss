
// Ensure tf is available globally (from CDN) for this simple setup.
// In a typical project, you'd import from '@tensorflow/tfjs'.
declare const tf: any; 

const MODEL_URL = 'https://storage.googleapis.com/tfjs-models/tfjs/mnist_model/model.json';
// Alternative simple model: 'https://storage.googleapis.com/tfjs-examples/mnist-simple/model.json';

export const loadModel = async (): Promise<any> => { // Using 'any' for tf.LayersModel for simplicity
  if (!tf) {
    throw new Error("TensorFlow.js (tf) is not available. Ensure it's loaded.");
  }
  try {
    const model = await tf.loadLayersModel(MODEL_URL);
    // Optional: Warm up the model (run a dummy prediction)
    // This can reduce latency for the first actual prediction.
    const zeros = tf.zeros([1, 28, 28, 1]);
    model.predict(zeros);
    zeros.dispose();
    console.log("MNIST Model loaded and warmed up successfully.");
    return model;
  } catch (error) {
    console.error("Error loading model from URL:", MODEL_URL, error);
    throw new Error(`Failed to load model from ${MODEL_URL}. Check network or model URL.`);
  }
};

export const preprocessCanvasData = (canvas: HTMLCanvasElement): any => { // Using 'any' for tf.Tensor
  if (!tf) {
    throw new Error("TensorFlow.js (tf) is not available.");
  }
  return tf.tidy(() => {
    // Capture image from canvas
    // Get raw pixels: tf.browser.fromPixels() returns values in [0, 255]
    // numChannels = 1 for grayscale. It averages R,G,B.
    let tensor = tf.browser.fromPixels(canvas, 1);

    // Resize to 28x28
    tensor = tf.image.resizeBilinear(tensor, [28, 28]);
    
    // Normalize: Convert pixel values from [0, 255] to [0, 1]
    tensor = tensor.toFloat().div(tf.scalar(255.0));

    // Invert colors: MNIST model expects white digit (1) on black background (0).
    // Canvas has black digit (0 after normalization) on white background (1 after normalization).
    // So, 1.0 - normalized_value.
    tensor = tf.scalar(1.0).sub(tensor);
    
    // Reshape to [1, 28, 28, 1] which is the expected input shape for the model
    // (batch_size, height, width, channels)
    tensor = tensor.reshape([1, 28, 28, 1]);
    
    return tensor;
  });
};

export const predictDigit = async (model: any, tensor: any): Promise<number> => { // Using 'any' for model and tensor
  if (!tf) {
    throw new Error("TensorFlow.js (tf) is not available.");
  }
  if (!model) {
    throw new Error("Model is not loaded for prediction.");
  }
  if (!tensor) {
    throw new Error("Input tensor is not available for prediction.");
  }

  const output = model.predict(tensor) as any; // Cast to 'any' for simplicity
  const predictionArray = await output.data();
  output.dispose(); // Dispose output tensor

  // Find the index of the highest probability
  let maxProb = -1;
  let digit = -1;
  for (let i = 0; i < predictionArray.length; i++) {
    if (predictionArray[i] > maxProb) {
      maxProb = predictionArray[i];
      digit = i;
    }
  }
  return digit;
};
