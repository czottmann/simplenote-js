# simplenote-js

A JS wrapper for the SimpleNote API.  Routes all requests through
[YQL](http://developer.yahoo.com/yql/) (via HTTPS) using the included
Open Data table (see `src/` folder).  Needs jQuery.


## Regarding YQL

All requests to the SimpleNote API are routed through YQL via HTTPS since 
cross-domain POST requests aren't possible with AJAX.  For that, simplenote-js
is making use of a custom Open Data table (see `src/yql_simplenote.xml`).  The
default table URL is this GitHub project's
[raw view of that file](http://github.com/carlo/simplenote-js/raw/master/src/yql_simplenote.xml).
It might be a good idea to host your own table XML somewhere to have more
control over what is going on between YQL and SimpleNote API, and to be
unaffected by changes to the table that might occur during future development
and which may break functionality in case of a version mismatch between the
JS library you're using and the table file in this here GitHub repository.
(See `SimpleNote`'s `setOpenDataTable()` method for that.)


## Usage

It's rather straightforward: first, authenticate, and if you've done so
successfully, go nuts.

Authenticating:

    var s = new SimpleNote();
    SN.enableDebug( true );   // because we're curious
    SN.auth({
      email: "test@example.com",
      password: "myPassword",
      success: function() {
        console.log( SN.isLoggedIn() );
        // >> true
      },
      error: function( code ) {
        console.error( "Authentication error: " + code );
      }
    });


Searching for notes:

    SN.searchNotes({
      query: "simplenote",
      maxResults: 3,
      success: function( resultsHash ) {
        console.info( resultsHash.totalRecords );
        // >> 32 (or some other number)
        
        console.info( resultsHash.notes );
        // >> [
        // >>   {
        // >>     key: "[SimpleNote-internal ID string]",
        // >>     body: "this is a note\nwith more than one line"
        // >>   },
        // >>   {
        // >>     key: "[another SimpleNote-internal ID string]",
        // >>     body: "this is a another note\nwith more than one line"
        // >>   },
        // >>   {
        // >>     key: "[yet another SimpleNote-internal ID string]",
        // >>     body: "this is a 3rd note"
        // >>   }
        // >> ]
      },
      error: function( code ) {
        console.error( code );
      }
    });


Getting the notes index:
    
    SN.retrieveIndex({
      success: function( resultsArray ) {
        console.info( resultsArray );
        // >> [
        // >>   {
        // >>     key: "[SimpleNote-internal ID string]",
        // >>     deleted: false,
        // >>     modify: "2010-08-27 12:47:11.259777"
        // >>   },
        // >>   {
        // >>     key: "[another SimpleNote-internal ID string]",
        // >>     deleted: true,
        // >>     modify: "2010-07-27 05:12:09.158457"
        // >>   },
        // >>   …
        // >> ]
      },
      error: function( code ) {
        console.error( code );
      }
    });


Creating a note:

    SN.createNote({
      body: "This is a new note!\nIt's awesome.",
      success: function( noteID ) {
        console.info( noteID );
        // >> "[new SimpleNote-internal ID string]"
      },
      error: function( code ) {
        console.error( code );
      }
    });


Updating a note:

    SN.updateNote({
      key: "[SimpleNote-internal ID string]",
      body: "This is the revised note!\nIt's even awesomer.",
      success: function( noteID ) {
        console.info( noteID );
        // >> "[SimpleNote-internal ID string]"
      },
      error: function( code ) {
        console.error( code );
      }
    });


Retrieving a note:

    SN.retrieveNote({
      key: "[SimpleNote-internal ID string]",
      success: function( noteHash ) {
        console.info( noteHash );
        // >> {
        // >>   body: "my example note",
        // >>   key: "[SimpleNote-internal ID string]",
        // >>   modifydate: "2008-12-18 04:04:20.554442",
        // >>   createdate: "2008-12-18 04:03:31.123456",
        // >>   deleted: false
        // >> }
      },
      error: function( code ) {
        console.error( code );
      }
    });


Deleting a note:

    SN.deleteNote({
      key: "[SimpleNote-internal ID string]",
      success: function( noteID ) {
        console.info( noteID );
        // >> "[SimpleNote-internal ID string]"
      },
      error: function( code ) {
        console.error( code );
      }
    });


## Documentation

The simplenote-js API documentation is included in this repository and the
related [download packages](http://github.com/carlo/simplenote-js/downloads).
It's been generated using YUIDoc (run `make docs` in the repo's root folder);
the documentation for the current stable version is available online
[here](http://carlo.github.com/simplenote-js/docs/).

The SimpleNote API documentation is available from the
[SimpleNote API Google Groups page](http://groups.google.com/group/simplenote-api).


## Tests

There's a [QUnit](http://docs.jquery.com/QUnit)-based test suite
(tests-in-`tests/` shocker!) with 130+ tests.


## Requirements

* jQuery 1.4+
* [jquery-base64](http://github.com/carlo/jquery-base64/)


## Author

Carlo Zottmann, [municode.de](http://municode.de/), carlo@municode.de.  Nice
to meet you.


## License

Dual-license, MIT & GNU GPL v2.
