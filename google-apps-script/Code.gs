const DEMO_HEADERS = [
  "Submitted At",
  "Request ID",
  "Full Name",
  "Work Email",
  "Phone",
  "Company",
  "Team Size",
  "Area of Interest",
  "Status",
  "Source",
];

function doPost(e) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const expectedToken = properties.getProperty("SHARED_SECRET");
    const payload = JSON.parse(e && e.postData ? e.postData.contents : "{}");

    if (!expectedToken || payload.token !== expectedToken) {
      return jsonResponse_({
        success: false,
        message: "Unauthorized request.",
      });
    }

    const rowNumber = appendDemoRequest_(payload, "Website Demo Form", "New");
    return jsonResponse_({ success: true, rowNumber: rowNumber });
  } catch (error) {
    return jsonResponse_({
      success: false,
      message: "Could not record demo request.",
    });
  }
}

function testAppendDemoRequest() {
  const rowNumber = appendDemoRequest_(
    {
      fullName: "Apps Script Setup Test",
      email: "test@example.com",
      phone: "+94 77 000 0000",
      companyName: "Test Row - Safe to Delete",
      teamSize: "1-10 employees",
      message: "Remove this row after checking the sheet connection.",
    },
    "Apps Script Editor Test",
    "Test",
  );

  Logger.log(
    "Test row added at row " + rowNumber + ". Delete it after verification.",
  );
}

function appendDemoRequest_(payload, source, status) {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("SHEET_ID");
  if (!spreadsheetId) {
    throw new Error("SHEET_ID script property is missing.");
  }

  const fullName = requiredText_(payload.fullName, "fullName", 120);
  const email = requiredText_(payload.email, "email", 254);
  const phone = requiredText_(payload.phone, "phone", 40);
  const companyName = optionalText_(payload.companyName, 160);
  const teamSize = optionalText_(payload.teamSize, 40);
  const message = optionalText_(payload.message, 2000);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName("Demo Requests");
    if (!sheet) {
      throw new Error('Sheet tab "Demo Requests" was not found.');
    }

    const headers = sheet
      .getRange(1, 1, 1, DEMO_HEADERS.length)
      .getDisplayValues()[0];
    if (
      DEMO_HEADERS.some(function (header, index) {
        return headers[index] !== header;
      })
    ) {
      throw new Error(
        "The Demo Requests header row does not match the expected columns.",
      );
    }

    const rowNumber = sheet.getLastRow() + 1;
    sheet
      .getRange(rowNumber, 1, 1, DEMO_HEADERS.length)
      .setValues([
        [
          new Date(),
          Utilities.getUuid(),
          safeCellText_(fullName),
          safeCellText_(email),
          safeCellText_(phone),
          safeCellText_(companyName),
          safeCellText_(teamSize),
          safeCellText_(message),
          status,
          source,
        ],
      ]);
    return rowNumber;
  } finally {
    lock.releaseLock();
  }
}

function requiredText_(value, field, maxLength) {
  const text = optionalText_(value, maxLength);
  if (!text) {
    throw new Error("Required field is missing: " + field);
  }
  return text;
}

function optionalText_(value, maxLength) {
  return String(value == null ? "" : value)
    .trim()
    .slice(0, maxLength);
}

function safeCellText_(value) {
  return /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
