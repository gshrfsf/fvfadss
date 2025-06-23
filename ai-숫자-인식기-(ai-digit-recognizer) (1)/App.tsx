
import React, { useState, useEffect, useRef, useCallback } from 'react';
import DigitCanvas from './components/DigitCanvas';
import { loadModel, preprocessCanvasData, predictDigit } from './services/mnistModelService';

// Make tf globally accessible for mnistModelService if not properly typed/imported there for this simple setup
declare const tf: any;

const App: React.FC = () => {
  const [model, setModel] = useState<any | null>(null); // Using 'any' for tf.LayersModel for simplicity with Babel Standalone
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const initModel = async () => {
      if (!tf) {
        setError("TensorFlow.js is not loaded. Please check your internet connection and ensure the library is included.");
        setIsLoadingModel(false);
        return;
      }
      try {
        setError(null);
        setIsLoadingModel(true);
        const loadedModel = await loadModel();
        setModel(loadedModel);
      } catch (err) {
        console.error("Error loading model:", err);
        setError("Failed to load the AI model. Please try refreshing the page.");
      } finally {
        setIsLoadingModel(false);
      }
    };
    initModel();
  }, []);

  const handlePredict = useCallback(async () => {
    if (!model || !canvasRef.current) {
      setError("Model or canvas not ready.");
      return;
    }
    if (canvasRef.current.dataset.isEmpty === 'true') {
        setError("Please draw a digit first.");
        return;
    }

    setIsPredicting(true);
    setError(null);
    setPrediction(null);

    try {
      const tensor = preprocessCanvasData(canvasRef.current);
      const predictedDigit = await predictDigit(model, tensor);
      setPrediction(predictedDigit.toString());
      tensor.dispose(); // Dispose tensor to free memory
    } catch (err) {
      console.error("Error predicting digit:", err);
      setError("Could not recognize the digit. Please try again.");
    } finally {
      setIsPredicting(false);
    }
  }, [model]);

  const handleClear = useCallback(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        context.fillStyle = "white";
        context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasRef.current.dataset.isEmpty = 'true';
      }
    }
    setPrediction(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex flex-col items-center justify-center p-4 text-white selection:bg-sky-500 selection:text-white">
      <div className="bg-slate-800 shadow-2xl rounded-xl p-6 md:p-10 w-full max-w-lg transition-all duration-300 ease-in-out">
        <header className="text-center mb-6 md:mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400">
            AI 숫자 인식기
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">손으로 숫자를 그리면 AI가 맞혀봅니다!</p>
        </header>

        <main>
          <div className="mb-6 aspect-square w-full max-w-md mx-auto bg-white rounded-lg shadow-inner overflow-hidden border-4 border-slate-700">
            <DigitCanvas ref={canvasRef} width={280} height={280} />
          </div>

          {isLoadingModel && (
            <div className="text-center p-4 bg-slate-700 rounded-md">
              <p className="text-sky-300 animate-pulse">AI 모델을 불러오는 중... 🧠</p>
            </div>
          )}

          {error && (
            <div className="text-center p-3 mb-4 bg-red-500/20 text-red-300 rounded-md border border-red-400">
              <p>{error}</p>
            </div>
          )}

          {!isLoadingModel && !error && prediction !== null && (
            <div className="text-center p-4 mb-4 bg-green-500/20 text-green-300 rounded-md border border-green-400">
              <p className="text-xl">AI 예측: <span className="font-bold text-3xl text-green-200">{prediction}</span></p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handlePredict}
              disabled={isLoadingModel || isPredicting || !model}
              className="w-full flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transform hover:scale-105 active:scale-95"
            >
              {isPredicting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  인식 중...
                </div>
              ) : (
                "예측하기"
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={isPredicting}
              className="w-full flex-1 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 transform hover:scale-105 active:scale-95"
            >
              지우기
            </button>
          </div>
        </main>
        
        <footer className="text-center mt-8 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500">TensorFlow.js & MNIST Model</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
