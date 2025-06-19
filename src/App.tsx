import { Routes, Route } from "react-router-dom";
import AutoCrop from "./pages/AutoCrop";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AutoCrop />} />
    </Routes>
  );
};

export default App;
