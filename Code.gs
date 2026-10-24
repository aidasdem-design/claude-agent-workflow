function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Claude Agent Workflow')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getGreeting(name) {
  return 'Hello, ' + (name || 'world') + '!';
}
