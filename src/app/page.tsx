'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon } from 'lucide-react';
import InfoPanel from '@/components/InfoPanel';
import StickerEditor from '@/components/StickerEditor';

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [view, setView] = useState<'upload' | 'editor'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setView('editor');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setView('editor');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const resetToUpload = () => {
    setView('upload');
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (view === 'editor' && uploadedImage) {
    return (
      <>
        <StickerEditor
          imageUrl={uploadedImage}
          onBack={resetToUpload}
        />
        <InfoPanel />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-purple-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-32 h-32 bg-white/8 rounded-full"
          style={{ top: '10%', left: '10%' }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-24 h-24 bg-white/6 rounded-full"
          style={{ top: '60%', right: '15%' }}
          animate={{
            y: [0, 15, 0],
            x: [0, -10, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-40 h-40 bg-white/7 rounded-full"
          style={{ bottom: '20%', left: '5%' }}
          animate={{
            y: [0, -25, 0],
            x: [0, 10, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-20 h-20 bg-white/9 rounded-full"
          style={{ top: '30%', right: '30%' }}
          animate={{
            y: [0, 20, 0],
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-16 h-16 bg-white/5 rounded-full"
          style={{ top: '15%', right: '10%' }}
          animate={{
            y: [0, -15, 0],
            x: [0, 5, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-28 h-28 bg-white/4 rounded-full"
          style={{ bottom: '10%', right: '20%' }}
          animate={{
            y: [0, 18, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto relative z-10"
      >
        <motion.h1
          className="text-6xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ fontFamily: 'Menlo, monospace' }}
        >
          stickerly
        </motion.h1>

        <motion.p
          className="text-xl text-white/80 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Transform any image into a sticker with custom borders
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="relative"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />

          <label
            htmlFor="image-upload"
            className="block cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <motion.div
              className="border-2 border-dashed border-white/30 rounded-2xl p-16 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center space-y-6">
                <motion.div
                  className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors"
                  whileHover={{ rotate: 5 }}
                >
                  <Upload size={40} className="text-white" />
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-white">Upload Your Image</h3>
                  <p className="text-white/70">
                    Drag and drop an image here, or click to browse
                  </p>
                </div>
              </div>
            </motion.div>
          </label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8 text-white/60 text-sm"
        >
          <div className="flex items-center justify-center space-x-2">
            <ImageIcon size={16} />
            <span>Create professional stickers in seconds</span>
          </div>
        </motion.div>
      </motion.div>

      <InfoPanel />
    </div>
  );
}
