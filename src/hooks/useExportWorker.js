import { useRef, useEffect, useCallback } from 'react';

export function useExportWorker() {
    const workerRef = useRef(null);
    const activeRequests = useRef(new Map());

    useEffect(() => {
        // Initialize worker
        workerRef.current = new Worker(new URL('../workers/export-worker.js', import.meta.url), { type: 'module' });

        // Handle messages from worker
        workerRef.current.onmessage = (e) => {
            const { id, success, blob, error } = e.data;
            const request = activeRequests.current.get(id);

            if (request) {
                if (success) {
                    request.resolve(blob);
                } else {
                    request.reject(new Error(error));
                }
                activeRequests.current.delete(id);
            }
        };

        workerRef.current.onerror = (error) => {
            console.error('Worker error:', error);
            // Reject all pending requests
            for (const [, request] of activeRequests.current) {
                request.reject(error);
            }
            activeRequests.current.clear();
        };

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    const processImage = useCallback((data, transferList = []) => {
        return new Promise((resolve, reject) => {
            if (!workerRef.current) {
                reject(new Error('Worker not initialized'));
                return;
            }

            const id = Math.random().toString(36).substr(2, 9);
            activeRequests.current.set(id, { resolve, reject });

            workerRef.current.postMessage({ ...data, id }, transferList);
        });
    }, []);

    return { processImage };
}
