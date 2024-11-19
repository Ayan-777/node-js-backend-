// Define a new class `ApiError` that extends the built-in `Error` class
class ApiError extends Error {
    // Constructor to initialize the ApiError instance
    constructor(
        statusCode, // HTTP status code indicating the error type
        message = "Something went wrong", // Default error message
        errors = [], // Additional errors or details about the error
        stack = "" // Optional stack trace for debugging purposes
    ) {
        // Call the parent class (Error) constructor with the message
        super(message);
        
        this.statusCode = statusCode; // Set the HTTP status code
        this.data = null; // Initialize the data property to null
        this.message = message; // Set the error message
        this.success = false; // Indicate the operation was not successful
        this.errors = errors; // Set additional error details

        if (stack) { // If a stack trace is provided
            this.stack = stack; // Set the stack trace
        } else {
            // Otherwise, capture the stack trace for this error instance
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export the ApiError class for use in other modules
export { ApiError }
