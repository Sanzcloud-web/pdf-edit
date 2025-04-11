// src/components/CropModal.tsx

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Crop, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { Modal } from './Modal';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageUrl: string;
  onCrop: (cropArea: { x: number; y: number; width: number; height: number }) => void;
}

export function CropModal({ isOpen, onClose, pageUrl, onCrop }: CropModalProps) {
  // Références
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  
  // États
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragType, setDragType] = useState<'move' | 'resize' | null>(null);
  const [resizeHandle, setResizeHandle] = useState<'top' | 'right' | 'bottom' | 'left' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | null>(null);
  const [zoom, setZoom] = useState(1);
  
  // Charger l'image et initialiser le recadrage
  useEffect(() => {
    if (!isOpen) return;
    
    const img = new Image();
    img.src = pageUrl;
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      
      // Initialiser le recadrage à 80% de l'image
      const initialWidth = img.width * 0.8;
      const initialHeight = img.height * 0.8;
      const initialX = (img.width - initialWidth) / 2;
      const initialY = (img.height - initialHeight) / 2;
      
      setCropBox({
        x: initialX,
        y: initialY,
        width: initialWidth,
        height: initialHeight
      });
    };
  }, [isOpen, pageUrl]);
  
  // Calculer la taille du conteneur visible
  const getContainerSize = () => {
    if (!containerRef.current) return { width: 0, height: 0 };
    const { width, height } = containerRef.current.getBoundingClientRect();
    return { width, height };
  };
  
  // Calculer le facteur d'échelle entre l'image réelle et l'affichage
  const getScaleFactor = () => {
    const containerSize = getContainerSize();
    
    if (imageSize.width === 0 || imageSize.height === 0) return { x: 1, y: 1 };
    
    const scaleX = containerSize.width / imageSize.width;
    const scaleY = containerSize.height / imageSize.height;
    
    // Utiliser l'échelle la plus petite pour que l'image s'adapte entièrement
    const scale = Math.min(scaleX, scaleY) * zoom;
    
    return { x: scale, y: scale };
  };
  
  // Calculer la position et la taille affichées du cadre de recadrage
  const getDisplayCropBox = () => {
    const scale = getScaleFactor();
    
    return {
      x: cropBox.x * scale.x,
      y: cropBox.y * scale.y,
      width: cropBox.width * scale.x,
      height: cropBox.height * scale.y
    };
  };
  
  // Convertir les coordonnées d'affichage en coordonnées d'image réelle
  const convertToImageCoordinates = (displayX: number, displayY: number) => {
    const scale = getScaleFactor();
    const containerSize = getContainerSize();
    const scaledImageWidth = imageSize.width * scale.x;
    const scaledImageHeight = imageSize.height * scale.y;
    
    // Calculer les offsets pour centrer l'image dans le conteneur
    const offsetX = (containerSize.width - scaledImageWidth) / 2;
    const offsetY = (containerSize.height - scaledImageHeight) / 2;
    
    // Convertir en tenant compte de l'offset et de l'échelle
    const imageX = (displayX - offsetX) / scale.x;
    const imageY = (displayY - offsetY) / scale.y;
    
    return { x: imageX, y: imageY };
  };
  
  // Gérer le début du glissement
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropBoxRef.current) return;
    
    e.preventDefault();
    
    const cropBoxRect = cropBoxRef.current.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Déterminer le type de glissement (déplacement ou redimensionnement)
    const handleSize = 20; // Taille de la poignée de redimensionnement en pixels
    
    // Vérifier si on est sur une poignée de redimensionnement
    const isNearLeft = Math.abs(mouseX - cropBoxRect.left) < handleSize;
    const isNearRight = Math.abs(mouseX - cropBoxRect.right) < handleSize;
    const isNearTop = Math.abs(mouseY - cropBoxRect.top) < handleSize;
    const isNearBottom = Math.abs(mouseY - cropBoxRect.bottom) < handleSize;
    
    if (isNearTop && isNearLeft) {
      setResizeHandle('topLeft');
      setDragType('resize');
    } else if (isNearTop && isNearRight) {
      setResizeHandle('topRight');
      setDragType('resize');
    } else if (isNearBottom && isNearLeft) {
      setResizeHandle('bottomLeft');
      setDragType('resize');
    } else if (isNearBottom && isNearRight) {
      setResizeHandle('bottomRight');
      setDragType('resize');
    } else if (isNearLeft) {
      setResizeHandle('left');
      setDragType('resize');
    } else if (isNearRight) {
      setResizeHandle('right');
      setDragType('resize');
    } else if (isNearTop) {
      setResizeHandle('top');
      setDragType('resize');
    } else if (isNearBottom) {
      setResizeHandle('bottom');
      setDragType('resize');
    } else {
      // Si on n'est pas sur une poignée, c'est un déplacement
      setDragType('move');
    }
    
    // Convertir la position de la souris en coordonnées d'image
    const imageCoords = convertToImageCoordinates(mouseX, mouseY);
    
    setDragStart({
      x: imageCoords.x - cropBox.x,
      y: imageCoords.y - cropBox.y
    });
    
    setIsDragging(true);
  };
  
  // Gérer le mouvement pendant le glissement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const imageCoords = convertToImageCoordinates(mouseX, mouseY);
    
    if (dragType === 'move') {
      // Déplacer le cadre de recadrage
      let newX = imageCoords.x - dragStart.x;
      let newY = imageCoords.y - dragStart.y;
      
      // Limiter aux bords de l'image
      newX = Math.max(0, Math.min(newX, imageSize.width - cropBox.width));
      newY = Math.max(0, Math.min(newY, imageSize.height - cropBox.height));
      
      setCropBox({
        ...cropBox,
        x: newX,
        y: newY
      });
    } else if (dragType === 'resize' && resizeHandle) {
      // Redimensionner le cadre de recadrage
      const newCropBox = { ...cropBox };
      
      // Calculer les nouvelles dimensions en fonction de la poignée utilisée
      if (resizeHandle.includes('left')) {
        const newWidth = cropBox.x + cropBox.width - imageCoords.x;
        if (newWidth > 50) {
          newCropBox.x = imageCoords.x;
          newCropBox.width = newWidth;
        }
      }
      
      if (resizeHandle.includes('right')) {
        const newWidth = imageCoords.x - cropBox.x;
        if (newWidth > 50) {
          newCropBox.width = newWidth;
        }
      }
      
      if (resizeHandle.includes('top')) {
        const newHeight = cropBox.y + cropBox.height - imageCoords.y;
        if (newHeight > 50) {
          newCropBox.y = imageCoords.y;
          newCropBox.height = newHeight;
        }
      }
      
      if (resizeHandle.includes('bottom')) {
        const newHeight = imageCoords.y - cropBox.y;
        if (newHeight > 50) {
          newCropBox.height = newHeight;
        }
      }
      
      setCropBox(newCropBox);
    }
  };
  
  // Gérer la fin du glissement
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
    setResizeHandle(null);
  };
  
  // Gérer le zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // Appliquer le recadrage
  const handleApplyCrop = () => {
    // Arrondir à des nombres entiers pour éviter les problèmes
    const finalCrop = {
      x: Math.round(cropBox.x),
      y: Math.round(cropBox.y),
      width: Math.round(cropBox.width),
      height: Math.round(cropBox.height)
    };
    
    onCrop(finalCrop);
  };
  
  // Obtenir le style du curseur en fonction de la poignée survolée
  const getCursorStyle = () => {
    if (!isDragging) return 'default';
    
    if (dragType === 'move') return 'move';
    
    switch (resizeHandle) {
      case 'top':
      case 'bottom':
        return 'ns-resize';
      case 'left':
      case 'right':
        return 'ew-resize';
      case 'topLeft':
      case 'bottomRight':
        return 'nwse-resize';
      case 'topRight':
      case 'bottomLeft':
        return 'nesw-resize';
      default:
        return 'default';
    }
  };
  
  if (!isOpen) return null;
  
  const displayCropBox = getDisplayCropBox();
  const scale = getScaleFactor();
  const containerSize = getContainerSize();
  
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
        
        <div className="border rounded-lg overflow-hidden bg-gray-100 mb-4">
          <div className="flex items-center justify-between p-2 bg-gray-200">
            <div className="text-sm text-gray-600">
              Ajustez le cadre de recadrage en le faisant glisser ou en utilisant les poignées.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-gray-300"
                title="Zoom arrière"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-sm">{Math.round(zoom * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-gray-300"
                title="Zoom avant"
              >
                <ZoomIn size={20} />
              </button>
            </div>
          </div>
          
          <div 
            ref={containerRef}
            className="relative h-[70vh] flex items-center justify-center bg-gray-800"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ cursor: getCursorStyle() }}
          >
            {/* Image de fond */}
            {imageSize.width > 0 && (
              <img
                ref={imageRef}
                src={pageUrl}
                alt="Page à recadrer"
                className="max-h-full max-w-full object-contain"
                style={{
                  width: imageSize.width * scale.x,
                  height: imageSize.height * scale.y
                }}
              />
            )}
            
            {/* Calque d'assombrissement */}
            <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none">
              {/* Zone claire du recadrage */}
              <div
                className="absolute border-2 border-blue-500 box-content"
                style={{
                  left: displayCropBox.x + (containerSize.width - imageSize.width * scale.x) / 2,
                  top: displayCropBox.y + (containerSize.height - imageSize.height * scale.y) / 2,
                  width: displayCropBox.width,
                  height: displayCropBox.height,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                }}
              />
            </div>
            
            {/* Zone interactive pour le glissement */}
            <div
              ref={cropBoxRef}
              className="absolute cursor-move"
              style={{
                left: displayCropBox.x + (containerSize.width - imageSize.width * scale.x) / 2,
                top: displayCropBox.y + (containerSize.height - imageSize.height * scale.y) / 2,
                width: displayCropBox.width,
                height: displayCropBox.height
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Poignées de redimensionnement */}
              <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize transform -translate-x-1/2 translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize transform translate-x-1/2 translate-y-1/2" />
              
              <div className="absolute top-0 left-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-ns-resize transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-ns-resize transform -translate-x-1/2 translate-y-1/2" />
              <div className="absolute left-0 top-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-ew-resize transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute right-0 top-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-ew-resize transform translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Dimensions: {Math.round(cropBox.width)} x {Math.round(cropBox.height)} px
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