var deep = require('deep-get-set');
var _ = require('lodash');

module.exports = function(self, options) {
  var launder = self.apos.launder;

  self.route('post', 'save-singleton', function(req, res) {
    var data = (typeof(req.body.data) === 'object') ? req.body.data : {};
    var options = (typeof(req.body.options) === 'object') ? req.body.options : {};
    var type = launder.string(options.type);
    var docId = launder.id(req.body.docId);
    var dotPath = launder.string(req.body.dotPath);
    var doc;
    if (!(type && data && options && docId && dotPath)) {
      return fail(new Error('invalid'));
    }
    if (!dotPath.match(/^[\w\.]+$/)) {
      return fail(new Error('invalid'));
    }
    var manager = self.getWidgetManager(type);
    if (!manager) {
      return fail(new Error('invalid'));
    }
    return manager.sanitize(req, data, function(err, widget) {
      if (err) {
        return fail(err);
      }
      return self.saveSingleton(req, docId, dotPath, data, options, function(err, html) {
        if (err) {
          return fail(err);
        }
        return res.send(html);
      });
    });
    function fail(err) {
      console.error(err);
      res.statusCode = 404;
      return res.send('notfound');
    }
  });

  self.route('post', 'save-area', function(req, res) {
    var items = Array.isArray(req.body.items) ? req.body.items : [];
    var docId = launder.id(req.body.docId);
    var dotPath = launder.string(req.body.dotPath);
    var doc;
    if (!(items && options && docId && dotPath)) {
      return fail(new Error('invalid'));
    }
    if (!dotPath.match(/^[\w\.]+$/)) {
      return fail(new Error('invalid'));
    }
    return self.sanitizeItems(req, items, function(err, items) {
      if (err) {
        return fail(err);
      }
      return self.saveArea(req, docId, dotPath, items, function(err) {
        if (err) {
          return fail(err);
        }
        return res.send({ status: 'ok' });
      });
    });
    function fail(err) {
      console.error(err);
      return res.send({ status: 'error' });
    }
  });

  // Render an editor for a virtual area with the content
  // specified as an array of items by the req.body.content
  // property, if any. For use when you are supplying your own storage
  // (for instance, the blog module uses this to render
  // an area editor for the content of a post).

  self.route('post', 'edit-virtual-area', function(req, res) {
    var items = req.body.items || [];
    var options = req.body.options || {};
    console.error('TODO: validate widget data in edit-virtual-area');
    var area = {
      type: 'area',
      items: items,
      _edit: true
    };
    // virtual option prevents attributes used to
    // save content from being output
    options.virtual = true;
    options.area = area;
    // This template is a shim to call the
    // apos.area helper
    return res.send(self.render(req, 'virtualArea', { options: options }));
  });

  // // Render an editor for a virtual area with the content
  // // specified as a JSON array of items by the req.body.content
  // // property, if any (there will be 0 or 1 elements, any further
  // // elements are ignored). For use when you are supplying your own storage
  // // (for instance, the blog module uses this to render
  // // a singleton thumbnail edit button for a post).

  // self.app.post('/apos/edit-virtual-singleton', function(req, res) {
  //   var options = req.body.options || {};
  //   var content = req.body.content || [];
  //   return self.sanitizeItems(req, content, function(err, items) {
  //     var area = {
  //       type: 'area',
  //       items: items,
  //       _edit: true
  //     };
  //     var type = req.body.type;
  //     // A temporary id for the duration of the editing activity, useful
  //     // in the DOM. Regular areas are permanently identified by their slugs,
  //     // not their IDs. Virtual areas are identified as the implementation sees fit.
  //     area.wid = 'w-' + self.generateId();
  //     extend(options, _.omit(req.body, 'content', 'type'), true);
  //     options.type = type;
  //     options.area = area;
  //     options.edit = true;
  //     // Must do this before directly invoking an apos* that might render a partial
  //     self.initI18nLocal(req);
  //     return res.send(self._aposLocals.aposSingleton(options));
  //   });
  // });


  self.route('post', 'render-widget', function(req, res) {
    var data = (typeof(req.body.data) === 'object') ? req.body.data : {};
    var options = (typeof(req.body.options) === 'object') ? req.body.options : {};
    var type = launder.string(req.body.type);
    if (!(data && options && type)) {
      return fail(new Error('invalid'));
    }
    var manager = self.getWidgetManager(type);
    if (!manager) {
      return fail(new Error('invalid'));
    }
    return manager.sanitize(req, data, function(err, widget) {
      console.log(arguments);
      return self.renderWidget(req, type, widget, options, function(err, html) {
        if (err) {
          return fail(err);
        }
        return res.send(html);
      });
    });
    function fail(err) {
      console.error(err);
      res.statusCode = 404;
      return res.send('notfound');
    }
  });

  // Supplies static DOM templates to the editor on request
  self.route('get', 'editor', function(req, res) {
    return res.send(self.render(req, 'editor'));
  });

};