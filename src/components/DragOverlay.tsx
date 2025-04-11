import { motion } from 'framer-motion';

interface DragOverlayProps {
  thumbnail: string;
  pageNumber: number;
}

export function DragOverlay({ thumbnail, pageNumber }: DragOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      className="pointer-events-none fixed z-50 w-48 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-2 ring-blue-500"
    >
      <iframe
        src={thumbnail}
        className="w-full h-full"
        title={`Page ${pageNumber} preview`}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
        <span className="text-sm font-medium text-white">
          Page {pageNumber}
        </span>
      </div>
    </motion.div>
  );
}