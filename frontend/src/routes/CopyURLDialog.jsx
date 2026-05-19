import { useState } from "react";
import { Copy, Check, X, Link } from "lucide-react";

/**
 * CopyURLDialog
 *
 * Props:
 *  - imageUrl  : string  — the original Cloudinary URL
 *  - isOpen    : boolean
 *  - onClose   : () => void
 */

export default function CopyURLDialog({ imageUrl, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  /* build share URL:  /share/<base64url-encoded cloudinary URL> */
  const encoded = btoa(imageUrl)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const shareURL = `${window.location.origin}/share/${encoded}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback for older browsers */
      const el = document.createElement("textarea");
      el.value = shareURL;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* dialog box */}
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 animate-fade-up">
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
              <Link className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-white font-semibold text-base">Share Photo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* description */}
        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
          Anyone with this link can view the photo. Click the URL to copy it.
        </p>

        {/* URL row — click to copy */}
        <button
          onClick={handleCopy}
          className="w-full flex items-center gap-3 px-4 py-3
                     bg-slate-900 border border-slate-700 hover:border-indigo-500
                     rounded-xl transition-colors group text-left"
        >
          {/* url text */}
          <span className="flex-1 text-slate-300 text-sm truncate font-mono">
            {shareURL.slice(0, 45) + (shareURL.length > 45 ? "..." : "")}
          </span>

          {/* copy icon */}
          <span
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center
                           rounded-lg bg-slate-700 group-hover:bg-indigo-600 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-300 group-hover:text-white" />
            )}
          </span>
        </button>

        {/* copy feedback */}
        <p
          className={`mt-2.5 text-center text-xs transition-opacity duration-300
                       ${copied ? "text-green-400 opacity-100" : "text-transparent opacity-0"}`}
        >
          ✓ Link copied to clipboard!
        </p>

        {/* actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium
                       bg-slate-700 hover:bg-slate-600 border border-slate-600
                       text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2
                       py-2.5 px-4 rounded-lg text-sm font-semibold
                       bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
