import { motion } from 'framer-motion';

interface DragOverlayProps {
  thumbnail: string;
  pageNumber: number;
}

export function DragOverlay({ thumbnail, pageNumber }: DragOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 0.9, scale: 1 }}
      className="pointer-events-none fixed z-50 w-48 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-2 ring-blue-500 bg-white"
      style={{
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
      }}
    >
      {/* Remplacer iframe par object */}
      <object
        data={thumbnail}
        type="application/pdf"
        className="w-full h-full"
        style={{
          border: 'none',
          background: 'white'
        }}
      >
        <div className="flex items-center justify-center h-full bg-gray-100">
          <p className="text-gray-500">Impossible d'afficher le PDF</p>
        </div>
      </object>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
        <span className="text-sm font-medium text-white">
          Page {pageNumber}
        </span>
      </div>
    </motion.div>
  );
}