/*jslint adsafe: false, bitwise: true, browser: true, cap: false, css: false,
  debug: false, devel: true, eqeqeq: true, es5: false, evil: false,
  forin: false, fragment: false, immed: true, laxbreak: false, newcap: true,
  nomen: false, on: false, onevar: true, passfail: false, plusplus: true,
  regexp: false, rhino: true, safe: false, strict: false, sub: false,
  undef: true, white: false, widget: false, windows: false */
/*global jQuery: false, $: false, window: false, QUnit: false, expect: false,
  ok: false, equals: false, same: false,  start: false, stop: false,
  module: false, test: false, asyncTest: false, SimpleNote: false,
  FIXTURES: false, _: false */
"use strict";


// ------------------------


module( "Authentication", {
  setup: function() {
    this.SN = new SimpleNote();
    this.SN.enableDebug( true );
  },
  
  teardown: function() {
    delete( this.SN );
  }
});


test( "shouldn't work with missing credentials", 3, function() {
  var SN = this.SN,
    configs = [
      { email: "test@example.com" },
      { password: "example" },
      {}
    ];

  _.each( configs, function( config ) {
    try {
      SN.auth( config );
    }
    catch ( e ) {
      ok( /^ArgumentError/.test( e ), "threw ArgumentError" );
    }
  });
});


asyncTest( "shouldn't work with invalid credentials", 2, function() {
  var SN = this.SN;
  
  stop( 3000 );

  SN.auth({
    email: "dummy",
    password: "dummy",
    success: $.noop,
    error: function( code ) {
      var auth = SN.getAuthDetails();
      ok( ( !auth.email && !auth.token ), "auth info is empty" );
      ok( /bad_request|unauthorized/.test( code ), "couldn't authenticate (" + code + ")" );
      start();
    }
  });
});


asyncTest( "should work with valid credentials", 2, function() {
  var SN = this.SN;
  
  stop( 3000 );

  SN.auth({
    email: FIXTURES.email,
    password: FIXTURES.password,
    success: function() {
      var auth = SN.getAuthDetails();
      ok( SN.isLoggedIn(), "authenticated" );
      ok( ( !!auth.email && !!auth.token ), "auth info is present" );
      start();
    },
    error: function( code ) {
      ok( false, "didn't authenticate, error occurred: " + code );
      start();
    }
  });
});


// ------------------------


module( "Note Index", {
  setup: function() {
    var SN;
    
    this.SN = new SimpleNote();
    this.SN.enableDebug( true );
    SN = this.SN;
    
    stop( 3000 );

    this.SN.auth({
      email: FIXTURES.email,
      password: FIXTURES.password,
      success: function() {
        ok( SN.isLoggedIn(), "authenticated" );
        start();
      }
    });
  }
});


test( "shouldn't retrieve index when called with missing or faulty argument", 7, function() {
  var SN = this.SN,
    configs = [
      undefined,
      {},
      { success: $.noop },
      { error: $.noop },
      { success: "abc" },
      { error: 123 }
    ];

  _.each( configs, function( config ) {
    try {
      SN.retrieveIndex( config );
    }
    catch ( e ) {
      ok( /^ArgumentError/.test( e ), "threw ArgumentError" );
    }
  });
});


asyncTest( "should retrieve valid index when logged in", 11, function() {
  var SN = this.SN;

  stop( 3000 );

  SN.retrieveIndex({
    success: function( data ) {
      var first = data[ 0 ];
        keys = _.keys( first );
      
      ok( _.isArray( data ), "got index" );

      _.each( [ "deleted", "key", "modify" ], function( key ) {
        ok( _.include( keys, key ), "first index element contains key '" + key + "'" );
        equals( _.isUndefined( first[ key ] ), false, "key is undefined" );
        equals( _.isNull( first[ key ] ), false, "key is null" );
      });

      start();
    },
    error: function( code ) {
      ok( false, "error occurred: " + code );
      start();
    }
  });
});


module( "Note Index" );


test( "shouldn't work when not logged in", function() {
  var SN = new SimpleNote();

  try {
    SN.retrieveIndex({
      success: $.noop,
      error: $.noop
    });
  }
  catch ( e ) {
    ok( /^AuthError/.test( e ), "threw AuthError" );
  }
});


// ------------------------


module( "Note Retrieval", {
  setup: function() {
    var SN;
    
    this.SN = new SimpleNote();
    this.SN.enableDebug( true );
    SN = this.SN;
    
    stop( 3000 );

    this.SN.auth({
      email: FIXTURES.email,
      password: FIXTURES.password,
      success: function() {
        ok( SN.isLoggedIn(), "authenticated" );
        start();
      }
    });
  }
});


test( "shouldn't retrieve note when called with missing or faulty argument", 13, function() {
  var SN = this.SN,
    configs = [
      undefined,
      {},
      { error: $.noop, success: $.noop },
      { key: "abc", success: $.noop },
      { key: "abc", error: $.noop },
      { error: $.noop, success: $.noop },
      { success: $.noop },
      { error: $.noop },
      { key: "123" },
      { key: "abc", error: 123, success: $.noop },
      { key: "abc", error: $.noop, success: "abc" },
      { key: null, error: $.noop, success: $.noop }
    ];

  _.each( configs, function( config ) {
    try {
      SN.retrieveNote( config );
    }
    catch ( e ) {
      ok( /^ArgumentError/.test( e ), "threw ArgumentError" );
    }
  });
});


asyncTest( "should be able to retrieve an existing note", 17, function() {
  var SN = this.SN;

  stop( 3000 );

  SN.retrieveNote({
    key: FIXTURES.existingNoteKey,
    success: function( data ) {
      var keys = _.keys( data );
      
      ok( $.isPlainObject( data ), "got note" );

      _.each( [ "body", "key", "modifydate", "createdate", "deleted" ], function( key ) {
        ok( _.include( keys, key ), "note object contains key '" + key + "'" );
        equals( _.isUndefined( data[ key ] ), false, "key is undefined" );
        equals( _.isNull( data[ key ] ), false, "key is null" );
      });

      start();
    },
    error: function( code ) {
      ok( false, "error occurred: " + code );
      start();
    }
  });
});


// ------------------------


module( "Miscellaneous", {
  setup: function() {
    this.SN = new SimpleNote();
    this.SN.enableDebug( true );
    this.originalTableURL = "http://github.com/carlo/simplenote-js/raw/master/src/yql_simplenote.xml";
  }
});


test( "should report its version", function() {
  ok( /^\d+\.\d+$/.test( this.SN._version ) );
});


test( "should report its default YQL Open Data table URL", function() {
  equals( this.SN.getOpenDataTable(), this.originalTableURL, "pass" );
});


test( "should allow to set new YQL Open Data table URL", 2, function() {
  var newURL = "http://example.com/new/table.xml";
  
  equals( this.SN.getOpenDataTable(), this.originalTableURL, "pass" );
  this.SN.setOpenDataTable( "http://example.com/new/table.xml" );
  equals( this.SN.getOpenDataTable(), newURL, "pass" );
});


