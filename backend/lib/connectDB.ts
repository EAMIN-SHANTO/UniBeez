import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO as string);
    console.log("MongoDB is connected");
  } catch (err) {
    console.error(err);
  }
};

export default connectDB; 