import { Routes, Route } from "react-router-dom";
import AutoCrop from "./pages/AutoCrop";
import TextractOCR from "./pages/TextractOCR";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AutoCrop />} />
      <Route path="/textract" element={<TextractOCR />} />
    </Routes>
  );
};

export default App;
