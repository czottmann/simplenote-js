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


