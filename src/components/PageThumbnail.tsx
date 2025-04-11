import React from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Move } from 'lucide-react';

interface Page {
  id: string;
  number: number;
  thumbnail: string;
}

interface PageThumbnailProps {
  page: Page;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

export function PageThumbnail({ page, isSelected, onSelect, onPreview }: PageThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-200'
      }`}
    >
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
        />
      </div>
      
      <motion.div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 cursor-move p-1.5 rounded-lg bg-white bg-opacity-90 shadow-md opacity-0 group-hover:opacity-100 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Move size={16} className="text-gray-600" />
      </motion.div>

      <motion.div
        onClick={onPreview}
        className="aspect-[3/4] cursor-pointer group-hover:brightness-95 transition-all"
        whileHover={{ scale: 1.02 }}
      >
        <iframe
          src={page.thumbnail}
          className="w-full h-full pointer-events-none"
          title={`Page ${page.number}`}
        />
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
        <span className="text-sm font-medium text-white">
          Page {page.number}
        </span>
      </div>
    </motion.div>
  );
}