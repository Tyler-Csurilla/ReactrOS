import { isValidImageUrl } from '../../util/validateImageUrl';

import bg_monkey from '@assets/Backgrounds/bg_monkey.png';
import bg_nami from '@assets/Backgrounds/bg_nami.webp';

export type Background = {
    type: 'image' | 'css';
    value: string;
    displayName: string;
    backgroundRepeat?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundAttachment?: string;
    backgroundBlendMode?: string;
    backgroundClip?: string;
    backgroundOrigin?: string;
};

// Background with its key for type safety
export type BackgroundWithKey = Background & { key: string };

// Define the background configuration as a const assertion for type inference
const BACKGROUND_DEFINITIONS = {
    nami: {
        type: 'image' as const,
        value: bg_nami,
        displayName: 'Nami',
        backgroundRepeat: 'repeat',
    },
    monkey: {
        type: 'image' as const,
        value: bg_monkey,
        displayName: 'Monkey D. Luffy',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    cubes: {
        type: 'css' as const,
        displayName: 'Geometric Cubes',
        value: `
            background-color: #230027;
            opacity: 0.8;
            background-image:  linear-gradient(30deg, #223a78 12%, transparent 12.5%, transparent 87%, #223a78 87.5%, #223a78), linear-gradient(150deg, #223a78 12%, transparent 12.5%, transparent 87%, #223a78 87.5%, #223a78), linear-gradient(30deg, #223a78 12%, transparent 12.5%, transparent 87%, #223a78 87.5%, #223a78), linear-gradient(150deg, #223a78 12%, transparent 12.5%, transparent 87%, #223a78 87.5%, #223a78), linear-gradient(60deg, #223a7877 25%, transparent 25.5%, transparent 75%, #223a7877 75%, #223a7877), linear-gradient(60deg, #223a7877 25%, transparent 25.5%, transparent 75%, #223a7877 75%, #223a7877);
            background-size: 68px 119px;
            background-position: 0 0, 0 0, 34px 60px, 34px 60px, 0 0, 34px 60px;
        `.trim(),
    },
} as const;

// Extract type-safe background keys from the definitions
export type BackgroundKey = keyof typeof BACKGROUND_DEFINITIONS;

// TODO: Remove this, this is just for testing until I have a background selection UI
const GENERATED_BACKGROUND_KEY: BackgroundKey = Object.keys(
    BACKGROUND_DEFINITIONS
)[
    Math.floor(Math.random() * Object.keys(BACKGROUND_DEFINITIONS).length)
] as BackgroundKey;

// Define which background is the default
const DEFAULT_BACKGROUND_KEY: BackgroundKey = GENERATED_BACKGROUND_KEY;

/**
 * Handles the management of desktop backgrounds with type safety.
 */
export default class BackgroundManager {
    private static backgrounds: Record<string, Background> = {};
    private static defaultBackground: BackgroundKey = DEFAULT_BACKGROUND_KEY;
    private static currentBackground: BackgroundKey = DEFAULT_BACKGROUND_KEY;

    public static initialize() {
        // Load default backgrounds from definitions
        this.backgrounds = { ...BACKGROUND_DEFINITIONS };
    }

    /**
     * Add a new background to the manager.
     * If the input is a valid image URL, it will be stored as an image type.
     * Otherwise, it will be stored as a CSS pattern.
     *
     * Example usage:
     * BackgroundManager.addBackground('sunset', 'path/to/sunset.jpg', 'Beautiful Sunset')
     * BackgroundManager.addBackground('gradient', 'linear-gradient(45deg, #ff6b6b, #4ecdc4)', 'Cool Gradient')
     */
    public static addBackground(
        name: string,
        input: string,
        displayName: string,
        options: Partial<
            Omit<Background, 'type' | 'value' | 'displayName'>
        > = {}
    ) {
        if (isValidImageUrl(input)) {
            this.backgrounds[name] = {
                type: 'image',
                value: input,
                displayName,
                backgroundRepeat: options.backgroundRepeat || 'no-repeat',
                backgroundSize: options.backgroundSize || 'cover',
                backgroundPosition: options.backgroundPosition || 'center',
                ...options,
            };
        } else {
            this.backgrounds[name] = {
                type: 'css',
                value: input,
                displayName,
                ...options,
            };
        }
    }

    public static getBackground(name: string): Background | undefined {
        return this.backgrounds[name];
    }

    public static getAllBackgrounds(): Record<string, Background> {
        return { ...this.backgrounds };
    }

    public static getCurrentBackground(): BackgroundKey {
        return this.currentBackground;
    }

    /**
     * Get the current background as a Background object with its key
     */
    public static getCurrentBackgroundData(): BackgroundWithKey | undefined {
        const background = this.backgrounds[this.currentBackground];
        if (!background) return undefined;
        return { ...background, key: this.currentBackground };
    }

    /**
     * Set the current background (with validation)
     */
    public static setCurrentBackground(name: string): boolean {
        if (this.hasBackground(name) && this.isValidBackgroundKey(name)) {
            this.currentBackground = name as BackgroundKey;
            return true;
        }
        return false;
    }

    /**
     * Returns the name of the default background
     */
    public static getDefaultBackground(): BackgroundKey {
        return this.defaultBackground;
    }

    /**
     * Get the default background as a Background object with its key
     */
    public static getDefaultBackgroundData(): BackgroundWithKey {
        const background = this.backgrounds[this.defaultBackground];
        return { ...background, key: this.defaultBackground };
    }

    /**
     * Returns the name of the default background (alias for getDefaultBackground)
     */
    public static getDefaultBackgroundName(): BackgroundKey {
        return this.defaultBackground;
    }

    /**
     * Sets the default background (with validation)
     */
    public static setDefaultBackground(name: string): boolean {
        if (this.hasBackground(name) && this.isValidBackgroundKey(name)) {
            this.defaultBackground = name as BackgroundKey;
            return true;
        }
        return false;
    }

    /**
     * Get all background names that are available
     */
    public static getAvailableBackgroundNames(): BackgroundKey[] {
        return Object.keys(this.backgrounds) as BackgroundKey[];
    }

    /**
     * Get all backgrounds with their keys for display purposes
     */
    public static getAllBackgroundsWithKeys(): BackgroundWithKey[] {
        return Object.entries(this.backgrounds).map(([key, background]) => ({
            ...background,
            key,
        }));
    }

    /**
     * Check if a background name exists
     */
    public static hasBackground(name: string): boolean {
        return name in this.backgrounds;
    }

    /**
     * Type guard to check if a string is a valid BackgroundKey
     */
    private static isValidBackgroundKey(name: string): name is BackgroundKey {
        return name in BACKGROUND_DEFINITIONS;
    }

    /**
     * Get all available background keys as a typed array
     */
    public static getBackgroundKeys(): BackgroundKey[] {
        return Object.keys(BACKGROUND_DEFINITIONS) as BackgroundKey[];
    }

    /**
     * Get background by key with full type safety
     */
    public static getBackgroundByKey(key: BackgroundKey): Background {
        return this.backgrounds[key];
    }

    /**
     * Set current background using typed key
     */
    public static setCurrentBackgroundByKey(key: BackgroundKey): void {
        this.currentBackground = key;
    }

    /**
     * Set default background using typed key
     */
    public static setDefaultBackgroundByKey(key: BackgroundKey): void {
        this.defaultBackground = key;
    }

    /**
     * Get the CSS style string for a background.
     * For images, returns a complete background style string with all properties.
     * For CSS patterns, returns the pattern as-is.
     */
    public static getBackgroundStyle(name: string): string {
        const background = this.backgrounds[name];
        if (!background) return '';

        if (background.type === 'image') {
            const styles: string[] = [];
            if (background.backgroundImage || background.value) {
                styles.push(`background-image: url(${background.value})`);
            }
            if (background.backgroundColor) {
                styles.push(`background-color: ${background.backgroundColor}`);
            }
            if (background.backgroundRepeat) {
                styles.push(
                    `background-repeat: ${background.backgroundRepeat}`
                );
            }
            if (background.backgroundSize) {
                styles.push(`background-size: ${background.backgroundSize}`);
            }
            if (background.backgroundPosition) {
                styles.push(
                    `background-position: ${background.backgroundPosition}`
                );
            }
            if (background.backgroundAttachment) {
                styles.push(
                    `background-attachment: ${background.backgroundAttachment}`
                );
            }
            if (background.backgroundBlendMode) {
                styles.push(
                    `background-blend-mode: ${background.backgroundBlendMode}`
                );
            }
            if (background.backgroundClip) {
                styles.push(`background-clip: ${background.backgroundClip}`);
            }
            if (background.backgroundOrigin) {
                styles.push(
                    `background-origin: ${background.backgroundOrigin}`
                );
            }
            return styles.join('; ');
        }
        return background.value;
    }
}

BackgroundManager.initialize();
