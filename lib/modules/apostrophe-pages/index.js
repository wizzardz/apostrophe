module.exports = {

  alias: 'pages',

  contextMenu: [
    {
      name: 'new-page',
      label: 'New Page'
    },
    {
      name: 'edit-page',
      label: 'Page Settings'
    },
    {
      name: 'versions-page',
      label: 'Page Versions'
    },
    {
      name: 'delete-page',
      label: 'Move to Trash'
    },
    {
      name: 'reorganize-page',
      label: 'Reorganize'
    }
  ],

  afterConstruct: function(self, callback) {
    return self.ensureIndexes(callback);
  },

  construct: function(self, options) {
    require('./lib/helpers.js')(self, options);
    require('./lib/browser.js')(self, options);
    require('./lib/routes.js')(self, options);
    require('./lib/api.js')(self, options);

    // merge new methods with all apostrophe-cursors
    self.apos.define('apostrophe-cursor', require('./lib/anyCursor.js'));

    // Wait until the last possible moment to add
    // the wildcard route for serving pages, so that
    // other routes are not blocked

    self.afterInit = function(callback) {
      self.apos.app.get('*', self.serve);
      console.log('AFTER INIT');
      return self.implementParkAll(callback);
    };

  }
};