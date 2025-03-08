import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div class="border border-red-500 bg-yellow-200 p-4">Debugging Div</div>
    </>
  );
}

export default App;
