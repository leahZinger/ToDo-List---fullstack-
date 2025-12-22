import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login"; 
import TodoList from "./TodoList"; 

function App() {
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/tasks" 
          element={isAuthenticated() ? <TodoList /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/tasks" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;