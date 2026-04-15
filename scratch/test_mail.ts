import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { sendMagicPhotosEmail } from "../src/services/mail.service";

const dummyPhotos = [
  {
    previewUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop",
    fullResUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=100&w=2000&auto=format&fit=crop"
  }
];

console.log("Sending test email to johnsonfelix94@gmail.com...");

sendMagicPhotosEmail("johnsonfelix94@gmail.com", dummyPhotos).then(result => {
  if (result?.success) {
    console.log("✅ Email sent successfully!");
  } else {
    console.error("❌ Failed to send email:", result?.error);
  }
  process.exit(0);
}).catch(error => {
  console.error("❌ Crash:", error);
  process.exit(1);
});
