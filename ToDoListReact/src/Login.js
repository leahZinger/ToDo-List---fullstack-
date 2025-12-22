import React, { useState } from 'react';
import api from './services/api'; 
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { 
                username: username, 
                password: password 
            });

            localStorage.setItem('token', response.data.token);
            
            navigate('/tasks');
        } catch (err) {
            console.error("Login error:", err);
            setError("שם משתמש או סיסמה שגויים");
        }
    };

    return (
        <div style={{ direction: 'rtl', textAlign: 'center', marginTop: '50px' }}>
            <h2>התחברות למערכת</h2>
            <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'right' }}>
                <div>
                    <label>שם משתמש:</label><br/>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>סיסמה:</label><br/>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ marginTop: '20px', width: '100%', cursor: 'pointer' }}>
                    התחבר
                </button>
            </form>
        </div>
    );
}

export default Login;