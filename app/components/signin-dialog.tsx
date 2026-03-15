"use client";
import { useActionState, useRef, useEffect } from "react";
import { signInWithOtp } from "../actions/auth";

export const SignInDialog = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Initialize state to match your ApiResponse structure
  const [state, formAction, isPending] = useActionState(signInWithOtp, {
    success: false,
    error: null,
    data: null,
  } as any);

  // If successfully sent, we could optionally show a different message or close it
  // But for now let's just show the message returned from the action

  return (
    <div>
      <button
        className="coc-btn coc-btn-green"
        onClick={() => dialogRef.current?.showModal()}
      >
        Sign In
      </button>

      <dialog ref={dialogRef} className="modal coc-overlay">
        <div className="modal-box coc-panel bg-[#E6E1D6] p-6 sm:p-8 max-w-[90vw] sm:max-w-sm w-full">
          <h3 className="font-luckiest text-xl sm:text-2xl mb-6 text-[#4A3B2A] text-center uppercase drop-shadow-sm">
            Welcome Chief
          </h3>

          <form action={formAction} className="space-y-5">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-[#4A3B2A]">Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="chief@clash.com"
                className="coc-input w-full"
                disabled={state.success && state.data?.emailSent}
              />
            </div>

            {/* Error handling */}
            {state.error && (
              <p className="text-sm text-red-600 bg-red-100 border-2 border-red-400 p-2 rounded font-bold text-center">
                {state.error}
              </p>
            )}

            {/* Success feedback */}
            {state.success && state.message && (
              <div className="text-sm text-green-700 bg-green-100 border-2 border-green-400 p-3 rounded font-bold text-center">
                <p>{state.message}</p>
                <p className="text-xs mt-1 font-normal">You can close this window now.</p>
              </div>
            )}

            <div className="modal-action flex justify-between mt-6">
              <button
                type="button"
                className="coc-btn coc-btn-grey text-sm py-1 px-3"
                onClick={() => dialogRef.current?.close()}
              >
                {state.success ? "Close" : "Cancel"}
              </button>

              {!state.success && (
                <button
                  type="submit"
                  className="coc-btn flex-1 ml-4"
                  disabled={isPending}
                >
                  {isPending && (
                    <span className="loading loading-spinner loading-xs mr-2"></span>
                  )}
                  Send Link
                </button>
              )}
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};
