import { useEffect, useState } from 'react';
import BackgroundManager, {
    type BackgroundKey,
    type BackgroundWithKey,
} from '../services/Desktop/BackgroundManager';

export interface IDesktopBackgroundHook {
    currentBackground: BackgroundKey;
    currentBackgroundData: BackgroundWithKey | undefined;
    setBackground: (name: string) => boolean;
    getBackgroundStyle: (name: string) => string;
    allBackgrounds: () => BackgroundKey[];
    allBackgroundsWithData: () => BackgroundWithKey[];
}

export function useDesktopBackground(): IDesktopBackgroundHook {
    const [currentBackground, setCurrentBackground] = useState(
        BackgroundManager.getDefaultBackgroundName()
    );

    const setBackground = (name: string): boolean => {
        if (BackgroundManager.hasBackground(name)) {
            const success = BackgroundManager.setCurrentBackground(name);
            if (success) {
                setCurrentBackground(name as BackgroundKey);
            }
            return success;
        }
        return false;
    };

    const getBackgroundStyle = (name: string): string => {
        return BackgroundManager.getBackgroundStyle(name);
    };

    useEffect(() => {
        // Set initial background
        setBackground(BackgroundManager.getDefaultBackgroundName());
    }, []);

    return {
        currentBackground,
        currentBackgroundData: BackgroundManager.getCurrentBackgroundData(),
        setBackground,
        getBackgroundStyle,
        allBackgrounds: () => BackgroundManager.getAvailableBackgroundNames(),
        allBackgroundsWithData: () =>
            BackgroundManager.getAllBackgroundsWithKeys(),
    };
}
