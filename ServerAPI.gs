/**
 * Helper function to safely get a sheet by its name.
 * Throws an error if the sheet is not found.
 * @param {string} sheetName The name of the sheet to get.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The sheet object.
 */
function getSheet(sheetName) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
            throw new Error(`Sheet "${sheetName}" not found. Please check spelling and make sure it exists.`);
        }
        return sheet;
    } catch (e) {
        Logger.log(e);
        throw new Error(`Could not open Spreadsheet. Check SPREADSHEET_ID and permissions. Original error: ${e.message}`);
    }
}

// AUTHENTICATION
function adminLogin(credentials) {
  try {
    if (credentials.username === 'admin' && credentials.password === 'aa1234') {
        PropertiesService.getUserProperties().setProperty('user', 'admin');
        return { status: 'success', url: ScriptApp.getService().getUrl() + '?page=dashboard' };
    }
    return { status: 'error', message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
  } catch(e) {
    Logger.log(e);
    return { status: 'error', message: 'เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์: ' + e.message };
  }
}

function adminLogout() {
  PropertiesService.getUserProperties().deleteProperty('user');
  return { status: 'success', url: ScriptApp.getService().getUrl() + '?page=login' };
}


// IMAGE UPLOAD
function uploadImage(fileData) {
  try {
    const imageFolder = DriveApp.getFolderById(IMAGE_FOLDER_ID);
    imageFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const { fileName, mimeType, data } = fileData;
    const decodedData = Utilities.base64Decode(data);
    const blob = Utilities.newBlob(decodedData, mimeType, fileName);
    const file = imageFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    Utilities.sleep(1000); 
    const directUrl = `https://lh3.googleusercontent.com/d/${file.getId()}`;
    return { success: true, url: directUrl };
  } catch (e) {
    Logger.log(`Image upload failed for file ${fileData.fileName}. Error: ${e.toString()}`);
    return { success: false, message: `Image upload failed: ${e.message}` };
  }
}

// GENERIC CRUD FUNCTIONS
function getSheetData(sheetName) {
  try {
    const sheet = getSheet(sheetName);
    const dataRange = sheet.getDataRange();
    if (dataRange.getNumRows() <= 1) return [];
    const values = dataRange.getValues();
    const headers = values.shift();
    return values.map((row, index) => {
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = row[i];
        });
        obj.rowIndex = index + 2;
        return obj;
    });
  } catch (e) {
      Logger.log(e);
      return { error: true, message: e.message };
  }
}

function addData(sheetName, dataObject) {
  try {
    const sheet = getSheet(sheetName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => dataObject[header] || "");
    sheet.appendRow(newRow);
    return { success: true, message: 'เพิ่มข้อมูลสำเร็จ' };
  } catch(e) {
      Logger.log(e);
      return { success: false, message: e.message };
  }
}

function updateData(sheetName, rowIndex, newDataObject) {
  try {
    const sheet = getSheet(sheetName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const oldRowValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
    const oldDataObject = {};
    headers.forEach((header, i) => {
        oldDataObject[header] = oldRowValues[i];
    });
    const mergedDataObject = { ...oldDataObject, ...newDataObject };
    const finalRowData = headers.map(header => mergedDataObject[header] || "");
    sheet.getRange(rowIndex, 1, 1, finalRowData.length).setValues([finalRowData]);
    return { success: true, message: 'แก้ไขข้อมูลสำเร็จ' };
  } catch (e) {
      Logger.log(e);
      return { success: false, message: `Update failed: ${e.message}` };
  }
}

function deleteData(sheetName, rowIndex) {
  try {
    const sheet = getSheet(sheetName);
    sheet.deleteRow(parseInt(rowIndex));
    return { success: true, message: 'ลบข้อมูลสำเร็จ' };
  } catch (e) {
      Logger.log(e);
      return { success: false, message: e.message };
  }
}


// WEB APP DATA LOADER
function getWebsiteData() {
  try {
    return {
      vans: getSheetData("Vans"),
      whyChooseUs: getSheetData("WhyChooseUs"),
      testimonials: getSheetData("Testimonials"),
      rates: getSheetData("Rates"),
      gallery: getSheetData("Gallery"),
    };
  } catch (e) {
    Logger.log(e);
    return { error: e.message };
  }
}

// CONTACT FORM
function saveMessage(formData) {
    try {
        const sheet = getSheet("Messages");
        sheet.appendRow([
            new Date(),
            formData.name,
            formData.email,
            formData.phone,
            formData.message,
            "No" // isRead
        ]);
        return { success: true, message: "ส่งข้อความเรียบร้อยแล้ว" };
    } catch (e) {
        Logger.log(e);
        return { success: false, message: "เกิดข้อผิดพลาด: " + e.message };
    }
}