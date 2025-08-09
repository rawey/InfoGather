import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVisitorSchema, insertChurchSettingsSchema } from "@shared/schema";
import { ZodError } from "zod";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVisitorNotification(visitor: any, churchSettings: any) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Email not configured, skipping notification");
    return;
  }

  const ageGroupEmailMap = {
    children: churchSettings?.notificationEmails?.children,
    youth: churchSettings?.notificationEmails?.youth,
    young_adult: churchSettings?.notificationEmails?.youngAdult,
    adult: churchSettings?.notificationEmails?.adult,
    senior: churchSettings?.notificationEmails?.senior,
  };

  const leaderEmail = ageGroupEmailMap[visitor.ageGroup as keyof typeof ageGroupEmailMap];
  
  if (!leaderEmail) {
    console.log(`No email configured for age group: ${visitor.ageGroup}`);
    return;
  }

  const emailSubject = `New Visitor: ${visitor.fullName}`;
  const emailBody = `
    A new visitor has submitted their information:
    
    Name: ${visitor.fullName}
    Phone: ${visitor.phone || 'Not provided'}
    Email: ${visitor.email || 'Not provided'}
    Age Group: ${visitor.ageGroup}
    City: ${visitor.city || 'Not provided'}
    How they heard about us: ${visitor.hearAbout || 'Not provided'}
    First time visitor: ${visitor.isFirstTime ? 'Yes' : 'No'}
    Language preference: ${visitor.language === 'es' ? 'Spanish' : 'English'}
    Notes: ${visitor.notes || 'None'}
    
    Submitted on: ${new Date(visitor.submissionDate).toLocaleString()}
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: leaderEmail,
      subject: emailSubject,
      text: emailBody,
    });
    console.log(`Notification sent to ${leaderEmail} for visitor ${visitor.fullName}`);
  } catch (error) {
    console.error("Failed to send email notification:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all visitors
  app.get("/api/visitors", async (req, res) => {
    try {
      const visitors = await storage.getVisitors();
      res.json(visitors);
    } catch (error) {
      console.error("Error fetching visitors:", error);
      res.status(500).json({ message: "Failed to fetch visitors" });
    }
  });

  // Create new visitor
  app.post("/api/visitors", async (req, res) => {
    try {
      const validatedData = insertVisitorSchema.parse(req.body);
      const visitor = await storage.createVisitor(validatedData);
      
      // Get church settings for notification emails
      const churchSettings = await storage.getChurchSettings();
      
      // Send notification email
      await sendVisitorNotification(visitor, churchSettings);
      
      res.status(201).json(visitor);
    } catch (error) {
      console.error("Error creating visitor:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create visitor" });
      }
    }
  });

  // Get church settings
  app.get("/api/church-settings", async (req, res) => {
    try {
      const settings = await storage.getChurchSettings();
      if (!settings) {
        // Return default settings if none exist
        res.json({
          name: "Grace Community Church",
          subtitle: "Welcome Center",
          logoUrl: null,
          primaryColor: "#1976D2",
          notificationEmails: {
            children: "",
            youth: "",
            youngAdult: "",
            adult: "",
            senior: ""
          }
        });
      } else {
        res.json(settings);
      }
    } catch (error) {
      console.error("Error fetching church settings:", error);
      res.status(500).json({ message: "Failed to fetch church settings" });
    }
  });

  // Update church settings
  app.post("/api/church-settings", async (req, res) => {
    try {
      const validatedData = insertChurchSettingsSchema.parse(req.body);
      const settings = await storage.updateChurchSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating church settings:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to update church settings" });
      }
    }
  });

  // Upload church logo
  app.post("/api/upload-logo", upload.single('logo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Move file to permanent location
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `church-logo-${Date.now()}${fileExtension}`;
      const finalPath = path.join(uploadsDir, fileName);
      
      fs.renameSync(req.file.path, finalPath);
      
      const logoUrl = `/uploads/${fileName}`;
      res.json({ logoUrl });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  // Serve uploaded files
  app.get("/uploads/:filename", (req, res) => {
    const filePath = path.join(process.cwd(), 'uploads', req.params.filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
