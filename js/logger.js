// logger.js
import { showTerminal } from './ui.js'

// Create a container for log messages
const logContainer = document.createElement('div');
logContainer.id = "logContainer";
logContainer.classList = showTerminal.boolState ? "logContainer" : "logContainer hidden";
document.body.appendChild(logContainer);

// Function to display messages
function displayLog(message, color = 'white') {
    const logMessage = document.createElement('div');
    logMessage.textContent = `[${getTimestamp()}] ${message}`;
    logMessage.style.color = color;
    logContainer.prepend(logMessage);
    logMessage.style.opacity = '1'; // Start fully visible
    logMessage.style.transition = 'opacity 1s'; // Transition for fade-out

    // Set a timeout to fade out and then remove the message
    setTimeout(() => {
        logMessage.style.opacity = '0.3'; // Start fading out
    }, 4000); // Delay to ensure the transition takes effect


    // Set a timeout to remove the message after a certain duration (e.g., 5 seconds)
    setTimeout(() => {
        logMessage.remove();
    }, 50000); // Change 5000 to the desired duration in milliseconds
}

// Function to get the current timestamp
function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString(); // You can customize the format as needed
}

// Override console.log
function setupLogger() {
    const originalLog = console.log;
    console.log = function(message, color) {
        displayLog(message, color);
        originalLog.apply(console, arguments); // Call the original console.log
    };
}

// Export the setupLogger function
export { setupLogger };
