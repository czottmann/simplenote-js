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


module( "Notes Index", {
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


test( "shouldn't retrieve index when called with missing or faulty argument", function() {
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


asyncTest( "should retrieve valid index when logged in", function() {
  var SN = this.SN;

  stop( 3000 );

  SN.retrieveIndex({
    success: function( data ) {
      var first = data[ 0 ],
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


module( "Notes Index" );


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


