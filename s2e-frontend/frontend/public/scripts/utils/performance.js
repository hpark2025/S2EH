// performance.js – Monitors performance metrics like page loads and errors

export function trackPerformance() {
    // Track page load time
    window.addEventListener('load', () => {
        performanceMetrics.pageLoads++;
        const loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
        performanceMetrics.averageResponseTime = 
            (performanceMetrics.averageResponseTime * (performanceMetrics.pageLoads - 1) + loadTime) 
            / performanceMetrics.pageLoads;
    });

    // Track errors
    window.addEventListener('error', () => {
        performanceMetrics.errors++;
        // In production, this would send error data to the backend
    });
} 
