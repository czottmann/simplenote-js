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


module( "Miscellaneous", {
  setup: function() {
    this.SN = new SimpleNote();
    this.SN.enableDebug( true );
    this.originalTableURL = "http://github.com/carlo/simplenote-js/blob/production/src/yql_simplenote.xml";
  }
});


test( "should report its version", function() {
  ok( /^\d+\.\d+$/.test( this.SN.VERSION ) );
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

