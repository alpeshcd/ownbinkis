
// Re-export firebase services from the new structure
// This is for backwards compatibility
import { app, auth, db, storage } from "../firebase";

export { auth, db, storage };
export default app;
