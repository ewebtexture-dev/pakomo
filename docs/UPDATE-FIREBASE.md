# update_firebase

Destination: `pakmoo-bd1d6`, account `pakmootestinginstruments@gmail.com`.
Default Storage bucket: `pakmoo-bd1d6.firebasestorage.app`, Mumbai (`ASIA-SOUTH1`).

The migration fetched 85 product documents and all 116 objects returned by the old Storage listing. Each file was downloaded from the old API, uploaded without overwriting different destination bytes, downloaded again through its new public image URL, and compared by SHA-256. All 85 Firestore documents were verified after importing the new image URLs, preserving IDs and native field types. Private source snapshots, downloaded bytes and the detailed report remain under `.data/firebase-migration/update-firebase/` and are excluded from Git.

The source Web API key is not an administrator credential. Collection discovery is denied, so this verifies the readable `products` collection and the complete API-returned Storage object listing. It cannot export protected/unknown collections, Auth users, security rules or indexes. Supply additional known readable collection paths with `--collections=products,other_collection` if needed. No source files or source projects are deleted.

The website and its CMS continue to run on Hostinger, with the existing SQLite database. This is not a rewrite of the admin backend to Firestore. On the next application startup, a versioned migration takes an integrity-checked private SQLite backup, replaces verified old asset URLs in draft/published CMS content, blog snapshots, revisions, author avatars, media and settings, and leaves account/password/session data intact. Updated content versions reject stale editor saves. Seed data and subsequently saved CMS content also use the verified URL map. The migration is transactional and safe to rerun.

## Reuse the fetch/import script

Set `FIREBASE_SOURCE_API_KEY` locally, or use `--source-config=path/to/private-web-config.json`. Do not commit credentials or exports. Without `--apply`, the script only fetches source data/files into `.data`.

```powershell
node scripts/migrate-firebase-rest.mjs --source-project=pakmoo --target-project=pakmoo-bd1d6 --source-bucket=pakmoo.firebasestorage.app --target-bucket=pakmoo-bd1d6.firebasestorage.app --collections=products
```

For destination writes, use a short-lived OAuth access token in `FIREBASE_TARGET_ACCESS_TOKEN`, or the existing private Firebase CLI adapter (`--auth-module=.data/firebase-rest.mjs`) on this workstation. An API key alone cannot perform administrative destination imports. The following command uses the existing adapter and a verified baseline to reject destination edits that conflict with the import:

```powershell
node scripts/migrate-firebase-rest.mjs --source-project=pakmoo --target-project=pakmoo-bd1d6 --source-bucket=pakmoo.firebasestorage.app --target-bucket=pakmoo-bd1d6.firebasestorage.app --collections=products --auth-module=.data/firebase-rest.mjs --baseline=.data/firebase-migration/2026-10-30T06-57-48-674Z/firestore-products-native.json --output=.data/firebase-migration/update-firebase --write-map=src/cms/firebase-storage-map.js --apply
node scripts/check-firebase-storage-migration.mjs
npm.cmd run lint
npm.cmd run build
```

Imported image URLs grant access only to the corresponding public assets through their Firebase download tokens. This release does not enable public writes or put private SQLite backups in public Storage.

References: [Firebase default bucket creation](https://firebase.google.com/docs/reference/rest/storage/rest/v1alpha/projects.defaultBucket/create), [Firebase API keys and authorization](https://firebase.google.com/docs/projects/api-keys).
