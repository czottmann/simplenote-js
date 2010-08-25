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
 * http://github.com/carlo/jquery-simplenote
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


/*
* SimpleNote API wrapper.
*
* @class      SimpleNote
* @requires   jQuery
* @static
*/

function SimpleNote() {

  var $ = window.jQuery,
    $this = this;
  

  /*
  * After a successful login, this variable holds the account email address
  * required for all subsequent API requests.
  *
  * @property   _email
  * @type       String
  * @private
  */
  
  this._email = null;


  /*
  * After a successful login, this variable holds the auth token required for
  * all subsequent API requests.
  *
  * @property   _token
  * @type       String
  * @private
  */
  
  this._token = null;
  
  
  /*
  * Contains the base URL of the API.
  *
  * @property   _baseURL
  * @type       String
  * @private
  */
  
  this._baseURL = "https://simple-note.appspot.com/api";

  
  /*
  * Contains the OpenData table used for all YQL calls.
  *
  * @property   _yqlTableURL
  * @type       String
  * @private
  */
  
  this._yqlTableURL = "http://dl.dropbox.com/u/7298/yql_simplenote.xml?";
  

  this.clearCredentials = function() {
    this._email = "";
    this._token = "";
  };
  
  
  /*
  * Returns a boolean showing whether the user is currently logged in or not.
  *
  * @method     isLoggedIn
  * @return     {Boolean}
  * @private
  */
  
  this.isLoggedIn = function() {
    return ( !!this._email && !!this._token );
  };


  /*
  * Throws an exception if either the internal email or token aren't set
  * (which means the user's not logged in).
  *
  * @method     throwUnlessLoggedIn
  * @private
  */
  
  this.throwUnlessLoggedIn = function() {
    if ( !this.isLoggedIn() ) {
      throw "AuthError";
    }
  };
  

  /*
  * Authenticates the client.  The request is made asynchronously via YQL.
  * Throws an exception if one of the arguments is missing or empty.
  *
  * The method expects a configuration object with the following keys:
  *
  * * `email`: SimpleNote account email address
  * * `password`: SimpleNote account password
  * * `success`: callback function to be called on successful authentication
  * * `error`: callback function to be called on failure, is passed a clear
  *   text error string.
  *
  * Both `success` and `error` are strictly speaking optional; omitting them
  * might be pointless, tho.
  *
  * @method     authenticate
  * @param      config {Object} SimpleNote account email address, password,
  *             callbacks
  * @private
  */
  
  this.authenticate = function( obj ) {
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
      yqlTable = this.getYQLTableName();
      
    query = [
      "USE '", this._yqlTableURL, "' AS ", yqlTable, "; ",
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
      
    $.ajax({
      url: this.getYQLURL( query ),
      context: this,
      success: function( data, status, req ) {
        // console.log( data );
        
        if ( !!data && data.query && data.query.results && data.query.results.result !== "" ) {
          this._email = config.email;
          this._token = $.trim( data.query.results.result );

          config.success();
        }
        else {
          this.clearCredentials();
          this.callErrorFunction( config.error, data.query );
        }
      },
      error: function( req, status, error ) {
        // console.warn( "error", req, status, error );

        this.clearCredentials();
        this.callErrorFunction( config.error, "unknown" );
      },
      dataType: "jsonp"
    });
  };  // this.authenticate


  /*
  * Calls the function passed as argument, and passes a clear text error
  * string.  
  * 
  * @method     callErrorFunction
  * @param      callback {Function} The error function to be called.
  * @param      query {Object} The query object returned by YQL.
  * @private
  */

  this.callErrorFunction = function( callback, query ) {
    if ( !!query.diagnostics && $.isArray( query.diagnostics.url ) ) {
      switch( query.diagnostics.url[ 1 ][ "http-status-code" ] ) {
        case "400":
          callback( "bad_request" );
          break;

        case "401":
          this.clearCredentials();
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
  };  // this.callErrorFunction


  /*
  * Returns a random string used as YQL request table name.
  *
  * @method     getYQLTableName
  * @private
  */
  
  this.getYQLTableName = function() {
    var a,
      name = "";
    
    for ( a = 0; a < 10; a += 1 ) {
      name += String.fromCharCode( 97 + Math.floor( Math.random( 26 ) * 26 ) );
    }
    
    name += String( Math.random() ).substr( -8 );
    return name;
  };
  
  
  this.getIndex = function( obj ) {
    if ( !$.isFunction( obj.success ) || !$.isFunction( obj.error ) ) {
      throw "ArgumentError: callbacks missing";
    }

    this.throwUnlessLoggedIn();
    
    var query,
      config = $.extend({
        success: function( json ) {},
        error: function( errorString ) {}
      }, obj ),
      yqlTable = this.getYQLTableName();
      
    query = [
      "USE '", this._yqlTableURL, "' AS ", yqlTable, "; ",
      "SELECT * FROM ", yqlTable, " ",
      "WHERE path='/index' ",
      "AND data='",
      $.param({
        email: this._email,
        auth: this._token
      }),
      "'"
    ].join( "" );
    
    $.ajax({
      url: this.getYQLURL( query ),
      context: this,
      success: function( data, status, req ) {
        if ( !!data && data.query && data.query.results && data.query.results.result !== "" && data.query.results.result !== "undefined" ) {
          config.success( $.parseJSON( data.query.results.result ) );
        }
        else {
          this.callErrorFunction( config.error, data.query );
        }
      },
      error: function( req, status, error ) {
        this.callErrorFunction( config.error, "unknown" );
      },
      dataType: "jsonp"
    });
  };
  
  
  /*
  * Accepts a YQL query and returns the related YQL URL.
  *
  * @method     getYQLURL
  * @param      query {String} YQL query
  * @private
  */
  
  this.getYQLURL = function( query ) {
    return [
      "https://query.yahooapis.com/v1/public/yql?q=",
      encodeURIComponent( query ),
      "&diagnostics=true",
      "&format=json",
      "&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys"
    ].join( "" );
  };


  return {
  
    /*
    * Authenticates the client.  The request is made asynchronously via YQL.
    * Throws an exception if one of the arguments is missing or empty.
    *
    * The method expects a configuration object with the following keys:
    *
    * * `email`: SimpleNote account email address
    * * `password`: SimpleNote account password
    * * `success`: callback function to be called on successful authentication
    * * `error`: callback function to be called on failure, is passed a clear
    *   text error string.
    *
    * Both `success` and `error` are strictly speaking optional; omitting them
    * might be pointless, tho.
    *
    * @method     auth
    * @param      config {Object} SimpleNote account email address, password,
    *             callbacks
    */
    
    auth: function( email, password ) {
      $this.authenticate( email, password );
    },
    
    
    /*
    * Returns a boolean showing whether the user is currently logged in or not.
    *
    * @method     isLoggedIn
    * @return     {Boolean}
    */

    isLoggedIn: function() {
      return $this.isLoggedIn();
    },
      

    getIndex: function( obj ) {
      $this.getIndex( obj );
    },
    
    
    debug: {
      showToken: function() {
        return $.param({
          auth: $this._token,
          email: $this._email
        });
      },

      unsetEmail: function() {
        $this._email = "";
      }
    }
    
  };
  
}
