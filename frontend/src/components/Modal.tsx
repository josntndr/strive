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
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-300"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto text-slate-700 leading-relaxed text-sm sm:text-base">
          {children}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
          >
            Close
          </button>
          {onAccept && (
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-100"
            >
              Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
