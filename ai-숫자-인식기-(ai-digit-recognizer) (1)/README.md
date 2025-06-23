
# AI 숫자 인식기 (AI Digit Recognizer)

이 웹 애플리케이션은 사용자가 캔버스에 숫자를 그리면 AI가 해당 숫자를 인식합니다. TensorFlow.js와 사전 훈련된 MNIST 모델을 사용합니다.

This web application allows users to draw a digit on a canvas, and an AI will attempt to recognize it. It uses TensorFlow.js and a pre-trained MNIST model.

## 실행 방법 (How to Run)

이 애플리케이션은 빌드 과정 없이 브라우저에서 직접 실행할 수 있도록 설계되었습니다.

This application is designed to run directly in your browser without a build step.

1.  **파일 다운로드 (Download Files):**
    *   `index.html`
    *   `index.tsx`
    *   `App.tsx`
    *   `components/DigitCanvas.tsx`
    *   `services/mnistModelService.ts`
    *   `metadata.json` (optional, for app info)

2.  **동일 디렉토리에 배치 (Place in Same Directory):**
    다운로드한 모든 파일을 컴퓨터의 한 폴더 안에 함께 넣어주세요.
    Place all the downloaded files together in the same folder on your computer.

3.  **`index.html` 파일 열기 (Open `index.html`):**
    웹 브라우저 (Chrome, Firefox, Edge, Safari 등 최신 버전 권장)를 사용하여 `index.html` 파일을 여세요.
    Open the `index.html` file using a modern web browser (e.g., latest versions of Chrome, Firefox, Edge, Safari).

4.  **인터넷 연결 (Internet Connection):**
    애플리케이션은 React, Tailwind CSS, TensorFlow.js 라이브러리 및 MNIST 모델을 CDN을 통해 로드합니다. 따라서 실행 시 인터넷 연결이 필요합니다.
    The application loads React, Tailwind CSS, TensorFlow.js libraries, and the MNIST model via CDNs. An active internet connection is required for it to run.

## 기술 스택 (Tech Stack)

*   React 18
*   TypeScript
*   Tailwind CSS (CDN)
*   TensorFlow.js (CDN)
*   Babel Standalone (for in-browser TSX/JSX transpilation)
*   MNIST (pre-trained model)

## 주의사항 (Notes)

*   최상의 인식률을 위해 숫자를 캔버스 중앙에 크고 명확하게 그려주세요.
    For best recognition results, draw the digit large and clear in the center of the canvas.
*   이 애플리케이션은 데모 및 학습 목적으로 제작되었습니다.
    This application is intended for demonstration and educational purposes.
