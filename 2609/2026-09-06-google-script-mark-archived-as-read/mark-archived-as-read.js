// Add a trigger to run the function `markArchivedAsRead` using a time-based event
function markArchivedAsRead() {
  var threads = GmailApp.search('label:unread -label:inbox');
  GmailApp.markThreadsRead(threads.slice(0, 100));
}
