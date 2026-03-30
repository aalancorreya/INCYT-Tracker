/**
 * INCYT Program Tracker — Google Apps Script Backend
 *
 * This script is bound to a Google Sheet and deployed as a Web App.
 * It provides a REST-like API for the frontend to read/write tracker state.
 *
 * Sheet tabs: Projects, People, Weeks, Tasks, Risks, Actions, Meta
 *
 * Deployment: Deploy > New deployment > Web app
 *   - Execute as: Me
 *   - Who has access: Anyone
 */

// =============================================================================
// TAB DEFINITIONS — headers for each sheet tab
// =============================================================================

var TAB_HEADERS = {
  Projects: ['id', 'name', 'shortName', 'description', 'priority', 'owners', 'color', 'isDeviceOnly'],
  People:   ['id', 'name', 'role', 'team', 'initials', 'color'],
  Weeks:    ['id', 'number', 'label', 'startDate', 'endDate', 'note'],
  Tasks:    ['id', 'projectId', 'jiraKey', 'title', 'description', 'status', 'priority', 'assigneeId', 'weekId', 'estimatedHours', 'blockedBy', 'blockerNote', 'isDeviceTask', 'tags', 'order'],
  Risks:    ['id', 'weekId', 'projectId', 'title', 'description', 'severity', 'status'],
  Actions:  ['id', 'weekId', 'projectId', 'title', 'assigneeId', 'completed'],
  Meta:     ['key', 'value']
};

// Fields that need special type handling on read
var JSON_FIELDS     = ['owners', 'tags'];
var BOOLEAN_FIELDS  = ['isDeviceOnly', 'isDeviceTask', 'completed'];
var NUMBER_FIELDS   = ['number', 'estimatedHours', 'order', 'priority'];

// =============================================================================
// WEB APP ENTRY POINTS
// =============================================================================

/**
 * Handles GET requests.
 * Default action is "getState" — returns the full TrackerState as JSON.
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getState';

    if (action === 'getState') {
      var state = assembleState();
      return jsonResponse({ success: true, data: state });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * Handles POST requests.
 * Expects JSON body: { action: string, payload: object }
 *   - action "saveState"   — full state rewrite
 *   - action "updateTasks" — partial update, Tasks tab only
 */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var payload = body.payload;

    if (action === 'saveState') {
      writeState(payload);
      return jsonResponse({ success: true, message: 'State saved.' });
    }

    if (action === 'updateTasks') {
      var headers = TAB_HEADERS.Tasks;
      var rows = (payload || []).map(function(task) {
        return serializeRow(task, headers);
      });
      writeSheetData('Tasks', rows, headers);
      updateMeta('lastUpdated', new Date().toISOString());
      return jsonResponse({ success: true, message: 'Tasks updated.' });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// =============================================================================
// CORE HELPERS
// =============================================================================

/**
 * Builds a JSON ContentService response.
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Reads all rows from a sheet tab and returns them as an array of objects.
 * The first row is treated as headers / keys.
 * Returns an empty array if the tab doesn't exist or has no data rows.
 */
function getSheetData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return []; // header only or empty

  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Skip completely empty rows
    if (row.every(function(cell) { return cell === '' || cell === null || cell === undefined; })) continue;

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];

      // Convert empty strings to undefined so they are omitted in JSON
      if (val === '' || val === null) {
        obj[key] = undefined;
        continue;
      }

      // JSON fields — parse stringified arrays
      if (JSON_FIELDS.indexOf(key) !== -1) {
        try {
          obj[key] = JSON.parse(val);
        } catch (_) {
          obj[key] = [];
        }
        continue;
      }

      // Boolean fields
      if (BOOLEAN_FIELDS.indexOf(key) !== -1) {
        obj[key] = (val === true || val === 'TRUE' || val === 'true');
        continue;
      }

      // Number fields
      if (NUMBER_FIELDS.indexOf(key) !== -1) {
        var num = Number(val);
        obj[key] = isNaN(num) ? undefined : num;
        continue;
      }

      // Default — keep as-is (string or Date)
      obj[key] = (val instanceof Date) ? val.toISOString() : val;
    }

    rows.push(obj);
  }

  return rows;
}

/**
 * Clears a sheet tab and rewrites it with headers + data rows.
 * Creates the tab if it doesn't exist.
 *
 * @param {string} sheetName  Tab name
 * @param {Array}  data       Array of row arrays (not objects)
 * @param {Array}  headers    Array of header strings
 */
