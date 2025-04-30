
// Firebase authentication service
import { getAuth } from "firebase/auth";
import app from "./config";

// Initialize Firebase Authentication
const auth = getAuth(app);

export default auth;
