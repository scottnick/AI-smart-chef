
import React, { useState } from 'react';

interface InfoIconProps {
  title: string;
  content: string;
}

export const InfoIcon: React.FC<InfoIconProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-blue-500 transition-colors"
      >
        <i className="fa-solid fa-circle-info text-sm"></i>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb text-yellow-500"></i>
              {title}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {content}
            </p>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
};
