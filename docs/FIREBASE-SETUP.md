# New Google account / Firebase project integration

Local page: http://localhost:3000/admin/firebase (Super Admin only).

1. New Gmail se [Firebase Console](https://console.firebase.google.com/) open karke project banayein aur Web app register karein.
2. Project settings → General → Your apps → Web app ke `firebaseConfig` se `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, aur optional `measurementId` copy karein.
3. Local admin → Firebase mein values paste karein, enable karein aur save karein. Gmail password/service-account private key ki zarurat nahi hai.
4. Firestore database create karein aur check ke liye collection name set karein (default `products`). Empty collection valid hai; read permission phir bhi required hai.
5. Google sign-in use karna ho to Authentication → Sign-in method mein Google enable karein. Authentication → Settings → Authorized domains mein `localhost` add karein. Live setup ke waqt `pakmoo.in` bhi add karein. New Google account ko popup se select karein.
6. Firestore rules mein intended signed-in account ko check collection par read permission dein. Rules ko public write access ke liye open na karein. Firebase IAM owner aur Firebase Authentication user alag concepts hain; owner Gmail hone se client SDK read automatically allow nahi hota.
7. **Check Firestore read** anonymous rules check karta hai; **Sign in with Google & check** selected account ke rules check karta hai. Success tabhi dikhata hai jab server se actual collection read successful ho. Firestore document write ya migration nahi hoti. Google sign-in first use par Firebase Auth user create kar sakta hai.

Connection settings SQLite ke admin-only `firebase` settings group mein save hote hain; public CMS snapshot/API mein include nahi hote. SDK lazy load hota hai aur explicit connect par named app initialise karta hai. Google session memory mein rehti hai. Config change ke baad new project ki independent app use hoti hai.

**Data scope:** existing admin login, products, blog, author aur CMS data SQLite mein hi hain. Existing product image URLs old Firebase Storage bucket par hi point karte hain. New project configuration se old files, Firestore records, Auth users ya CMS database migrate nahi hote. New bucket initialise hota hai, lekin CMS upload endpoint persistent local/Hostinger storage par hi upload karta hai. Old bucket ko tab tak rakhein jab tak files separately copy karke image URLs verify na ho jayein.

30 October 2026 status: the owner's Web configuration for `pakmoo-bd1d6` has been saved in the local admin. Firebase CLI authorization to the new project is verified. The Firestore API has been enabled and the Standard default database created in Mumbai (`asia-south1`) with its free tier and deletion protection. All 85 backed-up source product documents have been imported with the original IDs and native field types; every field value has been compared with the source backup after import.

File migration is pending: billing is disabled on the destination, which has no Storage bucket yet. New Firebase Storage requires the Blaze plan. The signed-in account does not currently have administrative access to the old `pakmoo` project, so additional collections/subcollections, Auth users, rules and indexes cannot yet be completely inventoried. The owner will grant source-project access. Until files and the full migration are verified, old image URLs and the old project remain connected. GitHub and Hostinger deployments have not been changed.

Source migration backup is private under `.data/firebase-migration/`: 85 fresh Firestore product documents in native typed JSON, all 116 listed source Storage objects (checksums verified), and an integrity-checked local CMS SQLite backup. A full authenticated source-project inventory is still needed to check for additional collections/subcollections, buckets, Auth users, rules and indexes before claiming a complete project migration. After copying, validate document values, file checksums and application links before cutting over. Do not delete or disable the old bucket while the live website still references it.

References: [Firebase Web setup](https://firebase.google.com/docs/web/setup), [Google sign-in](https://firebase.google.com/docs/auth/web/google-signin), [Firestore security rules](https://firebase.google.com/docs/firestore/security/get-started).
