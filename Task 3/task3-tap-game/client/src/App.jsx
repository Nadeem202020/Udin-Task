import { createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSocket } from "./hooks/useSocket";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import ResultsPage from "./pages/ResultsPage";
import "./App.css";

/**
 * GameContext — provides socket, connected, clockSynced to all components
 */
const GameContext = createContext();

export function useGame() {
  return useContext(GameContext);
}

function AppContent() {
  const { socket, connected, clockSynced } = useSocket("http://localhost:4000");

  return (
    <GameContext.Provider value={{ socket, connected, clockSynced }}>
      <Routes>
        <Route
          path="/"
          element={
            <LobbyPage
              socket={socket}
              connected={connected}
              clockSynced={clockSynced}
            />
          }
        />
        <Route
          path="/game"
          element={
            <GamePage
              socket={socket}
              connected={connected}
              clockSynced={clockSynced}
            />
          }
        />
        <Route
          path="/results"
          element={
            <ResultsPage
              socket={socket}
              connected={connected}
              clockSynced={clockSynced}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </GameContext.Provider>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
