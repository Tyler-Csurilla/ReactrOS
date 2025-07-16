import getCssVarPx from '../../util/getCssVarPx';

export interface GridDimensions {
    width: number;
    height: number;
    iconWidth: number;
    iconHeight: number;
    rowGap: number;
    columnGap: number;
    numCols: number;
    numRows: number;
}

export default class GridManager {
    private container: HTMLElement | null = null;
    private dimensions: GridDimensions | null = null;

    /**
     * Attach a container element to the grid manager
     */
    initializeContainer(container: HTMLElement): void {
        if (!(container instanceof HTMLElement)) {
            throw new Error('GridManager: container must be an HTMLElement');
        }
        if (this.container) {
            // Container already attached, reusing existing one
            // If you want to use a different container, create a new GridManager instance or use switchContainer(...)
            return;
        }
        this.container = container;
    }

    /**
     * Switch the container to a new one
     * @param newContainer New container element
     */
    switchContainer(newContainer: HTMLElement): void {
        if (!(newContainer instanceof HTMLElement)) {
            throw new Error('GridManager: newContainer must be an HTMLElement');
        }
        this.container = newContainer;
    }

    /**
     * Calculate grid dimensions based on container and CSS variables
     */
    calculateDimensions(): GridDimensions | null {
        if (!this.container) {
            console.warn('GridManager: No container attached');
            return null;
        }

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const iconWidth = getCssVarPx('--icon-width');
        const iconHeight = getCssVarPx('--icon-height');
        const rowGap = getCssVarPx('--desktop-row-gap');
        const columnGap = getCssVarPx('--desktop-column-gap');

        const numCols = Math.floor(width / (iconWidth + columnGap));
        const numRows = Math.floor(height / (iconHeight + rowGap));

        this.dimensions = {
            width,
            height,
            iconWidth,
            iconHeight,
            rowGap,
            columnGap,
            numCols,
            numRows,
        };

        return this.dimensions;
    }

    /**
     * Get current grid dimensions (calculates if not cached)
     */
    getDimensions(): GridDimensions | null {
        return this.dimensions || this.calculateDimensions();
    }

    /**
     * Get icon grid position from index
     */
    getIconGridPosition(index: number): { row: number; column: number } {
        const dims = this.getDimensions();
        if (!dims || dims.numCols === 0) return { row: 0, column: 0 };

        const row = Math.floor(index / dims.numCols);
        const column = index % dims.numCols;
        return { row, column };
    }

    /**
     * Convert grid position to pixel coordinates
     */
    gridPositionToPixels(row: number, col: number): { x: number; y: number } {
        const dims = this.getDimensions();
        if (!dims) return { x: 0, y: 0 };

        const x = col * (dims.iconWidth + dims.columnGap);
        const y = row * (dims.iconHeight + dims.rowGap);
        return { x, y };
    }

    /**
     * Force recalculation of dimensions (call on resize)
     */
    refresh(): void {
        this.dimensions = null;
        this.calculateDimensions();
    }

    /**
     * Get the bounding rectangle and pixel coordinates for a grid cell
     * @param row Row index
     * @param col Column index
     * @returns { x, y, width, height, right, bottom }
     */
    getCellRect(
        row: number,
        col: number
    ): {
        x: number;
        y: number;
        width: number;
        height: number;
        right: number;
        bottom: number;
    } {
        const dims = this.getDimensions();
        if (!dims) {
            return { x: 0, y: 0, width: 0, height: 0, right: 0, bottom: 0 };
        }
        const x = col * (dims.iconWidth + dims.columnGap);
        const y = row * (dims.iconHeight + dims.rowGap);
        const width = dims.iconWidth;
        const height = dims.iconHeight;
        const right = x + width;
        const bottom = y + height;
        return { x, y, width, height, right, bottom };
    }

    /**
     * Create a basic debug grid container element
     */
    createDebugContainer(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'circles-container';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.pointerEvents = 'none';
        container.style.width = '100%';
        container.style.height = '100%';
        return container;
    }

    /**
     * Remove existing debug elements from the DOM
     */
    cleanupDebugElements(): void {
        const circlesContainer = document.getElementById('circles-container');
        if (circlesContainer) circlesContainer.remove();

        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) debugInfo.remove();
    }
}
