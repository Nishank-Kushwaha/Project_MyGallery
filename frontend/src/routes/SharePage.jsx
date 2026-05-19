import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Download,
  Copy,
  Check,
  AlertTriangle,
  ImageOff,
  ArrowLeft,
} from "lucide-react";

export default function SharePage() {
  const { encoded } = useParams();

  const [imageUrl, setImageUrl] = useState(null);
  const [status, setStatus] = useState("loading");

  const [meta, setMeta] = useState({
    name: "",
    size: "",
    width: 0,
    height: 0,
  });

  const [copied, setCopied] = useState(false);

  // Decode shared URL
  useEffect(() => {
    if (!encoded) {
      setStatus("invalid");
      return;
    }

    try {
      const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");

      const decoded = atob(b64);

      setImageUrl(decoded);
    } catch {
      setStatus("invalid");
    }
  }, [encoded]);

  // Load image + metadata
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();

    img.crossOrigin = "anonymous";

    img.onload = () => {
      const name = decodeURIComponent(imageUrl.split("/").pop().split("?")[0]);

      fetch(imageUrl, { method: "HEAD" })
        .then((r) => {
          const bytes = parseInt(r.headers.get("content-length") || "0", 10);

          const size = bytes
            ? bytes > 1024 * 1024
              ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
              : `${Math.round(bytes / 1024)} KB`
            : "Unknown";

          setMeta({
            name,
            size,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        })
        .catch(() => {
          setMeta({
            name,
            size: "Unknown",
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        });

      setStatus("ready");
    };

    img.onerror = () => {
      setStatus("error");
    };

    img.src = imageUrl;
  }, [imageUrl]);

  // Copy share link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  // Handle download
  const handleDownload = async () => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = meta.name || "download";
    link.click();

    URL.revokeObjectURL(blobUrl);
  };

  // LOADING
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin" />

        <p className="text-slate-400 text-sm">Loading photo...</p>
      </div>
    );
  }

  // INVALID LINK
  if (status === "invalid") {
    return (
      <ErrorCard
        icon={<ImageOff className="w-10 h-10 text-slate-500" />}
        title="Invalid share link"
        message="This link is malformed or incomplete."
      />
    );
  }

  // IMAGE FAILED
  if (status === "error") {
    return (
      <ErrorCard
        icon={<AlertTriangle className="w-10 h-10 text-yellow-500/60" />}
        title="Couldn't load image"
        message="The image may have been deleted or the URL is invalid."
        sub={imageUrl}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* IMAGE AREA */}
        <div
          className="
            bg-slate-950
            flex
            items-center
            justify-center
            p-6
          "
        >
          <img
            src={imageUrl}
            alt={meta.name}
            draggable={false}
            className="
              max-w-full
              max-h-[65vh]
              object-contain
              rounded-2xl
              shadow-2xl
              select-none
            "
          />
        </div>

        {/* Outer grid: 2 cols on laptop, 1 col on phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {/* Inner grid: 3 equal cols spanning full width */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <DetailPill
              icon="📄"
              value={meta.name.split("-")[1] || "Unknown"}
            />

            <DetailPill icon="📐" value={`${meta.width} × ${meta.height}px`} />

            <DetailPill icon="💾" value={meta.size || "Unknown"} />
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            {/* COPY */}
            <button
              onClick={copyLink}
              className="
        h-10
        px-4
        rounded-xl
        bg-slate-800
        hover:bg-slate-700
        border
        border-slate-700
        flex
        items-center
        justify-center
        gap-2
        text-sm
        font-medium
        text-white
        transition-all
      "
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>

            {/* DOWNLOAD */}
            <button
              onClick={handleDownload}
              className="
                h-10
                px-4
                rounded-xl
                bg-indigo-600
                hover:bg-indigo-700
                flex
                items-center
                justify-center
                gap-2
                text-sm
                font-semibold
                text-white
                transition-all
              "
            >
              <Download className="w-4 h-4" />
              Download
            </button>

            {/* BACK */}
            <Link
              to="/"
              className="
        h-10
        px-4
        rounded-xl
        bg-slate-950
        hover:bg-slate-800
        border
        border-slate-700
        flex
        items-center
        justify-center
        gap-2
        text-sm
        font-medium
        text-slate-300
        hover:text-white
        transition-all
      "
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailPill({ icon, value }) {
  return (
    <div
      className="
        bg-slate-950
        border
        border-slate-800
        rounded-xl
        px-3
        py-2
        flex
        items-center
        justify-center
        gap-2
        min-w-0
      "
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xl text-slate-300 truncate">{value}</span>
    </div>
  );
}
function ErrorCard({ icon, title, message, sub }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div
        className="
          w-full
          max-w-md
          bg-slate-900
          border
          border-slate-800
          rounded-3xl
          p-10
          flex
          flex-col
          items-center
          text-center
          gap-5
          shadow-2xl
        "
      >
        {icon}

        <h2 className="text-white text-xl font-semibold">{title}</h2>

        <p className="text-slate-400 text-sm leading-relaxed">{message}</p>

        {sub && <p className="text-xs text-slate-600 break-all">{sub}</p>}

        <Link
          to="/"
          className="
            mt-2
            bg-indigo-600
            hover:bg-indigo-700
            text-white
            font-semibold
            py-2.5
            px-6
            rounded-xl
            transition-all
            text-sm
          "
        >
          ← Back to Gallery
        </Link>
      </div>
    </div>
  );
}
