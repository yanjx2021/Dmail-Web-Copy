import React from "react";
import { Route, Routes } from "react-router-dom";
import Test from "./Test";
import Home from "./Home";

// 该组件用于切换路由，当然现在只是naive的测试版本
function App() {
    return (
        <main>
            <Routes>
                <Route path="/test" element={<Test />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </main>
    );
}

export default App;
