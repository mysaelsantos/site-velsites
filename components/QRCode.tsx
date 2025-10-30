
import React, { useEffect, useState } from 'react';

declare const QRCode: any;

interface QRCodeProps {
  phone: string;
  show: boolean;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ phone, show }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateOrUpdateQRCode = async () => {
      if (!show || typeof QRCode === 'undefined') {
        setQrCodeUrl(null);
        return;
      }

      const cleanedPhone = phone.replace(/\D/g, '');
      
      if (cleanedPhone.length < 10 || cleanedPhone.length > 11) {
        setQrCodeUrl(null);
        return;
      }

      const finalPhone = `55${cleanedPhone}`;
      const whatsappLink = `https://wa.me/${finalPhone}`;

      try {
        const dataUrl = await QRCode.toDataURL(whatsappLink, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 80,
        });
        setQrCodeUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR Code:', err);
        setQrCodeUrl(null);
      }
    };

    generateOrUpdateQRCode();
  }, [phone, show]);

  return (
    <div id="whatsapp-qr-code-container" style={{ display: qrCodeUrl ? 'flex' : 'none' }}>
      <img src="https://files.catbox.moe/cvyrae.svg" alt="Ícone do WhatsApp" className="h-8 mb-2" />
      {qrCodeUrl && <img id="qr-code-img" alt="QR Code do WhatsApp" className="w-20 h-20" src={qrCodeUrl} />}
    </div>
  );
};

export default QRCodeComponent;
