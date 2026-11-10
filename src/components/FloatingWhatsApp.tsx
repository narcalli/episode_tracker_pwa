import React from 'react';
import { getThemeConfig } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { patient } = useAuth();
  const theme = getThemeConfig();

  const messageText = `Hi ${theme.hospitalName}, I am ${patient.name} (${patient.mrn}). I have a query regarding my maternity milestone tracker.`;
  const whatsappUrl = `https://wa.me/${theme.whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  return (
    <aside aria-label="Official WhatsApp Support" className="fixed bottom-5 right-5 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-all duration-200 group"
        title="Chat with Ovum Care Desk on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
        <span className="sr-only">Connect on WhatsApp</span>
      </a>
    </aside>
  );
};
