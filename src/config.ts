interface Config {
    debug: {
        toggle_all: boolean;
        background_manager: boolean;
        desktop: boolean;
    };
}

const isDevelopmentBuild = import.meta.env.MODE === 'development';

const config: Config = {
    debug: {
        toggle_all: isDevelopmentBuild,
        background_manager: isDevelopmentBuild,
        desktop: isDevelopmentBuild,
    },
};

const toggleDebug = (key: keyof Config['debug']) => {
    if (key in config.debug) {
        config.debug[key] = !config.debug[key];
        console.warn(
            `Debug mode for ${key} is now ${config.debug[key] ? 'enabled' : 'disabled'}.`
        );
    } else {
        throw new Error(`Invalid debug key: ${key}`);
    }
};

if (import.meta.env.MODE === 'development') {
    // Enable debug mode for development
    console.log('Debug mode is enabled:', config.debug);
}
export { toggleDebug };
export default config;
