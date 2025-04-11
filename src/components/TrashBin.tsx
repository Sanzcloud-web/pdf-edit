import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw } from 'lucide-react';

interface Page {
  id: string;
  number: number;
  thumbnail: string;
}

interface TrashBinProps {
  deletedPages: Page[];
  onRestore: (pageId: string) => void;
  onDelete: (pageId: string) => void;
}

export function TrashBin({ deletedPages, onRestore, onDelete }: TrashBinProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 border-t pt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <Trash2 size={20} />
          <span className="font-medium">
            Corbeille ({deletedPages.length})
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {deletedPages.map((page) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group border rounded-lg overflow-hidden bg-gray-50"
                >
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => onRestore(page.id)}
                      className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                      title="Restaurer"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(page.id)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Supprimer définitivement"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <iframe
                    src={page.thumbnail}
                    className="w-full aspect-[3/4] pointer-events-none opacity-50"
                    title={`Page supprimée ${page.number}`}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}