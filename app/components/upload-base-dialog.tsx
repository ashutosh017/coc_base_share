"use client";

import { useActionState, useEffect, useRef } from "react";
import { uploadBase } from "../actions/base";

export default function UploadBaseDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(uploadBase, {
    success: false,
    error: null,
  } as any);

  useEffect(() => {
    if (state?.success) {
      dialogRef.current?.close();
      formRef.current?.reset();
    }
  }, [state?.success]);

  return (
    <div>
      <button
        className="coc-btn coc-btn-green"
        onClick={() => dialogRef.current?.showModal()}
      >
        Upload Base
      </button>

      {/* DaisyUI Modal */}
      <dialog ref={dialogRef} className="modal coc-overlay">
        <div className="modal-box coc-panel bg-[#E6E1D6] p-6 sm:p-8 max-w-[95vw] sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <h3 className="font-luckiest text-xl sm:text-2xl mb-6 text-[#4A3B2A] text-center uppercase drop-shadow-sm">Upload New Base</h3>

          <form ref={formRef} action={formAction} className="space-y-4">
            {/* Base Link */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-[#4A3B2A]">Base Link</span>
              </label>
              <input
                type="text"
                name="baseLink"
                required
                placeholder="https://link.clashofclans.com/..."
                className="coc-input w-full"
              />
            </div>

            {/* TH Level */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-[#4A3B2A]">Town Hall Level</span>
              </label>
              <input
                type="number"
                name="thLevel"
                required
                min="1"
                max="17"
                placeholder="15"
                className="coc-input w-full font-luckiest text-lg"
              />
            </div>

            {/* Preview Image URL */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-[#4A3B2A]">Preview Image URL</span>
              </label>
              <input
                type="text"
                name="imageUrl"
                placeholder="https://i.imgur.com/..."
                className="coc-input w-full"
              />
            </div>

            {/* OR Upload Image */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-[#4A3B2A]">Or Upload File</span>
              </label>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                className="file-input file-input-bordered w-full bg-[#FFF8E7] border-[#8B7355] text-[#4A3B2A]"
              />
            </div>

            {/* Error handling */}
            {state?.error && (
              <p className="text-sm text-red-600 bg-red-100 border-2 border-red-400 p-2 rounded font-bold text-center">
                {state.error}
              </p>
            )}

            {/* Actions */}
            <div className="modal-action flex flex-col-reverse sm:flex-row justify-between gap-3 mt-8">
              <button
                type="button"
                className="coc-btn coc-btn-grey text-sm py-2 px-4 w-full sm:w-auto"
                onClick={() => dialogRef.current?.close()}
              >
                Cancel
              </button>

              <button type="submit" className="coc-btn coc-btn-green flex-1 text-lg py-2 w-full sm:w-auto" disabled={isPending}>
                {isPending && (
                  <span className="loading loading-spinner loading-xs mr-2"></span>
                )}
                Upload
              </button>
            </div>
          </form>
        </div>

        {/* Click outside to close */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
