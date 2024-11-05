import { google } from "googleapis";

// creation of folder by user
// insert the file into the folder


// Initialize OAuth2 Client
export const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

export const drive = google.drive({ version: "v3", auth: oauth2Client });
