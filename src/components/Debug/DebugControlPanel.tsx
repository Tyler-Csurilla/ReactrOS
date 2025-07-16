import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import config, { toggleDebug } from 'src/config';
import BackgroundManager from '../../services/Desktop/BackgroundManager';
import '../../styles/debug.css';

type DebugKey = keyof typeof config.debug;

// Simple Debug Control Panel Component
export function DebugControlPanel(): JSX.Element | null {
    // This is just for triggering re-renders when config changes
    const [, setRenderTrigger] = useState(0);

    // State to track if all controls are disabled
    const [controlsDisabled, setControlsDisabled] = useState(false);

    // Store the original config values when disabled
    const [savedConfigState, setSavedConfigState] = useState<Record<
        DebugKey,
        boolean
    > | null>(null);

    // Load saved settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('debugSettings');
        const savedDisableState = localStorage.getItem('debugControlsDisabled');
        const savedOriginalState = localStorage.getItem('debugOriginalState');

        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);

            // Apply saved settings to config
            (Object.keys(parsedSettings) as DebugKey[]).forEach(key => {
                if (key in config.debug) {
                    config.debug[key] = parsedSettings[key];
                }
            });

            // Force a re-render with updated config values
            setRenderTrigger(prev => prev + 1);
        }

        // Restore disable state if it was saved
        if (savedDisableState === 'true') {
            setControlsDisabled(true);
        }

        // Restore original config state if it exists
        if (savedOriginalState) {
            setSavedConfigState(JSON.parse(savedOriginalState));
        }
    }, []);

    // Toggle debug setting and save to localStorage
    const handleToggle = (key: DebugKey) => {
        // Don't allow changes if controls are disabled
        if (controlsDisabled) return;

        // Handle the main toggle "toggle_all" differently
        if (key === 'toggle_all') {
            // First toggle the main toggle_all switch
            toggleDebug(key);

            // If turning on the main toggle, turn on all other config values
            // If turning off the main toggle, turn off all other config values
            Object.keys(config.debug).forEach(debugKey => {
                if (
                    debugKey !== 'toggle_all' &&
                    config.debug[debugKey as DebugKey] !==
                        config.debug.toggle_all
                ) {
                    config.debug[debugKey as DebugKey] =
                        config.debug.toggle_all;
                    console.warn(
                        `Debug mode for ${debugKey} is now ${config.debug.toggle_all ? 'enabled' : 'disabled'}.`
                    );
                }
            });
        } else {
            toggleDebug(key);
        }

        // Force a re-render
        setRenderTrigger(prev => prev + 1);

        // Save to localStorage
        localStorage.setItem('debugSettings', JSON.stringify(config.debug));
    };

    // Handle disable all functionality
    const handleDisableAll = () => {
        if (!controlsDisabled) {
            // About to disable - save current config state
            const currentState: Record<DebugKey, boolean> = {} as Record<
                DebugKey,
                boolean
            >;
            (Object.keys(config.debug) as DebugKey[]).forEach(key => {
                currentState[key] = config.debug[key];
            });
            setSavedConfigState(currentState);

            // Set all debug values to false
            (Object.keys(config.debug) as DebugKey[]).forEach(key => {
                config.debug[key] = false;
            });

            // Save the original state and disable state to localStorage
            localStorage.setItem(
                'debugOriginalState',
                JSON.stringify(currentState)
            );
            localStorage.setItem('debugControlsDisabled', 'true');
            localStorage.setItem('debugSettings', JSON.stringify(config.debug));
        } else {
            // About to enable - restore saved config state
            if (savedConfigState) {
                (Object.keys(savedConfigState) as DebugKey[]).forEach(key => {
                    config.debug[key] = savedConfigState[key];
                });

                // Save the restored state
                localStorage.setItem(
                    'debugSettings',
                    JSON.stringify(config.debug)
                );
            }

            // Clear the saved states
            setSavedConfigState(null);
            localStorage.removeItem('debugOriginalState');
            localStorage.removeItem('debugControlsDisabled');
        }

        setControlsDisabled(!controlsDisabled);
        setRenderTrigger(prev => prev + 1);
    };

    if (!import.meta.env.DEV) return null;

    const debugKeys = Object.keys(config.debug) as DebugKey[];

    // Show background manager debug info directly in the control panel
    const backgroundDebugInfo = config.debug.background_manager ? (
        <div className="debug-panel">
            <div className="debug-header">{`${BackgroundManager.getCurrentBackground()} Background Debug Info`}</div>
            <pre>
                {JSON.stringify(
                    {
                        available: Object.keys(
                            BackgroundManager.getAllBackgrounds()
                        ),
                        current: BackgroundManager.getCurrentBackground(),
                        currentDetails:
                            BackgroundManager.getAllBackgrounds()[
                                BackgroundManager.getCurrentBackground()
                            ],
                    },
                    null,
                    2
                )}
            </pre>
        </div>
    ) : null;
    // Helper to format debug key labels
    const formatDebugKeyLabel = (key: string) =>
        key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    return (
        <>
            <div
                className={`debug-control-panel ${controlsDisabled ? 'disabled-mode' : ''}`}
            >
                <div className="debug-header">Debug Controls</div>

                {/* Disable All Button */}
                <div className="debug-disable-all">
                    <button
                        onClick={handleDisableAll}
                        className={`disable-all-btn ${controlsDisabled ? 'active' : ''}`}
                    >
                        {controlsDisabled
                            ? 'Enable All Controls'
                            : 'Disable All Controls'}
                    </button>
                </div>

                <div className="debug-groups">
                    {debugKeys.map(key => (
                        <div key={key} className="debug-group-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.debug[key]}
                                    onChange={() => handleToggle(key)}
                                    disabled={controlsDisabled}
                                />
                                {/* Display formatted label */}
                                {formatDebugKeyLabel(key)}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background debug info displayed directly */}
            {backgroundDebugInfo}
        </>
    );
}
