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


module( "Note Searching", {
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


test( "shouldn't search for notes when called with missing or faulty argument", function() {
  var SN = this.SN,
    configs = [
      undefined,
      {},
      { error: $.noop, success: $.noop },
      { query: "abc", success: $.noop },
      { query: "abc", error: $.noop },
      { query: "123" },
      { success: $.noop },
      { error: $.noop },
      { query: "abc", error: 123, success: $.noop },
      { query: "abc", error: $.noop, success: "abc" },
      { query: null, error: $.noop, success: $.noop }
    ];

  _.each( configs, function( config ) {
    try {
      SN.searchNotes( config );
    }
    catch ( e ) {
      ok( /^ArgumentError/.test( e ), "threw ArgumentError" );
    }
  });
});


asyncTest( "should search for notes when called correctly (searching for an existing string)", function() {
  var SN = this.SN;

  stop( 3000 );

  SN.searchNotes({
    query: "simplenote",
    success: function( hash ) {
      ok( $.isPlainObject( hash ), "returned an object" );
      ok( _.isNumber( hash.totalRecords ), "returned object contains number of total matching records" );
      ok( _.isArray( hash.notes ), "returned object contains an array of notes" );
      ok( hash.notes.length > 0, "array of notes isn't empty" );
      ok( _.isString( hash.notes[ 0 ].body ) && _.isString( hash.notes[ 0 ].key ), "first note contains the right keys" );
      start();
    },
    error: function( code ) {
      ok( false, "error occurred: " + code );
      start();
    }
  });
});


asyncTest( "should search for notes when called correctly (searching for an non-existing string)", function() {
  var SN = this.SN;

  stop( 3000 );

  SN.searchNotes({
    query: "suieufz43rt9348u934f43u493tz348dkfhsdnc",
    success: function( hash ) {
      ok( $.isPlainObject( hash ), "returned an object" );
      ok( _.isNumber( hash.totalRecords ), "returned object contains number of total matching records" );
      equals( hash.totalRecords, 0, "number of total matching records is 0" );
      ok( _.isArray( hash.notes ), "returned object contains an array of notes" );
      equals( hash.notes.length, 0, "array of notes is empty" );
      start();
    },
    error: function( code ) {
      ok( false, "error occurred: " + code );
      start();
    }
  });
});

