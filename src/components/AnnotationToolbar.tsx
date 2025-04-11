import { motion } from 'framer-motion';
import { Type, Highlighter, Pencil, Square, Circle } from 'lucide-react';

interface AnnotationToolbarProps {
  onSelectTool: (tool: 'text' | 'highlight' | 'draw' | 'rectangle' | 'circle') => void;
  selectedTool?: 'text' | 'highlight' | 'draw' | 'rectangle' | 'circle';
  onChangeFillColor: (color: string) => void;
  onChangeStrokeColor: (color: string) => void;
  fillColor: string;
  strokeColor: string;
}

export function AnnotationToolbar({
  onSelectTool,
  selectedTool,
  onChangeFillColor,
  onChangeStrokeColor,
  fillColor,
  strokeColor
}: AnnotationToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-md">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`p-2 rounded-lg ${selectedTool === 'text' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
        onClick={() => onSelectTool('text')}
      >
        <Type size={20} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`p-2 rounded-lg ${selectedTool === 'highlight' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
        onClick={() => onSelectTool('highlight')}
      >
        <Highlighter size={20} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`p-2 rounded-lg ${selectedTool === 'draw' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
        onClick={() => onSelectTool('draw')}
      >
        <Pencil size={20} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`p-2 rounded-lg ${selectedTool === 'rectangle' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
        onClick={() => onSelectTool('rectangle')}
      >
        <Square size={20} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`p-2 rounded-lg ${selectedTool === 'circle' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
        onClick={() => onSelectTool('circle')}
      >
        <Circle size={20} />
      </motion.button>
      
      <div className="h-8 w-px bg-gray-300 mx-1" />
      
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-600">Remplissage</label>
        <input 
          type="color" 
          value={fillColor} 
          onChange={(e) => onChangeFillColor(e.target.value)} 
          className="w-8 h-8 rounded cursor-pointer"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-600">Contour</label>
        <input 
          type="color" 
          value={strokeColor} 
          onChange={(e) => onChangeStrokeColor(e.target.value)} 
          className="w-8 h-8 rounded cursor-pointer"
        />
      </div>
    </div>
  );
}