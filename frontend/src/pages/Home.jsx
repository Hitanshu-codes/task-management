import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Home() {
    const [health, setHealth] = useState('loading...');

    useEffect(() => {
        fetch(`${API_URL}/api/health`)
            .then((r) => r.json())
            .then((d) => setHealth(d.status || 'ok'))
            .catch(() => setHealth('error'));
    }, []);

    return (
        <div style={{ padding: 16 }}>
            <h1>Task Management Starter</h1>
            <p>Backend health: {health}</p>
        </div>
    );
}
