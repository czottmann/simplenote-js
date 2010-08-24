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
* SimpleNote API wrapper as static class.
*
* @class      simplenote
* @namespace  jQuery
* @static
*/

jQuery.simplenote = ( function( $ ) {

  /*
  * After a successful login, this variable holds the account email address
  * required for all subsequent API requests.
  *
  * @property   _email
  * @type       String
  * @private
  */
  
  var _email,


  /*
  * After a successful login, this variable holds the auth token required for
  * all subsequent API requests.
  *
  * @property   _token
  * @type       String
  * @private
  */
  
  _token,
  
  
  /*
  * Contains the base URL of the API.
  *
  * @property   _baseURL
  * @type       String
  * @private
  */
  
  _baseURL = "https://simple-note.appspot.com/api";


  function _setToken( token ) {
    console.log( _token );
    _token = token;
    console.log( _token );
  }

  /*
  * Authenticates the client.  Returns a boolean marking success or failure.
  * Please note: the request made is synchronous, with a timeout of 3 seconds.  
  * Throws an exception if one of the arguments is missing or empty.
  *
  * @method     _authenticate
  * @param      email {String} SimpleNote account email address
  * @param      password {String} SimpleNote account password
  * @return     {Boolean} <code>true</code> on success, <code>false</code>
  *             on failure.
  * @private
  */
  
  function _authenticate( email, password ) {
    if ( !email || !password ) {
      throw [ "ArgumentError", "email and password required" ];
    }
    
    console.log( _email, _token );
    
    var req = $.ajax({
      type: "POST",
      url: _baseURL + "/login",
      data: $.base64.encode(
        $.param({
          email: email,
          password: password
        })
      ),
      success: function( data, status, req ) {
        // console.log( data, status, req );
        
        console.log( this, req );
        
        _email = this._email;
        _setToken( data );
        req.loginSuccessful = true;
      },
      error: function( data, status, req ) {
        // console.error( data, status, req );
        
        _email = null;
        _token = null;
        req.loginSuccessful = false;
      },
      dataType: "text",
      processData: false,
      async: false,
      timeout: 3000,
      _email: email,
      $this: this
    });
    
    return req.loginSuccessful;
  }


  function _getIndex( callback ) {
    if ( !$.isFunction( callback ) ) {
      throw [ "ArgumentError", "callback must be a function" ];
    }
    
    $.getJSON(
      baseUrl + ""
    );
  }

  return {
  
    /*
    * Authenticates the client.  Returns a boolean marking success or failure.
    * Please note: the request is a synchronous one with a timeout of 3s.
    *
    * @method     auth
    * @param      email {String} SimpleNote account email address
    * @param      password {String} SimpleNote account password
    * @return     {Boolean} <code>true</code> on success, <code>false</code>
    *             on failure.
    */
    
    auth: function( email, password ) {
      return _authenticate( email, password );
    },
    
    
    getIndex: function( callback ) {
      _getIndex( callback );
    },
    
    showToken: function() {
      return $.param({
        auth: _token,
        email: _email
      });
    }
  
  };
  
}( jQuery ) );
