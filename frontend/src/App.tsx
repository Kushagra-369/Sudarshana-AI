import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./components/Dashboard/Dashboard";
import Surveillance from "./components/Surveillance/Surveillance";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Threats from "./components/Threats/Threats";
import Incidents from "./components/Incidents/Incidents";
import Timeline from "./components/Timeline/Timeline";
import Analytics from "./components/Analytics/Analytics";
import AI_Assistant from "./components/AI_Assistant/AI_Assistant";
function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar
          activePage="command"
          operatorName="Captain Singh"
          notificationCount={5}
          isOperational={true}
        />
        <Routes>

          <Route path="/" element={<Navigate to="/command" replace />} />

          <Route path="/command" element={<Dashboard />} />

          <Route path="/surveillance" element={<Surveillance />} />

          <Route path="/threats" element={<Threats />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/assistant" element={<AI_Assistant />} />


        </Routes>

      </div>
    </BrowserRouter>

  );
}

export default App;