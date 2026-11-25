import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'What is BuckMe UPI?',
    a: 'BuckMe UPI lets you scan any Indian UPI QR code, paste a UPI ID (VPA), or share your own BuckMe payment link—wrapped in the GTA 6 BuckMe banking interface. It builds standard UPI links and hands off directly to your UPI app.',
  },
  {
    q: 'How do I pay someone?',
    a: 'Tap Scan & Pay to scan a QR with your camera, upload a QR screenshot, or paste a UPI ID / upi:// link. Enter the amount in INR, then pick CRED, another listed UPI app, or "Other UPI App" to open your phone’s UPI app drawer.',
  },
  {
    q: 'What if my UPI app is not listed?',
    a: 'Tap "Other UPI App (Open System Drawer)" below the app grid. That sends a standard upi://pay intent to your phone so you can pick any UPI app installed on your device.',
  },
  {
    q: 'How does "My BuckMe QR" work?',
    a: 'Enter your UPI ID (e.g. name@okaxis), display name, and optional default amount/note. BuckMe generates a shareable /pay web link and QR code so friends can open it in their browser and pay you with their preferred UPI app.',
  },
  {
    q: 'Does BuckMe hold my money or bank details?',
    a: 'No. BuckMe never touches your bank account, never collects UPI PINs, and does not process payments. Your transaction history and profile are stored locally in your browser.',
  },
  {
    q: 'Why does Checking show $1,410?',
    a: 'It is a cosmetic starter balance for the GTA 6 BuckMe look (not real money). You can tap the $ or ₹ symbol on the card to flip the display symbol for fun—your real UPI total lives in Family Savings below.',
  },
  {
    q: 'How does Family Savings work?',
    a: 'Family Savings starts at ₹0 and tracks the real ₹ total you have sent through BuckMe. Whenever you launch a UPI app and confirm "Yes, Mark Paid", that amount is added automatically toward your next milestone (₹1K → ₹5K → ₹10K → ₹50K → ₹1L).',
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
