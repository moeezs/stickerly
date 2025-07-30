'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, RotateCcw, Palette, Scissors } from 'lucide-react';
import { removeWhiteBackground } from '@/utils/backgroundRemoval';

interface StickerEditorProps {
    imageUrl: string;
    onBack: () => void;
}

export default function StickerEditor({ imageUrl, onBack }: StickerEditorProps) {
    const [borderColor, setBorderColor] = useState('#ffffff');
    const [borderThickness, setBorderThickness] = useState(8);
    const [fillBackground, setFillBackground] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
    const [isProcessingBg, setIsProcessingBg] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [processedImageUrl, setProcessedImageUrl] = useState<string>('');

    useEffect(() => {
        generateSticker();
    }, [currentImageUrl, borderColor, borderThickness, fillBackground, backgroundColor]);

    const generateSticker = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return;

            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            tempCtx.drawImage(img, 0, 0);

            const originalData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = originalData.data;

            let minX = tempCanvas.width, minY = tempCanvas.height;
            let maxX = 0, maxY = 0;
            let hasContent = false;

            for (let y = 0; y < tempCanvas.height; y++) {
                for (let x = 0; x < tempCanvas.width; x++) {
                    const alpha = data[(y * tempCanvas.width + x) * 4 + 3];
                    if (alpha > 10) {
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                        hasContent = true;
                    }
                }
            }

            if (!hasContent) {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                setProcessedImageUrl(canvas.toDataURL());
                return;
            }

            const contentWidth = maxX - minX + 1;
            const contentHeight = maxY - minY + 1;

            canvas.width = contentWidth + (borderThickness * 2);
            canvas.height = contentHeight + (borderThickness * 2);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (borderThickness > 0) {
                const strokeData = ctx.createImageData(canvas.width, canvas.height);
                const stroke = strokeData.data;
                const borderRgb = hexToRgb(borderColor);

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const destIndex = (y * canvas.width + x) * 4;

                        const origX = x - borderThickness + minX;
                        const origY = y - borderThickness + minY;

                        let hasObject = false;
                        let hasStroke = false;

                        if (origX >= 0 && origX < tempCanvas.width &&
                            origY >= 0 && origY < tempCanvas.height) {
                            const origIndex = (origY * tempCanvas.width + origX) * 4;
                            if (data[origIndex + 3] > 10) {
                                hasObject = true;
                            }
                        }

                        if (!hasObject) {
                            for (let dy = -borderThickness; dy <= borderThickness && !hasStroke; dy++) {
                                for (let dx = -borderThickness; dx <= borderThickness && !hasStroke; dx++) {
                                    const distance = Math.sqrt(dx * dx + dy * dy);
                                    if (distance <= borderThickness) {
                                        const checkOrigX = origX + dx;
                                        const checkOrigY = origY + dy;

                                        if (checkOrigX >= 0 && checkOrigX < tempCanvas.width &&
                                            checkOrigY >= 0 && checkOrigY < tempCanvas.height) {
                                            const checkIndex = (checkOrigY * tempCanvas.width + checkOrigX) * 4;
                                            if (data[checkIndex + 3] > 10) {
                                                hasStroke = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (hasObject) {
                            const origIndex = (origY * tempCanvas.width + origX) * 4;
                            stroke[destIndex] = data[origIndex];
                            stroke[destIndex + 1] = data[origIndex + 1];
                            stroke[destIndex + 2] = data[origIndex + 2];
                            stroke[destIndex + 3] = data[origIndex + 3];
                        } else if (hasStroke) {
                            stroke[destIndex] = borderRgb.r;
                            stroke[destIndex + 1] = borderRgb.g;
                            stroke[destIndex + 2] = borderRgb.b;
                            stroke[destIndex + 3] = 255;
                        } else {
                            stroke[destIndex] = 0;
                            stroke[destIndex + 1] = 0;
                            stroke[destIndex + 2] = 0;
                            stroke[destIndex + 3] = 0;
                        }
                    }
                }

                ctx.putImageData(strokeData, 0, 0);

                if (fillBackground) {
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.globalCompositeOperation = 'source-over';
                }
            } else {
                ctx.drawImage(
                    img,
                    minX, minY, contentWidth, contentHeight,
                    borderThickness, borderThickness, contentWidth, contentHeight
                );

                if (fillBackground) {
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.globalCompositeOperation = 'source-over';
                }
            }

            setProcessedImageUrl(canvas.toDataURL());
        };

        img.src = currentImageUrl;
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    };

    const downloadSticker = () => {
        if (processedImageUrl) {
            const link = document.createElement('a');
            link.href = processedImageUrl;
            link.download = 'sticker.png';
            link.click();
        }
    };

    const resetSettings = () => {
        setBorderColor('#ffffff');
        setBorderThickness(8);
        setFillBackground(false);
        setBackgroundColor('#ffffff');
        setCurrentImageUrl(imageUrl);
    };

    const handleBackgroundRemoval = async () => {
        setIsProcessingBg(true);
        try {
            const transparentImage = await removeWhiteBackground(currentImageUrl);
            setCurrentImageUrl(transparentImage);
        } catch (error) {
            console.error('Background removal failed:', error);
        } finally {
            setIsProcessingBg(false);
        }
    };

    return (
        <div className="min-h-screen bg-purple-400 p-4 relative overflow-hidden">
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
                    className="absolute w-28 h-28 bg-white/5 rounded-full"
                    style={{ top: '25%', right: '8%' }}
                    animate={{
                        y: [0, 18, 0],
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute w-36 h-36 bg-white/4 rounded-full"
                    style={{ bottom: '15%', right: '25%' }}
                    animate={{
                        y: [0, -20, 0],
                        x: [0, 8, 0],
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 pt-6">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-end mb-8 space-x-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white transition-all duration-300 text-sm"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <button
                        onClick={resetSettings}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white transition-all duration-300 text-sm"
                    >
                        <RotateCcw size={14} />
                        <span className="hidden sm:inline">Reset</span>
                    </button>

                    <button
                        onClick={downloadSticker}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg backdrop-blur-sm bg-green-600/80 hover:bg-green-600 text-white transition-all duration-300 text-sm"
                    >
                        <Download size={14} />
                        <span>Download</span>
                    </button>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Controls Panel */}
                    <motion.div
                        className="xl:col-span-1 order-2 xl:order-1 flex"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20 space-y-4 sm:space-y-6 flex-1 flex flex-col">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center">
                                <Palette size={18} className="mr-2" />
                                Customization
                            </h3>

                            {/* Border Color */}
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-white/80 text-sm font-medium mb-2 sm:mb-3">
                                    Border Color
                                </label>
                                <input
                                    type="color"
                                    value={borderColor}
                                    onChange={(e) => setBorderColor(e.target.value)}
                                    className="w-full h-10 sm:h-12 rounded-lg border border-white/30 bg-white/10"
                                />
                            </div>

                            {/* Border Thickness */}
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-white/80 text-sm font-medium mb-2">
                                    Border Thickness: {borderThickness}px
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    value={borderThickness}
                                    onChange={(e) => setBorderThickness(Number(e.target.value))}
                                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Background Removal */}
                            <div className="mb-4 sm:mb-6">
                                <button
                                    onClick={handleBackgroundRemoval}
                                    disabled={isProcessingBg}
                                    className="w-full flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg backdrop-blur-sm bg-blue-600/80 hover:bg-blue-600 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    <Scissors size={14} />
                                    <span>{isProcessingBg ? 'Processing...' : 'Remove White Background'}</span>
                                </button>
                            </div>

                            {/* Fill Background */}
                            <div className="mb-4 sm:mb-6">
                                <label className="flex items-center text-white/80 text-sm font-medium mb-2 sm:mb-3">
                                    <input
                                        type="checkbox"
                                        checked={fillBackground}
                                        onChange={(e) => setFillBackground(e.target.checked)}
                                        className="mr-2 w-4 h-4 rounded"
                                    />
                                    Fill Background
                                </label>
                                {fillBackground && (
                                    <input
                                        type="color"
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        className="w-full h-10 sm:h-12 rounded-lg border border-white/30 bg-white/10"
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Preview Panel */}
                    <motion.div
                        className="xl:col-span-2 order-1 xl:order-2 flex"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20 flex-1 flex flex-col">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Preview</h3>

                            <div className="flex justify-center items-center flex-1 rounded-xl p-4 overflow-auto relative"
                                style={{
                                    background: `
                       linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                       linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                       linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                       linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                     `,
                                    backgroundSize: '20px 20px',
                                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                                }}
                            >
                                <canvas
                                    ref={canvasRef}
                                    className="max-w-full max-h-[400px] sm:max-h-[600px] rounded-lg shadow-lg"
                                    style={{
                                        imageRendering: 'crisp-edges'
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
