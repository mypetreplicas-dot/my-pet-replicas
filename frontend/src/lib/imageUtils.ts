'use client';

import { useRef, useState, useCallback } from 'react';

/**
 * Returns a getPreviewUrl function that converts uploaded images to sRGB data URLs,
 * preventing Chrome HDR compositing glitches on wide-gamut displays.
 */
export function useImagePreview() {
    const previewUrls = useRef<Map<File, string>>(new Map());
    const [, setPreviewTick] = useState(0);

    const getPreviewUrl = useCallback((file: File) => {
        const existing = previewUrls.current.get(file);
        if (existing) return existing;
        const blobUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d', { colorSpace: 'srgb' });
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                previewUrls.current.set(file, canvas.toDataURL('image/jpeg', 0.85));
                setPreviewTick(t => t + 1);
            }
            URL.revokeObjectURL(blobUrl);
        };
        img.src = blobUrl;
        return blobUrl;
    }, []);

    return getPreviewUrl;
}
