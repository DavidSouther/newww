var Lab = require('lab'),
    describe = Lab.experiment,
    before = Lab.before,
    it = Lab.test,
    expect = Lab.expect;

var server, p, source, cookieCrumb;

// prepare the server
before(function (done) {
  server = require('./fixtures/setupServer')(done);

  server.ext('onPreResponse', function (request, next) {
    source = request.response.source;
    next();
  });
});

describe('Retreiving package feed from the registry', function () {
  it('gets an rss feed for package', function (done) {
    var pkgName = 'fake';

    var options = {
      url: '/package/' + pkgName + '.rss'
    }
    server.inject(options, function (resp) {
      var header = resp.headers['set-cookie'];
      expect(header.length).to.equal(1);

      expect(resp.statusCode).to.equal(200);

      var titleString = '<title><![CDATA[fake]]></title>';
      var titleStringIndex = source.indexOf(titleString);
      expect(titleStringIndex).to.be.greaterThan(-1);

      var itemTitleString = '<title><![CDATA[fake@0.0.1]]></title>';
      var itemTitleStringIndex = source.indexOf(itemTitleString)
      expect(itemTitleStringIndex).to.be.greaterThan(titleStringIndex);

      var guidString = '<guid isPermaLink="false">fake@0.0.1</guid>';
      var guidStringIndex = source.indexOf(guidString);
      expect(guidStringIndex).to.be.greaterThan(itemTitleStringIndex);

      done();
    });
  });
});
