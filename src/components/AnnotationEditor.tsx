// src/components/AnnotationEditor.tsx

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Type, Highlighter, Pencil, Square, Circle } from 'lucide-react';
import { Modal } from './Modal';

// Note: Nous n'utilisons plus fabric.js mais créons une version simplifiée
// à base de Canvas HTML5 standard pour éviter les problèmes d'importation

interface AnnotationEditorProps {
  pdfUrl: string;
  onSave: (annotatedPdfData: Uint8Array) => void;
  onCancel: () => void;
}

type AnnotationTool = 'text' | 'highlight' | 'draw' | 'rectangle' | 'circle';

interface Annotation {
  type: AnnotationTool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  points?: { x: number, y: number }[];
  fillColor: string;
  strokeColor: string;
}

export function AnnotationEditor({ pdfUrl, onSave, onCancel }: AnnotationEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>('text');
  const [fillColor, setFillColor] = useState('#ffff00');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  // Charger l'image PDF
  useEffect(() => {
    const img = new Image();
    img.src = pdfUrl;
    img.onload = () => {
      setImage(img);
      
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      }
    };
  }, [pdfUrl]);
  
  // Redessiner le canvas quand les annotations changent
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Effacer le canvas et redessiner l'image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      
      // Dessiner toutes les annotations
      annotations.forEach(annotation => {
        ctx.fillStyle = annotation.fillColor;
        ctx.strokeStyle = annotation.strokeColor;
        ctx.lineWidth = 2;
        
        switch (annotation.type) {
          case 'text':
            ctx.font = '20px sans-serif';
            ctx.fillText(annotation.text || 'Texte', annotation.x, annotation.y);
            break;
            
          case 'highlight':
            ctx.globalAlpha = 0.5;
            ctx.fillRect(annotation.x, annotation.y, annotation.width || 100, annotation.height || 20);
            ctx.globalAlpha = 1.0;
            break;
            
          case 'rectangle':
            ctx.fillRect(annotation.x, annotation.y, annotation.width || 0, annotation.height || 0);
            ctx.strokeRect(annotation.x, annotation.y, annotation.width || 0, annotation.height || 0);
            break;
            
          case 'circle':
            ctx.beginPath();
            ctx.arc(
              annotation.x + ((annotation.width || 0) / 2), 
              annotation.y + ((annotation.height || 0) / 2), 
              Math.min((annotation.width || 0), (annotation.height || 0)) / 2, 
              0, 
              Math.PI * 2
            );
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'draw':
            if (annotation.points && annotation.points.length > 1) {
              ctx.beginPath();
              ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
              
              for (let i = 1; i < annotation.points.length; i++) {
                ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
              }
              
              ctx.stroke();
            }
            break;
        }
      });
    }
  }, [annotations, image]);
  
  // Gérer le début d'une annotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    if (selectedTool === 'text') {
      // Pour le texte, ajoutez directement une annotation
      const textAnnotation: Annotation = {
        type: 'text',
        x,
        y,
        text: 'Double-cliquez pour éditer',
        fillColor,
        strokeColor
      };
      
      setAnnotations([...annotations, textAnnotation]);
    } else if (selectedTool === 'draw') {
      // Pour le dessin, commencez à tracer
      setIsDrawing(true);
      
      const drawAnnotation: Annotation = {
        type: 'draw',
        x,
        y,
        points: [{ x, y }],
        fillColor,
        strokeColor
      };
      
      setCurrentAnnotation(drawAnnotation);
    } else {
      // Pour les autres formes, commencez à les tracer
      setIsDrawing(true);
      
      const newAnnotation: Annotation = {
        type: selectedTool,
        x,
        y,
        width: 0,
        height: 0,
        fillColor,
        strokeColor
      };
      
      setCurrentAnnotation(newAnnotation);
    }
  };
  
  // Gérer le mouvement de la souris pendant une annotation
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    if (currentAnnotation.type === 'draw') {
      // Pour le dessin, ajoutez un point
      const updatedPoints = [...(currentAnnotation.points || []), { x, y }];
      
      setCurrentAnnotation({
        ...currentAnnotation,
        points: updatedPoints
      });
      
      // Mettre à jour temporairement les annotations pour l'affichage
      setAnnotations([...annotations.filter(a => a !== currentAnnotation), { ...currentAnnotation, points: updatedPoints }]);
    } else {
      // Pour les autres formes, mettez à jour la taille
      setCurrentAnnotation({
        ...currentAnnotation,
        width: x - currentAnnotation.x,
        height: y - currentAnnotation.y
      });
      
      // Mettre à jour temporairement les annotations pour l'affichage
      setAnnotations([...annotations.filter(a => a !== currentAnnotation), { 
        ...currentAnnotation, 
        width: x - currentAnnotation.x, 
        height: y - currentAnnotation.y 
      }]);
    }
  };
  
  // Gérer la fin d'une annotation
  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return;
    
    // Finaliser l'annotation
    setAnnotations([...annotations, currentAnnotation]);
    setIsDrawing(false);
    setCurrentAnnotation(null);
  };
  
  // Fonction pour sauvegarder les annotations
  const handleSave = () => {
    // Dans une implémentation réelle, convertir les annotations en modifications PDF
    // Pour cette démonstration, nous renvoyons simplement un tableau vide
    onSave(new Uint8Array([]));
  };
  
  return (
    <Modal onClose={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-5xl w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Annoter la page</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg mb-4">
          <button 
            className={`p-2 rounded-lg ${selectedTool === 'text' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setSelectedTool('text')}
          >
            <Type size={20} />
          </button>
          <button 
            className={`p-2 rounded-lg ${selectedTool === 'highlight' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setSelectedTool('highlight')}
          >
            <Highlighter size={20} />
          </button>
          <button 
            className={`p-2 rounded-lg ${selectedTool === 'draw' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setSelectedTool('draw')}
          >
            <Pencil size={20} />
          </button>
          <button 
            className={`p-2 rounded-lg ${selectedTool === 'rectangle' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setSelectedTool('rectangle')}
          >
            <Square size={20} />
          </button>
          <button 
            className={`p-2 rounded-lg ${selectedTool === 'circle' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setSelectedTool('circle')}
          >
            <Circle size={20} />
          </button>
          
          <div className="h-8 w-px bg-gray-300 mx-1" />
          
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Remplissage</label>
            <input 
              type="color" 
              value={fillColor} 
              onChange={(e) => setFillColor(e.target.value)} 
              className="w-8 h-8 rounded cursor-pointer"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Contour</label>
            <input 
              type="color" 
              value={strokeColor} 
              onChange={(e) => setStrokeColor(e.target.value)} 
              className="w-8 h-8 rounded cursor-pointer"
            />
          </div>
        </div>
        
        <div className="relative border rounded-lg overflow-hidden bg-gray-50 mb-4">
          <canvas 
            ref={canvasRef}
            className="w-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Annuler
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg"
          >
            <Check size={20} />
            Enregistrer
          </motion.button>
        </div>
      </motion.div>
    </Modal>
  );
}