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


module( "Note Updating", {
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
      { key: null, body: "abc", error: $.noop, success: $.noop },
      { body: null, error: $.noop, success: $.noop }
    ];

  _.each( configs, function( config ) {
    try {
      SN.updateNote( config );
    }
    catch ( e ) {
      ok( /^ArgumentError/.test( e ), "threw ArgumentError" );
    }
  });
});


asyncTest( "should be able to update a note when called correctly", function() {
  var SN = this.SN,
    body1 = "simplenote-js test note\nthis is the note body",
    body2 = "simplenote-js test note\nthis is the new note body";

  stop( 9000 );

  function _step3( noteID ) {
    SN.retrieveNote({
      key: noteID,
      success: function( note ) {
        equals( note.body, body2, "note updated" );
        SN.noteID = note.key;
        start();
      },
      error: function _error( code ) {
        ok( false, "error occurred in _step3: " + code );
        start();
      }
    });
  }

  function _step2( noteID ) {
    if ( _.isString( noteID ) && !_.isEmpty( noteID ) ) {
      SN.updateNote({
        body: body2,
        key: noteID,
        success: _step3,
        error: function _error( code ) {
          ok( false, "error occurred in _step2: " + code );
          start();
        }
      });
    }
    else {
      ok( false, "error occurred in _step2: weird-ass noteID '" + noteID + "'" );
      start();
    }
  }
  
  SN.createNote({
    body: body1,
    success: _step2,
    error: function _error( code ) {
      ok( false, "error occurred: " + code );
      start();
    }
  });
});


