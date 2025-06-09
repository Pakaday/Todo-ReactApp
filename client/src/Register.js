import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/Users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to register new user');
            }

            await response.json();
            navigate('/login');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="App">
            <button onClick={() => window.location.href = '/'}>Go Back</button>
            <form onSubmit={handleSubmit}>
                <h1>Register</h1>
                <input
                type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}
export default Register;