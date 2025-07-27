//========= CONFIGURATION =============
const SPREADSHEET_ID = "1nYxwf2Yc7VvCLez19POGouc9ae3C7HnsOQgjbqF5HPE";
const IMAGE_FOLDER_ID = "1n-X9m5yUJj9BXm6oqa12ouA0AIVIm8Uz";
//=====================================

function doGet(e) {
  const page = e.parameter.page;

if (page === 'test') {
    return HtmlService.createHtmlOutputFromFile('TestImage').setTitle('Image Upload Test');
  }

  if (page === 'login') {
    return HtmlService.createTemplateFromFile('Login').evaluate()
      .setTitle('Admin Login')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }

  if (page === 'dashboard') {
    const user = PropertiesService.getUserProperties().getProperty('user');
    if (user === 'admin') {
      return HtmlService.createTemplateFromFile('Dashboard').evaluate()
        .setTitle('Admin Dashboard')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    } else {
      // If not logged in, redirect to login page
      return HtmlService.createTemplateFromFile('Login').evaluate()
        .setTitle('Admin Login')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    }
  }
  
  // Default to public index page
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('บริการเช่ารถตู้พร้อมคนขับ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}