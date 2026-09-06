/**
 * Google Tasks -> real Google Calendar all-day events (one-way).
 * SETUP
 * 1. Create a project at https://script.google.com/ and paste this into Code.gs.
 * 2. Services (+): add Google Tasks API (Tasks) and Google Calendar API (Calendar).
 *    If using a custom Cloud project, enable both APIs in that project too.
 * 3. Run setup(), approve access, and check the new "Tasks — synced" calendar.
 *    setup() also installs a trigger to sync daily around 6 AM in the project timezone. No deployment needed.
 *
 * Includes incomplete tasks due today through the next six days, from all lists.
 * Renames, notes, list names and due-date changes update matching events.
 * Completing/deleting a task, deleting its list, or removing its date removes
 * its mirrored event. Events outside the seven-day window are also removed.
 * Reopening a task in the window recreates its event.
 * Only events tagged by this project are modified/deleted. Tasks are read-only.
 * Events are marked Free, with no reminders. Edits to mirrored fields in
 * Calendar are overwritten at the next sync. Edit the source task instead.
 * Only occurrences returned by Tasks API are mirrored; no recurring series
 * or future occurrences are synthesized. Overdue tasks are excluded.
 * Large accounts may exceed Apps Script execution limits; errors are visible
 * under Executions. A subsequent run reconciles partially completed changes.
 *
 * Run stopSync() to disable automatic syncing (existing events remain).
 * Keep this same Apps Script project; independent copies are separate syncs.
 *
 * References:
 * https://developers.google.com/apps-script/advanced/tasks
 * https://developers.google.com/apps-script/advanced/calendar
 * https://developers.google.com/workspace/tasks/reference/rest/v1/tasks/list
 * https://developers.google.com/apps-script/guides/triggers/installable
 */
const SYNC_CALENDAR_NAME = 'Tasks — synced';

function setup() {
  syncTasks(); // Creates the dedicated calendar and performs the first sync.
  stopSync();
  ScriptApp.newTrigger('syncTasks').timeBased()
    .atHour(4).everyDays(1).inTimezone(Session.getScriptTimeZone()).create();
  console.log('Setup complete. Automatic sync runs daily around 4 AM in the project timezone.');
}

function stopSync() {
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === 'syncTasks') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

function syncTasks() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const props = PropertiesService.getScriptProperties();
    let owner = props.getProperty('TASK_SYNC_OWNER');
    if (!owner) {
      owner = Utilities.getUuid();
      props.setProperty('TASK_SYNC_OWNER', owner);
    }

    // Read the COMPLETE source snapshot before changing or removing events.
    // Failed API requests throw; an incomplete snapshot is never reconciled.
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    let windowEnd = today;
    for (let i = 0; i < 7; i++) windowEnd = nextDate_(windowEnd);
    const desired = new Map();
    const lists = allPages_(options => Tasks.Tasklists.list(options), {maxResults: 100});
    lists.forEach(list => {
      const tasks = allPages_(options => Tasks.Tasks.list(list.id, options), {
        maxResults: 100, showCompleted: false, showDeleted: false,
        showHidden: false, showAssigned: true
      });
      tasks.forEach(task => {
        if (!task.due || task.deleted || task.status === 'completed') return;
        const date = task.due.slice(0, 10); // Preserve API date, never localize midnight.
        if (date < today || date >= windowEnd) return;
        const key = list.id + '/' + task.id;
        desired.set(key, {
          summary: task.title || '(Untitled task)',
          description: 'Google Tasks list: ' + list.title + '\n\n' + (task.notes || ''),
          start: {date: date},
          end: {date: nextDate_(date)}, // Calendar all-day end is exclusive.
          transparency: 'transparent',
          reminders: {useDefault: false},
          extendedProperties: {private: {taskSyncOwner: owner, taskSyncKey: key}}
        });
      });
    });

    let calendarId = props.getProperty('TASK_SYNC_CALENDAR_ID');
    if (!calendarId) {
      const calendar = Calendar.Calendars.insert({
        summary: SYNC_CALENDAR_NAME,
        timeZone: Session.getScriptTimeZone(),
        description: 'All-day events mirrored from Google Tasks by Apps Script.'
      });
      calendarId = calendar.id;
      props.setProperty('TASK_SYNC_CALENDAR_ID', calendarId);
    }
    // If the saved calendar becomes inaccessible, throw instead of creating duplicates.
    const existing = allPages_(options => Calendar.Events.list(calendarId, options), {
      maxResults: 2500, showDeleted: false,
      privateExtendedProperty: ['taskSyncOwner=' + owner]
    });
    const byKey = new Map();
    const obsolete = [];
    existing.forEach(event => {
      const key = (event.extendedProperties || {}).private?.taskSyncKey;
      if (!key) return;
      if (!desired.has(key) || byKey.has(key)) obsolete.push(event);
      else byKey.set(key, event);
    });

    let created = 0, updated = 0;
    desired.forEach((body, key) => {
      const event = byKey.get(key);
      if (!event) {
        // Ownership and source key are stored atomically on the event. If a run
        // stops after insertion, the next run discovers it without a local mapping.
        Calendar.Events.insert(body, calendarId);
        created++;
      } else if (!matches_(event, body)) {
        Calendar.Events.update(body, calendarId, event.id);
        updated++;
      }
    });
    // Cleanup occurs only after all reads and upserts succeed.
    obsolete.forEach(event => Calendar.Events.remove(calendarId, event.id));
    console.log(JSON.stringify({calendarId, tasks: desired.size,
      created, updated, removed: obsolete.length}));
  } finally {
    lock.releaseLock();
  }
}

function allPages_(fetchPage, options) {
  const items = [];
  let pageToken;
  do {
    const args = Object.assign({}, options);
    if (pageToken) args.pageToken = pageToken;
    const page = fetchPage(args);
    items.push(...(page.items || []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return items;
}

function nextDate_(date) {
  const value = new Date(date + 'T00:00:00Z');
  if (isNaN(value.getTime())) throw new Error('Invalid task due date: ' + date);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

function matches_(event, body) {
  return event.summary === body.summary &&
    (event.description || '') === body.description &&
    event.start?.date === body.start.date && event.end?.date === body.end.date &&
    event.transparency === 'transparent' && event.reminders?.useDefault === false &&
    !(event.reminders.overrides || []).length;
}