function writeSheetData(sheetName, data, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Clear existing content
  sheet.clearContents();

  // Write headers
  if (headers && headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  // Write data rows
  if (data && data.length > 0) {
    sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  }
}

/**
 * Converts an object into a flat row array matching the given headers.
 * Handles serialization: arrays to JSON strings, booleans and numbers kept as-is.
 */
function serializeRow(obj, headers) {
  return headers.map(function(key) {
    var val = obj[key];

    // undefined / null → empty string for the sheet
    if (val === undefined || val === null) return '';

    // JSON fields — stringify arrays
    if (JSON_FIELDS.indexOf(key) !== -1) {
      return (Array.isArray(val)) ? JSON.stringify(val) : String(val);
    }

    // Booleans — keep native so Sheets renders TRUE/FALSE
    if (BOOLEAN_FIELDS.indexOf(key) !== -1) {
      return !!val;
    }

    // Numbers — keep native
    if (NUMBER_FIELDS.indexOf(key) !== -1) {
      var num = Number(val);
      return isNaN(num) ? '' : num;
    }

    return val;
  });
}

// =============================================================================
// STATE ASSEMBLY & WRITE
// =============================================================================

/**
 * Reads every tab and assembles the full TrackerState object.
 */
function assembleState() {
  var meta = getMetaMap();

  return {
    projects: getSheetData('Projects'),
    people:   getSheetData('People'),
    weeks:    getSheetData('Weeks'),
    tasks:    getSheetData('Tasks'),
    risks:    getSheetData('Risks'),
    actions:  getSheetData('Actions'),
    meta: {
      lastUpdated: meta['lastUpdated'] || null,
      version:     meta['version'] ? Number(meta['version']) : 1
    }
  };
}

/**
 * Writes the full TrackerState to all sheet tabs.
 * Clears and rewrites every tab.
 */
function writeState(state) {
  // Projects
  if (state.projects) {
    var projectRows = state.projects.map(function(p) {
      return serializeRow(p, TAB_HEADERS.Projects);
    });
    writeSheetData('Projects', projectRows, TAB_HEADERS.Projects);
  }

  // People
  if (state.people) {
    var peopleRows = state.people.map(function(p) {
      return serializeRow(p, TAB_HEADERS.People);
    });
    writeSheetData('People', peopleRows, TAB_HEADERS.People);
  }

  // Weeks
  if (state.weeks) {
    var weekRows = state.weeks.map(function(w) {
      return serializeRow(w, TAB_HEADERS.Weeks);
    });
    writeSheetData('Weeks', weekRows, TAB_HEADERS.Weeks);
  }

  // Tasks
  if (state.tasks) {
    var taskRows = state.tasks.map(function(t) {
      return serializeRow(t, TAB_HEADERS.Tasks);
    });
    writeSheetData('Tasks', taskRows, TAB_HEADERS.Tasks);
  }

  // Risks
  if (state.risks) {
    var riskRows = state.risks.map(function(r) {
      return serializeRow(r, TAB_HEADERS.Risks);
    });
    writeSheetData('Risks', riskRows, TAB_HEADERS.Risks);
  }

  // Actions
  if (state.actions) {
    var actionRows = state.actions.map(function(a) {
      return serializeRow(a, TAB_HEADERS.Actions);
    });
    writeSheetData('Actions', actionRows, TAB_HEADERS.Actions);
  }

  // Meta
  var version = (state.meta && state.meta.version) ? state.meta.version : 1;
  updateMeta('lastUpdated', new Date().toISOString());
  updateMeta('version', version);
}

// =============================================================================
// META HELPERS
// =============================================================================

/**
 * Reads the Meta tab and returns a simple key-value map.
 */
function getMetaMap() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Meta');
  if (!sheet) return {};

  var data = sheet.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      map[data[i][0]] = data[i][1];
    }
  }
  return map;
}

/**
 * Sets a single key in the Meta tab.
 * Updates existing row or appends a new one.
 */
function updateMeta(key, value) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Meta');
  if (!sheet) {
    sheet = ss.insertSheet('Meta');
    sheet.getRange(1, 1, 1, 2).setValues([['key', 'value']]);
  }

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }

  // Key not found — append
  sheet.appendRow([key, value]);
}

// =============================================================================
// SETUP — run once to create all tabs with correct headers
// =============================================================================

/**
 * Creates all required sheet tabs with their header rows.
 * Safe to run multiple times — skips tabs that already exist.
 *
 * Run this function manually from the Apps Script editor before first use:
 *   1. Open the script editor (Extensions > Apps Script)
 *   2. Select "setup" from the function dropdown
 *   3. Click Run
 */
function setup() {
  initializeSheet();
  Logger.log('Setup complete. All tabs created with headers.');
}

/**
 * Creates all tabs with headers if they don't already exist.
 * Also seeds the Meta tab with default values.
 */
function initializeSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create each tab
  var tabNames = Object.keys(TAB_HEADERS);
  for (var i = 0; i < tabNames.length; i++) {
    var name = tabNames[i];
    var headers = TAB_HEADERS[name];
    var sheet = ss.getSheetByName(name);

    if (!sheet) {
      sheet = ss.insertSheet(name);
      Logger.log('Created tab: ' + name);
    }

    // Write headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      // Bold the header row
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      // Freeze the header row
      sheet.setFrozenRows(1);
      Logger.log('  Headers written for: ' + name);
    }
  }

  // Seed Meta with defaults if empty
  var metaSheet = ss.getSheetByName('Meta');
  if (metaSheet && metaSheet.getLastRow() <= 1) {
    metaSheet.appendRow(['lastUpdated', new Date().toISOString()]);
    metaSheet.appendRow(['version', 1]);
    Logger.log('  Meta seeded with defaults.');
  }
}
