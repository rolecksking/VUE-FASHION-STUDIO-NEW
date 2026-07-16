// Firebase Studio Configuration for VUE FASHION STUDIO
import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Default Sandbox Config (Provisioned by AI Studio)
export const defaultSandboxConfig = {
  apiKey: "AIzaSyC3GKkd2mUWQFS5JUYpfWvnvWF1V_DrJOI",
  authDomain: "magnificent-technique-c3bk6.firebaseapp.com",
  projectId: "magnificent-technique-c3bk6",
  storageBucket: "magnificent-technique-c3bk6.firebasestorage.app",
  messagingSenderId: "229166615486",
  appId: "1:229166615486:web:a743b90bcf115bf43c87ef"
};

// Retrieve any custom configuration from localStorage or environment variables
export function getFirebaseConfig() {
  // Check if server-injected studio config is available
  const serverConfig = (window as any).__STUDIO_CONFIG__;
  if (serverConfig && serverConfig.firebase && serverConfig.firebase.projectId) {
    return serverConfig.firebase;
  }

  const localRaw = localStorage.getItem("vfs_custom_firebase_config");
  if (localRaw) {
    try {
      const parsed = JSON.parse(localRaw);
      if (parsed.projectId) {
        return parsed;
      }
    } catch (e) {
      console.warn("Invalid stored firebase config:", e);
    }
  }

  // Fallback to environment variables if provided
  const metaEnv = (import.meta as any).env || {};
  const envConfig = {
    apiKey: metaEnv.VITE_FIREBASE_API_KEY,
    authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
    storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: metaEnv.VITE_FIREBASE_APP_ID,
    databaseId: metaEnv.VITE_FIREBASE_DATABASE_ID,
  };

  if (envConfig.projectId && envConfig.apiKey) {
    return envConfig;
  }

  return defaultSandboxConfig;
}

let appInstance: any = null;
let dbInstance: any = null;
let storageInstance: any = null;
let authInstance: any = null;

export function getFirebaseApp() {
  if (!appInstance) {
    const config = getFirebaseConfig();
    appInstance = getApps().length === 0 ? initializeApp(config) : getApp();
  }
  return appInstance;
}

export function getDbInstance() {
  if (!dbInstance) {
    const app = getFirebaseApp();
    const config = getFirebaseConfig();
    const dbId = config.databaseId || (config.projectId === "magnificent-technique-c3bk6"
      ? "ai-studio-vuefashionstudio-56f91c08-f344-42f3-87a4-556a733d1ca7"
      : "(default)");
    dbInstance = dbId === "(default)"
      ? initializeFirestore(app, {})
      : initializeFirestore(app, {}, dbId);
  }
  return dbInstance;
}

export function getStorageInstance() {
  if (!storageInstance) {
    storageInstance = getStorage(getFirebaseApp());
  }
  return storageInstance;
}

export function getAuthInstance() {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}

