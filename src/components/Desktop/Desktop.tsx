import FolderIcon from '@assets/icon_folder.png';
import monkeyIcon from '@assets/icon_monkey.png';
import { useEffect, useRef, useState } from 'react';
import './Desktop.css';
import DesktopIcon from './DesktopIcon/DesktopIcon';

export const COLUMN_WIDTH = 100;
export const ROW_GAP = 120;

interface DesktopIconData {
  id: string;
  iconImage: string;
  label: string;
}

interface DesktopIconState extends DesktopIconData {
  position: { x: number; y: number };
}

export function Desktop() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [desktopIcons, setDesktopIcons] = useState<DesktopIconState[]>([]);

  useEffect(() => {
    const initialIcons: DesktopIconData[] = [
      {
        id: 'computer',
        iconImage: '🖥️',
        label: 'Computer',
      },
      {
        id: 'documents',
        iconImage: FolderIcon,
        label: 'Documents',
      },
      {
        id: 'monke',
        iconImage: monkeyIcon,
        label: 'Test Monkey',
      },
      {
        id: 'network',
        iconImage: '🌐',
        label: 'Network',
      },
      {
        id: 'trash',
        iconImage: '🗑️',
        label: 'Trash',
      },
    ];

    const calculateLayout = () => {
      if (desktopRef.current) {
        const desktopWidth = desktopRef.current.clientWidth;
        const numCols = Math.floor(desktopWidth / COLUMN_WIDTH);

        const getIconGridPosition = (index: number) => {
          if (numCols === 0) return { row: 0, column: 0 };
          const row = Math.floor(index / numCols);
          const column = index % numCols;
          return { row, column };
        };

        setDesktopIcons(
          initialIcons.map((icon, index) => {
            const { row, column } = getIconGridPosition(index);
            return {
              ...icon,
              position: {
                x: column * COLUMN_WIDTH,
                y: row * ROW_GAP,
              },
            };
          })
        );
      }
    };

    calculateLayout();

    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, []);

  const handleDragStop = (
    iconId: string,
    position: { x: number; y: number }
  ) => {
    setDesktopIcons(currentIcons =>
      currentIcons.map(icon =>
        icon.id === iconId ? { ...icon, position } : icon
      )
    );
  };

  return (
    <div className="desktop" ref={desktopRef}>
      <div className="desktop-icons">
        {desktopIcons.map(icon => (
          <DesktopIcon
            key={icon.id}
            iconImage={icon.iconImage}
            label={icon.label}
            position={icon.position}
            onDragStop={position => handleDragStop(icon.id, position)}
          />
        ))}
      </div>
    </div>
  );
}
