import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

// Firestore Rest Doc Parser
function parseFirestoreRestDoc(doc: any) {
  if (!doc || !doc.fields || !doc.fields.data || !doc.fields.data.mapValue || !doc.fields.data.mapValue.fields) {
    return null;
  }
  const fields = doc.fields.data.mapValue.fields;
  const result: any = {};
  for (const [key, val] of Object.entries(fields)) {
    const v = val as any;
    if ('stringValue' in v) result[key] = v.stringValue;
    else if ('integerValue' in v) result[key] = parseInt(v.integerValue, 10);
    else if ('doubleValue' in v) result[key] = parseFloat(v.doubleValue);
    else if ('booleanValue' in v) result[key] = v.booleanValue;
  }
  return result;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Load Firebase Config for Backend Rest operations
  const firebaseConfig = {
    projectId: "magnificent-technique-c3bk6",
    firestoreDatabaseId: "ai-studio-vuefashionstudio-56f91c08-f344-42f3-87a4-556a733d1ca7",
    apiKey: "AIzaSyC3GKkd2mUWQFS5JUYpfWvnvWF1V_DrJOI"
  };

  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.projectId) firebaseConfig.projectId = parsed.projectId;
      if (parsed.firestoreDatabaseId) firebaseConfig.firestoreDatabaseId = parsed.firestoreDatabaseId;
      if (parsed.apiKey) firebaseConfig.apiKey = parsed.apiKey;
    }
  } catch (e) {
    console.error("Error reading firebase-applet-config.json on server:", e);
  }

  // Override with custom user config from studio-config.json if available
  try {
    const studioConfigPath = path.join(process.cwd(), "studio-config.json");
    if (fs.existsSync(studioConfigPath)) {
      const raw = fs.readFileSync(studioConfigPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.firebase) {
        if (parsed.firebase.projectId) firebaseConfig.projectId = parsed.firebase.projectId;
        if (parsed.firebase.databaseId) firebaseConfig.firestoreDatabaseId = parsed.firebase.databaseId;
        if (parsed.firebase.apiKey) firebaseConfig.apiKey = parsed.firebase.apiKey;
      }
    }
  } catch (e) {
    console.error("Error reading studio-config.json for backend override:", e);
  }

  // Environment variable overrides for production deployment hosting environments
  if (process.env.FIREBASE_PROJECT_ID) {
    firebaseConfig.projectId = process.env.FIREBASE_PROJECT_ID;
  }
  if (process.env.FIREBASE_DATABASE_ID) {
    firebaseConfig.firestoreDatabaseId = process.env.FIREBASE_DATABASE_ID;
  }
  if (process.env.FIREBASE_API_KEY) {
    firebaseConfig.apiKey = process.env.FIREBASE_API_KEY;
  }

  // API Route: Dynamic Script serving custom Firebase and password configuration
  app.get("/api/studio-config.js", (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    let config: any = {
      firebase: null,
      portalPassword: null
    };

    try {
      const studioConfigPath = path.join(process.cwd(), "studio-config.json");
      if (fs.existsSync(studioConfigPath)) {
        config = JSON.parse(fs.readFileSync(studioConfigPath, "utf-8"));
      }
    } catch (e) {
      console.error("Error reading studio-config.json for script route:", e);
    }

    // Server-side environment variable overrides
    if (process.env.PORTAL_PASSWORD) {
      config.portalPassword = process.env.PORTAL_PASSWORD;
    }
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_API_KEY) {
      if (!config.firebase) config.firebase = {};
      config.firebase.projectId = process.env.FIREBASE_PROJECT_ID;
      config.firebase.apiKey = process.env.FIREBASE_API_KEY;
      if (process.env.FIREBASE_DATABASE_ID) {
        config.firebase.databaseId = process.env.FIREBASE_DATABASE_ID;
      }
    }

    res.send(`window.__STUDIO_CONFIG__ = ${JSON.stringify(config)};`);
  });

  // API Route: JSON serving custom Firebase and password configuration
  app.get("/api/studio-config", (req, res) => {
    let config: any = {
      firebase: null,
      portalPassword: null
    };

    try {
      const studioConfigPath = path.join(process.cwd(), "studio-config.json");
      if (fs.existsSync(studioConfigPath)) {
        config = JSON.parse(fs.readFileSync(studioConfigPath, "utf-8"));
      }
    } catch (e) {
      console.error("Error reading studio-config.json for JSON route:", e);
    }

    // Server-side environment variable overrides
    if (process.env.PORTAL_PASSWORD) {
      config.portalPassword = process.env.PORTAL_PASSWORD;
    }
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_API_KEY) {
      if (!config.firebase) config.firebase = {};
      config.firebase.projectId = process.env.FIREBASE_PROJECT_ID;
      config.firebase.apiKey = process.env.FIREBASE_API_KEY;
      if (process.env.FIREBASE_DATABASE_ID) {
        config.firebase.databaseId = process.env.FIREBASE_DATABASE_ID;
      }
    }

    res.json(config);
  });

  // API Route: Save custom studio configuration (database config and password)
  app.post("/api/save-studio-config", (req, res) => {
    const { firebase, portalPassword } = req.body;
    try {
      const studioConfigPath = path.join(process.cwd(), "studio-config.json");
      let currentConfig: any = {};
      
      if (fs.existsSync(studioConfigPath)) {
        try {
          currentConfig = JSON.parse(fs.readFileSync(studioConfigPath, "utf-8"));
        } catch (e) {
          console.error("Error reading existing studio-config.json in save route:", e);
        }
      }

      if (firebase !== undefined) {
        currentConfig.firebase = firebase;
        
        // Dynamically update server-side firebaseConfig for active email requests
        if (firebase) {
          if (firebase.projectId) firebaseConfig.projectId = firebase.projectId;
          if (firebase.databaseId) firebaseConfig.firestoreDatabaseId = firebase.databaseId;
          if (firebase.apiKey) firebaseConfig.apiKey = firebase.apiKey;
        } else {
          // Revert server-side firebaseConfig to original firebase-applet-config.json or defaults
          firebaseConfig.projectId = "magnificent-technique-c3bk6";
          firebaseConfig.firestoreDatabaseId = "ai-studio-vuefashionstudio-56f91c08-f344-42f3-87a4-556a733d1ca7";
          firebaseConfig.apiKey = "AIzaSyC3GKkd2mUWQFS5JUYpfWvnvWF1V_DrJOI";
          try {
            const appletConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
            if (fs.existsSync(appletConfigPath)) {
              const raw = fs.readFileSync(appletConfigPath, "utf-8");
              const parsed = JSON.parse(raw);
              if (parsed.projectId) firebaseConfig.projectId = parsed.projectId;
              if (parsed.firestoreDatabaseId) firebaseConfig.firestoreDatabaseId = parsed.firestoreDatabaseId;
              if (parsed.apiKey) firebaseConfig.apiKey = parsed.apiKey;
            }
          } catch (e) {}
        }
      }

      if (portalPassword !== undefined) {
        currentConfig.portalPassword = portalPassword;
      }

      fs.writeFileSync(studioConfigPath, JSON.stringify(currentConfig, null, 2), "utf-8");
      res.json({ success: true });
    } catch (err: any) {
      console.error("Failed to save studio-config.json in save route:", err);
      res.status(500).json({ error: "Failed to save configuration", details: err.message });
    }
  });

  // API Route: Send Photoshoot Inquiry Emails
  app.post("/api/send-email", async (req, res) => {
    const inquiry = req.body;
    if (!inquiry || !inquiry.email) {
      return res.status(400).json({ error: "Missing required email field" });
    }

    try {
      // 1. Fetch SMTP configuration from Firestore via secure REST API
      const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig;
      const databaseId = firestoreDatabaseId || "(default)";
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/cms_config/smtp?key=${apiKey}`;

      const response = await fetch(firestoreUrl);
      if (!response.ok) {
        console.warn("SMTP settings not found in Firestore. Skipping automated email sends.", response.status);
        return res.status(200).json({ status: "skipped", message: "SMTP configuration not established." });
      }

      const doc = await response.json();
      const smtpConfig = parseFirestoreRestDoc(doc);

      if (!smtpConfig || !smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password) {
        console.warn("SMTP credentials incomplete in Firestore. Skipping automated email sends.");
        return res.status(200).json({ status: "skipped", message: "SMTP configuration incomplete." });
      }

      // 2. Setup Nodemailer Transporter
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.port === 465, // SSL for 465, STARTTLS otherwise
        auth: smtpConfig.auth ? {
          user: smtpConfig.username,
          pass: smtpConfig.password,
        } : undefined,
        tls: {
          rejectUnauthorized: false
        }
      });

      const fromEmail = smtpConfig.fromEmail || smtpConfig.username;
      const toEmail = smtpConfig.toEmail || "thevueatelier@gmail.com";

      // Check if it's a campaign request
      if (inquiry.isCampaign) {
        const payload = inquiry.campaignPayload || {};
        const productsCount = payload.products ? payload.products.length : 0;
        const productsListHtml = (payload.products || []).map((p: any, idx: number) => `
          <div style="border-bottom: 1px solid #222222; padding: 10px 0;">
            <p style="margin: 0; font-weight: bold; color: #ffffff;">Product ${idx + 1}: ${p.name || 'Unnamed Product'}</p>
            <p style="margin: 4px 0 0 0; color: #aaaaaa; font-size: 11px;">Category: ${p.category || 'N/A'} • Views: ${p.viewsCount || 0}</p>
            <p style="margin: 4px 0 0 0; color: #888888; font-size: 11px;">Curation: ${p.modelCurationPreference || 'Default'} • Environment: ${p.environmentPreference || 'Default'}</p>
          </div>
        `).join('');

        // Email 1: Send the full photoshoot request payload to the Atelier
        const teamEmailHtml = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #000000; color: #ffffff; border: 1px solid #1a1a1a;">
            <div style="text-align: center; margin-bottom: 40px; border-bottom: 1px solid #111111; padding-bottom: 20px;">
              <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 0.15em; text-transform: uppercase; margin: 0;">VUE Atelier</h1>
              <p style="font-size: 10px; color: #666666; letter-spacing: 0.2em; text-transform: uppercase; margin: 5px 0 0 0;">Campaign Request Log</p>
            </div>
            
            <div style="margin-bottom: 40px;">
              <h2 style="font-size: 14px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; border-left: 2px solid #ffffff; padding-left: 10px; margin-bottom: 20px; color: #ffffff;">Photoshoot Campaign Brief</h2>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 10px 0; color: #888888; width: 180px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Contact Email</td>
                  <td style="padding: 10px 0; color: #ffffff; font-weight: 400;"><a href="mailto:${inquiry.email}" style="color: #ffffff; text-decoration: underline;">${inquiry.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Selected Scope</td>
                  <td style="padding: 10px 0; color: #ffffff; font-weight: 400;">${inquiry.scope}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Products Count</td>
                  <td style="padding: 10px 0; color: #ffffff; font-weight: 400;">${productsCount} products designed</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Est. Investment</td>
                  <td style="padding: 10px 0; color: #ffffff; font-weight: 400; font-family: monospace;">${payload.estimatedInvestment || 'Bespoke'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Proposed Timeline</td>
                  <td style="padding: 10px 0; color: #ffffff; font-weight: 400;">${payload.timeline || 'TBD'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Submission Logged</td>
                  <td style="padding: 10px 0; color: #ffffff; font-weight: 400;">${inquiry.submittedAt}</td>
                </tr>
              </table>

              <div style="background-color: #0c0c0c; border: 1px solid #1a1a1a; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                <h3 style="font-size: 11px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 0; color: #ffffff; margin-bottom: 10px;">Products Summary</h3>
                ${productsListHtml || '<p style="color: #666; margin: 0; font-size: 11px;">No specific products added.</p>'}
              </div>

              <div style="background-color: #1a0f00; border: 1px solid #4a2f00; padding: 15px; border-radius: 4px; color: #ffb84d; font-size: 12px; line-height: 1.5;">
                <strong>NOTICE:</strong> The complete package (including client reference images, model preferences, scene selections, and custom files) has been uploaded to Firebase Storage and structured in the folder <strong>"${inquiry.email}"</strong>. You can view, manage, and download all assets directly in the <strong>Studio Portal CMS</strong> under the Inquiries section.
              </div>
            </div>
            
            <div style="border-top: 1px solid #111111; padding-top: 20px; text-align: center;">
              <p style="font-size: 9px; color: #444444; letter-spacing: 0.1em; margin: 0;">VUE FASHION STUDIO • ATELIER INTERFACE SERVICE</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: fromEmail,
          to: toEmail,
          subject: `[VUE CAMPAIGN] New Shoot Brief Received - ${inquiry.email}`,
          html: teamEmailHtml,
        });

        // Email 2: Send the auto responder to the client
        const clientEmailHtml = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #000000; color: #ffffff; border: 1px solid #1a1a1a;">
            <div style="text-align: center; margin-bottom: 40px; border-bottom: 1px solid #111111; padding-bottom: 20px;">
              <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 0.15em; text-transform: uppercase; margin: 0;">VUE Atelier</h1>
              <p style="font-size: 10px; color: #666666; letter-spacing: 0.2em; text-transform: uppercase; margin: 5px 0 0 0;">Digital Production & Fabric Scanning</p>
            </div>
            
            <div style="margin-bottom: 40px; line-height: 1.6; font-weight: 300; font-size: 14px;">
              <p style="margin-bottom: 20px; color: #ffffff;">Hello,</p>
              <p style="margin-bottom: 20px; color: #cccccc;">Thank you for designing your campaign photoshoot using the VUE Studio Campaign Builder. We have successfully received your campaign configuration and asset package.</p>
              <p style="margin-bottom: 20px; color: #cccccc;">Our digital production team coordinates creative direction, environment layout, and structural fabric scanning to produce hyper-realistic high-fashion digital twin assets. We are currently reviewing your product specifications and uploaded references.</p>
              
              <div style="background-color: #050505; border: 1px solid #111111; padding: 20px; margin: 30px 0;">
                <h3 style="font-size: 11px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 0; margin-bottom: 15px; color: #ffffff; border-bottom: 1px solid #1a1a1a; padding-bottom: 8px;">Your Campaign Summary</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #888888;">
                  <tr>
                    <td style="padding: 6px 0; width: 160px; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em;">Contact Email</td>
                    <td style="padding: 6px 0; color: #ffffff;">${inquiry.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em;">Scope / Pricing Tier</td>
                    <td style="padding: 6px 0; color: #ffffff;">${inquiry.scope}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em;">Estimated Investment</td>
                    <td style="padding: 6px 0; color: #ffffff; font-family: monospace;">${payload.estimatedInvestment || 'Bespoke'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em;">Estimated Timeline</td>
                    <td style="padding: 6px 0; color: #ffffff;">${payload.timeline || 'TBD'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em;">Designed Products</td>
                    <td style="padding: 6px 0; color: #ffffff;">${productsCount} items loaded</td>
                  </tr>
                </table>
              </div>

              <p style="margin-bottom: 20px; color: #cccccc;">Our team will reply within twelve hours to schedule your personalized consultation, discuss material/fabric submissions, and review the next steps of our physical-to-digital scanning pipeline.</p>
              <p style="margin-top: 40px; color: #ffffff; font-size: 12px; letter-spacing: 0.05em;">With warmest regards,<br><span style="font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; margin-top: 5px;">VUE Studio Atelier</span></p>
            </div>
            
            <div style="border-top: 1px solid #111111; padding-top: 20px; text-align: center;">
              <p style="font-size: 9px; color: #444444; letter-spacing: 0.1em; margin: 0;">VUE FASHION STUDIO • CONFIDENTIAL & BESPOKE PRODUCTION SERVICES</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: fromEmail,
          to: inquiry.email,
          subject: `Campaign Brief Received - VUE Studio Atelier`,
          html: clientEmailHtml,
        });

        console.log(`Automated campaign emails successfully sent for inquiry ${inquiry.id}`);
        return res.status(200).json({ status: "success", message: "Campaign emails sent successfully." });
      }

      // 3. Email 1: Send the full photoshoot request payload to the Atelier (Standard)
      const teamEmailHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #000000; color: #ffffff; border: 1px solid #1a1a1a;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 1px solid #111111; padding-bottom: 20px;">
            <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 0.15em; text-transform: uppercase; margin: 0;">VUE Atelier</h1>
            <p style="font-size: 10px; color: #666666; letter-spacing: 0.2em; text-transform: uppercase; margin: 5px 0 0 0;">Global Production Logs</p>
          </div>
          
          <div style="margin-bottom: 40px;">
            <h2 style="font-size: 14px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; border-left: 2px solid #ffffff; padding-left: 10px; margin-bottom: 20px; color: #ffffff;">Photoshoot Request Payload</h2>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 10px 0; color: #888888; width: 180px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Representative Name</td>
                <td style="padding: 10px 0; color: #ffffff; font-weight: 400;">${inquiry.name || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Brand / Agency</td>
                <td style="padding: 10px 0; color: #ffffff; font-weight: 400;">${inquiry.brand || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Contact Email</td>
                <td style="padding: 10px 0; color: #ffffff; font-weight: 400;"><a href="mailto:${inquiry.email}" style="color: #ffffff; text-decoration: underline;">${inquiry.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Product Category</td>
                <td style="padding: 10px 0; color: #ffffff; font-weight: 400;">${inquiry.category || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Project Scope / Volume</td>
                <td style="padding: 10px 0; color: #ffffff; font-weight: 400;">${inquiry.scope}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Reference Link</td>
                <td style="padding: 10px 0; color: #ffffff; font-weight: 400;">${inquiry.link ? `<a href="${inquiry.link}" style="color: #ffffff; text-decoration: underline;">${inquiry.link}</a>` : '<span style="color: #444444;">None provided</span>'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Submission Logged</td>
                <td style="padding: 10px 0; color: #ffffff; font-weight: 400;">${inquiry.submittedAt}</td>
              </tr>
            </table>
          </div>
          
          <div style="border-top: 1px solid #111111; padding-top: 20px; text-align: center;">
            <p style="font-size: 9px; color: #444444; letter-spacing: 0.1em; margin: 0;">VUE FASHION STUDIO • ATELIER INTERFACE SERVICE</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject: `[VUE ATELIER] New Campaign Photoshoot Request - ${inquiry.brand || inquiry.email}`,
        html: teamEmailHtml,
      });

      // 4. Email 2: Send the auto responder to the client
      const clientEmailHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #000000; color: #ffffff; border: 1px solid #1a1a1a;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 1px solid #111111; padding-bottom: 20px;">
            <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 0.15em; text-transform: uppercase; margin: 0;">VUE Atelier</h1>
            <p style="font-size: 10px; color: #666666; letter-spacing: 0.2em; text-transform: uppercase; margin: 5px 0 0 0;">Digital Production & Fabric Scanning</p>
          </div>
          
          <div style="margin-bottom: 40px; line-height: 1.6; font-weight: 300; font-size: 14px;">
            <p style="margin-bottom: 20px; color: #ffffff;">Dear Client,</p>
            <p style="margin-bottom: 20px; color: #cccccc;">We have received your request to initiate a bespoke campaign photoshoot with the VUE Studio Global Atelier.</p>
            <p style="margin-bottom: 20px; color: #cccccc;">Our digital production team coordinates creative direction, environment layout, and structural fabric scanning to produce hyper-realistic high-fashion digital twin assets. We are currently reviewing your product credentials and reference materials.</p>
            
            <div style="background-color: #050505; border: 1px solid #111111; padding: 20px; margin: 30px 0;">
              <h3 style="font-size: 11px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 0; margin-bottom: 15px; color: #ffffff; border-bottom: 1px solid #1a1a1a; padding-bottom: 8px;">Your Request Summary</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #888888;">
                <tr>
                  <td style="padding: 6px 0; width: 140px; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em;">Brand</td>
                  <td style="padding: 6px 0; color: #ffffff;">${inquiry.brand || 'Bespoke Request'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em;">Category</td>
                  <td style="padding: 6px 0; color: #ffffff;">${inquiry.category || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em;">Scope</td>
                  <td style="padding: 6px 0; color: #ffffff;">${inquiry.scope}</td>
                </tr>
              </table>
            </div>

            <p style="margin-bottom: 20px; color: #cccccc;">Our team will reply within twelve hours to schedule your personalized consultation and coordinate fabric sample collections if required.</p>
            <p style="margin-top: 40px; color: #ffffff; font-size: 12px; letter-spacing: 0.05em;">With warmest regards,<br><span style="font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; margin-top: 5px;">VUE Studio Atelier</span></p>
          </div>
          
          <div style="border-top: 1px solid #111111; padding-top: 20px; text-align: center;">
            <p style="font-size: 9px; color: #444444; letter-spacing: 0.1em; margin: 0;">VUE FASHION STUDIO • CONFIDENTIAL & BESPOKE PRODUCTION SERVICES</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: fromEmail,
        to: inquiry.email,
        subject: `Production Consultation Initiated - VUE Studio Atelier`,
        html: clientEmailHtml,
      });

      console.log(`Automated emails successfully sent for inquiry ${inquiry.id}`);
      return res.status(200).json({ status: "success", message: "Emails sent successfully." });
    } catch (err: any) {
      console.error("Error executing SMTP email engine:", err);
      return res.status(500).json({ error: "Failed to dispatch email", details: err.message });
    }
  });

  // Vite middleware for development (with robust production fallback)
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
