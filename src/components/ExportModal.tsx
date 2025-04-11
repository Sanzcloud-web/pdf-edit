import React from 'react';
import { ExportOptions } from './ExportOptions';
import { ExportOptions as ExportOptionsType } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptionsType, mode: 'all' | 'selection') => void;
  mode: 'all' | 'selection';
}

export function ExportModal({ isOpen, onClose, onExport, mode }: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <ExportOptions
      onExport={(options) => onExport(options, mode)}
      onClose={onClose}
    />
  );
}