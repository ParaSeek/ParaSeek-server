import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(String(process.env.MONGO_URI));
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

export {
    connectDB
};