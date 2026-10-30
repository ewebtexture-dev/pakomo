"use client";
import { useEffect, useState } from "react";
import { firebaseConfigKeys } from "@/cms/firebase";
const input =
  "block w-full bg-white/5 border border-white/20 rounded-lg p-3 mt-2";
export default function FirebaseSettings() {
  const [value, setValue] = useState(null),
    [saved, setSaved] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [results, setResults] = useState([]),
    [account, setAccount] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/admin/firebase")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw Error(data.error);
        if (active) {
          setValue(data.settings);
          setSaved(data.settings);
        }
      })
      .catch((e) => {
        if (active) setMessage(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResults([]);
    try {
      const r = await fetch("/api/admin/firebase", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        }),
        data = await r.json();
      if (!r.ok) throw Error(data.error);
      setValue(data.settings);
      setSaved(data.settings);
      setAccount("");
      setMessage(data.message);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function connect(signIn) {
    setBusy(true);
    setMessage("");
    setResults([]);
    let timeout;
    try {
      const { getFirebaseServices } = await import("@/firebase/config");
      const services = await getFirebaseServices(saved);
      if (signIn) {
        const { GoogleAuthProvider, signInWithPopup } = await import(
          "firebase/auth"
        );
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const credential = await signInWithPopup(services.auth, provider);
        setAccount(credential.user.email || "Google account");
      }
      const { collection, getDocsFromServer, limit, query } = await import(
        "firebase/firestore"
      );
      await Promise.race([
        getDocsFromServer(
          query(collection(services.db, saved.checkCollection), limit(1)),
        ),
        new Promise((_, reject) => {
          timeout = setTimeout(
            () =>
              reject(
                Error(
                  "Connection timed out. Check your internet connection and Firebase project.",
                ),
              ),
            15000,
          );
        }),
      ]);
      setResults([
        {
          type: "success",
          text:
            "Firestore server read succeeded for " +
            saved.projectId +
            "/" +
            saved.checkCollection +
            ". No records were written.",
        },
      ]);
    } catch (e) {
      const code = e.code || "";
      setResults([
        {
          type: "error",
          text:
            code === "permission-denied"
              ? "Firestore denied this read. Check the project rules for the selected Google account. No data was changed."
              : code === "auth/operation-not-allowed"
                ? "Enable Google as a sign-in provider in the new Firebase project."
                : code === "auth/unauthorized-domain"
                  ? "Add localhost (and later pakmoo.in) to Firebase Authentication → Settings → Authorized domains."
                  : code === "auth/popup-closed-by-user"
                    ? "Google sign-in was cancelled."
                    : (code ? code + ": " : "") + e.message,
        },
      ]);
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  }
  async function disconnect() {
    setBusy(true);
    try {
      const { getFirebaseServices } = await import("@/firebase/config");
      const { signOut } = await import("firebase/auth");
      const { auth } = await getFirebaseServices(saved);
      await signOut(auth);
      setAccount("");
      setResults([]);
      setMessage("Google account signed out.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="p-5 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Firebase connection</h1>
      <p className="my-4 text-sm text-white/65">
        Connect the Web app from your new Google account’s Firebase project. The
        CMS database stays in SQLite. Existing product images keep their
        original URLs; switching projects does not copy old files.
      </p>
      <a
        className="text-blue-300 underline"
        href="https://console.firebase.google.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Firebase Console
      </a>
      {message && (
        <p className="my-4 text-amber-200" role="status">
          {message}
        </p>
      )}
      {!value ? (
        <p className="mt-6">Loading Firebase settings…</p>
      ) : (
        <form onSubmit={save} className="space-y-4 mt-6">
          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={value.enabled}
              onChange={(e) =>
                setValue({ ...value, enabled: e.target.checked })
              }
            />
            Enable Firebase connection
          </label>
          <p className="text-sm text-white/60">
            Copy these values from Project settings → General → Your apps → Web
            app. Do not enter Gmail passwords or service-account keys.
          </p>
          {firebaseConfigKeys.map((key) => (
            <label key={key} className="block text-sm">
              {key}
              <input
                className={input}
                value={value[key]}
                required={value.enabled && key !== "measurementId"}
                maxLength={250}
                autoComplete="off"
                onChange={(e) => setValue({ ...value, [key]: e.target.value })}
              />
            </label>
          ))}
          <label className="block text-sm">
            Collection for read-only connection check
            <input
              className={input}
              value={value.checkCollection}
              required
              pattern="[A-Za-z0-9_-]{1,100}"
              onChange={(e) =>
                setValue({ ...value, checkCollection: e.target.value })
              }
            />
          </label>
          <button disabled={busy} className="bg-blue-600 rounded-lg px-5 py-3">
            {busy ? "Please wait…" : "Save Firebase settings"}
          </button>
        </form>
      )}
      <div className="mt-7 pt-6 border-t border-white/20 space-y-4">
        <p className="text-sm text-white/60">
          Save first, then check an existing collection in your new project.
          Google sign-in requires the Google provider and localhost in
          authorized domains. Firestore rules must allow that account to read
          the check collection. The check never writes Firestore data.
        </p>
        {dirty && (
          <p className="text-amber-200 text-sm">
            Save your changes before testing.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            disabled={busy || dirty || !saved?.enabled}
            type="button"
            className="border border-blue-400 px-4 py-2 rounded-lg disabled:opacity-40"
            onClick={() => connect(false)}
          >
            Check Firestore read
          </button>
          <button
            disabled={busy || dirty || !saved?.enabled}
            type="button"
            className="border border-blue-400 px-4 py-2 rounded-lg disabled:opacity-40"
            onClick={() => connect(true)}
          >
            Sign in with Google & check
          </button>
          {account && (
            <button
              type="button"
              className="underline"
              disabled={busy}
              onClick={disconnect}
            >
              Sign out {account}
            </button>
          )}
        </div>
        {results.map((r, i) => (
          <p
            key={i}
            role="status"
            className={
              r.type === "success" ? "text-green-200" : "text-amber-200"
            }
          >
            {r.text}
          </p>
        ))}
      </div>
    </div>
  );
}
