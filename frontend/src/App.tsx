import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  return (
    <div>
      <Navbar
        activePage="command"
        operatorName="Captain Singh"
        notificationCount={5}
        isOperational={true}
      />

      <Dashboard />
    </div>
  );
}

export default App;