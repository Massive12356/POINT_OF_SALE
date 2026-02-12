import { useState, useRef, useEffect } from 'react';
import { Scan, Keyboard } from 'lucide-react';

interface BarcodeInputProps {
  onScan: (barcode: string) => void;
  disabled?: boolean;
}

/**
 * BarcodeInput Component
 * Enhanced for USB barcode scanner and manual input support
 * Auto-focuses for rapid scanning
 */
export function BarcodeInput({ onScan, disabled = false }: BarcodeInputProps) {
  const [barcode, setBarcode] = useState('');
  const [lastScanTime, setLastScanTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Maintain focus on the input for continuous scanning
   */
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, barcode]);

  /**
   * Handle document click to refocus input
   */
  useEffect(() => {
    const handleDocumentClick = () => {
      if (!disabled && inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [disabled]);

  /**
   * Handle keyboard input for USB scanner support
   * USB scanners typically send data as keyboard input ending with Enter
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If input is not focused and we're not in an input/textarea, focus it
      if (!disabled && inputRef.current && document.activeElement === document.body) {
        // Don't intercept special keys
        if (e.key.length === 1 || e.key === 'Enter') {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      const now = Date.now();
      // Prevent duplicate scans within 500ms (some scanners send double input)
      if (now - lastScanTime > 500) {
        onScan(barcode.trim());
        setLastScanTime(now);
      }
      setBarcode('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Scan className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={barcode}
          onChange={handleChange}
          placeholder={disabled ? 'Processing...' : 'Scan or type barcode here...'}
          className="block w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoFocus
          disabled={disabled}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Keyboard className="h-5 w-5 text-gray-300" />
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {disabled 
          ? 'Please complete the current transaction' 
          : 'USB scanner or manual input supported • Press Enter to scan'}
      </p>
    </form>
  );
}
