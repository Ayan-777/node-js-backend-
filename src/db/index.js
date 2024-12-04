import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'videotube', // Add the database name here
        });

        console.log(`MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error('MONGODB connection FAILED', error);
        process.exit(1);
    }
};

export default connectDB;
