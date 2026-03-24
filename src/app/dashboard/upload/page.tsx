"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { processClaimUpload } from "./actions";
import { Upload, FileText, Info } from "lucide-react";

export default function UploadClaimsPage() {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDrag = function (e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = function (e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setIsUploading(true);
        setProgress(5);

        try {
            const formData = new FormData();
            const batchFiles = files.slice(0, 10);
            batchFiles.forEach(file => formData.append("files", file));

            setProgress(25);

            const result = await processClaimUpload(formData);

            if (!result.success) {
                console.error("Processing failed:", result.error || "Unknown Error");
                alert("Upload failed: " + (result.error || "Unknown error. Try a different file."));
                setIsUploading(false);
                setProgress(0);
                return;
            }

            setProgress(60);

            // Auto-generate appeal letters for extracted claims
            try {
                const appealRes = await fetch('/api/claims/generate-appeals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ batchId: result.batchId }),
                });
                const appealData = await appealRes.json();
                console.log(`Appeals generated: ${appealData.appealsGenerated}/${appealData.total}`);
            } catch (e) {
                console.warn("Appeal auto-generation skipped:", e);
            }

            setProgress(95);
            window.location.href = `/dashboard/review?batchId=${result.batchId}`;

        } catch (error) {
            console.error("Upload error:", error);
            alert("An error occurred during upload. Please try again.");
            setIsUploading(false);
            setProgress(0);
        }
    };

    return (
        <div style={{ maxWidth: "800px" }}>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Upload size={20} style={{ color: "var(--brand-primary)" }} />
                    Upload <span className="text-gradient">Claims</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    Securely ingest 835 ERA files, EOB PDFs, or CSV exports from your EHR.
                </p>
            </div>

            <div className="dash-content-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
                {/* Upload Zone */}
                <div
                    style={{
                        padding: "3rem 2rem",
                        textAlign: "center",
                        border: `2px dashed ${dragActive ? "var(--brand-primary)" : "var(--border-subtle)"}`,
                        background: dragActive ? "rgba(0, 242, 255, 0.03)" : "var(--bg-card)",
                        borderRadius: "var(--radius-xl)",
                        transition: "all 0.2s ease",
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {!isUploading ? (
                        <>
                            <Upload size={32} style={{ color: "var(--text-muted)", margin: "0 auto 1rem" }} />
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.375rem" }}>Drag and drop files here</h3>
                            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.8rem" }}>
                                <strong>Accepted:</strong> PDF, CSV, or TXT &mdash; HIPAA compliant encryption at rest.
                            </p>

                            <input
                                type="file"
                                multiple
                                id="file-upload"
                                style={{ display: "none" }}
                                onChange={handleChange}
                                accept=".pdf,.csv,.txt"
                            />
                            <Button onClick={() => document.getElementById("file-upload")?.click()} variant="outline">
                                Browse Files
                            </Button>

                            {files.length > 0 && (
                                <div style={{
                                    marginTop: "2rem", textAlign: "left",
                                    background: "rgba(0,0,0,0.2)", padding: "1rem",
                                    borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)",
                                }}>
                                    <h4 style={{ fontSize: "0.7rem", fontWeight: "600", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.75rem", letterSpacing: "0.04em" }}>
                                        Selected Files
                                    </h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                                        {files.map((f, i) => (
                                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                                                <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: "500" }}>
                                                    <FileText size={12} style={{ color: "var(--text-muted)" }} />
                                                    {f.name}
                                                </span>
                                                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end" }}>
                                        <Button onClick={handleUpload}>Run AI Analysis</Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ padding: "1.5rem 0" }}>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem" }}>
                                {progress < 100 ? "Analyzing medical codes..." : "Analysis Complete"}
                            </h3>
                            <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", marginBottom: "0.75rem" }}>
                                <div style={{ width: `${progress}%`, height: "100%", background: "var(--brand-primary)", transition: "width 0.3s", borderRadius: "2px" }} />
                            </div>
                            <div style={{ color: "var(--brand-primary)", fontWeight: "700", fontSize: "0.9rem" }}>{progress}%</div>
                            {progress === 100 && (
                                <p style={{ color: "#10b981", marginTop: "0.75rem", fontWeight: "600", fontSize: "0.85rem" }}>
                                    Redirecting to Review...
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Info Panel */}
                <div style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-xl)",
                    padding: "1.5rem",
                }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Info size={16} style={{ color: "var(--brand-primary)" }} />
                        How It Works
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {[
                            { step: "1", title: "Upload Files", desc: "Drop your ERA 835, EOB PDFs, or CSV claim exports." },
                            { step: "2", title: "AI Analysis", desc: "Our system parses CPT codes, denial reasons, and payer data." },
                            { step: "3", title: "Review & Appeal", desc: "Review AI-drafted appeal letters and approve for submission." },
                        ].map((item) => (
                            <div key={item.step} style={{ display: "flex", gap: "0.75rem" }}>
                                <div style={{
                                    width: "24px", height: "24px", borderRadius: "50%",
                                    background: "rgba(0, 242, 255, 0.1)", border: "1px solid rgba(0, 242, 255, 0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "0.7rem", fontWeight: "700", color: "var(--brand-primary)",
                                    flexShrink: 0,
                                }}>{item.step}</div>
                                <div>
                                    <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.125rem" }}>{item.title}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
