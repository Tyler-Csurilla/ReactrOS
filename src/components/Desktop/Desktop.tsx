import { useCallback, useEffect, useRef, useState } from 'react';
import { useDesktopContext } from '../../contexts/DesktopContext';
import BackgroundManager from '../../services/Desktop/BackgroundManager';
import GridManager, {
    type GridDimensions,
} from '../../services/Desktop/GridManager';
import IconManager from '../../services/Desktop/IconManager';
import './Desktop.css';
import DesktopIcon from './DesktopIcon/DesktopIcon';

import config from 'src/config';
import type { IconData } from '../../services/Desktop/IconManager';
import DraggablePanel from './DraggablePanel';

// Types
type DesktopIconState = IconData & {
    position: { x: number; y: number };
    selected?: boolean;
    disabled?: boolean;
};

type DebugPanelInfo = {
    visible: boolean;
    numCols: number;
    numRows: number;
    desktopWidth: number;
    desktopHeight: number;
    iconSize: number;
    rowGap: number;
    columnGap: number;
} | null;

export function Desktop() {
    // Refs
    const desktopRef = useRef<HTMLDivElement>(null);
    const desktopIconsRef = useRef<HTMLDivElement>(null);
    const gridManager = useRef(new GridManager());

    // State
    const [desktopIcons, setDesktopIcons] = useState<DesktopIconState[]>([]);
    const [debugPanelInfo, setDebugPanelInfo] = useState<DebugPanelInfo>(null);
    const [selectedIconId, setSelectedIconId] = useState<string | null>(null);

    // Context
    const background = useDesktopContext();

    // Grid Management Functions
    const getGridManagerDimensions = (): GridDimensions | null => {
        if (!desktopIconsRef.current) return null;

        const desktopIconsDiv = desktopIconsRef.current;
        gridManager.current.initializeContainer(desktopIconsDiv);
        const dimensions = gridManager.current.calculateDimensions();
        return dimensions;
    };

    // Icon Event Handlers
    const handleIconClick =
        (iconId: string) => (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling to desktop
            setSelectedIconId(prevSelected =>
                prevSelected === iconId ? null : iconId
            );
            console.log(`Icon ${iconId} clicked`);
        };

    const handleIconDoubleClick =
        (iconId: string) => (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling
            console.log(`Icon ${iconId} double-clicked - opening application`);
            // Clear selection after double-click
            setSelectedIconId(null);
            // TODO: Implement application launching logic
        };

    const handleIconContextMenu =
        (iconId: string) => (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling
            console.log(`Icon ${iconId} right-clicked - showing context menu`);
            // TODO: Implement context menu logic
        };

    const handleIconDragStart =
        (iconId: string) => (e: React.DragEvent<HTMLDivElement>) => {
            console.log(`Icon ${iconId} drag started`);
            e.dataTransfer.setData('text/plain', iconId);
            // Clear selection when starting to drag
            setSelectedIconId(null);
        };

    const handleIconDragEnd =
        (iconId: string) => (e: React.DragEvent<HTMLDivElement>) => {
            console.log(`Icon ${iconId} drag ended`);

            // Get the current mouse position relative to the desktop container
            const desktopRect =
                desktopIconsRef.current?.getBoundingClientRect();
            if (!desktopRect) return;

            // Calculate mouse position relative to desktop container
            const mouseX = e.clientX - desktopRect.left;
            const mouseY = e.clientY - desktopRect.top;

            // Get grid dimensions for snapping
            const gridDimensions = getGridManagerDimensions();
            if (!gridDimensions) return;

            // Calculate which grid cell the mouse is over
            const col = Math.floor(
                mouseX / (gridDimensions.iconWidth + gridDimensions.columnGap)
            );
            const row = Math.floor(
                mouseY / (gridDimensions.iconHeight + gridDimensions.rowGap)
            );

            // Clamp to valid grid bounds
            const clampedCol = Math.max(
                0,
                Math.min(col, gridDimensions.numCols - 1)
            );
            const clampedRow = Math.max(
                0,
                Math.min(row, gridDimensions.numRows - 1)
            );

            // Get the exact pixel position for this grid cell
            let { x: snapX, y: snapY } = gridManager.current.getCellRect(
                clampedRow,
                clampedCol
            );

            // Check if another icon is already at this position (collision detection)
            const isOccupied = desktopIcons.some(
                icon =>
                    icon.id !== iconId &&
                    icon.position.x === snapX &&
                    icon.position.y === snapY
            );

            if (isOccupied) {
                console.log(
                    `Grid cell (${clampedRow}, ${clampedCol}) is occupied, finding nearest empty cell`
                );

                // Find the nearest empty cell
                let foundEmpty = false;
                let searchRadius = 1;
                let finalX = snapX;
                let finalY = snapY;

                while (
                    !foundEmpty &&
                    searchRadius <=
                        Math.max(gridDimensions.numRows, gridDimensions.numCols)
                ) {
                    // Search in expanding radius around target position
                    for (
                        let dr = -searchRadius;
                        dr <= searchRadius && !foundEmpty;
                        dr++
                    ) {
                        for (
                            let dc = -searchRadius;
                            dc <= searchRadius && !foundEmpty;
                            dc++
                        ) {
                            const newRow = clampedRow + dr;
                            const newCol = clampedCol + dc;

                            // Check if this position is within bounds
                            if (
                                newRow >= 0 &&
                                newRow < gridDimensions.numRows &&
                                newCol >= 0 &&
                                newCol < gridDimensions.numCols
                            ) {
                                const { x: testX, y: testY } =
                                    gridManager.current.getCellRect(
                                        newRow,
                                        newCol
                                    );
                                const isTestOccupied = desktopIcons.some(
                                    icon =>
                                        icon.id !== iconId &&
                                        icon.position.x === testX &&
                                        icon.position.y === testY
                                );

                                if (!isTestOccupied) {
                                    finalX = testX;
                                    finalY = testY;
                                    foundEmpty = true;
                                    console.log(
                                        `Found empty cell at (${newRow}, ${newCol})`
                                    );
                                }
                            }
                        }
                    }
                    searchRadius++;
                }

                snapX = finalX;
                snapY = finalY;
            }

            console.log(
                `Snapping icon ${iconId} to position (${snapX}, ${snapY})`
            );

            // Update icon position to snap to grid
            setDesktopIcons(currentIcons =>
                currentIcons.map(icon =>
                    icon.id === iconId
                        ? { ...icon, position: { x: snapX, y: snapY } }
                        : icon
                )
            );
        };

    const handleIconDragOver =
        (iconId: string) => (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault(); // Allow drop
            console.log(`Icon ${iconId} dragging over`);
        };

    const handleIconFocus = (iconId: string) => () => {
        console.log(`Icon ${iconId} focused`);
        setSelectedIconId(iconId);
    };

    const handleIconBlur = (iconId: string) => () => {
        console.log(`Icon ${iconId} blurred`);
    };

    const handleIconKeyDown =
        (iconId: string) => (e: React.KeyboardEvent<HTMLDivElement>) => {
            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    console.log(`Icon ${iconId} activated via keyboard`);
                    // Trigger double-click behavior
                    break;
                case 'Delete':
                    e.preventDefault();
                    console.log(`Icon ${iconId} delete requested`);
                    // TODO: Implement delete logic
                    break;
                case 'F2':
                    e.preventDefault();
                    console.log(`Icon ${iconId} rename requested`);
                    // TODO: Implement rename logic
                    break;
                default:
                    break;
            }
        };

    // Desktop Event Handlers (for clicking on empty space)
    const handleDesktopClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only deselect if clicking directly on the desktop (not on child elements)
        if (e.target === e.currentTarget) {
            setSelectedIconId(null);
        }
    };

    const handleDesktopMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Deselect icons when mouse down on empty desktop space
        if (e.target === e.currentTarget) {
            setSelectedIconId(null);
        }
    };

    // Debug Functions
    const calculateDebugLayout = useCallback(() => {
        gridManager.current.cleanupDebugElements();

        const dimensions = getGridManagerDimensions();
        if (!dimensions) return;

        const {
            width: desktopWidth,
            height: desktopHeight,
            iconWidth,
            iconHeight,
            rowGap,
            columnGap,
            numCols,
            numRows,
        } = dimensions;

        if (config.debug.desktop) {
            setDebugPanelInfo({
                visible: true,
                numCols,
                numRows,
                desktopWidth,
                desktopHeight,
                iconSize: iconWidth,
                rowGap,
                columnGap,
            });

            const newGridContainer = gridManager.current.createDebugContainer();

            // Create debug grid (keeping existing debug grid logic)
            for (let row = 0; row < numRows; row++) {
                for (let col = 0; col < numCols; col++) {
                    const rect = document.createElement('div');
                    rect.className = 'debug-grid-rect';
                    rect.dataset.row = row.toString();
                    rect.dataset.col = col.toString();

                    const { x, y } = gridManager.current.gridPositionToPixels(
                        row,
                        col
                    );

                    rect.style.width = `${iconWidth}px`;
                    rect.style.height = `${iconHeight}px`;
                    rect.style.left = `${x}px`;
                    rect.style.top = `${y}px`;

                    // Add debug interactions
                    rect.addEventListener('mouseenter', () => {
                        const allrects =
                            newGridContainer.querySelectorAll(
                                '.debug-grid-rect'
                            );
                        allrects.forEach(s => s.classList.add('dimmed'));
                        rect.classList.remove('dimmed');

                        // Highlight adjacent cells
                        // Range from -1 to 1 for both row and column , creates a 3x3 grid around the hovered cell
                        // Shown by toggling the 'adjacent' elements' classes)
                        for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
                            for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
                                const adjRow = row + deltaRow;
                                const adjCol = col + deltaCol;
                                if (
                                    adjRow >= 0 &&
                                    adjRow < numRows &&
                                    adjCol >= 0 &&
                                    adjCol < numCols
                                ) {
                                    const adjacentRect =
                                        newGridContainer.querySelector(
                                            `[data-row="${adjRow}"][data-col="${adjCol}"]`
                                        );
                                    if (adjacentRect && adjacentRect !== rect) {
                                        adjacentRect.classList.remove('dimmed');
                                        adjacentRect.classList.add('adjacent');
                                    }
                                }
                            }
                        }
                    });

                    rect.addEventListener('mouseleave', () => {
                        const allrects =
                            newGridContainer.querySelectorAll(
                                '.debug-grid-rect'
                            );
                        allrects.forEach(s =>
                            s.classList.remove('dimmed', 'adjacent')
                        );
                    });

                    // Add coordinate points
                    const coordContainer = document.createElement('div');
                    coordContainer.className = 'debug-coordinate-points';

                    const points = [
                        { name: 'TL', x: 0, y: 0 },
                        { name: 'TR', x: iconWidth, y: 0 },
                        { name: 'BL', x: 0, y: iconHeight },
                        { name: 'BR', x: iconWidth, y: iconHeight },
                        { name: 'C', x: iconWidth / 2, y: iconHeight / 2 },
                    ];

                    points.forEach(point => {
                        const pointElement = document.createElement('div');
                        pointElement.className = 'debug-coordinate-point';
                        pointElement.style.left = `${point.x - 4}px`;
                        pointElement.style.top = `${point.y - 4}px`;

                        const globalX = x + point.x;
                        const globalY = y + point.y;

                        if (point.name === 'C') {
                            pointElement.addEventListener('mouseenter', e => {
                                e.stopPropagation();
                                const centerCoords = rect.querySelector(
                                    '.debug-center-coordinates'
                                ) as HTMLElement;
                                if (centerCoords) {
                                    const centerX = x + iconWidth / 2;
                                    const centerY = y + iconHeight / 2;
                                    centerCoords.textContent = `C: (${centerX}, ${centerY})`;
                                    centerCoords.style.opacity = '1';
                                }
                            });

                            pointElement.addEventListener('mouseleave', () => {
                                const centerCoords = rect.querySelector(
                                    '.debug-center-coordinates'
                                ) as HTMLElement;
                                if (centerCoords) {
                                    centerCoords.style.opacity = '0';
                                }
                            });
                        } else {
                            pointElement.addEventListener('mouseenter', e => {
                                e.stopPropagation();
                                const centerCoords = rect.querySelector(
                                    '.debug-center-coordinates'
                                ) as HTMLElement;
                                if (centerCoords) {
                                    centerCoords.textContent = `${point.name}: (${globalX}, ${globalY})`;
                                    centerCoords.style.opacity = '1';
                                }
                            });

                            pointElement.addEventListener('mouseleave', () => {
                                const centerCoords = rect.querySelector(
                                    '.debug-center-coordinates'
                                ) as HTMLElement;
                                if (centerCoords) {
                                    const centerX = x + iconWidth / 2;
                                    const centerY = y + iconHeight / 2;
                                    centerCoords.textContent = `C: (${centerX}, ${centerY})`;
                                    centerCoords.style.opacity = '0';
                                }
                            });
                        }

                        coordContainer.appendChild(pointElement);
                    });

                    const centerCoords = document.createElement('div');
                    centerCoords.className = 'debug-center-coordinates';
                    const centerX = x + iconWidth / 2;
                    const centerY = y + iconHeight / 2;
                    centerCoords.textContent = `C: (${centerX}, ${centerY})`;

                    rect.appendChild(coordContainer);
                    rect.appendChild(centerCoords);
                    newGridContainer.appendChild(rect);

                    // Add gap indicators
                    if (col < numCols - 1) {
                        const colGap = document.createElement('div');
                        colGap.className = 'debug-gap-indicator column-gap';
                        colGap.style.left = `${x + iconWidth}px`;
                        colGap.style.top = `${y}px`;
                        colGap.style.height = `${iconHeight}px`;
                        colGap.style.width = `${columnGap}px`;
                        newGridContainer.appendChild(colGap);
                    }
                }

                if (row < numRows - 1) {
                    const rowGapIndicator = document.createElement('div');
                    rowGapIndicator.className = 'debug-gap-indicator row-gap';
                    rowGapIndicator.style.left = '0px';
                    rowGapIndicator.style.top = `${row * (iconHeight + rowGap) + iconHeight}px`;
                    rowGapIndicator.style.width = `${numCols * (iconWidth + columnGap) - columnGap}px`;
                    rowGapIndicator.style.height = `${rowGap}px`;
                    newGridContainer.appendChild(rowGapIndicator);
                }
            }

            desktopIconsRef?.current?.appendChild(newGridContainer);
        } else {
            setDebugPanelInfo(null);
        }
    }, []);

    // Background Management (Only runs if the background being used is css based)
    useEffect(() => {
        if (desktopRef.current) {
            const style = BackgroundManager.getBackgroundStyle(
                background.currentBackground
            );
            if (style) {
                desktopRef.current.style.cssText = style;
            }
        }
    }, [background.currentBackground]);

    useEffect(() => {
        const initialIcons: IconData[] = IconManager.getAllIcons();

        const initializeIcons = () => {
            setDesktopIcons(
                initialIcons.map((icon, index) => {
                    // Get current grid dimensions
                    const gridDimensions = getGridManagerDimensions();
                    if (!gridDimensions) {
                        return {
                            ...icon,
                            position: { x: 0, y: 0 },
                            selected: false,
                            disabled: false,
                        };
                    }

                    // Convert linear index to row/col coordinates
                    const row = Math.floor(index / gridDimensions.numCols);
                    const col = index % gridDimensions.numCols;
                    const { x, y } = gridManager.current.getCellRect(row, col);

                    return {
                        ...icon,
                        position: { x: x || 0, y: y || 0 },
                        selected: false,
                        disabled: false,
                    };
                })
            );
        };

        // This is only required for the initial load assuming the dev is loading in with debug grid view enabled
        const setupDebugLayout = () => {
            setTimeout(() => {
                calculateDebugLayout();
            }, 100);
        };

        const handleResize = () => {
            gridManager.current.refresh();
            setupDebugLayout();
        };

        initializeIcons();
        setupDebugLayout();

        // Add event listeners for clearing selection
        const handleGlobalClick = (e: Event) => {
            const target = e.target as Element;
            // If click is outside the desktop-icons container, clear selection
            if (!desktopIconsRef.current?.contains(target)) {
                setSelectedIconId(null);
            }
        };

        // Add global event listeners
        document.addEventListener('click', handleGlobalClick);
        window.addEventListener('blur', () => setSelectedIconId(null));

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('click', handleGlobalClick);
            window.removeEventListener('blur', () => setSelectedIconId(null));
        };
    }, [calculateDebugLayout]);

    // Debugging: Check for changes in debug config
    // This will re-calculate the debug layout if debug settings change
    useEffect(() => {
        let lastDebugState = JSON.stringify(config.debug);

        const checkDebugInterval = setInterval(() => {
            const currentDebugState = JSON.stringify(config.debug);
            if (currentDebugState !== lastDebugState) {
                lastDebugState = currentDebugState;
                calculateDebugLayout();
            }
        }, 100);

        return () => {
            clearInterval(checkDebugInterval);
        };
    }, [calculateDebugLayout]);

    return (
        <div
            className="desktop"
            ref={desktopRef}
            onClick={handleDesktopClick}
            onMouseDown={handleDesktopMouseDown}
        >
            {/* Debug info displayed directly when debug.toggle_all and debug.desktop are true */}
            {config.debug.desktop && (
                <div className="debug-panel">
                    <div className="debug-header">Desktop Icons Debug Info</div>
                    <pre>
                        {JSON.stringify(
                            desktopIcons.reduce(
                                (acc, icon) => ({
                                    ...acc,
                                    [icon.id]: {
                                        label: icon.label,
                                        position: icon.position,
                                        selected: icon.selected,
                                    },
                                }),
                                {}
                            ),
                            null,
                            2
                        )}
                    </pre>
                </div>
            )}

            <div
                className="desktop-icons"
                ref={desktopIconsRef}
                onClick={handleDesktopClick}
            >
                {/* Enhanced Debug Grid Info Panel */}
                {debugPanelInfo && (
                    <DraggablePanel
                        defaultPosition={{
                            x: window.innerWidth / 3,
                            y: window.innerHeight / 2,
                        }}
                        className="debug-info-panel"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            lineHeight: '1.4',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                            border: '2px solid #00ff00',
                            minWidth: '280px',
                            textAlign: 'center',
                        }}
                        onClose={() => setDebugPanelInfo(null)}
                        title="Desktop Debug Info"
                    >
                        <div>
                            Columns: {debugPanelInfo.numCols} | Rows:{' '}
                            {debugPanelInfo.numRows}
                        </div>
                        <div>
                            Size: {debugPanelInfo.desktopWidth}×
                            {debugPanelInfo.desktopHeight}px
                        </div>
                        <div>
                            Icon: {debugPanelInfo.iconSize}px | Row Gap:{' '}
                            {debugPanelInfo.rowGap}px | Col Gap:{' '}
                            {debugPanelInfo.columnGap}px
                        </div>
                        <div
                            style={{
                                fontSize: '10px',
                                marginTop: '4px',
                                color: '#666',
                            }}
                        >
                            Hover rects to see coordinates • Red dots show
                            position points
                        </div>
                    </DraggablePanel>
                )}

                {desktopIcons.map(icon => (
                    <DesktopIcon
                        key={icon.id}
                        iconImage={icon.icon}
                        label={icon.label}
                        style={{
                            position: 'absolute',
                            left: icon.position.x,
                            top: icon.position.y,
                        }}
                        selected={icon.id === selectedIconId}
                        disabled={icon.disabled}
                        onClick={handleIconClick(icon.id)}
                        onDoubleClick={handleIconDoubleClick(icon.id)}
                        onContextMenu={handleIconContextMenu(icon.id)}
                        onDragStart={handleIconDragStart(icon.id)}
                        onDragEnd={handleIconDragEnd(icon.id)}
                        onDragOver={handleIconDragOver(icon.id)}
                        onFocus={handleIconFocus(icon.id)}
                        onBlur={handleIconBlur(icon.id)}
                        onKeyDown={handleIconKeyDown(icon.id)}
                    />
                ))}
            </div>
        </div>
    );
}
