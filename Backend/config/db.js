import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const initDatabaseConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ DB connection Error', error);
        process.exit(1);
    }
};

const startServer = async (port, server) => {
    await initDatabaseConnection();
    server.listen(port, () => {
        console.log(`✅ Server up and running on port ${port}🎉`);
    });
};

export default startServer;
