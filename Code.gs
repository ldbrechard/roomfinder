// ==========================================
// CONFIGURATION - TO BE MODIFIED BY YOU
// ==========================================
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; 
const ADMIN_EMAIL_FEEDBACK = 'admin@yourdomain.com'; 
const APP_TITLE = 'Indoor Map & Routing';
// ==========================================

const SHEET_NAME = 'Rooms';
const LOGS_SHEET_NAME = 'Logs';
const NODES_SHEET = 'Nodes';
const EDGES_SHEET = 'Edges';

function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Index');
  template.requestedRoomId = (e.parameter && e.parameter.room) ? e.parameter.room : '';
  template.scriptUrl = ScriptApp.getService().getUrl();
  return template.evaluate()
                 .setTitle(APP_TITLE)
                 .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function logAction(id, modification) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(LOGS_SHEET_NAME);
  if (sheet) sheet.appendRow([new Date().toLocaleString('en-US'), id, modification]);
}

// --- ROOM MANAGEMENT ---
function getRooms() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  data.shift(); 
  return data.map(row => ({ id: row[0], name: row[1], info: row[2], y: row[3], x: row[4], zone: row[5] || 'Other' }));
}

function updateRoom(id, name, info, y, x, zone) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 2).setValue(name); 
      sheet.getRange(i + 1, 3).setValue(info);
      sheet.getRange(i + 1, 4).setValue(y); 
      sheet.getRange(i + 1, 5).setValue(x); 
      sheet.getRange(i + 1, 6).setValue(zone);
      logAction(id, `Room updated: ${name}`);
      return { success: true, room: { id, name, info, y, x, zone } };
    }
  }
  return { success: false };
}

function addRoom(name, info, y, x, zone) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const newId = Utilities.getUuid(); 
  sheet.appendRow([newId, name, info, y, x, zone]); 
  logAction(newId, `Room added: ${name} (${zone})`);
  return { id: newId, name: name, info: info, y: y, x: x, zone: zone };
}

function deleteRoom(id) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      const roomName = data[i][1]; 
      sheet.deleteRow(i + 1); 
      logAction(id, `Room deleted: ${roomName}`);
      return { success: true };
    }
  }
  return { success: false };
}

// --- NETWORK MANAGEMENT (ROUTING) ---
function getNetwork() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const nodesData = ss.getSheetByName(NODES_SHEET).getDataRange().getValues(); nodesData.shift();
  const nodes = nodesData.map(r => ({ id: r[0], y: r[1], x: r[2] }));
  const edgesData = ss.getSheetByName(EDGES_SHEET).getDataRange().getValues(); edgesData.shift();
  const edges = edgesData.map(r => ({ nodeA: r[0], nodeB: r[1] }));
  return { nodes, edges };
}

function addNodeAndEdge(y, x, parentId) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const newId = Utilities.getUuid();
  ss.getSheetByName(NODES_SHEET).appendRow([newId, y, x]);
  let newEdge = null;
  if (parentId) { ss.getSheetByName(EDGES_SHEET).appendRow([parentId, newId]); newEdge = { nodeA: parentId, nodeB: newId }; }
  return { node: { id: newId, y: y, x: x }, edge: newEdge };
}

function addEdgeOnly(nodeA, nodeB) {
  SpreadsheetApp.openById(SHEET_ID).getSheetByName(EDGES_SHEET).appendRow([nodeA, nodeB]);
  return { nodeA, nodeB };
}

function deleteNetworkNode(id) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const nodesSheet = ss.getSheetByName(NODES_SHEET);
  const edgesSheet = ss.getSheetByName(EDGES_SHEET);
  
  const nodes = nodesSheet.getDataRange().getValues();
  for (let i = nodes.length - 1; i > 0; i--) { if (nodes[i][0] === id) nodesSheet.deleteRow(i + 1); }
  
  const edges = edgesSheet.getDataRange().getValues();
  for (let i = edges.length - 1; i > 0; i--) { if (edges[i][0] === id || edges[i][1] === id) edgesSheet.deleteRow(i + 1); }
  return { success: true };
}

function deleteNetworkEdge(nodeA, nodeB) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(EDGES_SHEET);
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i > 0; i--) {
    if ((data[i][0] === nodeA && data[i][1] === nodeB) || (data[i][0] === nodeB && data[i][1] === nodeA)) sheet.deleteRow(i + 1);
  }
  return { success: true };
}

function splitNetworkEdge(nodeA, nodeB, y, x) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const newId = Utilities.getUuid();
  const nodesSheet = ss.getSheetByName(NODES_SHEET);
  const edgesSheet = ss.getSheetByName(EDGES_SHEET);

  nodesSheet.appendRow([newId, y, x]);
  edgesSheet.appendRow([nodeA, newId]);
  edgesSheet.appendRow([newId, nodeB]);

  const data = edgesSheet.getDataRange().getValues();
  for (let i = data.length - 1; i > 0; i--) {
    if ((data[i][0] === nodeA && data[i][1] === nodeB) || (data[i][0] === nodeB && data[i][1] === nodeA)) {
      edgesSheet.deleteRow(i + 1);
    }
  }
  return { newNode: { id: newId, y: y, x: x }, edge1: { nodeA: nodeA, nodeB: newId }, edge2: { nodeA: newId, nodeB: nodeB } };
}

// --- FEEDBACK EMAILS ---
function sendFeedbackEmail(text) {
  MailApp.sendEmail({
    to: ADMIN_EMAIL_FEEDBACK,
    subject: `💡 ${APP_TITLE} - New Feedback`,
    body: "A user sent a new message from the application:\n\n" + text
  });
  return true;
}
