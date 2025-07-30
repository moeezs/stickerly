export function removeWhiteBackground(imageUrl: string): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(imageUrl);
                return;
            }

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                const threshold = 235;
                const tolerance = 15;

                if (r > threshold && g > threshold && b > threshold) {
                    const avgColor = (r + g + b) / 3;
                    if (avgColor > threshold) {
                        data[i + 3] = 0;
                    }
                }

                else if (r > threshold - tolerance && g > threshold - tolerance && b > threshold - tolerance) {
                    const avgColor = (r + g + b) / 3;
                    const opacity = Math.max(0, 255 - (avgColor - (threshold - tolerance)) * 10);
                    data[i + 3] = Math.min(data[i + 3], opacity);
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };

        img.src = imageUrl;
    });
}
