import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";
import { firebaseSettingsSchema, firebaseWebConfig } from "@/cms/firebase";

// Initialise only after an administrator connects a configured project.
export async function getFirebaseServices(input) {
  const settings = firebaseSettingsSchema.parse(input);
  if (!settings.enabled)
    throw Error("Enable and save the Firebase integration first.");
  const config = firebaseWebConfig(settings);
  const name =
    "pakmoo-" +
    settings.projectId +
    "-" +
    settings.appId +
    "-" +
    settings.apiKey;
  const app =
    getApps().find((app) => app.name === name) || initializeApp(config, name);
  const auth = getAuth(app);
  await setPersistence(auth, inMemoryPersistence);
  return { app, auth, db: getFirestore(app), storage: getStorage(app) };
}
