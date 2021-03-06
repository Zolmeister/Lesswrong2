import Users from '../users/collection';

const membersActions = [
  'rssfeeds.new.own',
  'rssfeeds.edit.own',
  'rssfeeds.remove.own',
];
Users.groups.members.can(membersActions);

const adminActions = [
  'rssfeeds.new.all',
  'rssfeeds.edit.all',
  'rssfeeds.remove.all',
];
Users.groups.admins.can(adminActions);
