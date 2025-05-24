import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getGroupInviteLink } from '../../services/whatsappService';

const WhatsAppChat: React.FC = () => {
  return (
    <a
      href={getGroupInviteLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-200 z-50"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
};

export default WhatsAppChat; 