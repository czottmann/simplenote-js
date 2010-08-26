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


test( "shouldn't retrieve note when called with missing or faulty argument", function() {
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


asyncTest( "should be able to retrieve an existing note when called correctly", function() {
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


