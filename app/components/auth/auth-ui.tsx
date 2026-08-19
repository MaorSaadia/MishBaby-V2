"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AuthActionState } from "@/app/auth/actions";

export function AuthShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#f1fbfe] px-5 py-12 sm:px-8 sm:py-18">
      <div className="mx-auto max-w-md rounded-[2rem] border border-[#063f5b]/10 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(6,63,91,.5)] sm:p-9">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#009dcc]">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#063f5b]/65">{intro}</p>
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}

export function SubmitButton({
  children,
  pendingText,
}: {
  children: React.ReactNode;
  pendingText: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full rounded-full bg-[#009dcc] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0784b0] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  );
}

export function ActionMessage({ state }: { state: AuthActionState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className={`mb-5 rounded-xl px-4 py-3 text-sm leading-6 ${state.status === "success" ? "bg-[#e7f8ee] text-[#195b37]" : "bg-[#fff0f1] text-[#8a2430]"}`}
    >
      {state.message}
    </p>
  );
}

export const inputClass =
  "mt-2 w-full rounded-xl border border-[#063f5b]/15 bg-white px-4 py-3 text-base text-[#063f5b] placeholder:text-[#063f5b]/35";
export const labelClass = "block text-sm font-bold text-[#063f5b]";

export function StatefulForm({
  action,
  children,
  pendingText,
  submitText,
}: {
  action: (state: AuthActionState, data: FormData) => Promise<AuthActionState>;
  children: React.ReactNode;
  pendingText: string;
  submitText: string;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction}>
      <ActionMessage state={state} />
      <div className="grid gap-5">
        {children}
        <SubmitButton pendingText={pendingText}>{submitText}</SubmitButton>
      </div>
    </form>
  );
}

export function LegalAgreement() {
  return (
    <p className="text-xs leading-5 text-[#063f5b]/55">
      By creating an account or continuing with Google, you agree to the{" "}
      <Link className="font-bold underline" href="/terms">
        Terms
      </Link>{" "}
      and acknowledge the{" "}
      <Link className="font-bold underline" href="/privacy">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
