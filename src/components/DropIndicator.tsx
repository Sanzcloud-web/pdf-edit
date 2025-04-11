import { motion } from 'framer-motion';

interface DropIndicatorProps {
  isVisible: boolean;
}

export function DropIndicator({ isVisible }: DropIndicatorProps) {
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 4 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full bg-blue-500 rounded-full my-3"
      style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.7)' }}
    />
  );
}