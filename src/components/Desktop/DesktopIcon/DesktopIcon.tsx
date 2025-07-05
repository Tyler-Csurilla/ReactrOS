import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import './DesktopIcon.css';

type DesktopIconProps = {
  iconImage: string;
  label: string;
  position: { x: number; y: number };
  onDragStop: (position: { x: number; y: number }) => void;
};

const DesktopIcon = ({
  iconImage,
  label,
  position,
  onDragStop,
}: DesktopIconProps): React.JSX.Element => {
  const imageFileRegex = /\.(png|jpe?g|gif|svg|webp|bmp|ico)([?#].*)?$/i;
  const isImageFile =
    typeof iconImage === 'string' && imageFileRegex.test(iconImage);

  // Checks if a string is only emoji (no numbers, no text, spaces ignored)
  function isEmojiOnly(str: string): boolean {
    const stringToTest = str.replace(/ /g, '');
    const emojiRegex =
      /^(?:(?:\p{RI}\p{RI}|\p{Emoji}(?:\p{Emoji_Modifier}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(?:\u{200D}\p{Emoji}(?:\p{Emoji_Modifier}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)*)|[\u{1f900}-\u{1f9ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}])+$/u;
    return emojiRegex.test(stringToTest) && Number.isNaN(Number(stringToTest));
  }

  const isSingleChar =
    typeof iconImage === 'string' && isEmojiOnly(iconImage.trim());

  const nodeRef = useRef<HTMLDivElement>(null);
  const [iconSize, setIconSize] = useState({ width: 100, height: 100 });

  useEffect(() => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setIconSize({ width: rect.width, height: rect.height });
    }
  }, []);

  const snapToGrid = useCallback(
    (x: number, y: number) => {
      const snappedX = Math.round(x / iconSize.width) * iconSize.width;
      const snappedY = Math.round(y / iconSize.height) * iconSize.height;

      return {
        x: snappedX,
        y: snappedY,
      };
    },
    [iconSize.width, iconSize.height]
  );

  const handleStop = (_e: DraggableEvent, data: DraggableData) => {
    const snapped = snapToGrid(data.x, data.y);
    onDragStop(snapped);
  };

  const opacity = 1;

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStop={handleStop}
      bounds="parent"
    >
      <div className="desktop-icon" ref={nodeRef} style={{ opacity }}>
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
              width="48"
              height="48"
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
              <rect x="14" y="30" width="20" height="6" rx="3" fill="#bdbdbd" />
            </svg>
          )}
        </div>
        <div className="label">{label}</div>
      </div>
    </Draggable>
  );
};

export default DesktopIcon;
