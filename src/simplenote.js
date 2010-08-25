/*jslint adsafe: false, bitwise: true, browser: true, cap: false, css: false,
  debug: false, devel: true, eqeqeq: true, es5: false, evil: false,
  forin: false, fragment: false, immed: true, laxbreak: false, newcap: true,
  nomen: false, on: false, onevar: true, passfail: false, plusplus: true,
  regexp: false, rhino: true, safe: false, strict: false, sub: false,
  undef: true, white: false, widget: false, windows: false */
/*global jQuery: false, window: false */
"use strict";


/*
* (c) 2010 Carlo Zottmann
* http://github.com/carlo/simplenote-js
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/


/**
* SimpleNote API wrapper module.
*
* @module     simplenote-js
*/


/**
* SimpleNote API wrapper class.
*
* @class      SimpleNote
* @requires   jquery
* @constructor
*/

function SimpleNote() {

  var $ = window.jQuery,
  

  /**
  * The simplenote-js version number.
  *
  * @property   _VERSION
  * @type       String
  * @final
  * @private
  */
  
  _VERSION = "0.6",
  
  
  /**
  * After a successful login, this variable holds the account email address
  * required for all subsequent API requests.
  *
  * @property   _email
  * @type       String
  * @private
  */
  
  _email = "",
  

  /**
  * After a successful login, this variable holds the auth token required for
  * all subsequent API requests.
  *
  * @property   _token
  * @type       String
  * @private
  */
  
  _token = "",
  
  
  /**
  * Contains the base URL of the API.
  *
  * @property   _baseURL
  * @type       String
  * @final
  * @private
  */
  
  _baseURL = "https://simple-note.appspot.com/api",

  
  /**
  * Contains the OpenData table used for all YQL calls.
  *
  * @property   _yqlTableURL
  * @type       String
  * @default    http://github.com/carlo/simplenote-js/raw/master/src/yql_simplenote.xml
  * @private
  */
  
  _yqlTableURL = "http://github.com/carlo/simplenote-js/raw/master/src/yql_simplenote.xml",
  

  /**
  * Enables console output of debugging messages.
  *
  * @property   _debugEnabled
  * @type       Boolean
  * @default    false
  * @private
  */
  
  _debugEnabled = false;
  
  
  function log() {
    log.history = log.history || [];   // store logs to an array for reference
    log.history.push( arguments );
    if ( window.console && _debugEnabled ) {
      console.log( Array.prototype.slice.call( arguments ) );
    }
  }

  
  /**
  * Deletes both `_email` and `_token` variables.
  *
  * @method     _clearCredentials
  * @private
  */
  
  function _clearCredentials() {
    _email = "";
    _token = "";
  }
  
  
  /**
  * Returns a boolean showing whether the user is currently logged in or not.
  *
  * @method     _isLoggedIn
  * @return     {Boolean}
  * @private
  */
  
  function _isLoggedIn() {
    return ( !!_email && !!_token );
  }


  /**
  * Throws an exception if either the internal email or token aren't set
  * (which means the user's not logged in).
  *
  * @method     _throwUnlessLoggedIn
  * @private
  */
  
  function _throwUnlessLoggedIn() {
    if ( !_isLoggedIn() ) {
      throw "AuthError";
    }
  }


  /**
  * Returns a random string used as YQL request table name.
  *
  * @method     _getYQLTableName
  * @private
  */
  
  function _getYQLTableName() {
    var a,
      name = "";
    
    for ( a = 0; a < 10; a += 1 ) {
      name += String.fromCharCode( 97 + Math.floor( Math.random( 26 ) * 26 ) );
    }
    
    name += String( Math.random() ).substr( -8 );
    return name;
  }

  
  /**
  * Accepts a YQL query and returns the related YQL URL.
  *
  * @method     _getYQLURL
  * @param      query {String} YQL query
  * @private
  */
  
  function _getYQLURL( query ) {
    return [
      "https://query.yahooapis.com/v1/public/yql?q=",
      encodeURIComponent( query ),
      "&diagnostics=true",
      "&format=json",
      "&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys"
    ].join( "" );
  }


  /**
  * Calls the function passed as argument, and passes a clear text error
  * string.  
  * 
  * @method     _callErrorFunction
  * @param      callback {Function} The error function to be called.
  * @param      query {Object} The query object returned by YQL.
  * @private
  */

  function _callErrorFunction( callback, query ) {
    if ( !!query.diagnostics && $.isArray( query.diagnostics.url ) ) {
      switch( query.diagnostics.url[ 1 ][ "http-status-code" ] ) {
        case "400":
          callback( "bad_request" );
          break;

        case "401":
          _clearCredentials();
          callback( "unauthorized" );
          break;

        case "403":
          callback( "forbidden" );
          break;

        case "404":
          callback( "not_found" );
          break;

        case "500":
          callback( "server_error" );
          break;

        default:
          callback( "unknown_error" );
          break;
      }
    }
    else {
      callback( "unknown_error" );
    }
  }  // _callErrorFunction
 

  /**
  * Authenticates the client.  The request is made asynchronously via YQL.
  * Throws an exception if one of the arguments is missing or empty.
  *
  * The method expects a configuration object with the following keys:
  *
  * * `email`: SimpleNote account email address
  * * `password`: SimpleNote account password
  * * `success`: callback function to be called on successful authentication
  * * `error`: callback function to be called on failure, is passed a clear
  *    text error string.
  *
  * Both `success` and `error` are strictly speaking optional; omitting them
  * might be pointless, tho.
  *
  * @method     _authenticate
  * @param      config {Object} SimpleNote account email address, password,
  *             callbacks
  * @private
  */
  
  function _authenticate( obj ) {
    if ( !obj || !obj.email || !obj.password ) {
      throw "ArgumentError: email and password required";
    }
    
    var query,
      config = $.extend({
        success: function() {
          alert( "SimpleNote auth success" );
        },
        error: function( errorCode ) {
          alert( "SimpleNote auth error: " + errorCode );
        }
      }, obj ),
      yqlTable = _getYQLTableName();
      
    query = [
      "USE '", _yqlTableURL, "' AS ", yqlTable, "; ",
      "SELECT * FROM ", yqlTable, " ",
      "WHERE path='/login' ",
      "AND method='post' ",
      "AND data='",
      $.param({
        email: config.email,
        password: config.password
      }),
      "'"
    ].join( "" );
    
    log( "_authenticate", query );
    
    $.ajax({
      url: _getYQLURL( query ),
      context: this,
      success: function( data, status, req ) {
        if ( !!data && data.query && data.query.results && data.query.results.result !== "" && data.query.results.result !== "undefined" ) {
          log( "_authenticate success", data );
          _email = config.email;
          _token = $.trim( data.query.results.result );

          config.success();
        }
        else {
          log( "_authenticate error #1", data );
          _clearCredentials();
          _callErrorFunction( config.error, data.query );
        }
      },
      error: function( req, status, error ) {
        log( "_authenticate error #2", req, status, error );

        _clearCredentials();
        _callErrorFunction( config.error, "unknown" );
      },
      dataType: "jsonp"
    });
  }  // _authenticate
  
  
  /**
  * Returns an index of all notes.  This method will return a JSON object with
  * three main properties for each note: `key`, `modify`, and `deleted`.  Some
  * notes may be marked `deleted`; these notes will be removed permanently
  * the next time the client synchronizes with the server.
  *
  * Throws an exception if one of the arguments is missing or empty.
  *
  * The method expects a configuration object with the following keys:
  *
  * * `success`: callback function to be called on success; the callback will
  *    be passed the array containing the notes index
  * * `error`: callback function to be called on failure, is passed a clear
  *    text error string.
  *
  * @method     _getIndex
  * @param      config {Object} 
  * @private
  */
  
  function _getIndex( obj ) {
    _throwUnlessLoggedIn();
    
    if ( !$.isPlainObject( obj ) ) {
      throw "ArgumentError: argument must be object";
    }
    
    if ( !$.isFunction( obj.success ) || !$.isFunction( obj.error ) ) {
      throw "ArgumentError: callbacks missing";
    }

    var query,
      config = $.extend({
        success: function( json ) {},
        error: function( errorString ) {}
      }, obj ),
      yqlTable = _getYQLTableName();
      
    query = [
      "USE '", _yqlTableURL, "' AS ", yqlTable, "; ",
      "SELECT * FROM ", yqlTable, " ",
      "WHERE path='/index' ",
      "AND data='",
      $.param({
        email: _email,
        auth: _token
      }),
      "'"
    ].join( "" );
    
    log( "_getIndex", query );
    
    $.ajax({
      url: _getYQLURL( query ),
      context: this,
      success: function( data, status, req ) {
        if ( !!data && data.query && data.query.results && data.query.results.result !== "" && data.query.results.result !== "undefined" ) {
          config.success( $.parseJSON( data.query.results.result ) );
        }
        else {
          _callErrorFunction( config.error, data.query );
        }
      },
      error: function( req, status, error ) {
        _callErrorFunction( config.error, "unknown" );
      },
      dataType: "jsonp"
    });
  }  // _getIndex


  // ============ PUBLIC METHODS & PROPERTIES ================================

  
  /**
  * Authenticates the client.  The request is made asynchronously via YQL.
  * Throws an exception if one of the arguments is missing or empty.
  *
  * The method expects a configuration object with the following keys:
  *
  * * `email`: SimpleNote account email address
  * * `password`: SimpleNote account password
  * * `success`: callback function to be called on successful authentication
  * * `error`: callback function to be called on failure, is passed a clear
  *    text error string.
  *
  * Both `success` and `error` are strictly speaking optional; omitting them
  * might be pointless, tho.
  *
  * @method     auth
  * @param      config {Object} SimpleNote account email address, password,
  *             callbacks
  */
  
  this.auth = function( config ) {
    _authenticate( config );
  };
  
  
  /**
  * Returns a boolean showing whether the user is currently logged in or not.
  *
  * @method     isLoggedIn
  * @return     {Boolean}
  */

  this.isLoggedIn = function() {
    return _isLoggedIn();
  };
    

  /**
  * Returns an index of all notes.  This method will return a JSON object with
  * three main properties for each note: `key`, `modify`, and `deleted`.  Some
  * notes may be marked `deleted`; these notes will be removed permanently
  * the next time the client synchronizes with the server.
  *
  * Throws an exception if one of the arguments is missing or empty.
  *
  * The method expects a configuration object with the following keys:
  *
  * * `success`: callback function to be called on success; the callback will
  *    be passed the array containing the notes index
  * * `error`: callback function to be called on failure, is passed a clear
  *    text error string.
  *
  * @method     getIndex
  * @param      config {Object} 
  */

  this.getIndex = function( obj ) {
    _getIndex( obj );
  };
  
  
  /**
  * Returns auth details, i.e. an object containing the current email address
  * and auth token returned by the API after a successful login.
  *
  * @method     getAuthDetails
  * @return     {Object} Auth info.
  */
  
  this.getAuthDetails = function() {
    return {
      token: _token,
      email: _email
    };
  };
  
  
  /**
  * Sets the Open Data table used in all YQL requests.  Usually, you'll want
  * to put the Open Data table XML file (see `yql_simplenote.xml`) on a server
  * controlled by you so you have full control over it.  If you do that, you
  * can tell `SimpleNote` to use it by setting the new URL with this method.
  *
  * @method     setOpenDataTable
  * @return     {String} Open Data Table URL.
  */
  
  this.setOpenDataTable = function( url ) {
    _yqlTableURL = url;
  };
  
  
  /**
  * Returns the Open Data table used in all YQL requests.
  *
  * @method     getOpenDataTable
  * @return     {String} Open Data Table URL.
  */
  
  this.getOpenDataTable = function() {
    return _yqlTableURL;
  };
  
  
  /**
  * Enables console output of debugging messages.
  *
  * @method     enableDebug
  * @param      bool {Boolean} Enable/disable debugging.
  */
  
  this.enableDebug = function( bool ) {
    _debugEnabled = !!bool;
  };


  /**
  * Returns the simplenote-js version number.
  *
  * @property   _version
  * @type       String
  */
  
  this._version = ( function() {
    return _VERSION;
  }() );
  
  
  this.debug = {
    showToken: function() {
      return $.param({
        auth: _token,
        email: _email
      });
    },

    unsetEmail: function() {
      _email = "";
    }
  };
  
}
