
// Firebase Storage service
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import app from "./config";

// Initialize Cloud Storage
const storage = getStorage(app);

// Helper functions
export const uploadFile = async (file, path) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const deleteFile = async (path) => {
  const storageRef = ref(storage, path);
  return await deleteObject(storageRef);
};

export default storage;
