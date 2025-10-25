import { useState, useRef, useEffect } from "react";
import Store from "../store";
import { useNavigate } from "react-router-dom";
import { FlipHorizontal2, RefreshCw } from "lucide-react";

export default function CameraCaptureDialog() {
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // "user" = front, "environment" = back
  const [facingMode, setFacingMode] = useState(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isMobile ? "environment" : "user"; // back camera on mobile, front on desktop
  });
  const [isSwitching, setIsSwitching] = useState(false);

  // NEW: Mirror toggle state - default true for natural mirror effect
  const [mirrorFrontCamera, setMirrorFrontCamera] = useState(true);

  const navigate = useNavigate();

  const openDialog = async () => {
    setIsOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setIsOpen(false);
    }
  };

  const closeDialog = () => {
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Reset all states
    setIsOpen(false);
    setPreview(null);
    setPhoto(null);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      // Apply mirroring only if front camera AND mirror toggle is ON
      if (facingMode === "user" && mirrorFrontCamera) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        setPhoto(file);
        setPreview(URL.createObjectURL(blob));
      }, "image/jpeg");
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return alert("Please capture a photo first!");
    if (!description.trim()) return alert("Please enter a description.");

    const { loginStatus, loginData } = Store.getState().login;

    console.log("LoginStatus in Upload form", loginStatus);
    console.log("LoginData in Upload form", loginData);

    const formData = new FormData();
    formData.append("photo", photo);
    formData.append("description", description);

    formData.append("userStatus", loginStatus);
    formData.append("userData", JSON.stringify(loginData));

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/photo/uploadphoto`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      const data = await res.json();
      alert(`✅ Uploaded successfully!\nURL: ${data.data.fileUrl}`);
      closeDialog();
      setDescription("");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
      navigate("/cameracapture");
    }
  };

  const handleRetake = async () => {
    setPreview(null);
    setPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setIsOpen(false);
    }
  };

  const switchCamera = async () => {
    // If already switching, ignore repeated clicks
    if (isSwitching) return;

    setIsSwitching(true);

    // Stop current camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Toggle facing mode
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newMode },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error switching camera:", err);
      alert("Could not switch camera. Please check permissions.");
    } finally {
      // small delay to allow animation to be visible; remove/change as desired
      setTimeout(() => setIsSwitching(false), 600);
    }
  };

  // NEW: Toggle mirror function
  const toggleMirror = () => {
    setMirrorFrontCamera(!mirrorFrontCamera);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Determine if we should apply mirror effect to preview
  const shouldMirrorPreview = facingMode === "user" && mirrorFrontCamera;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Input Dialog box*/}
      {!isOpen && (
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-white text-2xl font-semibold">Capture Photo</h2>
          </div>

          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 space-y-6">
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-300 mb-3"
              >
                Description
              </label>
              <input
                id="description"
                type="text"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description about your photo"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Mirror Setting Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
              <div className="flex items-center gap-3">
                <FlipHorizontal2 className="w-5 h-5 text-slate-300" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Mirror Front Camera
                  </p>
                  <p className="text-xs text-slate-400">
                    Save selfies as mirror image
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleMirror}
                role="switch"
                aria-checked={mirrorFrontCamera}
                style={{
                  position: "relative",
                  display: "inline-flex",
                  height: "24px",
                  width: "44px",
                  flexShrink: 0,
                  alignItems: "center",
                  borderRadius: "9999px",
                  transitionProperty: "background-color",
                  transitionDuration: "200ms",
                  outline: "none",
                  backgroundColor: mirrorFrontCamera ? "#4f46e5" : "#64748b",
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow =
                    "0 0 0 2px #1e293b, 0 0 0 4px #4f46e5";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    height: "16px",
                    width: "16px",
                    transform: mirrorFrontCamera
                      ? "translateX(24px)"
                      : "translateX(4px)",
                    borderRadius: "9999px",
                    backgroundColor: "#ffffff",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    transitionProperty: "transform",
                    transitionDuration: "200ms",
                  }}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={openDialog}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              📷 Open Camera
            </button>
          </div>
        </div>
      )}

      {/* Camera Dialog box*/}
      {isOpen && (
        <div className="inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md relative shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-semibold">
                {!preview ? "Capture Photo" : "Preview Photo"}
              </h2>

              {/* Mirror indicator - only show when front camera is active and not in preview */}
              {!preview && facingMode === "user" && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FlipHorizontal2 className="w-4 h-4" />
                  <span>{mirrorFrontCamera ? "Mirror ON" : "Mirror OFF"}</span>
                </div>
              )}
            </div>

            <div className="relative w-full aspect-video bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center">
              {!preview ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-contain bg-black`}
                    style={{
                      transform: `${
                        shouldMirrorPreview ? "scaleX(-1) " : "scaleX(1)"
                      }`,
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </>
              ) : (
                <img
                  src={preview}
                  alt="Captured preview"
                  className="w-full h-full object-contain bg-black"
                />
              )}
            </div>

            <div className="flex justify-between gap-3 mt-4">
              {!preview ? (
                <>
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Capture
                  </button>

                  <button
                    onClick={switchCamera}
                    aria-label="Switch camera"
                    className="flex items-center justify-center gap-2 flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <RefreshCw
                      className={`w-5 h-5 ${isSwitching ? "animate-spin" : ""}`}
                    />
                    <span className="text-sm font-medium">Switch Camera</span>
                  </button>

                  <button
                    onClick={closeDialog}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRetake}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Retake
                  </button>
                  <button
                    onClick={uploadPhoto}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Upload
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
