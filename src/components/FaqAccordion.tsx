import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const BUCKME_FAQS = [
  {
    q: "What is BuckMe?",
    a: "BuckMe is a digital financial application provided in partnership with Fleeca Financial. It allows you to hold digital funds, track transactions, locate ATMs, and funnel money into Family Savings — now with real UPI powers.",
  },
  {
    q: "How do I pay someone?",
    a: "Tap Scan & Pay, point your camera at any UPI QR (or paste a VPA like name@okhdfcbank), confirm the amount, pick your UPI app, and you're Bucking. BuckMe handles the handoff — your UPI app handles the PIN.",
  },
  {
    q: 'What is "Buck Yourself"?',
    a: '"Buck Yourself" is BuckMe\'s internal transfer protocol. It moves digital funds from your Checking Account into the shared Family Savings pool. Think of it as locking money away where even you can\'t blow it on another vehicle.',
  },
  {
    q: "Can I withdraw money from Family Savings?",
    a: "No. Once money is transferred into Family Savings, it is locked away safely and cannot be withdrawn or spent. But hitting milestones unlocks perks and bragging rights.",
  },
  {
    q: "What's a BuckMe QR?",
    a: "Instead of sharing a boring bank QR, BuckMe generates a branded QR that opens a BuckMe payment page. The person scanning it sees your name, amount, and one-tap UPI buttons — plus a CTA to get their own BuckMe QR.",
  },
  {
    q: "Why can't I deposit cash through the app?",
    a: "Physical pocket cash must be deposited at a physical ATM. Digital app deposits cannot be made straight from your phone. That's just how Fleeca rolls.",
  },
  {
    q: "What are the account limits?",
    a: "Standard purchases under $1,000 use pocket cash. Anything over $1,000 must go through your BuckMe Checking Account. Limits increase as you progress. In this app, there are no real limits — go wild.",
  },
  {
    q: "What happens to my money if I get Wasted or Busted?",
    a: "Pocket cash? Gone. But anything in your BuckMe Checking or Family Savings is safe. That's the whole point of banking with Fleeca. (In real life, your money is safe either way. Probably.)",
  },
];

export function FaqAccordion() {
  const [openIndices, setOpenIndices] = useState<Record<number, boolean>>({});

  const toggle = (idx: number) => {
    setOpenIndices((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <section className="rounded-3xl border border-purple-200/70 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-[#6D28D9]" />
        <h2 className="text-sm font-extrabold tracking-tight text-[#5B21B6]">
          BuckMe FAQ
        </h2>
        <span className="ml-auto text-[11px] font-medium text-gray-400">
          Fleeca Support
        </span>
      </div>

      <div className="divide-y divide-purple-100">
        {BUCKME_FAQS.map((item, idx) => {
          const isOpen = Boolean(openIndices[idx]);
          return (
            <div key={item.q} className="py-2.5 first:pt-1 last:pb-1">
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center justify-between gap-3 text-left text-xs font-bold text-gray-800 transition hover:text-[#5B21B6]"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-[#6D28D9] transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen && (
                <p className="mt-2 rounded-xl bg-[#F8F7FC] p-2.5 text-xs leading-relaxed text-gray-600">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
