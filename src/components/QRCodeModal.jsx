import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download } from 'lucide-react';

const FEEDBACK_URL = 'https://business-overview-dashboard-six.vercel.app/feedback?welcome=true';

const QRCodeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const downloadQRCode = () => {
    const canvas = document.getElementById('pune-wines-qr-canvas');
    if (!canvas) return;
    
    // Create download link
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'pune-wines-feedback-qr.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-80 max-w-[90vw] p-6 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2 className="text-base font-bold text-gray-800 tracking-tight">
          📱 Scan for Feedback
        </h2>

        {/* QR Code Box */}
        <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center">
          <QRCodeCanvas
            id="pune-wines-qr-canvas"
            value={FEEDBACK_URL}
            size={180}
            bgColor="#f3f4f6"
            fgColor="#1e1b4b"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* URL Reference */}
        <p className="text-xs text-indigo-600 font-medium break-all text-center select-all">
          {FEEDBACK_URL}
        </p>

        {/* Download Button */}
        <button
          onClick={downloadQRCode}
          className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold py-2.5 rounded-lg transition-colors border border-indigo-200"
        >
          <Download size={16} />
          Download QR Code
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
