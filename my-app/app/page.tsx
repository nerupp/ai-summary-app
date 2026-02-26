'use client'

import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Frontend running");
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function checkBackend() {
    setStatus("Checking backend...");
    const res = await fetch('/api/health');
    const data = await res.json();
    setStatus(`Backend says: ${data.message}`);
  }

  // 修复：强制识别选中的文件，不限制类型（先让按钮可用）
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus(`Selected file: ${file.name} (Type: ${file.type})`);
      console.log("File selected:", file); // 控制台打印文件信息，便于排查
    } else {
      setSelectedFile(null);
      setUploadStatus("No file selected");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first");
      return;
    }

    setUploadStatus("Uploading file...");
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload', {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (data.ok) {
        setUploadStatus(`Upload success! File URL: ${data.fileUrl}`);
      } else {
        setUploadStatus(`Upload failed: ${data.error}`);
      }
    } catch (err) {
      setUploadStatus(`Upload error: ${(err as Error).message}`);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>AI Summary App</h1>
      <button onClick={checkBackend} style={{ padding: 8, margin: 10 }}>
        Check backend
      </button>
      <p>{status}</p>

      <div style={{ marginTop: 20, borderTop: "1px solid #ddd", paddingTop: 20 }}>
        <h3>Document Upload</h3>
        {/* 修复：暂时去掉 accept 限制，先让文件能被选中 */}
        <input
          type="file"
          onChange={handleFileChange}
          style={{ margin: 10 }}
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          style={{
            padding: 8,
            backgroundColor: selectedFile ? "#27ae60" : "#bdc3c7",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: selectedFile ? "pointer" : "not-allowed"
          }}
        >
          Upload File
        </button>
        <p style={{ marginTop: 10, color: "#666" }}>{uploadStatus}</p>
      </div>
    </div>
  );
}