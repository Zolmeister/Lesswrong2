Package.describe({
  name: 'vulcan:routing',
  summary: 'Vulcan router package',
  version: '1.13.0',
  git: 'https://github.com/VulcanJS/Vulcan.git',
});

Package.onUse(function(api) {
  api.versionsFrom('1.6.1');

  api.use(['vulcan:lib@1.13.0', 'ecmascript']);

  api.mainModule('lib/server/main.js', 'server');
});
