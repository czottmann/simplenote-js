/*jslint adsafe: false, bitwise: true, browser: true, cap: false, css: false,
  debug: false, devel: true, eqeqeq: true, es5: false, evil: false,
  forin: false, fragment: false, immed: true, laxbreak: false, newcap: true,
  nomen: false, on: false, onevar: true, passfail: false, plusplus: true,
  regexp: false, rhino: true, safe: false, strict: false, sub: false,
  undef: true, white: false, widget: false, windows: false */
/*global jQuery: false, $: false, window: false, QUnit: false, expect: false,
  ok: false, equals: false, same: false,  start: false, stop: false,
  module: false, test: false, asyncTest: false, SimpleNote: false,
  CREDENTIALS: false */
"use strict";


// ------------------------


module( "Authentication", {
  setup: function() {
    this.SN = new SimpleNote();
    this.SN.debugEnabled( true );
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

  $.each( configs, function( config ) {
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
    success: function() {},
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
    email: CREDENTIALS.email,
    password: CREDENTIALS.password,
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
    this.SN.debugEnabled( true );
    SN = this.SN;
    
    stop( 3000 );

    this.SN.auth({
      email: CREDENTIALS.email,
      password: CREDENTIALS.password,
      success: function() {
        ok( SN.isLoggedIn(), "authenticated" );
        start();
      }
    });
  }
});


test( "shouldn't work with missing or faulty argument", 7, function() {
  var SN = this.SN,
    configs = [
      undefined,
      {},
      { success: function() {} },
      { error: function() {} },
      { success: "abc" },
      { error: 123 }
    ];

  $.each( configs, function( config ) {
    try {
      SN.getIndex( config );
    }
    catch ( e ) {
      ok( /^ArgumentError/.test( e ), "threw ArgumentError" );
    }
  });
});


asyncTest( "should get index", 2, function() {
  var SN = this.SN;

  stop( 3000 );

  SN.getIndex({
    success: function( data ) {
      ok( $.isArray( data ), "got index" );
      start();
    },
    error: function( code ) {
      ok( false, "error occurred: " + code );
      start();
    }
  });
});


// ------------------------


