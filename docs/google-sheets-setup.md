# Google Sheets Auth — Setup Guide

## 1. Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Rename it to **"Safar AI Users"**
3. In the first row (header), add these column headers:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| id | name | email | passwordHash | avatar | createdAt |

4. Rename the sheet tab (bottom) to **Users** (right-click tab → Rename)

## 2. Deploy the Apps Script

1. In the same spreadsheet, go to **Extensions → Apps Script**
2. Delete any existing code and paste the following:

```javascript
// ─── Safar AI — Google Sheets Auth Backend ──────────────────────────
// This script turns your Google Sheet into a free REST API for user auth.

const SHEET_NAME = "Users";

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function findUserByEmail(email) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === email) {
      return {
        id: data[i][0],
        name: data[i][1],
        email: data[i][2],
        passwordHash: data[i][3],
        avatar: data[i][4] || "",
        createdAt: data[i][5],
        row: i + 1,
      };
    }
  }
  return null;
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === "signup") {
      const { id, name, email, passwordHash, createdAt } = body;
      const existing = findUserByEmail(email);
      if (existing) {
        return jsonResponse({ success: false, error: "An account with this email already exists" });
      }
      const sheet = getSheet();
      sheet.appendRow([id, name, email, passwordHash, "", createdAt]);
      return jsonResponse({
        success: true,
        user: { id, name, email, avatar: "", createdAt },
      });
    }

    if (action === "signin") {
      const { email, passwordHash } = body;
      const user = findUserByEmail(email);
      if (!user) {
        return jsonResponse({ success: false, error: "No account found with this email" });
      }
      if (user.passwordHash !== passwordHash) {
        return jsonResponse({ success: false, error: "Incorrect password" });
      }
      return jsonResponse({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt },
      });
    }

    if (action === "getUser") {
      const { email } = body;
      const user = findUserByEmail(email);
      if (!user) {
        return jsonResponse({ success: false, error: "User not found" });
      }
      return jsonResponse({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt },
      });
    }

    if (action === "updateProfile") {
      const { email, name, avatar } = body;
      const user = findUserByEmail(email);
      if (!user) {
        return jsonResponse({ success: false, error: "User not found" });
      }
      const sheet = getSheet();
      if (name) sheet.getRange(user.row, 2).setValue(name);
      if (avatar !== undefined) sheet.getRange(user.row, 5).setValue(avatar);
      return jsonResponse({
        success: true,
        user: {
          id: user.id,
          name: name || user.name,
          email: user.email,
          avatar: avatar !== undefined ? avatar : user.avatar,
          createdAt: user.createdAt,
        },
      });
    }

    return jsonResponse({ success: false, error: "Unknown action" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  return jsonResponse({ status: "ok", message: "Safar AI Auth API is running" });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

3. Click **Deploy → New deployment**
4. Choose type: **Web app**
5. Set:
   - **Description**: Safar AI Auth
   - **Execute as**: Me
   - **Who has access**: **Anyone**
6. Click **Deploy**
7. Authorize when prompted (Review permissions → your Google account → Allow)
8. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfycb.../exec`)

## 3. Configure the App

1. Open `.env.local` in your project root
2. Paste the URL:

```
GOOGLE_SHEETS_WEBAPP_URL=https://script.google.com/macros/s/AKfycb.../exec
```

3. Restart the dev server (`Ctrl+C`, then `npm run dev`)

## That's it!

New sign-ups will now be stored in your Google Sheet. If the env var is empty, the app falls back to localStorage (offline mode) so everything still works during development.

### Troubleshooting

- **"Authorization required"**: Make sure you selected "Anyone" for access
- **CORS errors**: The API route proxies requests server-side, so CORS isn't an issue
- **Slow responses**: Apps Script cold starts take 1-3s on first request, then ~200ms after
- **Need to update the script?**: Go to Extensions → Apps Script → edit → Deploy → Manage deployments → Edit → New version → Deploy
