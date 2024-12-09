// Unit tests for: connectDB

import mongoose from "mongoose";
import connectDB from "../index";

jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

describe("connectDB() connectDB method", () => {
  let originalEnv;

  beforeAll(() => {
    // Save the original environment variables
    originalEnv = process.env;
  });

  beforeEach(() => {
    // Reset the environment variables before each test
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore the original environment variables
    process.env = originalEnv;
  });

  describe("Happy paths", () => {
    it("should connect to MongoDB successfully with valid URI", async () => {
      // Arrange
      const mockConnectionInstance = {
        connection: { host: "localhost" },
      };
      mongoose.connect.mockResolvedValue(mockConnectionInstance);
      process.env.MONGODB_URI = "mongodb://valid-uri";

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI, {
        dbName: "videotube",
      });
      expect(mongoose.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge cases", () => {
    it("should handle connection failure gracefully", async () => {
      // Arrange
      const mockError = new Error("Connection failed");
      mongoose.connect.mockRejectedValue(mockError);
      process.env.MONGODB_URI = "mongodb://invalid-uri";

      // Mock process.exit to prevent the test from exiting
      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI, {
        dbName: "videotube",
      });
      expect(mongoose.connect).toHaveBeenCalledTimes(1);
      expect(mockExit).toHaveBeenCalledWith(1);

      // Clean up
      mockExit.mockRestore();
    });

    it("should throw an error if MONGODB_URI is not defined", async () => {
      // Arrange
      delete process.env.MONGODB_URI;

      // Mock process.exit to prevent the test from exiting
      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).not.toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(1);

      // Clean up
      mockExit.mockRestore();
    });
  });
});

// End of unit tests for: connectDB
