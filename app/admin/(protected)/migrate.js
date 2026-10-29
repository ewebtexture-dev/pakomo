// export default function Upload() {
//   const [file, setFile] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isMigrating, setIsMigrating] = useState(false);
//   const [message, setMessage] = useState("Ready to upload a sample file or migrate all products.");

//   const uploadImage = async () => {
//     if (!file) {
//       setMessage("Please select an image first.");
//       return;
//     }

//     try {
//       setIsUploading(true);
//       setMessage("Uploading image...");

//       const imageRef = ref(storage, `products/${Date.now()}-${file.name}`);
//       await uploadBytes(imageRef, file);
//       const imageUrl = await getDownloadURL(imageRef);

//       setMessage(`Image uploaded successfully. URL: ${imageUrl}`);
//       console.log("Image URL:", imageUrl);
//     } catch (error) {
//       console.error("Image upload failed:", error);
//       setMessage("Image upload failed. Check the Firebase Storage rules and config.");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const uploadData = async () => {
//     try {
//       await addDoc(collection(db, "products"), {
//         name: "developer",
//         category: "prdct",
//         description: "desc",
//         imageUrl: "img",
//         createdAt: new Date(),
//       });

//       setMessage("Sample product document added to Firestore.");
//     } catch (error) {
//       console.error("Firestore write failed:", error);
//       setMessage("Firestore write failed. Check the Firebase rules and config.");
//     }
//   };

//   const getProductImageUrl = (imageValue) => {
//     if (!imageValue) {
//       return "";
//     }

//     if (typeof imageValue === "string") {
//       return imageValue;
//     }

//     if (typeof imageValue === "object") {
//       if (typeof imageValue.src === "string") {
//         return imageValue.src;
//       }

//       if (typeof imageValue.default === "string") {
//         return imageValue.default;
//       }

//       if (typeof imageValue.default?.src === "string") {
//         return imageValue.default.src;
//       }

//       if (typeof imageValue.url === "string") {
//         return imageValue.url;
//       }
//     }

//     return "";
//   };

//   const uploadProductImage = async (product) => {
//     const imageSource = getProductImageUrl(product?.image);

//     if (!imageSource) {
//       return "";
//     }

//     const response = await fetch(imageSource);

//     if (!response.ok) {
//       throw new Error(`Failed to fetch image for ${product?.name || product?.id}`);
//     }

//     const imageBlob = await response.blob();
//     const extension = imageBlob.type?.split("/")[1] || "jpg";
//     const safeName = (product?.id || product?.name || "product")
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "");

//     const imageRef = ref(storage, `products/${safeName}-${Date.now()}.${extension}`);
//     await uploadBytes(imageRef, imageBlob);

//     return await getDownloadURL(imageRef);
//   };

//   const migrateAllProductsToFirebase = async () => {
//     if (isMigrating) {
//       return;
//     }

//     try {
//       setIsMigrating(true);
//       setMessage("Starting product migration to Firebase...");

//       let migratedCount = 0;

//       for (const product of products) {
//         const { image: _image, ...productData } = product;
//         const imageUrl = await uploadProductImage(product);

//         await addDoc(collection(db, "products"), {
//           ...productData,
//           imageUrl,
//           migratedFromLocalAssets: true,
//           migratedAt: new Date(),
//         });

//         migratedCount += 1;
//         setMessage(`Migrated ${migratedCount}/${products.length}: ${product.name || product.id}`);
//       }

//       setMessage(`Migration complete. ${migratedCount} products were uploaded to Firebase.`);
//     } catch (error) {
//       console.error("Product migration failed:", error);
//       setMessage("Product migration failed. Make sure Firebase Storage and Firestore are configured correctly.");
//     } finally {
//       setIsMigrating(false);
//     }
//   };

//   return (
//     <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, display: "grid", gap: 16 }}>
//       <h1 style={{ fontSize: 24, fontWeight: 700 }}>Firebase Product Migration</h1>
//       <p style={{ color: "#374151", lineHeight: 1.5 }}>
//         This page uploads a sample image to Firebase Storage and also migrates all products from the local
//         products data file to Firebase Firestore, storing the generated image URL for each product.
//       </p>

//       <section style={{ display: "grid", gap: 12, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
//         <label style={{ fontWeight: 600 }}>Test image upload</label>
//         <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
//         <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//           <button onClick={uploadImage} disabled={isUploading} style={buttonStyle}>
//             {isUploading ? "Uploading..." : "Upload this image to Firebase"}
//           </button>
//           <button onClick={uploadData} style={buttonStyle}>Add sample Firestore doc</button>
//         </div>
//       </section>

//       <section style={{ display: "grid", gap: 12, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 16 }}>
//         <h2 style={{ fontSize: 18, fontWeight: 700 }}>Migrate all products</h2>
//         <p style={{ color: "#1f2937", lineHeight: 1.5 }}>
//           This function reads the local product list, uploads each product image to Firebase Storage, and writes
//           the product document to Firestore with the generated image URL.
//         </p>
//         <button onClick={migrateAllProductsToFirebase} disabled={isMigrating} style={buttonStylePrimary}>
//           {isMigrating ? "Migrating products..." : "Move all products to Firebase"}
//         </button>
//       </section>

//       <section style={{ background: "#111827", color: "#f9fafb", borderRadius: 12, padding: 14, whiteSpace: "pre-wrap" }}>
//         <strong>Status:</strong>
//         <div style={{ marginTop: 8 }}>{message}</div>
//       </section>
//     </main>
//   );
// }

// const buttonStyle = {
//   border: "1px solid #d1d5db",
//   background: "white",
//   color: "#111827",
//   borderRadius: 8,
//   padding: "10px 14px",
//   cursor: "pointer",
// };

// const buttonStylePrimary = {
//   border: "none",
//   background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
//   color: "white",
//   borderRadius: 8,
//   padding: "10px 14px",
//   cursor: "pointer",
//   fontWeight: 600,
// };

// Main Admin Page
