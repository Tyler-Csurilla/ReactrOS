import React, { useRef } from 'react';
// import Draggable from 'react-draggable';
import './DesktopIcon.css';

export interface DesktopIconProps {
    iconImage: string;
    label: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    disabled?: boolean;
    selected?: boolean;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({
    iconImage,
    label,
    style,
    onClick,
    onDoubleClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onDragOver,
    onFocus,
    onBlur,
    onKeyDown,
    disabled,
    selected,
}) => {
    const imageFileRegex = /\.(png|jpe?g|gif|svg|webp|bmp|ico)([?#].*)?$/i;
    const isImageFile =
        typeof iconImage === 'string' && imageFileRegex.test(iconImage);

    function isEmojiOnly(str: string): boolean {
        const stringToTest = str.replace(/ /g, '');
        const emojiRegex =
            /^(?:(?:\p{RI}\p{RI}|\p{Emoji}(?:\p{Emoji_Modifier}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(?:\u{200D}\p{Emoji}(?:\p{Emoji_Modifier}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)*)|[\u{1f900}-\u{1f9ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}])+$/u;
        return (
            emojiRegex.test(stringToTest) && Number.isNaN(Number(stringToTest))
        );
    }

    const isSingleChar =
        typeof iconImage === 'string' && isEmojiOnly(iconImage.trim());

    const nodeRef = useRef<HTMLDivElement>(null);
    const [isDragging, setDragging] = React.useState(false);
    const [isDragOver, setDragOver] = React.useState(false);
    const [isActive, setActive] = React.useState(false);
    const [isFocused, setFocused] = React.useState(false);
    const [isDoubleClicked, setDoubleClicked] = React.useState(false);
    const [isContextMenu, setContextMenu] = React.useState(false);

    // Helper to combine classes
    const getClassName = () => {
        const classes = ['desktop-icon'];
        if (isDragging) classes.push('dragging');
        if (isDragOver) classes.push('drag-over');
        if (isActive) classes.push('active');
        if (isFocused) classes.push('focused');
        if (isDoubleClicked) classes.push('double-clicked');
        if (isContextMenu) classes.push('context-menu');
        if (disabled) classes.push('disabled');
        if (selected) classes.push('selected');
        return classes.join(' ');
    };

    // Event handlers
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        setActive(true);
        if (onClick) onClick(e);
        setTimeout(() => setActive(false), 150);
    };
    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        setDoubleClicked(true);
        if (onDoubleClick) onDoubleClick(e);
        setTimeout(() => setDoubleClicked(false), 300);
    };
    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        setContextMenu(true);
        if (onContextMenu) onContextMenu(e);
        setTimeout(() => setContextMenu(false), 300);
    };
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        setDragging(true);
        if (onDragStart) onDragStart(e);
    };
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        setDragging(false);
        if (onDragEnd) onDragEnd(e);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        setDragOver(true);
        if (onDragOver) onDragOver(e);
    };
    const handleDragLeave = () => {
        setDragOver(false);
    };
    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
        setFocused(true);
        if (onFocus) onFocus(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        setFocused(false);
        if (onBlur) onBlur(e);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (onKeyDown) onKeyDown(e);
    };

    return (
        <div
            className={getClassName()}
            ref={nodeRef}
            style={style}
            tabIndex={disabled ? -1 : 0}
            draggable={!disabled}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-disabled={disabled}
            aria-selected={selected}
        >
            <div className="icon">
                {isImageFile ? (
                    <img src={iconImage} alt={label} />
                ) : isSingleChar ? (
                    <span role="img" aria-label={label}>
                        {iconImage}
                    </span>
                ) : (
                    // Default SVG icon if not image or single emoji
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-label="default icon"
                    >
                        <rect
                            x="6"
                            y="6"
                            width="36"
                            height="36"
                            rx="8"
                            fill="#e0e0e0"
                            stroke="#bdbdbd"
                            strokeWidth="2"
                        />
                        <circle cx="24" cy="20" r="6" fill="#90caf9" />
                        <rect
                            x="14"
                            y="30"
                            width="20"
                            height="6"
                            rx="3"
                            fill="#bdbdbd"
                        />
                    </svg>
                )}
            </div>
            <div className="label">{label}</div>
        </div>
    );
};

export default DesktopIcon;
