import mongoose from "mongoose";
const connectDb = async (url) => {
    try{
        mongoose.set('strictQuery', true)
        const conn = await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected successfully}`);
    }catch(err){
        console.error(err);
        process.exit(1);
    }
}

export default connectDb;
