// src/components/CropModal.tsx - Version simplifiée qui utilise directement le PDF

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Crop, Check } from 'lucide-react';
import { Modal } from './Modal';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageUrl: string;
  onCrop: (cropArea: { x: number; y: number; width: number; height: number }) => void;
}

export function CropModal({ isOpen, onClose, pageUrl, onCrop }: CropModalProps) {
  // Dimensions par défaut du recadrage
  const [cropDimensions, setCropDimensions] = useState({ width: 400, height: 600 });
  
  // Quand l'utilisateur clique sur "Appliquer"
  const handleApplyCrop = () => {
    // Utiliser des valeurs fictives pour X et Y car nous ne pouvons pas les obtenir facilement
    // Ces valeurs seront ajustées dans l'implémentation réelle de la fonction de recadrage
    onCrop({
      x: 0,
      y: 0,
      width: cropDimensions.width,
      height: cropDimensions.height
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <Modal onClose={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-5xl w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Crop size={24} className="text-blue-600" />
            Recadrer la page
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="bg-gray-100 p-2 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Ajustez le cadre de recadrage en le faisant glisser ou en utilisant les poignées.
            </div>
          </div>
        </div>
        
        {/* Afficher directement le PDF dans un iframe qui prend tout l'espace */}
        <div className="w-full h-[70vh] mb-4 overflow-hidden rounded-lg border border-gray-300">
          <iframe 
            src={pageUrl}
            className="w-full h-full border-0"
            title="PDF à recadrer"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Dimensions: {cropDimensions.width} × {cropDimensions.height} px
          </div>
          
          <div className="flex justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Annuler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApplyCrop}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg"
            >
              <Check size={20} />
              Appliquer
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
}