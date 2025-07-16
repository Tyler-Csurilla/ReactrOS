import { useEffect, useRef, useState } from 'react';

interface DraggablePanelProps {
    children: React.ReactNode;
    defaultPosition?: { x: number; y: number };
    style?: React.CSSProperties;
    className?: string;
    onClose?: () => void;
    title?: string;
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({
    children,
    defaultPosition = { x: 0, y: 0 },
    style = {},
    className = '',
    onClose,
    title = '',
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState(defaultPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
        null
    );
    const [mouseStart, setMouseStart] = useState<{
        x: number;
        y: number;
    } | null>(null);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only start drag if clicking the drag tab
        if (e.button !== 0) return;
        setIsDragging(true);
        setDragStart(position);
        setMouseStart({ x: e.clientX, y: e.clientY });
        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !dragStart || !mouseStart) return;
        const dx = e.clientX - mouseStart.x;
        const dy = e.clientY - mouseStart.y;
        setPosition({ x: dragStart.x + dx, y: dragStart.y + dy });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStart(null);
        setMouseStart(null);
        document.body.style.userSelect = '';
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDragging, dragStart, mouseStart]);

    return (
        <div
            ref={panelRef}
            className={className}
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                zIndex: 10000,
                ...style,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    height: '28px',
                    background:
                        'linear-gradient(90deg, #e0ffe0 0%, #f8f8f8 100%)',
                    borderBottom: '1px solid #eee',
                    borderRadius: '6px 6px 0 0',
                    position: 'relative',
                    userSelect: 'none',
                    marginBottom: '10px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                    }}
                    onMouseDown={e => {
                        // Prevent drag if clicking the close button
                        const closeBtn = panelRef.current?.querySelector(
                            '.draggable-panel-close-btn'
                        );
                        if (
                            closeBtn &&
                            (e.target === closeBtn ||
                                (closeBtn as HTMLElement).contains(
                                    e.target as Node
                                ))
                        ) {
                            return;
                        }
                        handleMouseDown(e);
                    }}
                >
                    <span
                        style={{
                            flex: '0 0 32px',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            color: '#00aa00',
                            fontSize: '16px',
                            paddingLeft: '8px',
                            paddingRight: '8px',
                            pointerEvents: 'none',
                        }}
                    >
                        ≡
                    </span>
                    <span
                        style={{
                            flex: '1',
                            textAlign: 'left',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            color: '#222',
                            paddingLeft: '4px',
                            pointerEvents: 'none',
                        }}
                    >
                        {title}
                    </span>
                </div>
                {onClose && (
                    <button
                        className="draggable-panel-close-btn"
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '6px',
                            right: '8px',
                            background: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '2px',
                            width: '16px',
                            height: '16px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            lineHeight: '1',
                        }}
                        title="Close"
                    >
                        ×
                    </button>
                )}
            </div>
            <div>{children}</div>
        </div>
    );
};

export default DraggablePanel;
