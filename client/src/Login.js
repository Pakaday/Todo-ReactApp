import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

function Login({ setUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/Users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            setUser(data.token);
            navigate('/TodoItems');
        } catch (error) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="App">
            <h1>SmartTask</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                    type="submit">
                    Login
                </button>
                <button
                    type="button"
                    placeholder="Register"
                    onClick={() =>
                        navigate('/register')}>
                    Register New User
                </button>
                <button
                    type="button"
                    placeholder="Guest"
                    onClick={() => {
                        localStorage.setItem('token', 'guest');
                        setUser('guest');
                        navigate('/TodoItems');
                    }} >
                    Continue as Guest
                </button>
            </form>
        </div>
    );

}


export default Login;