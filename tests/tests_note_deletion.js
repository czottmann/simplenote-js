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


module( "Note Deletion", {
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
        
        SN.createNote({
          body: "simplenote-js test note\nthis is the note body",
          success: function( noteID ) {
            SN.noteID = noteID;
            ok( true, "new note created" );
            start();
          },
          error: function _error( code ) {
            ok( false, "error occurred: " + code );
            start();
          }
        });
      }
    });
  }
});


test( "shouldn't delete note when called with missing or faulty argument", function() {
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
      { key: "abc" },
      { key: "abc", error: 123, success: $.noop },
      { key: "abc", error: $.noop, success: "abc" },
      { key: null, permanently: true, error: $.noop, success: $.noop },
      { key: null, error: $.noop, success: $.noop }
    ];

  _.each( configs, function( config ) {
    try {
      SN.deleteNote( config );
    }
    catch ( e ) {
      ok( /^ArgumentError/.test( e ), "threw ArgumentError" );
    }
  });
});


asyncTest( "should be able to delete a note when called correctly", function() {
  var SN = this.SN;

  stop( 3000 );

  SN.deleteNote({
    key: SN.noteID,
    success: function( noteID ) {
      equals( noteID, SN.noteID, "note deleted" );
      start();
    },
    error: function _error( code ) {
      ok( false, "error occurred in _step3: " + code );
      start();
    }
  });
});


