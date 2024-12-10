const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const { message } = require("statuses");
const { error } = require("console");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const CREDENTIALS_PATH = path.join(process.cwd(), "secre.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");
/**
 * Reads previously authorized credentials from the save file.
 *
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  console.log("key");
  console.log(keys);
  const key = keys.installed || keys.web;
  try{
    const payload = JSON.stringify({
      type: "authorized_user",
      client_id: key.client_id,
      client_secret: key.client_secret,
    });
    console.log(payload)
    await fs.writeFile(TOKEN_PATH, payload);
  }catch(er){
    console.log(er);
    
  }
  

}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,

    
  });
  if (client.credentials) {
    await saveCredentials(client);
    res.json({
      message: "authorized succesfully",
      success: true,
    });
  }
  return client;
}


async function listFiles(authClient) {
  const drive = google.drive({ version: "v3", auth: authClient });
  console.log(drive)
  const res = await drive.files.list({
    pageSize: 1,
    fields: "nextPageToken, files(id, name)",
  });
  console.log(res.data.files);

  const files = res.data.files;
  if (files.length === 0) {
    console.log("No files found.");
    return;
  }
  console.log("Files:");
  files.map((file) => {
    console.log(`${file.name} (${file.id})`);
    
  });
}

module.exports = {
  listFiles,
  authorize,
  saveCredentials,
  loadSavedCredentialsIfExist,
};
