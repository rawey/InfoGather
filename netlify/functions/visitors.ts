import type { Handler } from "@netlify/functions";
import { db } from './_firebase';
import fetch from 'node-fetch';

export const handler: Handler = async (event) => {
  try {
    if (!db) {
      console.error("❌ Firebase not initialized");
      return {
        statusCode: 500,
        body: "Firebase initialization failed",
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      console.log("📍 Adding visitor to Firestore:", body);
      await db.collection("visitors").add(body);
      console.log("✅ Visitor added");

      // 🔍 Fetch church settings to get notification email
      const settingsDoc = await db.collection("settings").doc("church").get();
      const settings = settingsDoc.data();
      const ageGroup = body.ageGroup;
      const recipientEmail = settings?.notificationEmails?.[ageGroup];

      if (recipientEmail) {
        console.log("📧 Sending email to:", recipientEmail);

        const emailPayload = {
          from: {
            email: process.env.EMAIL_FROM || "no-reply@yourchurch.com",
            name: "Church Visitor Notification"
          },
          to: [
            {
              email: recipientEmail,
              name: "Age Group Leader"
            }
          ],
          subject: "New Visitor Submission",
          text: `New visitor submitted:\n\nName: ${body.fullName}\nEmail: ${body.email}\nPhone: ${body.phone}\nCity: ${body.city}\nNotes: ${body.notes || "None"}\nLanguage: ${body.language}\nFirst Time: ${body.isFirstTime ? "Yes" : "No"}\nHeard About Us: ${body.hearAbout}`,
        };

        const response = await fetch("https://api.mailersend.com/v1/email", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.MAILERSEND_API_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(emailPayload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ MailerSend error:", errorText);
        } else {
          console.log("✅ Email sent via MailerSend");
        }
      } else {
        console.warn("⚠️ No recipient email found for age group:", ageGroup);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Visitor added and email sent" }),
      };
    }

    if (event.httpMethod === "GET") {
      const snapshot = await db.collection("visitors").get();
      const visitors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return {
        statusCode: 200,
        body: JSON.stringify(visitors),
      };
    }

    return { statusCode: 405, body: "Method not allowed" };
  } catch (err: any) {
    console.error("🔥 Function error in visitors:", err);
    return { statusCode: 500, body: err.message };
  }
};