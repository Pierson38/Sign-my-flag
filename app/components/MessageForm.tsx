"use client";

import { useState, useRef } from "react";
import { computeDesiredSpan } from "@/lib/grid";
import { Lang, t } from "@/lib/i18n";

const COLOR_PALETTE = [
  { value: "#1a1a1a", label: "Noir" },
  { value: "#dc2626", label: "Rouge" },
  { value: "#2563eb", label: "Bleu" },
  { value: "#16a34a", label: "Vert" },
  { value: "#9333ea", label: "Violet" },
  { value: "#ea580c", label: "Orange" },
  { value: "#ec4899", label: "Rose" },
  { value: "#ffffff", label: "Blanc" },
];

interface MessageFormProps {
  gridRow: number;
  gridCol: number;
  maxSpan: number;
  lang: Lang;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MessageForm({
  gridRow,
  gridCol,
  maxSpan,
  lang,
  onClose,
  onSuccess,
}: MessageFormProps) {
  const tr = t(lang);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("#1a1a1a");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const desiredSpan = computeDesiredSpan(message.length);
  const actualSpan = Math.min(desiredSpan, maxSpan);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(tr.formImageTooLarge);
      return;
    }
    setImageFile(file);
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      setError(tr.formAllRequired);
      return;
    }

    setSubmitting(true);
    try {
      // Get reCAPTCHA token
      let recaptchaToken = "";
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (siteKey && window.grecaptcha) {
        try {
          recaptchaToken = await window.grecaptcha.execute(siteKey, {
            action: "submit_message",
          });
        } catch {
          setError(tr.formError);
          setSubmitting(false);
          return;
        }
      }

      // Upload image first if present
      let imagePath: string | null = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          setError(data.error || tr.formUploadError);
          setSubmitting(false);
          return;
        }
        const uploadData = await uploadRes.json();
        imagePath = uploadData.filename;
      }

      // Create message
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          message,
          gridRow,
          gridCol,
          color,
          imagePath,
          recaptchaToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || tr.formError);
        return;
      }

      onSuccess();
    } catch {
      setError(tr.formConnectionError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-3 text-gray-900">
          {tr.formTitle}
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Two-column layout on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left column: personal info */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tr.formFirstName}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder={tr.formFirstName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tr.formLastName}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder={tr.formLastName}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tr.formEmail}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={lang === "fr" ? "ton@email.com" : "your@email.com"}
                />
              </div>

              {/* Color palette */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tr.formColor}
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      title={c.label}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c.value
                          ? "border-amber-500 scale-110"
                          : "border-gray-300"
                      }`}
                      style={{
                        backgroundColor: c.value,
                        boxShadow:
                          c.value === "#ffffff"
                            ? "inset 0 0 0 1px #d1d5db"
                            : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tr.formImage}
                </label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Apercu"
                      className="h-16 rounded-lg border border-gray-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      x
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors"
                  >
                    {tr.formAddImage}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Right column: message + preview */}
            <div className="flex flex-col gap-3">
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tr.formMessage}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full flex-1 min-h-[120px] border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder={tr.formMessagePlaceholder}
                />
                {message.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {actualSpan}{" "}
                    {actualSpan > 1 ? tr.formCellsPlural : tr.formCells}
                    {desiredSpan > maxSpan && (
                      <span className="text-amber-600">
                        {" "}
                        ({tr.formMaxHere.replace("{n}", String(maxSpan))})
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-xs text-gray-400 block mb-1">{tr.formPreview}</span>
                <span
                  style={{
                    color,
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  {message || tr.formPreviewMessage} — {firstName || tr.formPreviewFirstName}
                </span>
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

          <div className="flex gap-3 pt-3 mt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              {tr.formCancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 text-sm"
            >
              {submitting ? tr.formSubmitting : tr.formSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
