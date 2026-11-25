import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'What is BuckMe UPI?',
    a: 'When traditional banks turned you down for "questionable Leonida credit history," BuckMe stepped up. It’s a GTA 6 BuckMe-skinned UPI scanner and payment link sharer—scan any QR, send a link, and let your UPI app handle the rest. Thank you for bucking with us!',
  },
  {
    q: 'Wait… why does it say "You’re Bucking"?',
    a: 'Because Fleeca’s compliance team somehow approved it. Every time you pay someone—or get paid through your link—somebody officially gets Bucked. Hear the jingle in your head yet? "Thank you for bucking with us!"',
  },
  {
    q: 'How do I actually Buck someone?',
    a: 'Tap Scan & Pay to use your camera, upload a QR screenshot, or paste a UPI ID / upi:// link. Enter the amount in ₹, then pick CRED, GPay, PhonePe, Paytm, or "Other UPI App" to jump straight into your phone’s UPI drawer.',
  },
  {
    q: 'How does "My BuckMe QR" work?',
    a: 'Scan your existing UPI QR (or type your UPI ID) to mint a shareable BuckMe card and /pay link. Send it to friends so they can Buck you back in two taps—zero excuses about "not having change."',
  },
  {
    q: 'Why can I edit my Checking balance?',
    a: 'Because pocket cash disappears real fast if you get Wasted outside a Vice City club. Tap the balance to set whatever number helps you sleep at night, or tap $ / ₹ to flip currencies—it’s purely cosmetic. Your real ₹ total lives in Family Savings.',
  },
  {
    q: 'How does Family Savings work?',
    a: 'Whenever you complete a UPI handoff and tap "Yes, Mark Paid," that ₹ amount stacks into Family Savings toward your next milestone (₹1K → ₹5K → ₹10K → ₹50K → ₹1L). Safer than stuffing cash under a motel mattress.',
  },
  {
    q: 'Does BuckMe hold my money or UPI PIN?',
    a: 'Never. Even Fleeca isn’t shady enough to ask for your PIN. BuckMe only builds standard upi://pay links and hands off to your UPI app—your profile and transaction log stay locally in your browser.',
  },
];

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <div className="rounded-3xl border border-[#E9D5FF] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#5B21B6]">BuckMe FAQ</h2>
        <span className="rounded-full bg-[#F3E8FF] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#7C3AED]">
          Fleeca Support
        </span>
      </div>

      <div className="divide-y divide-[#E9D5FF]">
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex min-h-[44px] w-full items-center justify-between gap-3 py-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium text-[#111111]">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#7C3AED] transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <p className="pb-3 text-sm leading-relaxed text-[#5B21B6]/80">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FaqAccordion;
