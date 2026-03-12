import React, { useRef, useEffect, useState } from 'react';

const DrawingCanvas = ({
    image,
    crop,
    zoom,
    paths,
    setPaths,
    drawingSettings,
    imageSize
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState([]);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Measure container size
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Calculate fit-to-screen scale and translation
    // react-easy-crop defaults to ObjectFit: 'contain'
    const fitScale = React.useMemo(() => {
        if (!containerSize.width || !imageSize.width) return 1;
        const containerAspect = containerSize.width / containerSize.height;
        const imageAspect = imageSize.width / imageSize.height;

        if (containerAspect > imageAspect) {
            // Container is wider than image -> fit by height
            return containerSize.height / imageSize.height;
        } else {
            // Container is taller/narrower -> fit by width
            return containerSize.width / imageSize.width;
        }
    }, [containerSize, imageSize]);

    // Apply zoom to the base fit scale
    const currentScale = fitScale * zoom;

    // Calculate active translation
    // react-easy-crop's 'crop' is the translation in pixels applied to the image?
    // Docs: { x, y } position of the image within the container.
    // Yes, it acts as directly adding to transform translate.
    const transformStyle = {
        transform: `translate3d(${crop.x}px, ${crop.y}px, 0) scale(${currentScale})`,
        transformOrigin: 'center',
        cursor: drawingSettings.tool === 'pen' ? 'crosshair' : 'default',
        // Critical for preventing overflow: disable layout impact of the huge image
        position: 'absolute',
        top: 0,
        left: 0,
        // We center the image initially, then apply crop translation?
        // react-easy-crop centers the image in the container.
        // so top: 50%, left: 50%, translate(-50%, -50%)... AND then adds crop.x/y?
        // Let's verify specific CSS logic of react-easy-crop if possible.
        // It likely does: translate(x, y) where x,y start at 0 (centered).
        // Let's force centering manually.
        left: '50%',
        top: '50%',
        marginLeft: -imageSize.width / 2,
        marginTop: -imageSize.height / 2
    };

    const getPointerPos = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(true);
        const pos = getPointerPos(e.nativeEvent || e);
        const newPoint = { x: pos.x, y: pos.y };
        setCurrentPath([newPoint]);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPointerPos(e.nativeEvent || e);
        const newPoint = { x: pos.x, y: pos.y };
        setCurrentPath(prev => [...prev, newPoint]);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (currentPath.length > 0) {
            setPaths(prev => [...prev, {
                points: currentPath,
                ...drawingSettings
            }]);
        }
        setCurrentPath([]);
    };

    // Render paths
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageSize.width) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        paths.forEach(path => {
            if (path.points.length < 2) return;
            ctx.beginPath();
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.width;
            ctx.moveTo(path.points[0].x, path.points[0].y);
            path.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        });

        if (currentPath.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = drawingSettings.color;
            ctx.lineWidth = drawingSettings.width;
            ctx.moveTo(currentPath[0].x, currentPath[0].y);
            currentPath.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        }

    }, [paths, currentPath, drawingSettings, imageSize]);

    return (
        <div
            className="drawing-container"
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                background: '#0a0a0f',
                borderRadius: 8,
                userSelect: 'none',
                touchAction: 'none'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        >
            <div style={transformStyle}>
                <img
                    src={image}
                    alt="Drawing Base"
                    style={{
                        display: 'block',
                        width: imageSize.width,
                        height: imageSize.height,
                        pointerEvents: 'none'
                    }}
                />
                <canvas
                    ref={canvasRef}
                    width={imageSize.width}
                    height={imageSize.height}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none'
                    }}
                />
            </div>
            {/* Optional: Add a visual cue that this is annotation mode, e.g. a border or label? */}
        </div>
    );
};

export default DrawingCanvas;
