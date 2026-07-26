import React, { useEffect } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Footer stays pinned below the scrolling body — used for primary actions. */
  footer?: React.ReactNode;
}

/**
 * Modal sheet anchored to the bottom of the viewport, the standard mobile
 * pattern for secondary detail without losing the shopper's place in the list.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
}) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    // Stop the page behind the sheet from scrolling with it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        {/* Drag affordance */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="h-1 w-10 rounded-full bg-stone-300" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 pb-3 border-b border-stone-100 shrink-0">
            <h2 className="text-base font-extrabold text-[#1c1b1b]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="h-8 w-8 rounded-full bg-stone-100 text-[#584238] flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1 overscroll-contain">{children}</div>

        {footer && (
          <div className="border-t border-stone-100 px-5 py-3 pb-6 shrink-0 bg-white rounded-b-3xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
