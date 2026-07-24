// Firebase Studio Configuration for VUE FASHION STUDIO
import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

export interface FirebaseAppConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseId?: string;
}

// Default Sandbox Config (Provisioned by AI Studio)
export const defaultSandboxConfig: FirebaseAppConfig = {
  apiKey: "AIzaSyC3GKkd2mUWQFS5JUYpfWvnvWF1V_DrJOI",
  authDomain: "magnificent-technique-c3bk6.firebaseapp.com",
  projectId: "magnificent-technique-c3bk6",
  storageBucket: "magnificent-technique-c3bk6.firebasestorage.app",
  messagingSenderId: "229166615486",
  appId: "1:229166615486:web:a743b90bcf115bf43c87ef"
};

// Retrieve configuration from environment variables or default sandbox
export function getFirebaseConfig(): FirebaseAppConfig {
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

export const firebaseConfig = getFirebaseConfig();

// Standard Firebase Initializer
let app: any;
let db: any;
let storage: any;
let auth: any;
let dbId = "(default)";

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  const getDatabaseId = () => {
    if (firebaseConfig && firebaseConfig.databaseId) return firebaseConfig.databaseId;
    if (firebaseConfig && firebaseConfig.projectId === "magnificent-technique-c3bk6") {
      return "ai-studio-vuefashionstudio-56f91c08-f344-42f3-87a4-556a733d1ca7";
    }
    return "(default)";
  };
  
  dbId = getDatabaseId();
  db = dbId === "(default)"
    ? initializeFirestore(app, {})
    : initializeFirestore(app, {}, dbId);
    
  storage = getStorage(app);
  auth = getAuth(app);
} catch (error) {
  console.error("[Firebase] Initialization failed. Attempting fallback to sandbox:", error);
  try {
    app = getApps().length === 0 ? initializeApp(defaultSandboxConfig) : getApp();
    dbId = "ai-studio-vuefashionstudio-56f91c08-f344-42f3-87a4-556a733d1ca7";
    db = initializeFirestore(app, {}, dbId);
    storage = getStorage(app);
    auth = getAuth(app);
  } catch (innerError) {
    console.error("[Firebase] Fatal initialization failure:", innerError);
    app = null;
    db = null;
    storage = null;
    auth = {
      currentUser: null,
      onAuthStateChanged: () => () => {},
    };
  }
}

export { app, db, dbId, storage, auth };

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
  if (!db) {
    console.warn("[Firebase] db is not initialized. Skipping saveCMSConfig.");
    return false;
  }
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
  if (!db) {
    console.warn("[Firebase] db is not initialized. Skipping getCMSConfig.");
    return null;
  }
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
  if (!db) {
    console.warn("[Firebase] db is not initialized. Skipping saveInquiry.");
    return false;
  }
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
  if (!db) {
    console.warn("[Firebase] db is not initialized. Skipping getInquiries.");
    return [];
  }
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
  if (!db) {
    console.warn("[Firebase] db is not initialized. Skipping deleteInquiryFromFirebase.");
    return false;
  }
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
      if (!storage) {
        console.warn("[Firebase] Storage is not initialized.");
        reject(new Error("STORAGE_NOT_INITIALIZED"));
        return;
      }
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
      if (!storage) {
        console.warn("[Firebase] Storage is not initialized.");
        reject(new Error("STORAGE_NOT_INITIALIZED"));
        return;
      }
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
      if (!storage) {
        console.warn("[Firebase] Storage is not initialized.");
        reject(new Error("STORAGE_NOT_INITIALIZED"));
        return;
      }
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

