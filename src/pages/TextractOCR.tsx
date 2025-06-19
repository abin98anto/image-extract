import React, { useState } from "react";

type ExtractedField = {
  type: string;
  value: string;
  confidence: number;
};

const TextractOCR: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFields([]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("file", image);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/textract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Response data:", data);

      // The backend returns { fields: [...] } based on your AnalyzeID code
      setFields(data.fields || []);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const formatFieldType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      {/* Left Side: Upload + Preview */}
      <div
        style={{
          width: "50%",
          padding: "2rem",
          borderRight: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ marginBottom: "2rem", fontSize: "1.8rem" }}>
          Upload Document
        </h2>

        <div style={{ marginBottom: "1rem", width: "100%" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
            }}
          >
            Select ID Document
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!image || loading}
          style={{
            width: "100%",
            marginBottom: "2rem",
            opacity: !image || loading ? 0.6 : 1,
          }}
        >
          {loading ? "Analyzing..." : "Analyze Document"}
        </button>

        {error && (
          <div
            style={{
              width: "100%",
              padding: "1rem",
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            <p style={{ color: "#991b1b", fontSize: "0.875rem", margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {previewUrl ? (
          <div style={{ width: "100%" }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>
              Document Preview
            </h3>
            <div className="img-placeholder">
              <img src={previewUrl} alt="Uploaded Document" />
            </div>
          </div>
        ) : (
          <div style={{ width: "100%" }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>
              Document Preview
            </h3>
            <div className="img-placeholder">
              <span>No document selected</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Extracted Data */}
      <div style={{ width: "50%", padding: "2rem" }}>
        <h3
          style={{
            marginBottom: "2rem",
            fontSize: "1.8rem",
            textAlign: "center",
          }}
        >
          Extracted Information
        </h3>

        {loading && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div
              style={{
                display: "inline-block",
                width: "32px",
                height: "32px",
                border: "3px solid #f3f3f3",
                borderTop: "3px solid #646cff",
                borderRadius: "50%",
                animation: "logo-spin 1s linear infinite",
              }}
            ></div>
            <p style={{ marginTop: "1rem", color: "#666" }}>
              Processing document...
            </p>
          </div>
        )}

        {!loading && fields.length === 0 && (
          <div
            style={{ textAlign: "center", padding: "3rem 0", color: "#666" }}
          >
            <p>
              No data extracted yet. Upload and analyze a document to see
              results.
            </p>
          </div>
        )}

        {!loading && fields.length > 0 && (
          <div style={{ textAlign: "left", lineHeight: "2" }}>
            {fields.map((field, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <strong>{formatFieldType(field.type)}:</strong>{" "}
                {field.value || "Not detected"}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextractOCR;
