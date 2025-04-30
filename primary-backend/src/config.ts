import dotenv from "dotenv";
dotenv.config();
export const PORT = process.env.PORT || 3000;
export const JWT_SECERT = process.env.JWT_SECRET || "asldkfjal;ksdjflk;asjdfkljjasdf"