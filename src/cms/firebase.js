import { z } from "zod";

export const firebaseDefaults = {
  enabled: false,
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
  checkCollection: "products",
};
export const firebaseConfigKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
  "measurementId",
];
export const firebaseSettingsSchema = z
  .object({
    enabled: z.boolean(),
    apiKey: z.string().trim().max(200),
    authDomain: z.string().trim().max(250),
    projectId: z.string().trim().max(100),
    storageBucket: z.string().trim().max(250),
    messagingSenderId: z.string().trim().max(100),
    appId: z.string().trim().max(200),
    measurementId: z.string().trim().max(100).default(""),
    checkCollection: z
      .string()
      .trim()
      .regex(
        /^[A-Za-z0-9_-]{1,100}$/,
        "Use a single Firestore collection name.",
      )
      .default("products"),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.enabled) return;
    const checks = {
      apiKey: /^AIza[A-Za-z0-9_-]{20,180}$/,
      projectId: /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/,
      authDomain: /^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/,
      storageBucket:
        /^[a-z0-9][a-z0-9.-]+\.(?:appspot\.com|firebasestorage\.app)$/,
      messagingSenderId: /^\d+$/,
      appId: /^1:\d+:web:[a-zA-Z0-9]+$/,
    };
    for (const [key, pattern] of Object.entries(checks))
      if (!pattern.test(data[key]))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message:
            "Paste the " +
            key +
            " value from your Firebase Web app configuration.",
        });
  });
export function firebaseWebConfig(settings) {
  return Object.fromEntries(
    firebaseConfigKeys
      .filter((key) => settings[key])
      .map((key) => [key, settings[key]]),
  );
}
