"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children, testid = "modal" }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; testid?: string }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose} data-testid={`${testid}-overlay`}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid={testid}>
        <div className="traffic-lights"><span /><span /><span /></div>
        <div className="px-8 pb-2 flex items-center justify-between">
          <h2 className="font-display text-3xl">{title}</h2>
          <button onClick={onClose} className="btn-ghost" data-testid={`${testid}-close`}><X size={18} /></button>
        </div>
        <div className="px-8 pb-8 pt-2">{children}</div>
      </div>
    </div>
  );
}