// Export Proxies so they behave exactly like the real objects, but are initialized lazily upon first property access!
export const db = new Proxy({}, {
  get: (target: any, prop: string | symbol) => {
    if (prop === 'then') return undefined; // Prevent promise-like resolution issues
    const instance = getDbInstance();
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
  set: (target: any, prop: string | symbol, value: any) => {
    getDbInstance()[prop] = value;
    return true;
  }
}) as any;

export const storage = new Proxy({}, {
  get: (target: any, prop: string | symbol) => {
    if (prop === 'then') return undefined;
    const instance = getStorageInstance();
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
  set: (target: any, prop: string | symbol, value: any) => {
    getStorageInstance()[prop] = value;
    return true;
  }
}) as any;

export const auth = new Proxy({}, {
  get: (target: any, prop: string | symbol) => {
    if (prop === 'then') return undefined;
    const instance = getAuthInstance();
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
  set: (target: any, prop: string | symbol, value: any) => {
    getAuthInstance()[prop] = value;
    return true;
  }
}) as any;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to save a single CMS config document to Firestore
export async function saveCMSConfig(docId: string, data: any) {
  const path = `cms_config/${docId}`;
  try {
    const docRef = doc(db, "cms_config", docId);
    await setDoc(docRef, { data, updatedAt: new Date().toISOString() });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

// Helper to fetch a single CMS config document from Firestore
export async function getCMSConfig(docId: string) {
  const path = `cms_config/${docId}`;
  try {
    const docRef = doc(db, "cms_config", docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().data;
    }
  } catch (error: any) {
    if (error?.code === "permission-denied" || error?.message?.includes("permission") || error?.message?.includes("Permission")) {
      console.warn(`[Firebase] Permission denied reading ${path}. Falling back to default/local storage. Ensure your rules allow unauthenticated read if you want public visitors to see your dynamic CMS content.`);
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
  return null;
}

// Helper to save an Inquiry to Firestore
export async function saveInquiry(inquiry: any) {
  const path = `inquiries/${inquiry.id}`;
  try {
    // Save to the inquiries collection
    const docRef = doc(db, "inquiries", inquiry.id);
    await setDoc(docRef, {
      ...inquiry,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

// Helper to get all Inquiries from Firestore (ordered by newest)
export async function getInquiries() {
  const path = "inquiries";
  try {
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const items: any[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data());
    });
    return items;
  } catch (error: any) {
    if (error?.code === "permission-denied" || error?.message?.includes("permission") || error?.message?.includes("Permission")) {
      console.warn("[Firebase] Permission denied fetching inquiries. Firebase Auth session is likely expired or missing.");
      throw new Error("PERMISSION_DENIED");
    }
    handleFirestoreError(error, OperationType.LIST, path);
    return null;
  }
}

// Helper to delete an Inquiry from Firestore
export async function deleteInquiryFromFirebase(id: string) {
  const path = `inquiries/${id}`;
  try {
    const docRef = doc(db, "inquiries", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}

// Helper to upload a base64 string or file object to Firebase Storage
export async function uploadToFirebaseStorage(base64OrFile: string | File, fileName: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      let blob: Blob;
      if (typeof base64OrFile === "string") {
        if (base64OrFile.startsWith("data:")) {
          // Convert base64 to blob
          const response = await fetch(base64OrFile);
          blob = await response.blob();
        } else {
          // Just a regular URL, no need to upload
          resolve(base64OrFile);
          return;
        }
      } else {
        blob = base64OrFile;
      }

      const storageRef = ref(storage, `uploads/${Date.now()}_${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Firebase Storage upload error:", error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    } catch (err) {
      console.error("Upload process error:", err);
      reject(err);
    }
  });
}

// Helper to upload a File or Blob to Firebase Storage with real-time progress monitoring
export async function uploadWithProgress(
  file: File | Blob,
  fileName: string,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, `uploads/${Date.now()}_${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        },
        (error) => {
          console.error("Firebase Storage upload error with progress:", error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    } catch (err) {
      console.error("Upload with progress failed:", err);
      reject(err);
    }
  });
}

// Helper to upload a base64 string or file object to Firebase Storage under a client-specific folder
export async function uploadCampaignAsset(base64OrFile: string | File, clientEmail: string, fileName: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      let blob: Blob;
      if (typeof base64OrFile === "string") {
        if (base64OrFile.startsWith("data:")) {
          // Convert base64 to blob
          const response = await fetch(base64OrFile);
          blob = await response.blob();
        } else {
          // Just a regular URL, no need to upload
          resolve(base64OrFile);
          return;
        }
      } else {
        blob = base64OrFile;
      }

      // Organize under campaign_requests/{clientEmail}/
      const sanitizedEmail = clientEmail.replace(/[^a-zA-Z0-9@.]/g, "_");
      const storageRef = ref(storage, `campaign_requests/${sanitizedEmail}/${Date.now()}_${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Firebase Storage upload error:", error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    } catch (err) {
      console.error("Upload process error:", err);
      reject(err);
    }
  });
}

