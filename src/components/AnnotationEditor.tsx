// src/components/AnnotationEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Type, Highlighter, Pencil, Square, Circle, Save } from 'lucide-react';
import { Modal } from './Modal';
import { AnnotationToolbar } from './AnnotationToolbar';

// Types simplifiés pour les annotations
type AnnotationTool = 'text' | 'highlight' | 'draw' | 'rectangle' | 'circle';

interface Annotation {
  id: string;
  type: AnnotationTool;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color: string;
  strokeWidth?: number;
  points?: Array<{x: number, y: number}>;
}

interface AnnotationEditorProps {
  pdfUrl: string;
  onSave: (annotatedPdfData: Uint8Array) => void;
  onCancel: () => void;
}

export function AnnotationEditor({ pdfUrl, onSave, onCancel }: AnnotationEditorProps) {
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>('text');
  const [fillColor, setFillColor] = useState('#ffff00');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  // Charger l'image
  useEffect(() => {
    const img = new Image();
    img.src = pdfUrl;
    img.onload = () => {
      imageRef.current = img;
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        redrawCanvas();
      }
    };
  }, [pdfUrl]);
  
  // Redessiner le canvas
  const redrawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Dessiner l'image de base
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0);
      
      // Dessiner les annotations
      annotations.forEach(annotation => {
        drawAnnotation(ctx, annotation);
      });
      
      // Dessiner l'annotation en cours si elle existe
      if (currentAnnotation) {
        drawAnnotation(ctx, currentAnnotation);
      }
    }
  };
  
  // Dessiner une annotation spécifique
  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: Annotation) => {
    switch (annotation.type) {
      case 'text':
        ctx.font = '20px Arial';
        ctx.fillStyle = annotation.color;
        ctx.fillText(annotation.text || 'Texte', annotation.x, annotation.y);
        break;
        
      case 'highlight':
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = annotation.color;
        ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
        ctx.globalAlpha = 1.0;
        break;
        
      case 'rectangle':
        ctx.fillStyle = annotation.color;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
        break;
        
      case 'circle':
        ctx.beginPath();
        const radiusX = annotation.width / 2;
        const radiusY = annotation.height / 2;
        const centerX = annotation.x + radiusX;
        const centerY = annotation.y + radiusY;
        const radius = Math.min(radiusX, radiusY);
        
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = annotation.color;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
        
      case 'draw':
        if (annotation.points && annotation.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
          
          for (let i = 1; i < annotation.points.length; i++) {
            ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
          }
          
          ctx.strokeStyle = annotation.color;
          ctx.lineWidth = annotation.strokeWidth || 2;
          ctx.stroke();
        }
        break;
    }
  };
  
  // Mettre à jour le dessin quand les annotations changent
  useEffect(() => {
    redrawCanvas();
  }, [annotations, currentAnnotation]);
  
  // Gérer le début d'une annotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || editingTextId) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (selectedTool === 'text') {
      // Créer une nouvelle annotation texte
      const newTextAnnotation: Annotation = {
        id: `text-${Date.now()}`,
        type: 'text',
        x,
        y,
        width: 100,
        height: 30,
        text: 'Double-cliquez pour éditer',
        color: fillColor
      };
      
      setAnnotations([...annotations, newTextAnnotation]);
      setEditingTextId(newTextAnnotation.id);
    } else {
      // Pour les autres types d'annotations
      setIsDrawing(true);
      
      const newAnnotation: Annotation = {
        id: `${selectedTool}-${Date.now()}`,
        type: selectedTool,
        x,
        y,
        width: 0,
        height: 0,
        color: selectedTool === 'draw' ? strokeColor : fillColor,
        points: selectedTool === 'draw' ? [{x, y}] : undefined,
        strokeWidth: selectedTool === 'draw' ? 2 : undefined
      };
      
      setCurrentAnnotation(newAnnotation);
    }
  };
  
  // Gérer le mouvement de la souris
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (currentAnnotation.type === 'draw') {
      // Ajouter un point au dessin
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...(currentAnnotation.points || []), {x, y}]
      });
    } else {
      // Mettre à jour les dimensions
      setCurrentAnnotation({
        ...currentAnnotation,
        width: x - currentAnnotation.x,
        height: y - currentAnnotation.y
      });
    }
  };
  
  // Gérer la fin d'une annotation
  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return;
    
    // Finaliser l'annotation avec des dimensions positives
    const finalAnnotation = {
      ...currentAnnotation,
      width: Math.abs(currentAnnotation.width),
      height: Math.abs(currentAnnotation.height),
      x: currentAnnotation.width < 0 ? 
          currentAnnotation.x + currentAnnotation.width : 
          currentAnnotation.x,
      y: currentAnnotation.height < 0 ? 
          currentAnnotation.y + currentAnnotation.height : 
          currentAnnotation.y
    };
    
    setAnnotations([...annotations, finalAnnotation]);
    setIsDrawing(false);
    setCurrentAnnotation(null);
  };
  
  // Gérer le double-clic pour éditer un texte
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Trouver l'annotation texte cliquée (en parcours inverse pour prendre celle du dessus)
    for (let i = annotations.length - 1; i >= 0; i--) {
      const annotation = annotations[i];
      if (annotation.type === 'text') {
        // Zone approximative du texte
        const textWidth = (annotation.text?.length || 0) * 12;
        const textHeight = 24;
        
        if (
          x >= annotation.x - 5 && 
          x <= annotation.x + textWidth + 5 && 
          y >= annotation.y - textHeight && 
          y <= annotation.y + 5
        ) {
          setEditingTextId(annotation.id);
          setTextInput(annotation.text || '');
          return;
        }
      }
    }
  };
  
  // Gérer la sauvegarde du texte édité
  const handleTextSave = () => {
    if (!editingTextId) return;
    
    setAnnotations(annotations.map(annotation => 
      annotation.id === editingTextId 
        ? { ...annotation, text: textInput } 
        : annotation
    ));
    
    setEditingTextId(null);
    setTextInput('');
  };
  
  // Enregistrer les annotations dans le PDF
  const handleSave = async () => {
    // Dans une implémentation réelle, on utiliserait pdf-lib ou une autre bibliothèque
    // pour intégrer les annotations dans le PDF
    
    // Pour cette démo, on crée simplement un tableau vide
    const dataToReturn = new Uint8Array([]);
    
    // TODO: Intégrer avec pdf-lib pour appliquer réellement les annotations
    
    onSave(dataToReturn);
  };
  
  // Supprimer la dernière annotation
  const handleUndo = () => {
    if (annotations.length > 0) {
      setAnnotations(annotations.slice(0, -1));
    }
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
        
        <AnnotationToolbar
          onSelectTool={setSelectedTool}
          selectedTool={selectedTool}
          onChangeFillColor={setFillColor}
          onChangeStrokeColor={setStrokeColor}
          fillColor={fillColor}
          strokeColor={strokeColor}
        />
        
        <div className="flex justify-between items-center mb-2 mt-4">
          <div className="text-sm text-gray-600">
            {selectedTool === 'text' ? 
              'Cliquez pour ajouter du texte, double-cliquez pour modifier' : 
              'Cliquez et faites glisser pour dessiner'}
          </div>
          
          <button
            onClick={handleUndo}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 flex items-center gap-1"
            disabled={annotations.length === 0}
          >
            <span className="text-sm">Annuler la dernière</span>
          </button>
        </div>
        
        <div ref={containerRef} className="relative border rounded-lg overflow-hidden bg-gray-50 mb-4">
          <canvas 
            ref={canvasRef}
            className="w-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          />
          
          {/* Mode édition de texte */}
          {editingTextId && (
            <div 
              className="absolute top-0 left-0 right-0 p-4 bg-white border-b z-10 flex gap-2"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Entrez votre texte"
                autoFocus
              />
              <button
                onClick={handleTextSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
              >
                <Save size={16} />
                Appliquer
              </button>
            </div>
          )}
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