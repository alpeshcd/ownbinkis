
// Firebase authentication service
import { getAuth } from "firebase/auth";
import app from "./config";

// Initialize Firebase Authentication
const auth = getAuth(app);

// Export as both default and named export for compatibility
export { auth };
export default auth;
