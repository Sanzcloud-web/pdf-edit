// src/components/CropModal.tsx

import React, { useState, useRef, useEffect } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  // Charger l'image PDF en tant qu'image
  useEffect(() => {
    if (!isOpen) return;
    
    const img = new Image();
    img.src = pageUrl;
    img.onload = () => {
      setImage(img);
      
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Initialiser la zone de recadrage à l'image entière
        setCrop({ 
          x: 0, 
          y: 0, 
          width: img.width, 
          height: img.height 
        });
        
        // Dessiner l'image
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      }
    };
  }, [isOpen, pageUrl]);
  
  // Mettre à jour le canvas quand la zone de recadrage change
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Effacer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner l'image
      ctx.drawImage(image, 0, 0);
      
      // Dessiner un assombrissement sur tout le canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Effacer la zone de recadrage (pour la rendre visible)
      ctx.clearRect(crop.x, crop.y, crop.width, crop.height);
      
      // Dessiner un cadre autour de la zone de recadrage
      ctx.strokeStyle = '#3b82f6'; // Bleu
      ctx.lineWidth = 2;
      ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
    }
  }, [crop, image]);
  
  // Gérer le début du glissement
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setStartPoint({ x, y });
    setCrop({ x, y, width: 0, height: 0 });
    setIsDragging(true);
  };
  
  // Gérer le mouvement de la souris pendant le glissement
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setCrop({
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y)
    });
  };
  
  // Gérer la fin du glissement
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleApplyCrop = () => {
    onCrop(crop);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <Modal onClose={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full"
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
        
        <div className="relative border rounded-lg overflow-hidden mb-4">
          <canvas 
            ref={canvasRef}
            className="w-full"
            style={{ cursor: isDragging ? 'crosshair' : 'default' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Sélectionnez la zone à conserver en faisant glisser la souris sur l'image.
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