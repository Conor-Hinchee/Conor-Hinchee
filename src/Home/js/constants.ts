const Desktop_Width = 1028;
const Tablet_Width = 768;
const Mobile_Width = 480;

//SET DEBUG IF WE ARE ON LOCALHOST or a debug cookie is set
const IS_DEBUG_MODE = window.location.hostname === "localhost" || document.cookie.includes("debug=true");

type LogLevel = "log" | "info" | "warn" | "error";

interface DebugLogOptions {
    logLevel?: LogLevel;
    message: unknown;
}

const DEBUG_LOG = ({ logLevel = "info", message }: DebugLogOptions): void => {
    const validTypes: LogLevel[] = ["log", "info", "warn", "error"];

    let validatedLogLevel = logLevel;
    const validatedMessage = JSON.stringify(message);


    if (!validTypes.includes(logLevel)) {
        validatedLogLevel = "info";
    }

    if (validatedLogLevel === "error") {
        // Always log errors
        console.error(validatedMessage);
        return;
    }

    if (IS_DEBUG_MODE) {
        console[validatedLogLevel](validatedMessage);
    }
};

export type { LogLevel, DebugLogOptions };
export { Desktop_Width, Tablet_Width, Mobile_Width, IS_DEBUG_MODE, DEBUG_LOG };