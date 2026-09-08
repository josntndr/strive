"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onAccept?: () => void;
}

export const Modal = ({ isOpen, onClose, title, children, onAccept }: ModalProps) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
      // Move focus into the dialog so keyboard/screen-reader users start inside it.
      const id = requestAnimationFrame(() => closeRef.current?.focus());
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleEsc);
        cancelAnimationFrame(id);
      };
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100/80 flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-300"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="text-xl font-black text-slate-900 leading-tight truncate"
            >
              {title}
            </h2>
            {/* Colored accent underline */}
            <div className="mt-1.5 h-0.5 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-300" />
          </div>

          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="flex-shrink-0 p-2 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-colors text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto text-slate-700 leading-relaxed text-sm sm:text-base flex-1">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/60 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-slate-600 border border-slate-200 hover:bg-white hover:border-slate-300 rounded-xl transition-all"
          >
            Close
          </button>
          {onAccept && (
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-6 py-2 text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl transition-all shadow-md shadow-blue-100 active:scale-95"
            >
              Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
