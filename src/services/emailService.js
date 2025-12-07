import emailjs from '@emailjs/browser';

// EmailJS Configuration
// You'll need to set these up at https://www.emailjs.com/
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id';
const EMAILJS_TEMPLATE_ID_APPROVAL = import.meta.env.VITE_EMAILJS_TEMPLATE_APPROVAL || 'template_approval';
const EMAILJS_TEMPLATE_ID_REJECTION = import.meta.env.VITE_EMAILJS_TEMPLATE_REJECTION || 'template_rejection';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key';

/**
 * Initialize EmailJS
 */
emailjs.init(EMAILJS_PUBLIC_KEY);

/**
 * Send approval email with verification link
 * @param {Object} params - Email parameters
 * @param {string} params.toEmail - Recipient email
 * @param {string} params.toName - Recipient name
 * @param {string} params.verificationLink - Verification URL
 * @param {string} params.expirationDate - Account expiration date
 * @returns {Promise}
 */
export const sendApprovalEmail = async ({ toEmail, toName, verificationLink, expirationDate }) => {
  try {
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      verification_link: verificationLink,
      expiration_date: expirationDate,
      from_name: 'NTC E-Voting System',
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_APPROVAL,
      templateParams
    );

    console.log('Approval email sent successfully:', response);
    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send rejection email
 * @param {Object} params - Email parameters
 * @param {string} params.toEmail - Recipient email
 * @param {string} params.toName - Recipient name
 * @param {string} params.reason - Rejection reason (optional)
 * @returns {Promise}
 */
export const sendRejectionEmail = async ({ toEmail, toName, reason }) => {
  try {
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      rejection_reason: reason || 'Your registration did not meet the requirements.',
      from_name: 'NTC E-Voting System',
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_REJECTION,
      templateParams
    );

    console.log('Rejection email sent successfully:', response);
    return { success: true, message: 'Rejection email sent successfully' };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw new Error('Failed to send rejection email');
  }
};
