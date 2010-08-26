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


module( "Note Creation", {
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
  },
  
  teardown: function() {
    if ( this.SN.noteID ) {
      this.SN.deleteNote({
        key: this.SN.noteID,
        permanently: true,
        success: $.noop,
        error: $.noop
      });
    }
  }
});


test( "shouldn't retrieve note when called with missing or faulty argument", function() {
  var SN = this.SN,
    configs = [
      undefined,
      {},
      { error: $.noop, success: $.noop },
      { body: "abc", success: $.noop },
      { body: "abc", error: $.noop },
      { error: $.noop, success: $.noop },
      { success: $.noop },
      { error: $.noop },
      { body: "123" },
      { body: "abc", error: 123, success: $.noop },
      { body: "abc", error: $.noop, success: "abc" },
      { body: null, error: $.noop, success: $.noop }
    ];

  _.each( configs, function( config ) {
    try {
      SN.createNote( config );
    }
    catch ( e ) {
      ok( /^ArgumentError/.test( e ), "threw ArgumentError" );
    }
  });
});


asyncTest( "should be able to create a note when called correctly", 2, function() {
  var SN = this.SN;

  stop( 3000 );

  SN.createNote({
    body: "simplenote-js test note\nthis is the note body",
    success: function( data ) {
      ok( _.isString( data ), "got note ID" );
      start();
    },
    error: function( code ) {
      ok( false, "error occurred: " + code );
      start();
    }
  });
});


