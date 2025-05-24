import { WHATSAPP_CONFIG } from '../config/firebase';
import { Mail, Lock, User, UserPlus, Phone, MessageCircle, MessageSquare } from 'lucide-react';

interface WhatsAppMessage {
  to: string;
  body: string;
  mediaUrl?: string;
}

export const sendWelcomeMessage = async (name: string, whatsappNumber: string) => {
  try {
    // In a real implementation, you would use WhatsApp Business API or a similar service
    // to send the message. For now, we'll just log it.
    console.log('Sending WhatsApp welcome message:', {
      to: whatsappNumber,
      message: WHATSAPP_CONFIG.welcomeMessage(name)
    });

    // Store the user's WhatsApp number in your database
    // This will be used to track who has received the invite
    return {
      success: true,
      message: 'Welcome message prepared with group invite link'
    };
  } catch (error) {
    console.error('Error preparing WhatsApp welcome message:', error);
    throw error;
  }
};

export const sendVerificationMessage = async (name: string, whatsappNumber: string, verificationLink: string) => {
  try {
    // In a real implementation, you would use WhatsApp Business API or a similar service
    // to send the message. For now, we'll just log it.
    console.log('Sending WhatsApp verification message:', {
      to: whatsappNumber,
      message: `Hi ${name},\n\nPlease verify your email by clicking this link: ${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this, please ignore this message.\n\nBest regards,\nThe Engiversee Team`
    });

    // Store the user's WhatsApp number in your database
    // This will be used to track who has received the verification message
    return {
      success: true,
      message: 'Verification message prepared'
    };
  } catch (error) {
    console.error('Error preparing WhatsApp verification message:', error);
    throw error;
  }
};

export const sendCourseEnrollmentMessage = async (name: string, whatsappNumber: string, courseName: string) => {
  try {
    // In a real implementation, you would use WhatsApp Business API or a similar service
    // to send the message. For now, we'll just log it.
    console.log('Sending WhatsApp course enrollment message:', {
      to: whatsappNumber,
      message: `Hi ${name},\n\nCongratulations! You have successfully enrolled in "${courseName}".\n\nYou can now access the course materials and start learning.\n\nIf you have any questions, feel free to reach out to us.\n\nBest regards,\nThe Engiversee Team`
    });

    // Store the user's WhatsApp number in your database
    // This will be used to track who has received the enrollment message
    return {
      success: true,
      message: 'Course enrollment message prepared'
    };
  } catch (error) {
    console.error('Error preparing WhatsApp course enrollment message:', error);
    throw error;
  }
};

export const sendCustomMessage = async ({ to, body, mediaUrl }: WhatsAppMessage) => {
  try {
    // In a real implementation, you would use WhatsApp Business API or a similar service
    // to send the message. For now, we'll just log it.
    console.log('Sending WhatsApp custom message:', {
      to: `whatsapp:${to}`,
      body,
      ...(mediaUrl && { mediaUrl: [mediaUrl] })
    });

    // Store the user's WhatsApp number in your database
    // This will be used to track who has received the custom message
    return {
      success: true,
      message: 'Custom message prepared'
    };
  } catch (error) {
    console.error('Error preparing WhatsApp custom message:', error);
    throw error;
  }
};

export const validateWhatsAppNumber = (number: string): boolean => {
  // Remove any non-digit characters
  const cleanedNumber = number.replace(/\D/g, '');
  
  // Check if the number starts with a valid country code
  const countryCodeRegex = /^[1-9]\d{0,3}$/;
  const numberWithoutCountryCode = cleanedNumber.slice(1);
  
  // Check if the remaining number is valid
  const validLength = numberWithoutCountryCode.length >= 8 && numberWithoutCountryCode.length <= 15;
  
  return countryCodeRegex.test(cleanedNumber[0]) && validLength;
};

export const getGroupInviteLink = () => {
  return WHATSAPP_CONFIG.groupInviteLink;
};

export const getGroupName = () => {
  return WHATSAPP_CONFIG.groupName;
}; 