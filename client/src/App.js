import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import TodoList from './TodoList';
import Register from './Register';
import './App.css';

function App() {
    const token = localStorage.getItem('token');
    const [user, setUser] = useState(null); // Guest if null

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/TodoItems"
                    element={user ? <TodoList user={user} /> : <Navigate to="/login" />}
                />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;