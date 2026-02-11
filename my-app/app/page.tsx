'use client'

import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Frontend running");
  const [backendStatus, setBackendStatus] = useState("");

  const checkBackend = async () => {
    try {
      setBackendStatus("Checking backend...");
      const res = await fetch("/api/health");
      const data = await res.json();
      setBackendStatus(`✅ Backend OK: ${data.message}`);
    } catch (err) {
      setBackendStatus("❌ Backend error");
    }
  };

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0070f3' }}>AI Summary App</h1>
      <p>{status}</p>
      {/* 新增检查后端按钮 */}
      <button 
        onClick={checkBackend}
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        check API
      </button>
      <p style={{ marginTop: '1rem' }}>{backendStatus}</p>
      <p style={{ marginTop: '1rem' }}>Next: deploy this to Vercel, then add API routes.</p>
    </div>
  );
}