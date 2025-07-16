import { createContext, useContext } from 'react';
import { type IDesktopBackgroundHook } from '../hooks/useDesktopBackground';

export const DesktopContext = createContext<IDesktopBackgroundHook | null>(
    null
);

export const useDesktopContext = () => {
    const context = useContext(DesktopContext);
    if (!context)
        throw new Error(
            'useDesktopContext must be used within a DesktopProvider'
        );
    return context;
};
