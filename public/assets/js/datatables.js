/*
 * This combined file was created by the DataTables downloader builder:
 *   https://datatables.net/download
 *
 * To rebuild or modify this file with the latest versions of the included
 * software please visit:
 *   https://datatables.net/download/#ju/dt-2.0.5/b-3.0.2/b-colvis-3.0.2/b-html5-3.0.2/b-print-3.0.2/kt-2.12.0/r-3.0.2/sp-2.3.1
 *
 * Included libraries:
 *   DataTables 2.0.5, Buttons 3.0.2, Column visibility 3.0.2, HTML5 export 3.0.2, Print view 3.0.2, KeyTable 2.12.0, Responsive 3.0.2, SearchPanes 2.3.1
 */

/*! DataTables 2.0.5
 * © SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     DataTables
 * @description Paginate, search and order HTML tables
 * @version     2.0.5
 * @author      SpryMedia Ltd
 * @contact     www.datatables.net
 * @copyright   SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - https://datatables.net/license
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: https://www.datatables.net
 */

(function( factory ) {
	"use strict";

	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		// jQuery's factory checks for a global window - if it isn't present then it
		// returns a factory function that expects the window object
		var jq = require('jquery');

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				return factory( $, root, root.document );
			};
		}
		else {
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		window.DataTable = factory( jQuery, window, document );
	}
}(function( $, window, document ) {
	"use strict";

	
	var DataTable = function ( selector, options )
	{
		// Check if called with a window or jQuery object for DOM less applications
		// This is for backwards compatibility
		if (DataTable.factory(selector, options)) {
			return DataTable;
		}
	
		// When creating with `new`, create a new DataTable, returning the API instance
		if (this instanceof DataTable) {
			return $(selector).DataTable(options);
		}
		else {
			// Argument switching
			options = selector;
		}
	
		var _that = this;
		var emptyInit = options === undefined;
		var len = this.length;
	
		if ( emptyInit ) {
			options = {};
		}
	
		// Method to get DT API instance from jQuery object
		this.api = function ()
		{
			return new _Api( this );
		};
	
		this.each(function() {
			// For each initialisation we want to give it a clean initialisation
			// object that can be bashed around
			var o = {};
			var oInit = len > 1 ? // optimisation for single table case
				_fnExtend( o, options, true ) :
				options;
	
			
			var i=0, iLen;
			var sId = this.getAttribute( 'id' );
			var bInitHandedOff = false;
			var defaults = DataTable.defaults;
			var $this = $(this);
			
			
			/* Sanity check */
			if ( this.nodeName.toLowerCase() != 'table' )
			{
				_fnLog( null, 0, 'Non-table node initialisation ('+this.nodeName+')', 2 );
				return;
			}
			
			$(this).trigger( 'options.dt', oInit );
			
			/* Backwards compatibility for the defaults */
			_fnCompatOpts( defaults );
			_fnCompatCols( defaults.column );
			
			/* Convert the camel-case defaults to Hungarian */
			_fnCamelToHungarian( defaults, defaults, true );
			_fnCamelToHungarian( defaults.column, defaults.column, true );
			
			/* Setting up the initialisation object */
			_fnCamelToHungarian( defaults, $.extend( oInit, $this.data() ), true );
			
			
			
			/* Check to see if we are re-initialising a table */
			var allSettings = DataTable.settings;
			for ( i=0, iLen=allSettings.length ; i<iLen ; i++ )
			{
				var s = allSettings[i];
			
				/* Base check on table node */
				if (
					s.nTable == this ||
					(s.nTHead && s.nTHead.parentNode == this) ||
					(s.nTFoot && s.nTFoot.parentNode == this)
				) {
					var bRetrieve = oInit.bRetrieve !== undefined ? oInit.bRetrieve : defaults.bRetrieve;
					var bDestroy = oInit.bDestroy !== undefined ? oInit.bDestroy : defaults.bDestroy;
			
					if ( emptyInit || bRetrieve )
					{
						return s.oInstance;
					}
					else if ( bDestroy )
					{
						new DataTable.Api(s).destroy();
						break;
					}
					else
					{
						_fnLog( s, 0, 'Cannot reinitialise DataTable', 3 );
						return;
					}
				}
			
				/* If the element we are initialising has the same ID as a table which was previously
				 * initialised, but the table nodes don't match (from before) then we destroy the old
				 * instance by simply deleting it. This is under the assumption that the table has been
				 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
				 */
				if ( s.sTableId == this.id )
				{
					allSettings.splice( i, 1 );
					break;
				}
			}
			
			/* Ensure the table has an ID - required for accessibility */
			if ( sId === null || sId === "" )
			{
				sId = "DataTables_Table_"+(DataTable.ext._unique++);
				this.id = sId;
			}
			
			/* Create the settings object for this table and set some of the default parameters */
			var oSettings = $.extend( true, {}, DataTable.models.oSettings, {
				"sDestroyWidth": $this[0].style.width,
				"sInstance":     sId,
				"sTableId":      sId,
				colgroup: $('<colgroup>').prependTo(this),
				fastData: function (row, column, type) {
					return _fnGetCellData(oSettings, row, column, type);
				}
			} );
			oSettings.nTable = this;
			oSettings.oInit  = oInit;
			
			allSettings.push( oSettings );
			
			// Make a single API instance available for internal handling
			oSettings.api = new _Api( oSettings );
			
			// Need to add the instance after the instance after the settings object has been added
			// to the settings array, so we can self reference the table instance if more than one
			oSettings.oInstance = (_that.length===1) ? _that : $this.dataTable();
			
			// Backwards compatibility, before we apply all the defaults
			_fnCompatOpts( oInit );
			
			// If the length menu is given, but the init display length is not, use the length menu
			if ( oInit.aLengthMenu && ! oInit.iDisplayLength )
			{
				oInit.iDisplayLength = Array.isArray(oInit.aLengthMenu[0])
					? oInit.aLengthMenu[0][0]
					: $.isPlainObject( oInit.aLengthMenu[0] )
						? oInit.aLengthMenu[0].value
						: oInit.aLengthMenu[0];
			}
			
			// Apply the defaults and init options to make a single init object will all
			// options defined from defaults and instance options.
			oInit = _fnExtend( $.extend( true, {}, defaults ), oInit );
			
			
			// Map the initialisation options onto the settings object
			_fnMap( oSettings.oFeatures, oInit, [
				"bPaginate",
				"bLengthChange",
				"bFilter",
				"bSort",
				"bSortMulti",
				"bInfo",
				"bProcessing",
				"bAutoWidth",
				"bSortClasses",
				"bServerSide",
				"bDeferRender"
			] );
			_fnMap( oSettings, oInit, [
				"ajax",
				"fnFormatNumber",
				"sServerMethod",
				"aaSorting",
				"aaSortingFixed",
				"aLengthMenu",
				"sPaginationType",
				"iStateDuration",
				"bSortCellsTop",
				"iTabIndex",
				"sDom",
				"fnStateLoadCallback",
				"fnStateSaveCallback",
				"renderer",
				"searchDelay",
				"rowId",
				"caption",
				"layout",
				[ "iCookieDuration", "iStateDuration" ], // backwards compat
				[ "oSearch", "oPreviousSearch" ],
				[ "aoSearchCols", "aoPreSearchCols" ],
				[ "iDisplayLength", "_iDisplayLength" ]
			] );
			_fnMap( oSettings.oScroll, oInit, [
				[ "sScrollX", "sX" ],
				[ "sScrollXInner", "sXInner" ],
				[ "sScrollY", "sY" ],
				[ "bScrollCollapse", "bCollapse" ]
			] );
			_fnMap( oSettings.oLanguage, oInit, "fnInfoCallback" );
			
			/* Callback functions which are array driven */
			_fnCallbackReg( oSettings, 'aoDrawCallback',       oInit.fnDrawCallback );
			_fnCallbackReg( oSettings, 'aoStateSaveParams',    oInit.fnStateSaveParams );
			_fnCallbackReg( oSettings, 'aoStateLoadParams',    oInit.fnStateLoadParams );
			_fnCallbackReg( oSettings, 'aoStateLoaded',        oInit.fnStateLoaded );
			_fnCallbackReg( oSettings, 'aoRowCallback',        oInit.fnRowCallback );
			_fnCallbackReg( oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow );
			_fnCallbackReg( oSettings, 'aoHeaderCallback',     oInit.fnHeaderCallback );
			_fnCallbackReg( oSettings, 'aoFooterCallback',     oInit.fnFooterCallback );
			_fnCallbackReg( oSettings, 'aoInitComplete',       oInit.fnInitComplete );
			_fnCallbackReg( oSettings, 'aoPreDrawCallback',    oInit.fnPreDrawCallback );
			
			oSettings.rowIdFn = _fnGetObjectDataFn( oInit.rowId );
			
			/* Browser support detection */
			_fnBrowserDetect( oSettings );
			
			var oClasses = oSettings.oClasses;
			
			$.extend( oClasses, DataTable.ext.classes, oInit.oClasses );
			$this.addClass( oClasses.table );
			
			if (! oSettings.oFeatures.bPaginate) {
				oInit.iDisplayStart = 0;
			}
			
			if ( oSettings.iInitDisplayStart === undefined )
			{
				/* Display start point, taking into account the save saving */
				oSettings.iInitDisplayStart = oInit.iDisplayStart;
				oSettings._iDisplayStart = oInit.iDisplayStart;
			}
			
			/* Language definitions */
			var oLanguage = oSettings.oLanguage;
			$.extend( true, oLanguage, oInit.oLanguage );
			
			if ( oLanguage.sUrl )
			{
				/* Get the language definitions from a file - because this Ajax call makes the language
				 * get async to the remainder of this function we use bInitHandedOff to indicate that
				 * _fnInitialise will be fired by the returned Ajax handler, rather than the constructor
				 */
				$.ajax( {
					dataType: 'json',
					url: oLanguage.sUrl,
					success: function ( json ) {
						_fnCamelToHungarian( defaults.oLanguage, json );
						$.extend( true, oLanguage, json, oSettings.oInit.oLanguage );
			
						_fnCallbackFire( oSettings, null, 'i18n', [oSettings], true);
						_fnInitialise( oSettings );
					},
					error: function () {
						// Error occurred loading language file
						_fnLog( oSettings, 0, 'i18n file loading error', 21 );
			
						// continue on as best we can
						_fnInitialise( oSettings );
					}
				} );
				bInitHandedOff = true;
			}
			else {
				_fnCallbackFire( oSettings, null, 'i18n', [oSettings]);
			}
			
			/*
			 * Columns
			 * See if we should load columns automatically or use defined ones
			 */
			var columnsInit = [];
			var thead = this.getElementsByTagName('thead');
			var initHeaderLayout = _fnDetectHeader( oSettings, thead[0] );
			
			// If we don't have a columns array, then generate one with nulls
			if ( oInit.aoColumns ) {
				columnsInit = oInit.aoColumns;
			}
			else if ( initHeaderLayout.length ) {
				for ( i=0, iLen=initHeaderLayout[0].length ; i<iLen ; i++ ) {
					columnsInit.push( null );
				}
			}
			
			// Add the columns
			for ( i=0, iLen=columnsInit.length ; i<iLen ; i++ ) {
				_fnAddColumn( oSettings );
			}
			
			// Apply the column definitions
			_fnApplyColumnDefs( oSettings, oInit.aoColumnDefs, columnsInit, initHeaderLayout, function (iCol, oDef) {
				_fnColumnOptions( oSettings, iCol, oDef );
			} );
			
			/* HTML5 attribute detection - build an mData object automatically if the
			 * attributes are found
			 */
			var rowOne = $this.children('tbody').find('tr').eq(0);
			
			if ( rowOne.length ) {
				var a = function ( cell, name ) {
					return cell.getAttribute( 'data-'+name ) !== null ? name : null;
				};
			
				$( rowOne[0] ).children('th, td').each( function (i, cell) {
					var col = oSettings.aoColumns[i];
			
					if (! col) {
						_fnLog( oSettings, 0, 'Incorrect column count', 18 );
					}
			
					if ( col.mData === i ) {
						var sort = a( cell, 'sort' ) || a( cell, 'order' );
						var filter = a( cell, 'filter' ) || a( cell, 'search' );
			
						if ( sort !== null || filter !== null ) {
							col.mData = {
								_:      i+'.display',
								sort:   sort !== null   ? i+'.@data-'+sort   : undefined,
								type:   sort !== null   ? i+'.@data-'+sort   : undefined,
								filter: filter !== null ? i+'.@data-'+filter : undefined
							};
							col._isArrayHost = true;
			
							_fnColumnOptions( oSettings, i );
						}
					}
				} );
			}
			
			var features = oSettings.oFeatures;
			var loadedInit = function () {
				/*
				 * Sorting
				 * @todo For modularisation (1.11) this needs to do into a sort start up handler
				 */
			
				// If aaSorting is not defined, then we use the first indicator in asSorting
				// in case that has been altered, so the default sort reflects that option
				if ( oInit.aaSorting === undefined ) {
					var sorting = oSettings.aaSorting;
					for ( i=0, iLen=sorting.length ; i<iLen ; i++ ) {
						sorting[i][1] = oSettings.aoColumns[ i ].asSorting[0];
					}
				}
			
				/* Do a first pass on the sorting classes (allows any size changes to be taken into
				 * account, and also will apply sorting disabled classes if disabled
				 */
				_fnSortingClasses( oSettings );
			
				_fnCallbackReg( oSettings, 'aoDrawCallback', function () {
					if ( oSettings.bSorted || _fnDataSource( oSettings ) === 'ssp' || features.bDeferRender ) {
						_fnSortingClasses( oSettings );
					}
				} );
			
			
				/*
				 * Final init
				 * Cache the header, body and footer as required, creating them if needed
				 */
				var caption = $this.children('caption');
			
				if ( oSettings.caption ) {
					if ( caption.length === 0 ) {
						caption = $('<caption/>').appendTo( $this );
					}
			
					caption.html( oSettings.caption );
				}
			
				// Store the caption side, so we can remove the element from the document
				// when creating the element
				if (caption.length) {
					caption[0]._captionSide = caption.css('caption-side');
					oSettings.captionNode = caption[0];
				}
			
				if ( thead.length === 0 ) {
					thead = $('<thead/>').appendTo($this);
				}
				oSettings.nTHead = thead[0];
				$('tr', thead).addClass(oClasses.thead.row);
			
				var tbody = $this.children('tbody');
				if ( tbody.length === 0 ) {
					tbody = $('<tbody/>').insertAfter(thead);
				}
				oSettings.nTBody = tbody[0];
			
				var tfoot = $this.children('tfoot');
				if ( tfoot.length === 0 ) {
					// If we are a scrolling table, and no footer has been given, then we need to create
					// a tfoot element for the caption element to be appended to
					tfoot = $('<tfoot/>').appendTo($this);
				}
				oSettings.nTFoot = tfoot[0];
				$('tr', tfoot).addClass(oClasses.tfoot.row);
			
				// Check if there is data passing into the constructor
				if ( oInit.aaData ) {
					for ( i=0 ; i<oInit.aaData.length ; i++ ) {
						_fnAddData( oSettings, oInit.aaData[ i ] );
					}
				}
				else if ( _fnDataSource( oSettings ) == 'dom' ) {
					// Grab the data from the page
					_fnAddTr( oSettings, $(oSettings.nTBody).children('tr') );
				}
			
				/* Copy the data index array */
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
				/* Initialisation complete - table can be drawn */
				oSettings.bInitialised = true;
			
				/* Check if we need to initialise the table (it might not have been handed off to the
				 * language processor)
				 */
				if ( bInitHandedOff === false ) {
					_fnInitialise( oSettings );
				}
			};
			
			/* Must be done after everything which can be overridden by the state saving! */
			_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSaveState );
			
			if ( oInit.bStateSave )
			{
				features.bStateSave = true;
				_fnLoadState( oSettings, oInit, loadedInit );
			}
			else {
				loadedInit();
			}
			
		} );
		_that = null;
		return this;
	};
	
	
	
	/**
	 * DataTables extensions
	 * 
	 * This namespace acts as a collection area for plug-ins that can be used to
	 * extend DataTables capabilities. Indeed many of the build in methods
	 * use this method to provide their own capabilities (sorting methods for
	 * example).
	 *
	 * Note that this namespace is aliased to `jQuery.fn.dataTableExt` for legacy
	 * reasons
	 *
	 *  @namespace
	 */
	DataTable.ext = _ext = {
		/**
		 * Buttons. For use with the Buttons extension for DataTables. This is
		 * defined here so other extensions can define buttons regardless of load
		 * order. It is _not_ used by DataTables core.
		 *
		 *  @type object
		 *  @default {}
		 */
		buttons: {},
	
	
		/**
		 * Element class names
		 *
		 *  @type object
		 *  @default {}
		 */
		classes: {},
	
	
		/**
		 * DataTables build type (expanded by the download builder)
		 *
		 *  @type string
		 */
		builder: "ju/dt-2.0.5/b-3.0.2/b-colvis-3.0.2/b-html5-3.0.2/b-print-3.0.2/kt-2.12.0/r-3.0.2/sp-2.3.1",
	
	
		/**
		 * Error reporting.
		 * 
		 * How should DataTables report an error. Can take the value 'alert',
		 * 'throw', 'none' or a function.
		 *
		 *  @type string|function
		 *  @default alert
		 */
		errMode: "alert",
	
	
		/**
		 * Legacy so v1 plug-ins don't throw js errors on load
		 */
		feature: [],
	
		/**
		 * Feature plug-ins.
		 * 
		 * This is an object of callbacks which provide the features for DataTables
		 * to be initialised via the `layout` option.
		 */
		features: {},
	
	
		/**
		 * Row searching.
		 * 
		 * This method of searching is complimentary to the default type based
		 * searching, and a lot more comprehensive as it allows you complete control
		 * over the searching logic. Each element in this array is a function
		 * (parameters described below) that is called for every row in the table,
		 * and your logic decides if it should be included in the searching data set
		 * or not.
		 *
		 * Searching functions have the following input parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{array|object}` Data for the row to be processed (same as the
		 *    original format that was passed in as the data source, or an array
		 *    from a DOM data source
		 * 3. `{int}` Row index ({@link DataTable.models.oSettings.aoData}), which
		 *    can be useful to retrieve the `TR` element if you need DOM interaction.
		 *
		 * And the following return is expected:
		 *
		 * * {boolean} Include the row in the searched result set (true) or not
		 *   (false)
		 *
		 * Note that as with the main search ability in DataTables, technically this
		 * is "filtering", since it is subtractive. However, for consistency in
		 * naming we call it searching here.
		 *
		 *  @type array
		 *  @default []
		 *
		 *  @example
		 *    // The following example shows custom search being applied to the
		 *    // fourth column (i.e. the data[3] index) based on two input values
		 *    // from the end-user, matching the data in a certain range.
		 *    $.fn.dataTable.ext.search.push(
		 *      function( settings, data, dataIndex ) {
		 *        var min = document.getElementById('min').value * 1;
		 *        var max = document.getElementById('max').value * 1;
		 *        var version = data[3] == "-" ? 0 : data[3]*1;
		 *
		 *        if ( min == "" && max == "" ) {
		 *          return true;
		 *        }
		 *        else if ( min == "" && version < max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && "" == max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && version < max ) {
		 *          return true;
		 *        }
		 *        return false;
		 *      }
		 *    );
		 */
		search: [],
	
	
		/**
		 * Selector extensions
		 *
		 * The `selector` option can be used to extend the options available for the
		 * selector modifier options (`selector-modifier` object data type) that
		 * each of the three built in selector types offer (row, column and cell +
		 * their plural counterparts). For example the Select extension uses this
		 * mechanism to provide an option to select only rows, columns and cells
		 * that have been marked as selected by the end user (`{selected: true}`),
		 * which can be used in conjunction with the existing built in selector
		 * options.
		 *
		 * Each property is an array to which functions can be pushed. The functions
		 * take three attributes:
		 *
		 * * Settings object for the host table
		 * * Options object (`selector-modifier` object type)
		 * * Array of selected item indexes
		 *
		 * The return is an array of the resulting item indexes after the custom
		 * selector has been applied.
		 *
		 *  @type object
		 */
		selector: {
			cell: [],
			column: [],
			row: []
		},
	
	
		/**
		 * Legacy configuration options. Enable and disable legacy options that
		 * are available in DataTables.
		 *
		 *  @type object
		 */
		legacy: {
			/**
			 * Enable / disable DataTables 1.9 compatible server-side processing
			 * requests
			 *
			 *  @type boolean
			 *  @default null
			 */
			ajax: null
		},
	
	
		/**
		 * Pagination plug-in methods.
		 * 
		 * Each entry in this object is a function and defines which buttons should
		 * be shown by the pagination rendering method that is used for the table:
		 * {@link DataTable.ext.renderer.pageButton}. The renderer addresses how the
		 * buttons are displayed in the document, while the functions here tell it
		 * what buttons to display. This is done by returning an array of button
		 * descriptions (what each button will do).
		 *
		 * Pagination types (the four built in options and any additional plug-in
		 * options defined here) can be used through the `paginationType`
		 * initialisation parameter.
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{int} page` The current page index
		 * 2. `{int} pages` The number of pages in the table
		 *
		 * Each function is expected to return an array where each element of the
		 * array can be one of:
		 *
		 * * `first` - Jump to first page when activated
		 * * `last` - Jump to last page when activated
		 * * `previous` - Show previous page when activated
		 * * `next` - Show next page when activated
		 * * `{int}` - Show page of the index given
		 * * `{array}` - A nested array containing the above elements to add a
		 *   containing 'DIV' element (might be useful for styling).
		 *
		 * Note that DataTables v1.9- used this object slightly differently whereby
		 * an object with two functions would be defined for each plug-in. That
		 * ability is still supported by DataTables 1.10+ to provide backwards
		 * compatibility, but this option of use is now decremented and no longer
		 * documented in DataTables 1.10+.
		 *
		 *  @type object
		 *  @default {}
		 *
		 *  @example
		 *    // Show previous, next and current page buttons only
		 *    $.fn.dataTableExt.oPagination.current = function ( page, pages ) {
		 *      return [ 'previous', page, 'next' ];
		 *    };
		 */
		pager: {},
	
	
		renderer: {
			pageButton: {},
			header: {}
		},
	
	
		/**
		 * Ordering plug-ins - custom data source
		 * 
		 * The extension options for ordering of data available here is complimentary
		 * to the default type based ordering that DataTables typically uses. It
		 * allows much greater control over the the data that is being used to
		 * order a column, but is necessarily therefore more complex.
		 * 
		 * This type of ordering is useful if you want to do ordering based on data
		 * live from the DOM (for example the contents of an 'input' element) rather
		 * than just the static string that DataTables knows of.
		 * 
		 * The way these plug-ins work is that you create an array of the values you
		 * wish to be ordering for the column in question and then return that
		 * array. The data in the array much be in the index order of the rows in
		 * the table (not the currently ordering order!). Which order data gathering
		 * function is run here depends on the `dt-init columns.orderDataType`
		 * parameter that is used for the column (if any).
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{int}` Target column index
		 *
		 * Each function is expected to return an array:
		 *
		 * * `{array}` Data for the column to be ordering upon
		 *
		 *  @type array
		 *
		 *  @example
		 *    // Ordering using `input` node values
		 *    $.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
		 *    {
		 *      return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		 *        return $('input', td).val();
		 *      } );
		 *    }
		 */
		order: {},
	
	
		/**
		 * Type based plug-ins.
		 *
		 * Each column in DataTables has a type assigned to it, either by automatic
		 * detection or by direct assignment using the `type` option for the column.
		 * The type of a column will effect how it is ordering and search (plug-ins
		 * can also make use of the column type if required).
		 *
		 * @namespace
		 */
		type: {
			/**
			 * Automatic column class assignment
			 */
			className: {},
	
			/**
			 * Type detection functions.
			 *
			 * The functions defined in this object are used to automatically detect
			 * a column's type, making initialisation of DataTables super easy, even
			 * when complex data is in the table.
			 *
			 * The functions defined take two parameters:
			 *
		     *  1. `{*}` Data from the column cell to be analysed
		     *  2. `{settings}` DataTables settings object. This can be used to
		     *     perform context specific type detection - for example detection
		     *     based on language settings such as using a comma for a decimal
		     *     place. Generally speaking the options from the settings will not
		     *     be required
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Data type detected, or null if unknown (and thus
			 *   pass it on to the other type detection functions.
			 *
			 *  @type array
			 *
			 *  @example
			 *    // Currency type detection plug-in:
			 *    $.fn.dataTable.ext.type.detect.push(
			 *      function ( data, settings ) {
			 *        // Check the numeric part
			 *        if ( ! data.substring(1).match(/[0-9]/) ) {
			 *          return null;
			 *        }
			 *
			 *        // Check prefixed by currency
			 *        if ( data.charAt(0) == '$' || data.charAt(0) == '&pound;' ) {
			 *          return 'currency';
			 *        }
			 *        return null;
			 *      }
			 *    );
			 */
			detect: [],
	
			/**
			 * Automatic renderer assignment
			 */
			render: {},
	
	
			/**
			 * Type based search formatting.
			 *
			 * The type based searching functions can be used to pre-format the
			 * data to be search on. For example, it can be used to strip HTML
			 * tags or to de-format telephone numbers for numeric only searching.
			 *
			 * Note that is a search is not defined for a column of a given type,
			 * no search formatting will be performed.
			 * 
			 * Pre-processing of searching data plug-ins - When you assign the sType
			 * for a column (or have it automatically detected for you by DataTables
			 * or a type detection plug-in), you will typically be using this for
			 * custom sorting, but it can also be used to provide custom searching
			 * by allowing you to pre-processing the data and returning the data in
			 * the format that should be searched upon. This is done by adding
			 * functions this object with a parameter name which matches the sType
			 * for that target column. This is the corollary of <i>afnSortData</i>
			 * for searching data.
			 *
			 * The functions defined take a single parameter:
			 *
		     *  1. `{*}` Data from the column cell to be prepared for searching
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Formatted string that will be used for the searching.
			 *
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    $.fn.dataTable.ext.type.search['title-numeric'] = function ( d ) {
			 *      return d.replace(/\n/g," ").replace( /<.*?>/g, "" );
			 *    }
			 */
			search: {},
	
	
			/**
			 * Type based ordering.
			 *
			 * The column type tells DataTables what ordering to apply to the table
			 * when a column is sorted upon. The order for each type that is defined,
			 * is defined by the functions available in this object.
			 *
			 * Each ordering option can be described by three properties added to
			 * this object:
			 *
			 * * `{type}-pre` - Pre-formatting function
			 * * `{type}-asc` - Ascending order function
			 * * `{type}-desc` - Descending order function
			 *
			 * All three can be used together, only `{type}-pre` or only
			 * `{type}-asc` and `{type}-desc` together. It is generally recommended
			 * that only `{type}-pre` is used, as this provides the optimal
			 * implementation in terms of speed, although the others are provided
			 * for compatibility with existing Javascript sort functions.
			 *
			 * `{type}-pre`: Functions defined take a single parameter:
			 *
		     *  1. `{*}` Data from the column cell to be prepared for ordering
			 *
			 * And return:
			 *
			 * * `{*}` Data to be sorted upon
			 *
			 * `{type}-asc` and `{type}-desc`: Functions are typical Javascript sort
			 * functions, taking two parameters:
			 *
		     *  1. `{*}` Data to compare to the second parameter
		     *  2. `{*}` Data to compare to the first parameter
			 *
			 * And returning:
			 *
			 * * `{*}` Ordering match: <0 if first parameter should be sorted lower
			 *   than the second parameter, ===0 if the two parameters are equal and
			 *   >0 if the first parameter should be sorted height than the second
			 *   parameter.
			 * 
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    // Numeric ordering of formatted numbers with a pre-formatter
			 *    $.extend( $.fn.dataTable.ext.type.order, {
			 *      "string-pre": function(x) {
			 *        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
			 *        return parseFloat( a );
			 *      }
			 *    } );
			 *
			 *  @example
			 *    // Case-sensitive string ordering, with no pre-formatting method
			 *    $.extend( $.fn.dataTable.ext.order, {
			 *      "string-case-asc": function(x,y) {
			 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			 *      },
			 *      "string-case-desc": function(x,y) {
			 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
			 *      }
			 *    } );
			 */
			order: {}
		},
	
		/**
		 * Unique DataTables instance counter
		 *
		 * @type int
		 * @private
		 */
		_unique: 0,
	
	
		//
		// Depreciated
		// The following properties are retained for backwards compatibility only.
		// The should not be used in new projects and will be removed in a future
		// version
		//
	
		/**
		 * Version check function.
		 *  @type function
		 *  @depreciated Since 1.10
		 */
		fnVersionCheck: DataTable.fnVersionCheck,
	
	
		/**
		 * Index for what 'this' index API functions should use
		 *  @type int
		 *  @deprecated Since v1.10
		 */
		iApiIndex: 0,
	
	
		/**
		 * Software version
		 *  @type string
		 *  @deprecated Since v1.10
		 */
		sVersion: DataTable.version
	};
	
	
	//
	// Backwards compatibility. Alias to pre 1.10 Hungarian notation counter parts
	//
	$.extend( _ext, {
		afnFiltering: _ext.search,
		aTypes:       _ext.type.detect,
		ofnSearch:    _ext.type.search,
		oSort:        _ext.type.order,
		afnSortData:  _ext.order,
		aoFeatures:   _ext.feature,
		oStdClasses:  _ext.classes,
		oPagination:  _ext.pager
	} );
	
	
	$.extend( DataTable.ext.classes, {
		container: 'dt-container',
		empty: {
			row: 'dt-empty'
		},
		info: {
			container: 'dt-info'
		},
		length: {
			container: 'dt-length',
			select: 'dt-input'
		},
		order: {
			canAsc: 'dt-orderable-asc',
			canDesc: 'dt-orderable-desc',
			isAsc: 'dt-ordering-asc',
			isDesc: 'dt-ordering-desc',
			none: 'dt-orderable-none',
			position: 'sorting_'
		},
		processing: {
			container: 'dt-processing'
		},
		scrolling: {
			body: 'dt-scroll-body',
			container: 'dt-scroll',
			footer: {
				self: 'dt-scroll-foot',
				inner: 'dt-scroll-footInner'
			},
			header: {
				self: 'dt-scroll-head',
				inner: 'dt-scroll-headInner'
			}
		},
		search: {
			container: 'dt-search',
			input: 'dt-input'
		},
		table: 'dataTable',	
		tbody: {
			cell: '',
			row: ''
		},
		thead: {
			cell: '',
			row: ''
		},
		tfoot: {
			cell: '',
			row: ''
		},
		paging: {
			active: 'current',
			button: 'dt-paging-button',
			container: 'dt-paging',
			disabled: 'disabled'
		}
	} );
	
	
	/*
	 * It is useful to have variables which are scoped locally so only the
	 * DataTables functions can access them and they don't leak into global space.
	 * At the same time these functions are often useful over multiple files in the
	 * core and API, so we list, or at least document, all variables which are used
	 * by DataTables as private variables here. This also ensures that there is no
	 * clashing of variable names and that they can easily referenced for reuse.
	 */
	
	
	// Defined else where
	//  _selector_run
	//  _selector_opts
	//  _selector_row_indexes
	
	var _ext; // DataTable.ext
	var _Api; // DataTable.Api
	var _api_register; // DataTable.Api.register
	var _api_registerPlural; // DataTable.Api.registerPlural
	
	var _re_dic = {};
	var _re_new_lines = /[\r\n\u2028]/g;
	var _re_html = /<([^>]*>)/g;
	var _max_str_len = Math.pow(2, 28);
	
	// This is not strict ISO8601 - Date.parse() is quite lax, although
	// implementations differ between browsers.
	var _re_date = /^\d{2,4}[./-]\d{1,2}[./-]\d{1,2}([T ]{1}\d{1,2}[:.]\d{2}([.:]\d{2})?)?$/;
	
	// Escape regular expression special characters
	var _re_escape_regex = new RegExp( '(\\' + [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-' ].join('|\\') + ')', 'g' );
	
	// https://en.wikipedia.org/wiki/Foreign_exchange_market
	// - \u20BD - Russian ruble.
	// - \u20a9 - South Korean Won
	// - \u20BA - Turkish Lira
	// - \u20B9 - Indian Rupee
	// - R - Brazil (R$) and South Africa
	// - fr - Swiss Franc
	// - kr - Swedish krona, Norwegian krone and Danish krone
	// - \u2009 is thin space and \u202F is narrow no-break space, both used in many
	// - Ƀ - Bitcoin
	// - Ξ - Ethereum
	//   standards as thousands separators.
	var _re_formatted_numeric = /['\u00A0,$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfkɃΞ]/gi;
	
	
	var _empty = function ( d ) {
		return !d || d === true || d === '-' ? true : false;
	};
	
	
	var _intVal = function ( s ) {
		var integer = parseInt( s, 10 );
		return !isNaN(integer) && isFinite(s) ? integer : null;
	};
	
	// Convert from a formatted number with characters other than `.` as the
	// decimal place, to a Javascript number
	var _numToDecimal = function ( num, decimalPoint ) {
		// Cache created regular expressions for speed as this function is called often
		if ( ! _re_dic[ decimalPoint ] ) {
			_re_dic[ decimalPoint ] = new RegExp( _fnEscapeRegex( decimalPoint ), 'g' );
		}
		return typeof num === 'string' && decimalPoint !== '.' ?
			num.replace( /\./g, '' ).replace( _re_dic[ decimalPoint ], '.' ) :
			num;
	};
	
	
	var _isNumber = function ( d, decimalPoint, formatted ) {
		var type = typeof d;
		var strType = type === 'string';
	
		if ( type === 'number' || type === 'bigint') {
			return true;
		}
	
		// If empty return immediately so there must be a number if it is a
		// formatted string (this stops the string "k", or "kr", etc being detected
		// as a formatted number for currency
		if ( _empty( d ) ) {
			return true;
		}
	
		if ( decimalPoint && strType ) {
			d = _numToDecimal( d, decimalPoint );
		}
	
		if ( formatted && strType ) {
			d = d.replace( _re_formatted_numeric, '' );
		}
	
		return !isNaN( parseFloat(d) ) && isFinite( d );
	};
	
	
	// A string without HTML in it can be considered to be HTML still
	var _isHtml = function ( d ) {
		return _empty( d ) || typeof d === 'string';
	};
	
	// Is a string a number surrounded by HTML?
	var _htmlNumeric = function ( d, decimalPoint, formatted ) {
		if ( _empty( d ) ) {
			return true;
		}
	
		// input and select strings mean that this isn't just a number
		if (typeof d === 'string' && d.match(/<(input|select)/i)) {
			return null;
		}
	
		var html = _isHtml( d );
		return ! html ?
			null :
			_isNumber( _stripHtml( d ), decimalPoint, formatted ) ?
				true :
				null;
	};
	
	
	var _pluck = function ( a, prop, prop2 ) {
		var out = [];
		var i=0, ien=a.length;
	
		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if ( prop2 !== undefined ) {
			for ( ; i<ien ; i++ ) {
				if ( a[i] && a[i][ prop ] ) {
					out.push( a[i][ prop ][ prop2 ] );
				}
			}
		}
		else {
			for ( ; i<ien ; i++ ) {
				if ( a[i] ) {
					out.push( a[i][ prop ] );
				}
			}
		}
	
		return out;
	};
	
	
	// Basically the same as _pluck, but rather than looping over `a` we use `order`
	// as the indexes to pick from `a`
	var _pluck_order = function ( a, order, prop, prop2 )
	{
		var out = [];
		var i=0, ien=order.length;
	
		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if ( prop2 !== undefined ) {
			for ( ; i<ien ; i++ ) {
				if ( a[ order[i] ][ prop ] ) {
					out.push( a[ order[i] ][ prop ][ prop2 ] );
				}
			}
		}
		else {
			for ( ; i<ien ; i++ ) {
				if ( a[ order[i] ] ) {
					out.push( a[ order[i] ][ prop ] );
				}
			}
		}
	
		return out;
	};
	
	
	var _range = function ( len, start )
	{
		var out = [];
		var end;
	
		if ( start === undefined ) {
			start = 0;
			end = len;
		}
		else {
			end = start;
			start = len;
		}
	
		for ( var i=start ; i<end ; i++ ) {
			out.push( i );
		}
	
		return out;
	};
	
	
	var _removeEmpty = function ( a )
	{
		var out = [];
	
		for ( var i=0, ien=a.length ; i<ien ; i++ ) {
			if ( a[i] ) { // careful - will remove all falsy values!
				out.push( a[i] );
			}
		}
	
		return out;
	};
	
	// Replaceable function in api.util
	var _stripHtml = function (input) {
		// Irrelevant check to workaround CodeQL's false positive on the regex
		if (input.length > _max_str_len) {
			throw new Error('Exceeded max str len');
		}
	
		var previous;
	
		input = input.replace(_re_html, ''); // Complete tags
	
		// Safety for incomplete script tag - use do / while to ensure that
		// we get all instances
		do {
			previous = input;
			input = input.replace(/<script/i, '');
		} while (input !== previous);
	
		return previous;
	};
	
	// Replaceable function in api.util
	var _escapeHtml = function ( d ) {
		if (Array.isArray(d)) {
			d = d.join(',');
		}
	
		return typeof d === 'string' ?
			d
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;') :
			d;
	};
	
	// Remove diacritics from a string by decomposing it and then removing
	// non-ascii characters
	var _normalize = function (str, both) {
		if (typeof str !== 'string') {
			return str;
		}
	
		// It is faster to just run `normalize` than it is to check if
		// we need to with a regex!
		var res = str.normalize("NFD");
	
		// Equally, here we check if a regex is needed or not
		return res.length !== str.length
			? (both === true ? str + ' ' : '' ) + res.replace(/[\u0300-\u036f]/g, "")
			: res;
	}
	
	/**
	 * Determine if all values in the array are unique. This means we can short
	 * cut the _unique method at the cost of a single loop. A sorted array is used
	 * to easily check the values.
	 *
	 * @param  {array} src Source array
	 * @return {boolean} true if all unique, false otherwise
	 * @ignore
	 */
	var _areAllUnique = function ( src ) {
		if ( src.length < 2 ) {
			return true;
		}
	
		var sorted = src.slice().sort();
		var last = sorted[0];
	
		for ( var i=1, ien=sorted.length ; i<ien ; i++ ) {
			if ( sorted[i] === last ) {
				return false;
			}
	
			last = sorted[i];
		}
	
		return true;
	};
	
	
	/**
	 * Find the unique elements in a source array.
	 *
	 * @param  {array} src Source array
	 * @return {array} Array of unique items
	 * @ignore
	 */
	var _unique = function ( src )
	{
		if (Array.from && Set) {
			return Array.from(new Set(src));
		}
	
		if ( _areAllUnique( src ) ) {
			return src.slice();
		}
	
		// A faster unique method is to use object keys to identify used values,
		// but this doesn't work with arrays or objects, which we must also
		// consider. See jsperf.app/compare-array-unique-versions/4 for more
		// information.
		var
			out = [],
			val,
			i, ien=src.length,
			j, k=0;
	
		again: for ( i=0 ; i<ien ; i++ ) {
			val = src[i];
	
			for ( j=0 ; j<k ; j++ ) {
				if ( out[j] === val ) {
					continue again;
				}
			}
	
			out.push( val );
			k++;
		}
	
		return out;
	};
	
	// Surprisingly this is faster than [].concat.apply
	// https://jsperf.com/flatten-an-array-loop-vs-reduce/2
	var _flatten = function (out, val) {
		if (Array.isArray(val)) {
			for (var i=0 ; i<val.length ; i++) {
				_flatten(out, val[i]);
			}
		}
		else {
			out.push(val);
		}
	
		return out;
	}
	
	// Similar to jQuery's addClass, but use classList.add
	function _addClass(el, name) {
		if (name) {
			name.split(' ').forEach(function (n) {
				if (n) {
					// `add` does deduplication, so no need to check `contains`
					el.classList.add(n);
				}
			});
		}
	}
	
	/**
	 * DataTables utility methods
	 * 
	 * This namespace provides helper methods that DataTables uses internally to
	 * create a DataTable, but which are not exclusively used only for DataTables.
	 * These methods can be used by extension authors to save the duplication of
	 * code.
	 *
	 *  @namespace
	 */
	DataTable.util = {
		/**
		 * Return a string with diacritic characters decomposed
		 * @param {*} mixed Function or string to normalize
		 * @param {*} both Return original string and the normalized string
		 * @returns String or undefined
		 */
		diacritics: function (mixed, both) {
			var type = typeof mixed;
	
			if (type !== 'function') {
				return _normalize(mixed, both);
			}
			_normalize = mixed;
		},
	
		/**
		 * Debounce a function
		 *
		 * @param {function} fn Function to be called
		 * @param {integer} freq Call frequency in mS
		 * @return {function} Wrapped function
		 */
		debounce: function ( fn, timeout ) {
			var timer;
	
			return function () {
				var that = this;
				var args = arguments;
	
				clearTimeout(timer);
	
				timer = setTimeout( function () {
					fn.apply(that, args);
				}, timeout || 250 );
			};
		},
	
		/**
		 * Throttle the calls to a function. Arguments and context are maintained
		 * for the throttled function.
		 *
		 * @param {function} fn Function to be called
		 * @param {integer} freq Call frequency in mS
		 * @return {function} Wrapped function
		 */
		throttle: function ( fn, freq ) {
			var
				frequency = freq !== undefined ? freq : 200,
				last,
				timer;
	
			return function () {
				var
					that = this,
					now  = +new Date(),
					args = arguments;
	
				if ( last && now < last + frequency ) {
					clearTimeout( timer );
	
					timer = setTimeout( function () {
						last = undefined;
						fn.apply( that, args );
					}, frequency );
				}
				else {
					last = now;
					fn.apply( that, args );
				}
			};
		},
	
		/**
		 * Escape a string such that it can be used in a regular expression
		 *
		 *  @param {string} val string to escape
		 *  @returns {string} escaped string
		 */
		escapeRegex: function ( val ) {
			return val.replace( _re_escape_regex, '\\$1' );
		},
	
		/**
		 * Create a function that will write to a nested object or array
		 * @param {*} source JSON notation string
		 * @returns Write function
		 */
		set: function ( source ) {
			if ( $.isPlainObject( source ) ) {
				/* Unlike get, only the underscore (global) option is used for for
				 * setting data since we don't know the type here. This is why an object
				 * option is not documented for `mData` (which is read/write), but it is
				 * for `mRender` which is read only.
				 */
				return DataTable.util.set( source._ );
			}
			else if ( source === null ) {
				// Nothing to do when the data source is null
				return function () {};
			}
			else if ( typeof source === 'function' ) {
				return function (data, val, meta) {
					source( data, 'set', val, meta );
				};
			}
			else if (
				typeof source === 'string' && (source.indexOf('.') !== -1 ||
				source.indexOf('[') !== -1 || source.indexOf('(') !== -1)
			) {
				// Like the get, we need to get data from a nested object
				var setData = function (data, val, src) {
					var a = _fnSplitObjNotation( src ), b;
					var aLast = a[a.length-1];
					var arrayNotation, funcNotation, o, innerSrc;
		
					for ( var i=0, iLen=a.length-1 ; i<iLen ; i++ ) {
						// Protect against prototype pollution
						if (a[i] === '__proto__' || a[i] === 'constructor') {
							throw new Error('Cannot set prototype values');
						}
		
						// Check if we are dealing with an array notation request
						arrayNotation = a[i].match(__reArray);
						funcNotation = a[i].match(__reFn);
		
						if ( arrayNotation ) {
							a[i] = a[i].replace(__reArray, '');
							data[ a[i] ] = [];
		
							// Get the remainder of the nested object to set so we can recurse
							b = a.slice();
							b.splice( 0, i+1 );
							innerSrc = b.join('.');
		
							// Traverse each entry in the array setting the properties requested
							if ( Array.isArray( val ) ) {
								for ( var j=0, jLen=val.length ; j<jLen ; j++ ) {
									o = {};
									setData( o, val[j], innerSrc );
									data[ a[i] ].push( o );
								}
							}
							else {
								// We've been asked to save data to an array, but it
								// isn't array data to be saved. Best that can be done
								// is to just save the value.
								data[ a[i] ] = val;
							}
		
							// The inner call to setData has already traversed through the remainder
							// of the source and has set the data, thus we can exit here
							return;
						}
						else if ( funcNotation ) {
							// Function call
							a[i] = a[i].replace(__reFn, '');
							data = data[ a[i] ]( val );
						}
		
						// If the nested object doesn't currently exist - since we are
						// trying to set the value - create it
						if ( data[ a[i] ] === null || data[ a[i] ] === undefined ) {
							data[ a[i] ] = {};
						}
						data = data[ a[i] ];
					}
		
					// Last item in the input - i.e, the actual set
					if ( aLast.match(__reFn ) ) {
						// Function call
						data = data[ aLast.replace(__reFn, '') ]( val );
					}
					else {
						// If array notation is used, we just want to strip it and use the property name
						// and assign the value. If it isn't used, then we get the result we want anyway
						data[ aLast.replace(__reArray, '') ] = val;
					}
				};
		
				return function (data, val) { // meta is also passed in, but not used
					return setData( data, val, source );
				};
			}
			else {
				// Array or flat object mapping
				return function (data, val) { // meta is also passed in, but not used
					data[source] = val;
				};
			}
		},
	
		/**
		 * Create a function that will read nested objects from arrays, based on JSON notation
		 * @param {*} source JSON notation string
		 * @returns Value read
		 */
		get: function ( source ) {
			if ( $.isPlainObject( source ) ) {
				// Build an object of get functions, and wrap them in a single call
				var o = {};
				$.each( source, function (key, val) {
					if ( val ) {
						o[key] = DataTable.util.get( val );
					}
				} );
		
				return function (data, type, row, meta) {
					var t = o[type] || o._;
					return t !== undefined ?
						t(data, type, row, meta) :
						data;
				};
			}
			else if ( source === null ) {
				// Give an empty string for rendering / sorting etc
				return function (data) { // type, row and meta also passed, but not used
					return data;
				};
			}
			else if ( typeof source === 'function' ) {
				return function (data, type, row, meta) {
					return source( data, type, row, meta );
				};
			}
			else if (
				typeof source === 'string' && (source.indexOf('.') !== -1 ||
				source.indexOf('[') !== -1 || source.indexOf('(') !== -1)
			) {
				/* If there is a . in the source string then the data source is in a
				 * nested object so we loop over the data for each level to get the next
				 * level down. On each loop we test for undefined, and if found immediately
				 * return. This allows entire objects to be missing and sDefaultContent to
				 * be used if defined, rather than throwing an error
				 */
				var fetchData = function (data, type, src) {
					var arrayNotation, funcNotation, out, innerSrc;
		
					if ( src !== "" ) {
						var a = _fnSplitObjNotation( src );
		
						for ( var i=0, iLen=a.length ; i<iLen ; i++ ) {
							// Check if we are dealing with special notation
							arrayNotation = a[i].match(__reArray);
							funcNotation = a[i].match(__reFn);
		
							if ( arrayNotation ) {
								// Array notation
								a[i] = a[i].replace(__reArray, '');
		
								// Condition allows simply [] to be passed in
								if ( a[i] !== "" ) {
									data = data[ a[i] ];
								}
								out = [];
		
								// Get the remainder of the nested object to get
								a.splice( 0, i+1 );
								innerSrc = a.join('.');
		
								// Traverse each entry in the array getting the properties requested
								if ( Array.isArray( data ) ) {
									for ( var j=0, jLen=data.length ; j<jLen ; j++ ) {
										out.push( fetchData( data[j], type, innerSrc ) );
									}
								}
		
								// If a string is given in between the array notation indicators, that
								// is used to join the strings together, otherwise an array is returned
								var join = arrayNotation[0].substring(1, arrayNotation[0].length-1);
								data = (join==="") ? out : out.join(join);
		
								// The inner call to fetchData has already traversed through the remainder
								// of the source requested, so we exit from the loop
								break;
							}
							else if ( funcNotation ) {
								// Function call
								a[i] = a[i].replace(__reFn, '');
								data = data[ a[i] ]();
								continue;
							}
		
							if (data === null || data[ a[i] ] === null) {
								return null;
							}
							else if ( data === undefined || data[ a[i] ] === undefined ) {
								return undefined;
							}
	
							data = data[ a[i] ];
						}
					}
		
					return data;
				};
		
				return function (data, type) { // row and meta also passed, but not used
					return fetchData( data, type, source );
				};
			}
			else {
				// Array or flat object mapping
				return function (data) { // row and meta also passed, but not used
					return data[source];
				};
			}
		},
	
		stripHtml: function (mixed) {
			var type = typeof mixed;
	
			if (type === 'function') {
				_stripHtml = mixed;
				return;
			}
			else if (type === 'string') {
				return _stripHtml(mixed);
			}
			return mixed;
		},
	
		escapeHtml: function (mixed) {
			var type = typeof mixed;
	
			if (type === 'function') {
				_escapeHtml = mixed;
				return;
			}
			else if (type === 'string' || Array.isArray(mixed)) {
				return _escapeHtml(mixed);
			}
			return mixed;
		},
	
		unique: _unique
	};
	
	
	
	/**
	 * Create a mapping object that allows camel case parameters to be looked up
	 * for their Hungarian counterparts. The mapping is stored in a private
	 * parameter called `_hungarianMap` which can be accessed on the source object.
	 *  @param {object} o
	 *  @memberof DataTable#oApi
	 */
	function _fnHungarianMap ( o )
	{
		var
			hungarian = 'a aa ai ao as b fn i m o s ',
			match,
			newKey,
			map = {};
	
		$.each( o, function (key) {
			match = key.match(/^([^A-Z]+?)([A-Z])/);
	
			if ( match && hungarian.indexOf(match[1]+' ') !== -1 )
			{
				newKey = key.replace( match[0], match[2].toLowerCase() );
				map[ newKey ] = key;
	
				if ( match[1] === 'o' )
				{
					_fnHungarianMap( o[key] );
				}
			}
		} );
	
		o._hungarianMap = map;
	}
	
	
	/**
	 * Convert from camel case parameters to Hungarian, based on a Hungarian map
	 * created by _fnHungarianMap.
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 *  @memberof DataTable#oApi
	 */
	function _fnCamelToHungarian ( src, user, force )
	{
		if ( ! src._hungarianMap ) {
			_fnHungarianMap( src );
		}
	
		var hungarianKey;
	
		$.each( user, function (key) {
			hungarianKey = src._hungarianMap[ key ];
	
			if ( hungarianKey !== undefined && (force || user[hungarianKey] === undefined) )
			{
				// For objects, we need to buzz down into the object to copy parameters
				if ( hungarianKey.charAt(0) === 'o' )
				{
					// Copy the camelCase options over to the hungarian
					if ( ! user[ hungarianKey ] ) {
						user[ hungarianKey ] = {};
					}
					$.extend( true, user[hungarianKey], user[key] );
	
					_fnCamelToHungarian( src[hungarianKey], user[hungarianKey], force );
				}
				else {
					user[hungarianKey] = user[ key ];
				}
			}
		} );
	}
	
	/**
	 * Map one parameter onto another
	 *  @param {object} o Object to map
	 *  @param {*} knew The new parameter name
	 *  @param {*} old The old parameter name
	 */
	var _fnCompatMap = function ( o, knew, old ) {
		if ( o[ knew ] !== undefined ) {
			o[ old ] = o[ knew ];
		}
	};
	
	
	/**
	 * Provide backwards compatibility for the main DT options. Note that the new
	 * options are mapped onto the old parameters, so this is an external interface
	 * change only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatOpts ( init )
	{
		_fnCompatMap( init, 'ordering',      'bSort' );
		_fnCompatMap( init, 'orderMulti',    'bSortMulti' );
		_fnCompatMap( init, 'orderClasses',  'bSortClasses' );
		_fnCompatMap( init, 'orderCellsTop', 'bSortCellsTop' );
		_fnCompatMap( init, 'order',         'aaSorting' );
		_fnCompatMap( init, 'orderFixed',    'aaSortingFixed' );
		_fnCompatMap( init, 'paging',        'bPaginate' );
		_fnCompatMap( init, 'pagingType',    'sPaginationType' );
		_fnCompatMap( init, 'pageLength',    'iDisplayLength' );
		_fnCompatMap( init, 'searching',     'bFilter' );
	
		// Boolean initialisation of x-scrolling
		if ( typeof init.sScrollX === 'boolean' ) {
			init.sScrollX = init.sScrollX ? '100%' : '';
		}
		if ( typeof init.scrollX === 'boolean' ) {
			init.scrollX = init.scrollX ? '100%' : '';
		}
	
		// Column search objects are in an array, so it needs to be converted
		// element by element
		var searchCols = init.aoSearchCols;
	
		if ( searchCols ) {
			for ( var i=0, ien=searchCols.length ; i<ien ; i++ ) {
				if ( searchCols[i] ) {
					_fnCamelToHungarian( DataTable.models.oSearch, searchCols[i] );
				}
			}
		}
	
		// Enable search delay if server-side processing is enabled
		if (init.serverSide && ! init.searchDelay) {
			init.searchDelay = 400;
		}
	}
	
	
	/**
	 * Provide backwards compatibility for column options. Note that the new options
	 * are mapped onto the old parameters, so this is an external interface change
	 * only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatCols ( init )
	{
		_fnCompatMap( init, 'orderable',     'bSortable' );
		_fnCompatMap( init, 'orderData',     'aDataSort' );
		_fnCompatMap( init, 'orderSequence', 'asSorting' );
		_fnCompatMap( init, 'orderDataType', 'sortDataType' );
	
		// orderData can be given as an integer
		var dataSort = init.aDataSort;
		if ( typeof dataSort === 'number' && ! Array.isArray( dataSort ) ) {
			init.aDataSort = [ dataSort ];
		}
	}
	
	
	/**
	 * Browser feature detection for capabilities, quirks
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBrowserDetect( settings )
	{
		// We don't need to do this every time DataTables is constructed, the values
		// calculated are specific to the browser and OS configuration which we
		// don't expect to change between initialisations
		if ( ! DataTable.__browser ) {
			var browser = {};
			DataTable.__browser = browser;
	
			// Scrolling feature / quirks detection
			var n = $('<div/>')
				.css( {
					position: 'fixed',
					top: 0,
					left: -1 * window.pageXOffset, // allow for scrolling
					height: 1,
					width: 1,
					overflow: 'hidden'
				} )
				.append(
					$('<div/>')
						.css( {
							position: 'absolute',
							top: 1,
							left: 1,
							width: 100,
							overflow: 'scroll'
						} )
						.append(
							$('<div/>')
								.css( {
									width: '100%',
									height: 10
								} )
						)
				)
				.appendTo( 'body' );
	
			var outer = n.children();
			var inner = outer.children();
	
			// Get scrollbar width
			browser.barWidth = outer[0].offsetWidth - outer[0].clientWidth;
	
			// In rtl text layout, some browsers (most, but not all) will place the
			// scrollbar on the left, rather than the right.
			browser.bScrollbarLeft = Math.round( inner.offset().left ) !== 1;
	
			n.remove();
		}
	
		$.extend( settings.oBrowser, DataTable.__browser );
		settings.oScroll.iBarWidth = DataTable.__browser.barWidth;
	}
	
	/**
	 * Add a column to the list used for the table with default values
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAddColumn( oSettings )
	{
		// Add column to aoColumns array
		var oDefaults = DataTable.defaults.column;
		var iCol = oSettings.aoColumns.length;
		var oCol = $.extend( {}, DataTable.models.oColumn, oDefaults, {
			"aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
			"mData": oDefaults.mData ? oDefaults.mData : iCol,
			idx: iCol,
			searchFixed: {},
			colEl: $('<col>').attr('data-dt-column', iCol)
		} );
		oSettings.aoColumns.push( oCol );
	
		// Add search object for column specific search. Note that the `searchCols[ iCol ]`
		// passed into extend can be undefined. This allows the user to give a default
		// with only some of the parameters defined, and also not give a default
		var searchCols = oSettings.aoPreSearchCols;
		searchCols[ iCol ] = $.extend( {}, DataTable.models.oSearch, searchCols[ iCol ] );
	}
	
	
	/**
	 * Apply options for a column
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iCol column index to consider
	 *  @param {object} oOptions object with sType, bVisible and bSearchable etc
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnOptions( oSettings, iCol, oOptions )
	{
		var oCol = oSettings.aoColumns[ iCol ];
	
		/* User specified column options */
		if ( oOptions !== undefined && oOptions !== null )
		{
			// Backwards compatibility
			_fnCompatCols( oOptions );
	
			// Map camel case parameters to their Hungarian counterparts
			_fnCamelToHungarian( DataTable.defaults.column, oOptions, true );
	
			/* Backwards compatibility for mDataProp */
			if ( oOptions.mDataProp !== undefined && !oOptions.mData )
			{
				oOptions.mData = oOptions.mDataProp;
			}
	
			if ( oOptions.sType )
			{
				oCol._sManualType = oOptions.sType;
			}
		
			// `class` is a reserved word in Javascript, so we need to provide
			// the ability to use a valid name for the camel case input
			if ( oOptions.className && ! oOptions.sClass )
			{
				oOptions.sClass = oOptions.className;
			}
	
			var origClass = oCol.sClass;
	
			$.extend( oCol, oOptions );
			_fnMap( oCol, oOptions, "sWidth", "sWidthOrig" );
	
			// Merge class from previously defined classes with this one, rather than just
			// overwriting it in the extend above
			if (origClass !== oCol.sClass) {
				oCol.sClass = origClass + ' ' + oCol.sClass;
			}
	
			/* iDataSort to be applied (backwards compatibility), but aDataSort will take
			 * priority if defined
			 */
			if ( oOptions.iDataSort !== undefined )
			{
				oCol.aDataSort = [ oOptions.iDataSort ];
			}
			_fnMap( oCol, oOptions, "aDataSort" );
		}
	
		/* Cache the data get and set functions for speed */
		var mDataSrc = oCol.mData;
		var mData = _fnGetObjectDataFn( mDataSrc );
	
		// The `render` option can be given as an array to access the helper rendering methods.
		// The first element is the rendering method to use, the rest are the parameters to pass
		if ( oCol.mRender && Array.isArray( oCol.mRender ) ) {
			var copy = oCol.mRender.slice();
			var name = copy.shift();
	
			oCol.mRender = DataTable.render[name].apply(window, copy);
		}
	
		oCol._render = oCol.mRender ? _fnGetObjectDataFn( oCol.mRender ) : null;
	
		var attrTest = function( src ) {
			return typeof src === 'string' && src.indexOf('@') !== -1;
		};
		oCol._bAttrSrc = $.isPlainObject( mDataSrc ) && (
			attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter)
		);
		oCol._setter = null;
	
		oCol.fnGetData = function (rowData, type, meta) {
			var innerData = mData( rowData, type, undefined, meta );
	
			return oCol._render && type ?
				oCol._render( innerData, type, rowData, meta ) :
				innerData;
		};
		oCol.fnSetData = function ( rowData, val, meta ) {
			return _fnSetObjectDataFn( mDataSrc )( rowData, val, meta );
		};
	
		// Indicate if DataTables should read DOM data as an object or array
		// Used in _fnGetRowElements
		if ( typeof mDataSrc !== 'number' && ! oCol._isArrayHost ) {
			oSettings._rowReadObject = true;
		}
	
		/* Feature sorting overrides column specific when off */
		if ( !oSettings.oFeatures.bSort )
		{
			oCol.bSortable = false;
		}
	}
	
	
	/**
	 * Adjust the table column widths for new data. Note: you would probably want to
	 * do a redraw after calling this function!
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAdjustColumnSizing ( settings )
	{
		_fnCalculateColumnWidths( settings );
		_fnColumnSizes( settings );
	
		var scroll = settings.oScroll;
		if ( scroll.sY !== '' || scroll.sX !== '') {
			_fnScrollDraw( settings );
		}
	
		_fnCallbackFire( settings, null, 'column-sizing', [settings] );
	}
	
	/**
	 * Apply column sizes
	 *
	 * @param {*} settings DataTables settings object
	 */
	function _fnColumnSizes ( settings )
	{
		var cols = settings.aoColumns;
	
		for (var i=0 ; i<cols.length ; i++) {
			var width = _fnColumnsSumWidth(settings, [i], false, false);
	
			cols[i].colEl.css('width', width);
		}
	}
	
	
	/**
	 * Convert the index of a visible column to the index in the data array (take account
	 * of hidden columns)
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iMatch Visible column index to lookup
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnVisibleToColumnIndex( oSettings, iMatch )
	{
		var aiVis = _fnGetColumns( oSettings, 'bVisible' );
	
		return typeof aiVis[iMatch] === 'number' ?
			aiVis[iMatch] :
			null;
	}
	
	
	/**
	 * Convert the index of an index in the data array and convert it to the visible
	 *   column index (take account of hidden columns)
	 *  @param {int} iMatch Column index to lookup
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnIndexToVisible( oSettings, iMatch )
	{
		var aiVis = _fnGetColumns( oSettings, 'bVisible' );
		var iPos = aiVis.indexOf(iMatch);
	
		return iPos !== -1 ? iPos : null;
	}
	
	
	/**
	 * Get the number of visible columns
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the number of visible columns
	 *  @memberof DataTable#oApi
	 */
	function _fnVisbleColumns( settings )
	{
		var layout = settings.aoHeader;
		var columns = settings.aoColumns;
		var vis = 0;
	
		if ( layout.length ) {
			for ( var i=0, ien=layout[0].length ; i<ien ; i++ ) {
				if ( columns[i].bVisible && $(layout[0][i].cell).css('display') !== 'none' ) {
					vis++;
				}
			}
		}
	
		return vis;
	}
	
	
	/**
	 * Get an array of column indexes that match a given property
	 *  @param {object} oSettings dataTables settings object
	 *  @param {string} sParam Parameter in aoColumns to look for - typically
	 *    bVisible or bSearchable
	 *  @returns {array} Array of indexes with matched properties
	 *  @memberof DataTable#oApi
	 */
	function _fnGetColumns( oSettings, sParam )
	{
		var a = [];
	
		oSettings.aoColumns.map( function(val, i) {
			if ( val[sParam] ) {
				a.push( i );
			}
		} );
	
		return a;
	}
	
	
	/**
	 * Calculate the 'type' of a column
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnTypes ( settings )
	{
		var columns = settings.aoColumns;
		var data = settings.aoData;
		var types = DataTable.ext.type.detect;
		var i, ien, j, jen, k, ken;
		var col, detectedType, cache;
	
		// For each column, spin over the 
		for ( i=0, ien=columns.length ; i<ien ; i++ ) {
			col = columns[i];
			cache = [];
	
			if ( ! col.sType && col._sManualType ) {
				col.sType = col._sManualType;
			}
			else if ( ! col.sType ) {
				for ( j=0, jen=types.length ; j<jen ; j++ ) {
					for ( k=0, ken=data.length ; k<ken ; k++ ) {
	
						if (! data[k]) {
							continue;
						}
	
						// Use a cache array so we only need to get the type data
						// from the formatter once (when using multiple detectors)
						if ( cache[k] === undefined ) {
							cache[k] = _fnGetCellData( settings, k, i, 'type' );
						}
	
						detectedType = types[j]( cache[k], settings );
	
						// If null, then this type can't apply to this column, so
						// rather than testing all cells, break out. There is an
						// exception for the last type which is `html`. We need to
						// scan all rows since it is possible to mix string and HTML
						// types
						if ( ! detectedType && j !== types.length-2 ) {
							break;
						}
	
						// Only a single match is needed for html type since it is
						// bottom of the pile and very similar to string - but it
						// must not be empty
						if ( detectedType === 'html' && ! _empty(cache[k]) ) {
							break;
						}
					}
	
					// Type is valid for all data points in the column - use this
					// type
					if ( detectedType ) {
						col.sType = detectedType;
						break;
					}
				}
	
				// Fall back - if no type was detected, always use string
				if ( ! col.sType ) {
					col.sType = 'string';
				}
			}
	
			// Set class names for header / footer for auto type classes
			var autoClass = _ext.type.className[col.sType];
	
			if (autoClass) {
				_columnAutoClass(settings.aoHeader, i, autoClass);
				_columnAutoClass(settings.aoFooter, i, autoClass);
			}
	
			var renderer = _ext.type.render[col.sType];
	
			// This can only happen once! There is no way to remover
			// a renderer. After the first time the renderer has
			// already been set so createTr will run the renderer itself.
			if (renderer && ! col._render) {
				col._render = DataTable.util.get(renderer);
	
				_columnAutoRender(settings, i);
			}
		}
	}
	
	/**
	 * Apply an auto detected renderer to data which doesn't yet have
	 * a renderer
	 */
	function _columnAutoRender(settings, colIdx) {
		var data = settings.aoData;
	
		for (var i=0 ; i<data.length ; i++) {
			if (data[i].nTr) {
				// We have to update the display here since there is no
				// invalidation check for the data
				var display = _fnGetCellData( settings, i, colIdx, 'display' );
	
				data[i].displayData[colIdx] = display;
				_fnWriteCell(data[i].anCells[colIdx], display);
	
				// No need to update sort / filter data since it has
				// been invalidated and will be re-read with the
				// renderer now applied
			}
		}
	}
	
	/**
	 * Apply a class name to a column's header cells
	 */
	function _columnAutoClass(container, colIdx, className) {
		container.forEach(function (row) {
			if (row[colIdx] && row[colIdx].unique) {
				_addClass(row[colIdx].cell, className);
			}
		});
	}
	
	/**
	 * Take the column definitions and static columns arrays and calculate how
	 * they relate to column indexes. The callback function will then apply the
	 * definition found for a column to a suitable configuration object.
	 *  @param {object} oSettings dataTables settings object
	 *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
	 *  @param {array} aoCols The aoColumns array that defines columns individually
	 *  @param {array} headerLayout Layout for header as it was loaded
	 *  @param {function} fn Callback function - takes two parameters, the calculated
	 *    column index and the definition for that column.
	 *  @memberof DataTable#oApi
	 */
	function _fnApplyColumnDefs( oSettings, aoColDefs, aoCols, headerLayout, fn )
	{
		var i, iLen, j, jLen, k, kLen, def;
		var columns = oSettings.aoColumns;
	
		if ( aoCols ) {
			for ( i=0, iLen=aoCols.length ; i<iLen ; i++ ) {
				if (aoCols[i] && aoCols[i].name) {
					columns[i].sName = aoCols[i].name;
				}
			}
		}
	
		// Column definitions with aTargets
		if ( aoColDefs )
		{
			/* Loop over the definitions array - loop in reverse so first instance has priority */
			for ( i=aoColDefs.length-1 ; i>=0 ; i-- )
			{
				def = aoColDefs[i];
	
				/* Each definition can target multiple columns, as it is an array */
				var aTargets = def.target !== undefined
					? def.target
					: def.targets !== undefined
						? def.targets
						: def.aTargets;
	
				if ( ! Array.isArray( aTargets ) )
				{
					aTargets = [ aTargets ];
				}
	
				for ( j=0, jLen=aTargets.length ; j<jLen ; j++ )
				{
					var target = aTargets[j];
	
					if ( typeof target === 'number' && target >= 0 )
					{
						/* Add columns that we don't yet know about */
						while( columns.length <= target )
						{
							_fnAddColumn( oSettings );
						}
	
						/* Integer, basic index */
						fn( target, def );
					}
					else if ( typeof target === 'number' && target < 0 )
					{
						/* Negative integer, right to left column counting */
						fn( columns.length+target, def );
					}
					else if ( typeof target === 'string' )
					{
						for ( k=0, kLen=columns.length ; k<kLen ; k++ ) {
							if (target === '_all') {
								// Apply to all columns
								fn( k, def );
							}
							else if (target.indexOf(':name') !== -1) {
								// Column selector
								if (columns[k].sName === target.replace(':name', '')) {
									fn( k, def );
								}
							}
							else {
								// Cell selector
								headerLayout.forEach(function (row) {
									if (row[k]) {
										var cell = $(row[k].cell);
	
										// Legacy support. Note that it means that we don't support
										// an element name selector only, since they are treated as
										// class names for 1.x compat.
										if (target.match(/^[a-z][\w-]*$/i)) {
											target = '.' + target;
										}
	
										if (cell.is( target )) {
											fn( k, def );
										}
									}
								});
							}
						}
					}
				}
			}
		}
	
		// Statically defined columns array
		if ( aoCols ) {
			for ( i=0, iLen=aoCols.length ; i<iLen ; i++ ) {
				fn( i, aoCols[i] );
			}
		}
	}
	
	
	/**
	 * Get the width for a given set of columns
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} targets Columns - comma separated string or array of numbers
	 * @param {*} original Use the original width (true) or calculated (false)
	 * @param {*} incVisible Include visible columns (true) or not (false)
	 * @returns Combined CSS value
	 */
	function _fnColumnsSumWidth( settings, targets, original, incVisible ) {
		if ( ! Array.isArray( targets ) ) {
			targets = _fnColumnsFromHeader( targets );
		}
	
		var sum = 0;
		var unit;
		var columns = settings.aoColumns;
		
		for ( var i=0, ien=targets.length ; i<ien ; i++ ) {
			var column = columns[ targets[i] ];
			var definedWidth = original ?
				column.sWidthOrig :
				column.sWidth;
	
			if ( ! incVisible && column.bVisible === false ) {
				continue;
			}
	
			if ( definedWidth === null || definedWidth === undefined ) {
				return null; // can't determine a defined width - browser defined
			}
			else if ( typeof definedWidth === 'number' ) {
				unit = 'px';
				sum += definedWidth;
			}
			else {
				var matched = definedWidth.match(/([\d\.]+)([^\d]*)/);
	
				if ( matched ) {
					sum += matched[1] * 1;
					unit = matched.length === 3 ?
						matched[2] :
						'px';
				}
			}
		}
	
		return sum + unit;
	}
	
	function _fnColumnsFromHeader( cell )
	{
		var attr = $(cell).closest('[data-dt-column]').attr('data-dt-column');
	
		if ( ! attr ) {
			return [];
		}
	
		return attr.split(',').map( function (val) {
			return val * 1;
		} );
	}
	/**
	 * Add a data array to the table, creating DOM node etc. This is the parallel to
	 * _fnGatherData, but for adding rows from a Javascript source, rather than a
	 * DOM source.
	 *  @param {object} settings dataTables settings object
	 *  @param {array} data data array to be added
	 *  @param {node} [tr] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [tds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
	 *  @memberof DataTable#oApi
	 */
	function _fnAddData ( settings, dataIn, tr, tds )
	{
		/* Create the object for storing information about this new row */
		var rowIdx = settings.aoData.length;
		var rowModel = $.extend( true, {}, DataTable.models.oRow, {
			src: tr ? 'dom' : 'data',
			idx: rowIdx
		} );
	
		rowModel._aData = dataIn;
		settings.aoData.push( rowModel );
	
		var columns = settings.aoColumns;
	
		for ( var i=0, iLen=columns.length ; i<iLen ; i++ )
		{
			// Invalidate the column types as the new data needs to be revalidated
			columns[i].sType = null;
		}
	
		/* Add to the display array */
		settings.aiDisplayMaster.push( rowIdx );
	
		var id = settings.rowIdFn( dataIn );
		if ( id !== undefined ) {
			settings.aIds[ id ] = rowModel;
		}
	
		/* Create the DOM information, or register it if already present */
		if ( tr || ! settings.oFeatures.bDeferRender )
		{
			_fnCreateTr( settings, rowIdx, tr, tds );
		}
	
		return rowIdx;
	}
	
	
	/**
	 * Add one or more TR elements to the table. Generally we'd expect to
	 * use this for reading data from a DOM sourced table, but it could be
	 * used for an TR element. Note that if a TR is given, it is used (i.e.
	 * it is not cloned).
	 *  @param {object} settings dataTables settings object
	 *  @param {array|node|jQuery} trs The TR element(s) to add to the table
	 *  @returns {array} Array of indexes for the added rows
	 *  @memberof DataTable#oApi
	 */
	function _fnAddTr( settings, trs )
	{
		var row;
	
		// Allow an individual node to be passed in
		if ( ! (trs instanceof $) ) {
			trs = $(trs);
		}
	
		return trs.map( function (i, el) {
			row = _fnGetRowElements( settings, el );
			return _fnAddData( settings, row.data, el, row.cells );
		} );
	}
	
	
	/**
	 * Get the data for a given cell from the internal cache, taking into account data mapping
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {string} type data get type ('display', 'type' 'filter|search' 'sort|order')
	 *  @returns {*} Cell data
	 *  @memberof DataTable#oApi
	 */
	function _fnGetCellData( settings, rowIdx, colIdx, type )
	{
		if (type === 'search') {
			type = 'filter';
		}
		else if (type === 'order') {
			type = 'sort';
		}
	
		var row = settings.aoData[rowIdx];
	
		if (! row) {
			return undefined;
		}
	
		var draw           = settings.iDraw;
		var col            = settings.aoColumns[colIdx];
		var rowData        = row._aData;
		var defaultContent = col.sDefaultContent;
		var cellData       = col.fnGetData( rowData, type, {
			settings: settings,
			row:      rowIdx,
			col:      colIdx
		} );
	
		// Allow for a node being returned for non-display types
		if (type !== 'display' && cellData && typeof cellData === 'object' && cellData.nodeName) {
			cellData = cellData.innerHTML;
		}
	
		if ( cellData === undefined ) {
			if ( settings.iDrawError != draw && defaultContent === null ) {
				_fnLog( settings, 0, "Requested unknown parameter "+
					(typeof col.mData=='function' ? '{function}' : "'"+col.mData+"'")+
					" for row "+rowIdx+", column "+colIdx, 4 );
				settings.iDrawError = draw;
			}
			return defaultContent;
		}
	
		// When the data source is null and a specific data type is requested (i.e.
		// not the original data), we can use default column data
		if ( (cellData === rowData || cellData === null) && defaultContent !== null && type !== undefined ) {
			cellData = defaultContent;
		}
		else if ( typeof cellData === 'function' ) {
			// If the data source is a function, then we run it and use the return,
			// executing in the scope of the data object (for instances)
			return cellData.call( rowData );
		}
	
		if ( cellData === null && type === 'display' ) {
			return '';
		}
	
		if ( type === 'filter' ) {
			var fomatters = DataTable.ext.type.search;
	
			if ( fomatters[ col.sType ] ) {
				cellData = fomatters[ col.sType ]( cellData );
			}
		}
	
		return cellData;
	}
	
	
	/**
	 * Set the value for a specific cell, into the internal data cache
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {*} val Value to set
	 *  @memberof DataTable#oApi
	 */
	function _fnSetCellData( settings, rowIdx, colIdx, val )
	{
		var col     = settings.aoColumns[colIdx];
		var rowData = settings.aoData[rowIdx]._aData;
	
		col.fnSetData( rowData, val, {
			settings: settings,
			row:      rowIdx,
			col:      colIdx
		}  );
	}
	
	/**
	 * Write a value to a cell
	 * @param {*} td Cell
	 * @param {*} val Value
	 */
	function _fnWriteCell(td, val)
	{
		if (val && typeof val === 'object' && val.nodeName) {
			$(td)
				.empty()
				.append(val);
		}
		else {
			td.innerHTML = val;
		}
	}
	
	
	// Private variable that is used to match action syntax in the data property object
	var __reArray = /\[.*?\]$/;
	var __reFn = /\(\)$/;
	
	/**
	 * Split string on periods, taking into account escaped periods
	 * @param  {string} str String to split
	 * @return {array} Split string
	 */
	function _fnSplitObjNotation( str )
	{
		var parts = str.match(/(\\.|[^.])+/g) || [''];
	
		return parts.map( function ( s ) {
			return s.replace(/\\\./g, '.');
		} );
	}
	
	
	/**
	 * Return a function that can be used to get data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data get function
	 *  @memberof DataTable#oApi
	 */
	var _fnGetObjectDataFn = DataTable.util.get;
	
	
	/**
	 * Return a function that can be used to set data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data set function
	 *  @memberof DataTable#oApi
	 */
	var _fnSetObjectDataFn = DataTable.util.set;
	
	
	/**
	 * Return an array with the full table data
	 *  @param {object} oSettings dataTables settings object
	 *  @returns array {array} aData Master data array
	 *  @memberof DataTable#oApi
	 */
	function _fnGetDataMaster ( settings )
	{
		return _pluck( settings.aoData, '_aData' );
	}
	
	
	/**
	 * Nuke the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnClearTable( settings )
	{
		settings.aoData.length = 0;
		settings.aiDisplayMaster.length = 0;
		settings.aiDisplay.length = 0;
		settings.aIds = {};
	}
	
	
	/**
	 * Mark cached data as invalid such that a re-read of the data will occur when
	 * the cached data is next requested. Also update from the data source object.
	 *
	 * @param {object} settings DataTables settings object
	 * @param {int}    rowIdx   Row index to invalidate
	 * @param {string} [src]    Source to invalidate from: undefined, 'auto', 'dom'
	 *     or 'data'
	 * @param {int}    [colIdx] Column index to invalidate. If undefined the whole
	 *     row will be invalidated
	 * @memberof DataTable#oApi
	 *
	 * @todo For the modularisation of v1.11 this will need to become a callback, so
	 *   the sort and filter methods can subscribe to it. That will required
	 *   initialisation options for sorting, which is why it is not already baked in
	 */
	function _fnInvalidate( settings, rowIdx, src, colIdx )
	{
		var row = settings.aoData[ rowIdx ];
		var i, ien;
	
		// Remove the cached data for the row
		row._aSortData = null;
		row._aFilterData = null;
		row.displayData = null;
	
		// Are we reading last data from DOM or the data object?
		if ( src === 'dom' || ((! src || src === 'auto') && row.src === 'dom') ) {
			// Read the data from the DOM
			row._aData = _fnGetRowElements(
					settings, row, colIdx, colIdx === undefined ? undefined : row._aData
				)
				.data;
		}
		else {
			// Reading from data object, update the DOM
			var cells = row.anCells;
			var display = _fnGetRowDisplay(settings, rowIdx);
	
			if ( cells ) {
				if ( colIdx !== undefined ) {
					_fnWriteCell(cells[colIdx], display[colIdx]);
				}
				else {
					for ( i=0, ien=cells.length ; i<ien ; i++ ) {
						_fnWriteCell(cells[i], display[i]);
					}
				}
			}
		}
	
		// Column specific invalidation
		var cols = settings.aoColumns;
		if ( colIdx !== undefined ) {
			// Type - the data might have changed
			cols[ colIdx ].sType = null;
	
			// Max length string. Its a fairly cheep recalculation, so not worth
			// something more complicated
			cols[ colIdx ].maxLenString = null;
		}
		else {
			for ( i=0, ien=cols.length ; i<ien ; i++ ) {
				cols[i].sType = null;
				cols[i].maxLenString = null;
			}
	
			// Update DataTables special `DT_*` attributes for the row
			_fnRowAttributes( settings, row );
		}
	}
	
	
	/**
	 * Build a data source object from an HTML row, reading the contents of the
	 * cells that are in the row.
	 *
	 * @param {object} settings DataTables settings object
	 * @param {node|object} TR element from which to read data or existing row
	 *   object from which to re-read the data from the cells
	 * @param {int} [colIdx] Optional column index
	 * @param {array|object} [d] Data source object. If `colIdx` is given then this
	 *   parameter should also be given and will be used to write the data into.
	 *   Only the column in question will be written
	 * @returns {object} Object with two parameters: `data` the data read, in
	 *   document order, and `cells` and array of nodes (they can be useful to the
	 *   caller, so rather than needing a second traversal to get them, just return
	 *   them from here).
	 * @memberof DataTable#oApi
	 */
	function _fnGetRowElements( settings, row, colIdx, d )
	{
		var
			tds = [],
			td = row.firstChild,
			name, col, i=0, contents,
			columns = settings.aoColumns,
			objectRead = settings._rowReadObject;
	
		// Allow the data object to be passed in, or construct
		d = d !== undefined ?
			d :
			objectRead ?
				{} :
				[];
	
		var attr = function ( str, td  ) {
			if ( typeof str === 'string' ) {
				var idx = str.indexOf('@');
	
				if ( idx !== -1 ) {
					var attr = str.substring( idx+1 );
					var setter = _fnSetObjectDataFn( str );
					setter( d, td.getAttribute( attr ) );
				}
			}
		};
	
		// Read data from a cell and store into the data object
		var cellProcess = function ( cell ) {
			if ( colIdx === undefined || colIdx === i ) {
				col = columns[i];
				contents = (cell.innerHTML).trim();
	
				if ( col && col._bAttrSrc ) {
					var setter = _fnSetObjectDataFn( col.mData._ );
					setter( d, contents );
	
					attr( col.mData.sort, cell );
					attr( col.mData.type, cell );
					attr( col.mData.filter, cell );
				}
				else {
					// Depending on the `data` option for the columns the data can
					// be read to either an object or an array.
					if ( objectRead ) {
						if ( ! col._setter ) {
							// Cache the setter function
							col._setter = _fnSetObjectDataFn( col.mData );
						}
						col._setter( d, contents );
					}
					else {
						d[i] = contents;
					}
				}
			}
	
			i++;
		};
	
		if ( td ) {
			// `tr` element was passed in
			while ( td ) {
				name = td.nodeName.toUpperCase();
	
				if ( name == "TD" || name == "TH" ) {
					cellProcess( td );
					tds.push( td );
				}
	
				td = td.nextSibling;
			}
		}
		else {
			// Existing row object passed in
			tds = row.anCells;
	
			for ( var j=0, jen=tds.length ; j<jen ; j++ ) {
				cellProcess( tds[j] );
			}
		}
	
		// Read the ID from the DOM if present
		var rowNode = row.firstChild ? row : row.nTr;
	
		if ( rowNode ) {
			var id = rowNode.getAttribute( 'id' );
	
			if ( id ) {
				_fnSetObjectDataFn( settings.rowId )( d, id );
			}
		}
	
		return {
			data: d,
			cells: tds
		};
	}
	
	/**
	 * Render and cache a row's display data for the columns, if required
	 * @returns 
	 */
	function _fnGetRowDisplay (settings, rowIdx) {
		let rowModal = settings.aoData[rowIdx];
		let columns = settings.aoColumns;
	
		if (! rowModal.displayData) {
			// Need to render and cache
			rowModal.displayData = [];
		
			for ( var colIdx=0, len=columns.length ; colIdx<len ; colIdx++ ) {
				rowModal.displayData.push(
					_fnGetCellData( settings, rowIdx, colIdx, 'display' )
				);
			}
		}
	
		return rowModal.displayData;
	}
	
	/**
	 * Create a new TR element (and it's TD children) for a row
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iRow Row to consider
	 *  @param {node} [nTrIn] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @memberof DataTable#oApi
	 */
	function _fnCreateTr ( oSettings, iRow, nTrIn, anTds )
	{
		var
			row = oSettings.aoData[iRow],
			rowData = row._aData,
			cells = [],
			nTr, nTd, oCol,
			i, iLen, create,
			trClass = oSettings.oClasses.tbody.row;
	
		if ( row.nTr === null )
		{
			nTr = nTrIn || document.createElement('tr');
	
			row.nTr = nTr;
			row.anCells = cells;
	
			_addClass(nTr, trClass);
	
			/* Use a private property on the node to allow reserve mapping from the node
			 * to the aoData array for fast look up
			 */
			nTr._DT_RowIndex = iRow;
	
			/* Special parameters can be given by the data source to be used on the row */
			_fnRowAttributes( oSettings, row );
	
			/* Process each column */
			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oCol = oSettings.aoColumns[i];
				create = nTrIn && anTds[i] ? false : true;
	
				nTd = create ? document.createElement( oCol.sCellType ) : anTds[i];
	
				if (! nTd) {
					_fnLog( oSettings, 0, 'Incorrect column count', 18 );
				}
	
				nTd._DT_CellIndex = {
					row: iRow,
					column: i
				};
				
				cells.push( nTd );
				
				var display = _fnGetRowDisplay(oSettings, iRow);
	
				// Need to create the HTML if new, or if a rendering function is defined
				if (
					create ||
					(
						(oCol.mRender || oCol.mData !== i) &&
						(!$.isPlainObject(oCol.mData) || oCol.mData._ !== i+'.display')
					)
				) {
					_fnWriteCell(nTd, display[i]);
				}
	
				// Visibility - add or remove as required
				if ( oCol.bVisible && create )
				{
					nTr.appendChild( nTd );
				}
				else if ( ! oCol.bVisible && ! create )
				{
					nTd.parentNode.removeChild( nTd );
				}
	
				if ( oCol.fnCreatedCell )
				{
					oCol.fnCreatedCell.call( oSettings.oInstance,
						nTd, _fnGetCellData( oSettings, iRow, i ), rowData, iRow, i
					);
				}
			}
	
			_fnCallbackFire( oSettings, 'aoRowCreatedCallback', 'row-created', [nTr, rowData, iRow, cells] );
		}
		else {
			_addClass(row.nTr, trClass);
		}
	}
	
	
	/**
	 * Add attributes to a row based on the special `DT_*` parameters in a data
	 * source object.
	 *  @param {object} settings DataTables settings object
	 *  @param {object} DataTables row object for the row to be modified
	 *  @memberof DataTable#oApi
	 */
	function _fnRowAttributes( settings, row )
	{
		var tr = row.nTr;
		var data = row._aData;
	
		if ( tr ) {
			var id = settings.rowIdFn( data );
	
			if ( id ) {
				tr.id = id;
			}
	
			if ( data.DT_RowClass ) {
				// Remove any classes added by DT_RowClass before
				var a = data.DT_RowClass.split(' ');
				row.__rowc = row.__rowc ?
					_unique( row.__rowc.concat( a ) ) :
					a;
	
				$(tr)
					.removeClass( row.__rowc.join(' ') )
					.addClass( data.DT_RowClass );
			}
	
			if ( data.DT_RowAttr ) {
				$(tr).attr( data.DT_RowAttr );
			}
	
			if ( data.DT_RowData ) {
				$(tr).data( data.DT_RowData );
			}
		}
	}
	
	
	/**
	 * Create the HTML header for the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBuildHead( settings, side )
	{
		var classes = settings.oClasses;
		var columns = settings.aoColumns;
		var i, ien, row;
		var target = side === 'header'
			? settings.nTHead
			: settings.nTFoot;
		var titleProp = side === 'header' ? 'sTitle' : side;
	
		// Footer might be defined
		if (! target) {
			return;
		}
	
		// If no cells yet and we have content for them, then create
		if (side === 'header' || _pluck(settings.aoColumns, titleProp).join('')) {
			row = $('tr', target);
	
			// Add a row if needed
			if (! row.length) {
				row = $('<tr/>').appendTo(target)
			}
	
			// Add the number of cells needed to make up to the number of columns
			if (row.length === 1) {
				var cells = $('td, th', row);
	
				for ( i=cells.length, ien=columns.length ; i<ien ; i++ ) {
					$('<th/>')
						.html( columns[i][titleProp] || '' )
						.appendTo( row );
				}
			}
		}
	
		var detected = _fnDetectHeader( settings, target, true );
	
		if (side === 'header') {
			settings.aoHeader = detected;
		}
		else {
			settings.aoFooter = detected;
		}
	
		// ARIA role for the rows
		$(target).children('tr').attr('role', 'row');
	
		// Every cell needs to be passed through the renderer
		$(target).children('tr').children('th, td')
			.each( function () {
				_fnRenderer( settings, side )(
					settings, $(this), classes
				);
			} );
	}
	
	/**
	 * Build a layout structure for a header or footer
	 *
	 * @param {*} settings DataTables settings
	 * @param {*} source Source layout array
	 * @param {*} incColumns What columns should be included
	 * @returns Layout array
	 */
	function _fnHeaderLayout( settings, source, incColumns )
	{
		var row, column, cell;
		var local = [];
		var structure = [];
		var columns = settings.aoColumns;
		var columnCount = columns.length;
		var rowspan, colspan;
	
		if ( ! source ) {
			return;
		}
	
		// Default is to work on only visible columns
		if ( ! incColumns ) {
			incColumns = _range(columnCount)
				.filter(function (idx) {
					return columns[idx].bVisible;
				});
		}
	
		// Make a copy of the master layout array, but with only the columns we want
		for ( row=0 ; row<source.length ; row++ ) {
			// Remove any columns we haven't selected
			local[row] = source[row].slice().filter(function (cell, i) {
				return incColumns.includes(i);
			});
	
			// Prep the structure array - it needs an element for each row
			structure.push( [] );
		}
	
		for ( row=0 ; row<local.length ; row++ ) {
			for ( column=0 ; column<local[row].length ; column++ ) {
				rowspan = 1;
				colspan = 1;
	
				// Check to see if there is already a cell (row/colspan) covering our target
				// insert point. If there is, then there is nothing to do.
				if ( structure[row][column] === undefined ) {
					cell = local[row][column].cell;
	
					// Expand for rowspan
					while (
						local[row+rowspan] !== undefined &&
						local[row][column].cell == local[row+rowspan][column].cell
					) {
						structure[row+rowspan][column] = null;
						rowspan++;
					}
	
					// And for colspan
					while (
						local[row][column+colspan] !== undefined &&
						local[row][column].cell == local[row][column+colspan].cell
					) {
						// Which also needs to go over rows
						for ( var k=0 ; k<rowspan ; k++ ) {
							structure[row+k][column+colspan] = null;
						}
	
						colspan++;
					}
	
					var titleSpan = $('span.dt-column-title', cell);
	
					structure[row][column] = {
						cell: cell,
						colspan: colspan,
						rowspan: rowspan,
						title: titleSpan.length
							? titleSpan.html()
							: $(cell).html()
					};
				}
			}
		}
	
		return structure;
	}
	
	
	/**
	 * Draw the header (or footer) element based on the column visibility states.
	 *
	 *  @param object oSettings dataTables settings object
	 *  @param array aoSource Layout array from _fnDetectHeader
	 *  @memberof DataTable#oApi
	 */
	function _fnDrawHead( settings, source )
	{
		var layout = _fnHeaderLayout(settings, source);
		var tr, n;
	
		for ( var row=0 ; row<source.length ; row++ ) {
			tr = source[row].row;
	
			// All cells are going to be replaced, so empty out the row
			// Can't use $().empty() as that kills event handlers
			if (tr) {
				while( (n = tr.firstChild) ) {
					tr.removeChild( n );
				}
			}
	
			for ( var column=0 ; column<layout[row].length ; column++ ) {
				var point = layout[row][column];
	
				if (point) {
					$(point.cell)
						.appendTo(tr)
						.attr('rowspan', point.rowspan)
						.attr('colspan', point.colspan);
				}
			}
		}
	}
	
	
	/**
	 * Insert the required TR nodes into the table for display
	 *  @param {object} oSettings dataTables settings object
	 *  @param ajaxComplete true after ajax call to complete rendering
	 *  @memberof DataTable#oApi
	 */
	function _fnDraw( oSettings, ajaxComplete )
	{
		// Allow for state saving and a custom start position
		_fnStart( oSettings );
	
		/* Provide a pre-callback function which can be used to cancel the draw is false is returned */
		var aPreDraw = _fnCallbackFire( oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings] );
		if ( aPreDraw.indexOf(false) !== -1 )
		{
			_fnProcessingDisplay( oSettings, false );
			return;
		}
	
		var anRows = [];
		var iRowCount = 0;
		var bServerSide = _fnDataSource( oSettings ) == 'ssp';
		var aiDisplay = oSettings.aiDisplay;
		var iDisplayStart = oSettings._iDisplayStart;
		var iDisplayEnd = oSettings.fnDisplayEnd();
		var columns = oSettings.aoColumns;
		var body = $(oSettings.nTBody);
	
		oSettings.bDrawing = true;
	
		/* Server-side processing draw intercept */
		if ( !bServerSide )
		{
			oSettings.iDraw++;
		}
		else if ( !oSettings.bDestroying && !ajaxComplete)
		{
			// Show loading message for server-side processing
			if (oSettings.iDraw === 0) {
				body.empty().append(_emptyRow(oSettings));
			}
	
			_fnAjaxUpdate( oSettings );
			return;
		}
	
		if ( aiDisplay.length !== 0 )
		{
			var iStart = bServerSide ? 0 : iDisplayStart;
			var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;
	
			for ( var j=iStart ; j<iEnd ; j++ )
			{
				var iDataIndex = aiDisplay[j];
				var aoData = oSettings.aoData[ iDataIndex ];
				if ( aoData.nTr === null )
				{
					_fnCreateTr( oSettings, iDataIndex );
				}
	
				var nRow = aoData.nTr;
	
				// Add various classes as needed
				for (var i=0 ; i<columns.length ; i++) {
					var col = columns[i];
					var td = aoData.anCells[i];
	
					_addClass(td, _ext.type.className[col.sType]); // auto class
					_addClass(td, col.sClass); // column class
					_addClass(td, oSettings.oClasses.tbody.cell); // all cells
				}
	
				// Row callback functions - might want to manipulate the row
				// iRowCount and j are not currently documented. Are they at all
				// useful?
				_fnCallbackFire( oSettings, 'aoRowCallback', null,
					[nRow, aoData._aData, iRowCount, j, iDataIndex] );
	
				anRows.push( nRow );
				iRowCount++;
			}
		}
		else
		{
			anRows[ 0 ] = _emptyRow(oSettings);
		}
	
		/* Header and footer callbacks */
		_fnCallbackFire( oSettings, 'aoHeaderCallback', 'header', [ $(oSettings.nTHead).children('tr')[0],
			_fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );
	
		_fnCallbackFire( oSettings, 'aoFooterCallback', 'footer', [ $(oSettings.nTFoot).children('tr')[0],
			_fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );
	
		// replaceChildren is faster, but only became widespread in 2020,
		// so a fall back in jQuery is provided for older browsers.
		if (body[0].replaceChildren) {
			body[0].replaceChildren.apply(body[0], anRows);
		}
		else {
			body.children().detach();
			body.append( $(anRows) );
		}
	
		// Empty table needs a specific class
		$(oSettings.nTableWrapper).toggleClass('dt-empty-footer', $('tr', oSettings.nTFoot).length === 0);
	
		/* Call all required callback functions for the end of a draw */
		_fnCallbackFire( oSettings, 'aoDrawCallback', 'draw', [oSettings], true );
	
		/* Draw is complete, sorting and filtering must be as well */
		oSettings.bSorted = false;
		oSettings.bFiltered = false;
		oSettings.bDrawing = false;
	}
	
	
	/**
	 * Redraw the table - taking account of the various features which are enabled
	 *  @param {object} oSettings dataTables settings object
	 *  @param {boolean} [holdPosition] Keep the current paging position. By default
	 *    the paging is reset to the first page
	 *  @memberof DataTable#oApi
	 */
	function _fnReDraw( settings, holdPosition, recompute )
	{
		var
			features = settings.oFeatures,
			sort     = features.bSort,
			filter   = features.bFilter;
	
		if (recompute === undefined || recompute === true) {
			if ( sort ) {
				_fnSort( settings );
			}
	
			if ( filter ) {
				_fnFilterComplete( settings, settings.oPreviousSearch );
			}
			else {
				// No filtering, so we want to just use the display master
				settings.aiDisplay = settings.aiDisplayMaster.slice();
			}
		}
	
		if ( holdPosition !== true ) {
			settings._iDisplayStart = 0;
		}
	
		// Let any modules know about the draw hold position state (used by
		// scrolling internally)
		settings._drawHold = holdPosition;
	
		_fnDraw( settings );
	
		settings._drawHold = false;
	}
	
	
	/*
	 * Table is empty - create a row with an empty message in it
	 */
	function _emptyRow ( settings ) {
		var oLang = settings.oLanguage;
		var zero = oLang.sZeroRecords;
		var dataSrc = _fnDataSource( settings );
	
		if (
			(settings.iDraw < 1 && dataSrc === 'ssp') ||
			(settings.iDraw <= 1 && dataSrc === 'ajax')
		) {
			zero = oLang.sLoadingRecords;
		}
		else if ( oLang.sEmptyTable && settings.fnRecordsTotal() === 0 )
		{
			zero = oLang.sEmptyTable;
		}
	
		return $( '<tr/>' )
			.append( $('<td />', {
				'colSpan': _fnVisbleColumns( settings ),
				'class':   settings.oClasses.empty.row
			} ).html( zero ) )[0];
	}
	
	
	/**
	 * Convert a `layout` object given by a user to the object structure needed
	 * for the renderer. This is done twice, once for above and once for below
	 * the table. Ordering must also be considered.
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} layout Layout object to convert
	 * @param {string} side `top` or `bottom`
	 * @returns Converted array structure - one item for each row.
	 */
	function _layoutArray ( settings, layout, side )
	{
		var groups = {};
	
		// Combine into like groups (e.g. `top`, `top2`, etc)
		$.each( layout, function ( pos, val ) {
			if (val === null) {
				return;
			}
	
			var splitPos = pos.replace(/([A-Z])/g, ' $1').split(' ');
	
			if ( ! groups[ splitPos[0] ] ) {
				groups[ splitPos[0] ] = {};
			}
	
			var align = splitPos.length === 1 ?
				'full' :
				splitPos[1].toLowerCase();
			var group = groups[ splitPos[0] ];
			var groupRun = function (contents, innerVal) {
				// If it is an object, then there can be multiple features contained in it
				if ( $.isPlainObject( innerVal ) ) {
					Object.keys(innerVal).map(function (key) {
						contents.push( {
							feature: key,
							opts: innerVal[key]
						});
					});
				}
				else {
					contents.push(innerVal);
				}
			}
	
			// Transform to an object with a contents property
			if (! group[align] || ! group[align].contents) {
				group[align] = { contents: [] };
			}
	
			// Allow for an array or just a single object
			if ( Array.isArray(val)) {
				for (var i=0 ; i<val.length ; i++) {
					groupRun(group[align].contents, val[i]);
				}
			}
			else {
				groupRun(group[ align ].contents, val);
			}
	
			// And make contents an array
			if ( ! Array.isArray( group[ align ].contents ) ) {
				group[ align ].contents = [ group[ align ].contents ];
			}
		} );
	
		var filtered = Object.keys(groups)
			.map( function ( pos ) {
				// Filter to only the side we need
				if ( pos.indexOf(side) !== 0 ) {
					return null;
				}
	
				return {
					name: pos,
					val: groups[pos]
				};
			} )
			.filter( function (item) {
				return item !== null;
			});
	
		// Order by item identifier
		filtered.sort( function ( a, b ) {
			var order1 = a.name.replace(/[^0-9]/g, '') * 1;
			var order2 = b.name.replace(/[^0-9]/g, '') * 1;
	
			return order2 - order1;
		} );
		
		if ( side === 'bottom' ) {
			filtered.reverse();
		}
	
		// Split into rows
		var rows = [];
		for ( var i=0, ien=filtered.length ; i<ien ; i++ ) {
			if (  filtered[i].val.full ) {
				rows.push( { full: filtered[i].val.full } );
				_layoutResolve( settings, rows[ rows.length - 1 ] );
	
				delete filtered[i].val.full;
			}
	
			if ( Object.keys(filtered[i].val).length ) {
				rows.push( filtered[i].val );
				_layoutResolve( settings, rows[ rows.length - 1 ] );
			}
		}
	
		return rows;
	}
	
	
	/**
	 * Convert the contents of a row's layout object to nodes that can be inserted
	 * into the document by a renderer. Execute functions, look up plug-ins, etc.
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} row Layout object for this row
	 */
	function _layoutResolve( settings, row ) {
		var getFeature = function (feature, opts) {
			if ( ! _ext.features[ feature ] ) {
				_fnLog( settings, 0, 'Unknown feature: '+ feature );
			}
	
			return _ext.features[ feature ].apply( this, [settings, opts] );
		};
	
		var resolve = function ( item ) {
			var line = row[ item ].contents;
	
			for ( var i=0, ien=line.length ; i<ien ; i++ ) {
				if ( ! line[i] ) {
					continue;
				}
				else if ( typeof line[i] === 'string' ) {
					line[i] = getFeature( line[i], null );
				}
				else if ( $.isPlainObject(line[i]) ) {
					// If it's an object, it just has feature and opts properties from
					// the transform in _layoutArray
					line[i] = getFeature(line[i].feature, line[i].opts);
				}
				else if ( typeof line[i].node === 'function' ) {
					line[i] = line[i].node( settings );
				}
				else if ( typeof line[i] === 'function' ) {
					var inst = line[i]( settings );
	
					line[i] = typeof inst.node === 'function' ?
						inst.node() :
						inst;
				}
			}
		};
	
		$.each( row, function ( key ) {
			resolve( key );
		} );
	}
	
	
	/**
	 * Add the options to the page HTML for the table
	 *  @param {object} settings DataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAddOptionsHtml ( settings )
	{
		var classes = settings.oClasses;
		var table = $(settings.nTable);
	
		// Wrapper div around everything DataTables controls
		var insert = $('<div/>')
			.attr({
				id:      settings.sTableId+'_wrapper',
				'class': classes.container
			})
			.insertBefore(table);
	
		settings.nTableWrapper = insert[0];
	
		if (settings.sDom) {
			// Legacy
			_fnLayoutDom(settings, settings.sDom, insert);
		}
		else {
			var top = _layoutArray( settings, settings.layout, 'top' );
			var bottom = _layoutArray( settings, settings.layout, 'bottom' );
			var renderer = _fnRenderer( settings, 'layout' );
		
			// Everything above - the renderer will actually insert the contents into the document
			top.forEach(function (item) {
				renderer( settings, insert, item );
			});
	
			// The table - always the center of attention
			renderer( settings, insert, {
				full: {
					table: true,
					contents: [ _fnFeatureHtmlTable(settings) ]
				}
			} );
	
			// Everything below
			bottom.forEach(function (item) {
				renderer( settings, insert, item );
			});
		}
	
		// Processing floats on top, so it isn't an inserted feature
		_processingHtml( settings );
	}
	
	/**
	 * Draw the table with the legacy DOM property
	 * @param {*} settings DT settings object
	 * @param {*} dom DOM string
	 * @param {*} insert Insert point
	 */
	function _fnLayoutDom( settings, dom, insert )
	{
		var parts = dom.match(/(".*?")|('.*?')|./g);
		var featureNode, option, newNode, next, attr;
	
		for ( var i=0 ; i<parts.length ; i++ ) {
			featureNode = null;
			option = parts[i];
	
			if ( option == '<' ) {
				// New container div
				newNode = $('<div/>');
	
				// Check to see if we should append an id and/or a class name to the container
				next = parts[i+1];
	
				if ( next[0] == "'" || next[0] == '"' ) {
					attr = next.replace(/['"]/g, '');
	
					var id = '', className;
	
					/* The attribute can be in the format of "#id.class", "#id" or "class" This logic
					 * breaks the string into parts and applies them as needed
					 */
					if ( attr.indexOf('.') != -1 ) {
						var split = attr.split('.');
	
						id = split[0];
						className = split[1];
					}
					else if ( attr[0] == "#" ) {
						id = attr;
					}
					else {
						className = attr;
					}
	
					newNode
						.attr('id', id.substring(1))
						.addClass(className);
	
					i++; // Move along the position array
				}
	
				insert.append( newNode );
				insert = newNode;
			}
			else if ( option == '>' ) {
				// End container div
				insert = insert.parent();
			}
			else if ( option == 't' ) {
				// Table
				featureNode = _fnFeatureHtmlTable( settings );
			}
			else
			{
				DataTable.ext.feature.forEach(function(feature) {
					if ( option == feature.cFeature ) {
						featureNode = feature.fnInit( settings );
					}
				});
			}
	
			// Add to the display
			if ( featureNode ) {
				insert.append( featureNode );
			}
		}
	}
	
	
	/**
	 * Use the DOM source to create up an array of header cells. The idea here is to
	 * create a layout grid (array) of rows x columns, which contains a reference
	 * to the cell that that point in the grid (regardless of col/rowspan), such that
	 * any column / row could be removed and the new grid constructed
	 *  @param {node} thead The header/footer element for the table
	 *  @returns {array} Calculated layout array
	 *  @memberof DataTable#oApi
	 */
	function _fnDetectHeader ( settings, thead, write )
	{
		var columns = settings.aoColumns;
		var rows = $(thead).children('tr');
		var row, cell;
		var i, k, l, iLen, shifted, column, colspan, rowspan;
		var isHeader = thead && thead.nodeName.toLowerCase() === 'thead';
		var layout = [];
		var unique;
		var shift = function ( a, i, j ) {
			var k = a[i];
			while ( k[j] ) {
				j++;
			}
			return j;
		};
	
		// We know how many rows there are in the layout - so prep it
		for ( i=0, iLen=rows.length ; i<iLen ; i++ ) {
			layout.push( [] );
		}
	
		for ( i=0, iLen=rows.length ; i<iLen ; i++ ) {
			row = rows[i];
			column = 0;
	
			// For every cell in the row..
			cell = row.firstChild;
			while ( cell ) {
				if (
					cell.nodeName.toUpperCase() == 'TD' ||
					cell.nodeName.toUpperCase() == 'TH'
				) {
					var cols = [];
	
					// Get the col and rowspan attributes from the DOM and sanitise them
					colspan = cell.getAttribute('colspan') * 1;
					rowspan = cell.getAttribute('rowspan') * 1;
					colspan = (!colspan || colspan===0 || colspan===1) ? 1 : colspan;
					rowspan = (!rowspan || rowspan===0 || rowspan===1) ? 1 : rowspan;
	
					// There might be colspan cells already in this row, so shift our target
					// accordingly
					shifted = shift( layout, i, column );
	
					// Cache calculation for unique columns
					unique = colspan === 1 ?
						true :
						false;
					
					// Perform header setup
					if ( write ) {
						if (unique) {
							// Allow column options to be set from HTML attributes
							_fnColumnOptions( settings, shifted, $(cell).data() );
							
							// Get the width for the column. This can be defined from the
							// width attribute, style attribute or `columns.width` option
							var columnDef = columns[shifted];
							var width = cell.getAttribute('width') || null;
							var t = cell.style.width.match(/width:\s*(\d+[pxem%]+)/);
							if ( t ) {
								width = t[1];
							}
	
							columnDef.sWidthOrig = columnDef.sWidth || width;
	
							if (isHeader) {
								// Column title handling - can be user set, or read from the DOM
								// This happens before the render, so the original is still in place
								if ( columnDef.sTitle !== null && ! columnDef.autoTitle ) {
									cell.innerHTML = columnDef.sTitle;
								}
	
								if (! columnDef.sTitle && unique) {
									columnDef.sTitle = _stripHtml(cell.innerHTML);
									columnDef.autoTitle = true;
								}
							}
							else {
								// Footer specific operations
								if (columnDef.footer) {
									cell.innerHTML = columnDef.footer;
								}
							}
	
							// Fall back to the aria-label attribute on the table header if no ariaTitle is
							// provided.
							if (! columnDef.ariaTitle) {
								columnDef.ariaTitle = $(cell).attr("aria-label") || columnDef.sTitle;
							}
	
							// Column specific class names
							if ( columnDef.className ) {
								$(cell).addClass( columnDef.className );
							}
						}
	
						// Wrap the column title so we can write to it in future
						if ( $('span.dt-column-title', cell).length === 0) {
							$('<span>')
								.addClass('dt-column-title')
								.append(cell.childNodes)
								.appendTo(cell);
						}
	
						if ( isHeader && $('span.dt-column-order', cell).length === 0) {
							$('<span>')
								.addClass('dt-column-order')
								.appendTo(cell);
						}
					}
	
					// If there is col / rowspan, copy the information into the layout grid
					for ( l=0 ; l<colspan ; l++ ) {
						for ( k=0 ; k<rowspan ; k++ ) {
							layout[i+k][shifted+l] = {
								cell: cell,
								unique: unique
							};
	
							layout[i+k].row = row;
						}
	
						cols.push( shifted+l );
					}
	
					// Assign an attribute so spanning cells can still be identified
					// as belonging to a column
					cell.setAttribute('data-dt-column', _unique(cols).join(','));
				}
	
				cell = cell.nextSibling;
			}
		}
	
		return layout;
	}
	
	/**
	 * Set the start position for draw
	 *  @param {object} oSettings dataTables settings object
	 */
	function _fnStart( oSettings )
	{
		var bServerSide = _fnDataSource( oSettings ) == 'ssp';
		var iInitDisplayStart = oSettings.iInitDisplayStart;
	
		// Check and see if we have an initial draw position from state saving
		if ( iInitDisplayStart !== undefined && iInitDisplayStart !== -1 )
		{
			oSettings._iDisplayStart = bServerSide ?
				iInitDisplayStart :
				iInitDisplayStart >= oSettings.fnRecordsDisplay() ?
					0 :
					iInitDisplayStart;
	
			oSettings.iInitDisplayStart = -1;
		}
	}
	
	/**
	 * Create an Ajax call based on the table's settings, taking into account that
	 * parameters can have multiple forms, and backwards compatibility.
	 *
	 * @param {object} oSettings dataTables settings object
	 * @param {array} data Data to send to the server, required by
	 *     DataTables - may be augmented by developer callbacks
	 * @param {function} fn Callback function to run when data is obtained
	 */
	function _fnBuildAjax( oSettings, data, fn )
	{
		var ajaxData;
		var ajax = oSettings.ajax;
		var instance = oSettings.oInstance;
		var callback = function ( json ) {
			var status = oSettings.jqXHR
				? oSettings.jqXHR.status
				: null;
	
			if ( json === null || (typeof status === 'number' && status == 204 ) ) {
				json = {};
				_fnAjaxDataSrc( oSettings, json, [] );
			}
	
			var error = json.error || json.sError;
			if ( error ) {
				_fnLog( oSettings, 0, error );
			}
	
			oSettings.json = json;
	
			_fnCallbackFire( oSettings, null, 'xhr', [oSettings, json, oSettings.jqXHR], true );
			fn( json );
		};
	
		if ( $.isPlainObject( ajax ) && ajax.data )
		{
			ajaxData = ajax.data;
	
			var newData = typeof ajaxData === 'function' ?
				ajaxData( data, oSettings ) :  // fn can manipulate data or return
				ajaxData;                      // an object object or array to merge
	
			// If the function returned something, use that alone
			data = typeof ajaxData === 'function' && newData ?
				newData :
				$.extend( true, data, newData );
	
			// Remove the data property as we've resolved it already and don't want
			// jQuery to do it again (it is restored at the end of the function)
			delete ajax.data;
		}
	
		var baseAjax = {
			"url": typeof ajax === 'string' ?
				ajax :
				'',
			"data": data,
			"success": callback,
			"dataType": "json",
			"cache": false,
			"type": oSettings.sServerMethod,
			"error": function (xhr, error) {
				var ret = _fnCallbackFire( oSettings, null, 'xhr', [oSettings, null, oSettings.jqXHR], true );
	
				if ( ret.indexOf(true) === -1 ) {
					if ( error == "parsererror" ) {
						_fnLog( oSettings, 0, 'Invalid JSON response', 1 );
					}
					else if ( xhr.readyState === 4 ) {
						_fnLog( oSettings, 0, 'Ajax error', 7 );
					}
				}
	
				_fnProcessingDisplay( oSettings, false );
			}
		};
	
		// If `ajax` option is an object, extend and override our default base
		if ( $.isPlainObject( ajax ) ) {
			$.extend( baseAjax, ajax )
		}
	
		// Store the data submitted for the API
		oSettings.oAjaxData = data;
	
		// Allow plug-ins and external processes to modify the data
		_fnCallbackFire( oSettings, null, 'preXhr', [oSettings, data, baseAjax], true );
	
		if ( typeof ajax === 'function' )
		{
			// Is a function - let the caller define what needs to be done
			oSettings.jqXHR = ajax.call( instance, data, callback, oSettings );
		}
		else if (ajax.url === '') {
			// No url, so don't load any data. Just apply an empty data array
			// to the object for the callback.
			var empty = {};
	
			DataTable.util.set(ajax.dataSrc)(empty, []);
			callback(empty);
		}
		else {
			// Object to extend the base settings
			oSettings.jqXHR = $.ajax( baseAjax );
	
			// Restore for next time around
			if ( ajaxData ) {
				ajax.data = ajaxData;
			}
		}
	}
	
	
	/**
	 * Update the table using an Ajax call
	 *  @param {object} settings dataTables settings object
	 *  @returns {boolean} Block the table drawing or not
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxUpdate( settings )
	{
		settings.iDraw++;
		_fnProcessingDisplay( settings, true );
	
		_fnBuildAjax(
			settings,
			_fnAjaxParameters( settings ),
			function(json) {
				_fnAjaxUpdateDraw( settings, json );
			}
		);
	}
	
	
	/**
	 * Build up the parameters in an object needed for a server-side processing
	 * request.
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {bool} block the table drawing or not
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxParameters( settings )
	{
		var
			columns = settings.aoColumns,
			features = settings.oFeatures,
			preSearch = settings.oPreviousSearch,
			preColSearch = settings.aoPreSearchCols,
			colData = function ( idx, prop ) {
				return typeof columns[idx][prop] === 'function' ?
					'function' :
					columns[idx][prop];
			};
	
		return {
			draw: settings.iDraw,
			columns: columns.map( function ( column, i ) {
				return {
					data: colData(i, 'mData'),
					name: column.sName,
					searchable: column.bSearchable,
					orderable: column.bSortable,
					search: {
						value: preColSearch[i].search,
						regex: preColSearch[i].regex,
						fixed: Object.keys(column.searchFixed).map( function(name) {
							return {
								name: name,
								term: column.searchFixed[name].toString()
							}
						})
					}
				};
			} ),
			order: _fnSortFlatten( settings ).map( function ( val ) {
				return {
					column: val.col,
					dir: val.dir,
					name: colData(val.col, 'sName')
				};
			} ),
			start: settings._iDisplayStart,
			length: features.bPaginate ?
				settings._iDisplayLength :
				-1,
			search: {
				value: preSearch.search,
				regex: preSearch.regex,
				fixed: Object.keys(settings.searchFixed).map( function(name) {
					return {
						name: name,
						term: settings.searchFixed[name].toString()
					}
				})
			}
		};
	}
	
	
	/**
	 * Data the data from the server (nuking the old) and redraw the table
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} json json data return from the server.
	 *  @param {string} json.sEcho Tracking flag for DataTables to match requests
	 *  @param {int} json.iTotalRecords Number of records in the data set, not accounting for filtering
	 *  @param {int} json.iTotalDisplayRecords Number of records in the data set, accounting for filtering
	 *  @param {array} json.aaData The data to display on this page
	 *  @param {string} [json.sColumns] Column ordering (sName, comma separated)
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxUpdateDraw ( settings, json )
	{
		var data = _fnAjaxDataSrc(settings, json);
		var draw = _fnAjaxDataSrcParam(settings, 'draw', json);
		var recordsTotal = _fnAjaxDataSrcParam(settings, 'recordsTotal', json);
		var recordsFiltered = _fnAjaxDataSrcParam(settings, 'recordsFiltered', json);
	
		if ( draw !== undefined ) {
			// Protect against out of sequence returns
			if ( draw*1 < settings.iDraw ) {
				return;
			}
			settings.iDraw = draw * 1;
		}
	
		// No data in returned object, so rather than an array, we show an empty table
		if ( ! data ) {
			data = [];
		}
	
		_fnClearTable( settings );
		settings._iRecordsTotal   = parseInt(recordsTotal, 10);
		settings._iRecordsDisplay = parseInt(recordsFiltered, 10);
	
		for ( var i=0, ien=data.length ; i<ien ; i++ ) {
			_fnAddData( settings, data[i] );
		}
		settings.aiDisplay = settings.aiDisplayMaster.slice();
	
		_fnDraw( settings, true );
		_fnInitComplete( settings );
		_fnProcessingDisplay( settings, false );
	}
	
	
	/**
	 * Get the data from the JSON data source to use for drawing a table. Using
	 * `_fnGetObjectDataFn` allows the data to be sourced from a property of the
	 * source object, or from a processing function.
	 *  @param {object} settings dataTables settings object
	 *  @param  {object} json Data source object / array from the server
	 *  @return {array} Array of data to use
	 */
	function _fnAjaxDataSrc ( settings, json, write )
	{
		var dataProp = 'data';
	
		if ($.isPlainObject( settings.ajax ) && settings.ajax.dataSrc !== undefined) {
			// Could in inside a `dataSrc` object, or not!
			var dataSrc = settings.ajax.dataSrc;
	
			// string, function and object are valid types
			if (typeof dataSrc === 'string' || typeof dataSrc === 'function') {
				dataProp = dataSrc;
			}
			else if (dataSrc.data !== undefined) {
				dataProp = dataSrc.data;
			}
		}
	
		if ( ! write ) {
			if ( dataProp === 'data' ) {
				// If the default, then we still want to support the old style, and safely ignore
				// it if possible
				return json.aaData || json[dataProp];
			}
	
			return dataProp !== "" ?
				_fnGetObjectDataFn( dataProp )( json ) :
				json;
		}
		
		// set
		_fnSetObjectDataFn( dataProp )( json, write );
	}
	
	/**
	 * Very similar to _fnAjaxDataSrc, but for the other SSP properties
	 * @param {*} settings DataTables settings object
	 * @param {*} param Target parameter
	 * @param {*} json JSON data
	 * @returns Resolved value
	 */
	function _fnAjaxDataSrcParam (settings, param, json) {
		var dataSrc = $.isPlainObject( settings.ajax )
			? settings.ajax.dataSrc
			: null;
	
		if (dataSrc && dataSrc[param]) {
			// Get from custom location
			return _fnGetObjectDataFn( dataSrc[param] )( json );
		}
	
		// else - Default behaviour
		var old = '';
	
		// Legacy support
		if (param === 'draw') {
			old = 'sEcho';
		}
		else if (param === 'recordsTotal') {
			old = 'iTotalRecords';
		}
		else if (param === 'recordsFiltered') {
			old = 'iTotalDisplayRecords';
		}
	
		return json[old] !== undefined
			? json[old]
			: json[param];
	}
	
	
	/**
	 * Filter the table using both the global filter and column based filtering
	 *  @param {object} settings dataTables settings object
	 *  @param {object} input search information
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterComplete ( settings, input )
	{
		var columnsSearch = settings.aoPreSearchCols;
	
		// Resolve any column types that are unknown due to addition or invalidation
		// @todo As per sort - can this be moved into an event handler?
		_fnColumnTypes( settings );
	
		// In server-side processing all filtering is done by the server, so no point hanging around here
		if ( _fnDataSource( settings ) != 'ssp' )
		{
			// Check if any of the rows were invalidated
			_fnFilterData( settings );
	
			// Start from the full data set
			settings.aiDisplay = settings.aiDisplayMaster.slice();
	
			// Global filter first
			_fnFilter( settings.aiDisplay, settings, input.search, input );
	
			$.each(settings.searchFixed, function (name, term) {
				_fnFilter(settings.aiDisplay, settings, term, {});
			});
	
			// Then individual column filters
			for ( var i=0 ; i<columnsSearch.length ; i++ )
			{
				var col = columnsSearch[i];
	
				_fnFilter(
					settings.aiDisplay,
					settings,
					col.search,
					col,
					i
				);
	
				$.each(settings.aoColumns[i].searchFixed, function (name, term) {
					_fnFilter(settings.aiDisplay, settings, term, {}, i);
				});
			}
	
			// And finally global filtering
			_fnFilterCustom( settings );
		}
	
		// Tell the draw function we have been filtering
		settings.bFiltered = true;
	
		_fnCallbackFire( settings, null, 'search', [settings] );
	}
	
	
	/**
	 * Apply custom filtering functions
	 * 
	 * This is legacy now that we have named functions, but it is widely used
	 * from 1.x, so it is not yet deprecated.
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterCustom( settings )
	{
		var filters = DataTable.ext.search;
		var displayRows = settings.aiDisplay;
		var row, rowIdx;
	
		for ( var i=0, ien=filters.length ; i<ien ; i++ ) {
			var rows = [];
	
			// Loop over each row and see if it should be included
			for ( var j=0, jen=displayRows.length ; j<jen ; j++ ) {
				rowIdx = displayRows[ j ];
				row = settings.aoData[ rowIdx ];
	
				if ( filters[i]( settings, row._aFilterData, rowIdx, row._aData, j ) ) {
					rows.push( rowIdx );
				}
			}
	
			// So the array reference doesn't break set the results into the
			// existing array
			displayRows.length = 0;
			displayRows.push.apply(displayRows, rows);
		}
	}
	
	
	/**
	 * Filter the data table based on user input and draw the table
	 */
	function _fnFilter( searchRows, settings, input, options, column )
	{
		if ( input === '' ) {
			return;
		}
	
		var i = 0;
	
		// Search term can be a function, regex or string - if a string we apply our
		// smart filtering regex (assuming the options require that)
		var searchFunc = typeof input === 'function' ? input : null;
		var rpSearch = input instanceof RegExp
			? input
			: searchFunc
				? null
				: _fnFilterCreateSearch( input, options );
	
		// Then for each row, does the test pass. If not, lop the row from the array
		while (i < searchRows.length) {
			var row = settings.aoData[ searchRows[i] ];
			var data = column === undefined
				? row._sFilterRow
				: row._aFilterData[ column ];
	
			if ( (searchFunc && ! searchFunc(data, row._aData, searchRows[i], column)) || (rpSearch && ! rpSearch.test(data)) ) {
				searchRows.splice(i, 1);
				i--;
			}
	
			i++;
		}
	}
	
	
	/**
	 * Build a regular expression object suitable for searching a table
	 *  @param {string} sSearch string to search for
	 *  @param {bool} bRegex treat as a regular expression or not
	 *  @param {bool} bSmart perform smart filtering or not
	 *  @param {bool} bCaseInsensitive Do case insensitive matching or not
	 *  @returns {RegExp} constructed object
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterCreateSearch( search, inOpts )
	{
		var not = [];
		var options = $.extend({}, {
			boundary: false,
			caseInsensitive: true,
			exact: false,
			regex: false,
			smart: true
		}, inOpts);
	
		if (typeof search !== 'string') {
			search = search.toString();
		}
	
		// Remove diacritics if normalize is set up to do so
		search = _normalize(search);
	
		if (options.exact) {
			return new RegExp(
				'^'+_fnEscapeRegex(search)+'$',
				options.caseInsensitive ? 'i' : ''
			);
		}
	
		search = options.regex ?
			search :
			_fnEscapeRegex( search );
		
		if ( options.smart ) {
			/* For smart filtering we want to allow the search to work regardless of
			 * word order. We also want double quoted text to be preserved, so word
			 * order is important - a la google. And a negative look around for
			 * finding rows which don't contain a given string.
			 * 
			 * So this is the sort of thing we want to generate:
			 * 
			 * ^(?=.*?\bone\b)(?=.*?\btwo three\b)(?=.*?\bfour\b).*$
			 */
			var parts = search.match( /!?["\u201C][^"\u201D]+["\u201D]|[^ ]+/g ) || [''];
			var a = parts.map( function ( word ) {
				var negative = false;
				var m;
	
				// Determine if it is a "does not include"
				if ( word.charAt(0) === '!' ) {
					negative = true;
					word = word.substring(1);
				}
	
				// Strip the quotes from around matched phrases
				if ( word.charAt(0) === '"' ) {
					m = word.match( /^"(.*)"$/ );
					word = m ? m[1] : word;
				}
				else if ( word.charAt(0) === '\u201C' ) {
					// Smart quote match (iPhone users)
					m = word.match( /^\u201C(.*)\u201D$/ );
					word = m ? m[1] : word;
				}
	
				// For our "not" case, we need to modify the string that is
				// allowed to match at the end of the expression.
				if (negative) {
					if (word.length > 1) {
						not.push('(?!'+word+')');
					}
	
					word = '';
				}
	
				return word.replace(/"/g, '');
			} );
	
			var match = not.length
				? not.join('')
				: '';
	
			var boundary = options.boundary
				? '\\b'
				: '';
	
			search = '^(?=.*?'+boundary+a.join( ')(?=.*?'+boundary )+')('+match+'.)*$';
		}
	
		return new RegExp( search, options.caseInsensitive ? 'i' : '' );
	}
	
	
	/**
	 * Escape a string such that it can be used in a regular expression
	 *  @param {string} sVal string to escape
	 *  @returns {string} escaped string
	 *  @memberof DataTable#oApi
	 */
	var _fnEscapeRegex = DataTable.util.escapeRegex;
	
	var __filter_div = $('<div>')[0];
	var __filter_div_textContent = __filter_div.textContent !== undefined;
	
	// Update the filtering data for each row if needed (by invalidation or first run)
	function _fnFilterData ( settings )
	{
		var columns = settings.aoColumns;
		var data = settings.aoData;
		var column;
		var j, jen, filterData, cellData, row;
		var wasInvalidated = false;
	
		for ( var rowIdx=0 ; rowIdx<data.length ; rowIdx++ ) {
			if (! data[rowIdx]) {
				continue;
			}
	
			row = data[rowIdx];
	
			if ( ! row._aFilterData ) {
				filterData = [];
	
				for ( j=0, jen=columns.length ; j<jen ; j++ ) {
					column = columns[j];
	
					if ( column.bSearchable ) {
						cellData = _fnGetCellData( settings, rowIdx, j, 'filter' );
	
						// Search in DataTables is string based
						if ( cellData === null ) {
							cellData = '';
						}
	
						if ( typeof cellData !== 'string' && cellData.toString ) {
							cellData = cellData.toString();
						}
					}
					else {
						cellData = '';
					}
	
					// If it looks like there is an HTML entity in the string,
					// attempt to decode it so sorting works as expected. Note that
					// we could use a single line of jQuery to do this, but the DOM
					// method used here is much faster https://jsperf.com/html-decode
					if ( cellData.indexOf && cellData.indexOf('&') !== -1 ) {
						__filter_div.innerHTML = cellData;
						cellData = __filter_div_textContent ?
							__filter_div.textContent :
							__filter_div.innerText;
					}
	
					if ( cellData.replace ) {
						cellData = cellData.replace(/[\r\n\u2028]/g, '');
					}
	
					filterData.push( cellData );
				}
	
				row._aFilterData = filterData;
				row._sFilterRow = filterData.join('  ');
				wasInvalidated = true;
			}
		}
	
		return wasInvalidated;
	}
	
	
	/**
	 * Draw the table for the first time, adding all required features
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnInitialise ( settings )
	{
		var i, iAjaxStart=settings.iInitDisplayStart;
	
		/* Ensure that the table data is fully initialised */
		if ( ! settings.bInitialised ) {
			setTimeout( function(){ _fnInitialise( settings ); }, 200 );
			return;
		}
	
		/* Build and draw the header / footer for the table */
		_fnBuildHead( settings, 'header' );
		_fnBuildHead( settings, 'footer' );
		_fnDrawHead( settings, settings.aoHeader );
		_fnDrawHead( settings, settings.aoFooter );
	
		// Enable features
		_fnAddOptionsHtml( settings );
		_fnSortInit( settings );
	
		_colGroup( settings );
	
		/* Okay to show that something is going on now */
		_fnProcessingDisplay( settings, true );
	
		_fnCallbackFire( settings, null, 'preInit', [settings], true );
	
		// If there is default sorting required - let's do it. The sort function
		// will do the drawing for us. Otherwise we draw the table regardless of the
		// Ajax source - this allows the table to look initialised for Ajax sourcing
		// data (show 'loading' message possibly)
		_fnReDraw( settings );
	
		var dataSrc = _fnDataSource( settings );
	
		// Server-side processing init complete is done by _fnAjaxUpdateDraw
		if ( dataSrc != 'ssp' ) {
			// if there is an ajax source load the data
			if ( dataSrc == 'ajax' ) {
				_fnBuildAjax( settings, {}, function(json) {
					var aData = _fnAjaxDataSrc( settings, json );
	
					// Got the data - add it to the table
					for ( i=0 ; i<aData.length ; i++ ) {
						_fnAddData( settings, aData[i] );
					}
	
					// Reset the init display for cookie saving. We've already done
					// a filter, and therefore cleared it before. So we need to make
					// it appear 'fresh'
					settings.iInitDisplayStart = iAjaxStart;
	
					_fnReDraw( settings );
					_fnProcessingDisplay( settings, false );
					_fnInitComplete( settings );
				}, settings );
			}
			else {
				_fnInitComplete( settings );
				_fnProcessingDisplay( settings, false );
			}
		}
	}
	
	
	/**
	 * Draw the table for the first time, adding all required features
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnInitComplete ( settings )
	{
		if (settings._bInitComplete) {
			return;
		}
	
		var args = [settings, settings.json];
	
		settings._bInitComplete = true;
	
		// Table is fully set up and we have data, so calculate the
		// column widths
		_fnAdjustColumnSizing( settings );
	
		_fnCallbackFire( settings, null, 'plugin-init', args, true );
		_fnCallbackFire( settings, 'aoInitComplete', 'init', args, true );
	}
	
	function _fnLengthChange ( settings, val )
	{
		var len = parseInt( val, 10 );
		settings._iDisplayLength = len;
	
		_fnLengthOverflow( settings );
	
		// Fire length change event
		_fnCallbackFire( settings, null, 'length', [settings, len] );
	}
	
	/**
	 * Alter the display settings to change the page
	 *  @param {object} settings DataTables settings object
	 *  @param {string|int} action Paging action to take: "first", "previous",
	 *    "next" or "last" or page number to jump to (integer)
	 *  @param [bool] redraw Automatically draw the update or not
	 *  @returns {bool} true page has changed, false - no change
	 *  @memberof DataTable#oApi
	 */
	function _fnPageChange ( settings, action, redraw )
	{
		var
			start     = settings._iDisplayStart,
			len       = settings._iDisplayLength,
			records   = settings.fnRecordsDisplay();
	
		if ( records === 0 || len === -1 )
		{
			start = 0;
		}
		else if ( typeof action === "number" )
		{
			start = action * len;
	
			if ( start > records )
			{
				start = 0;
			}
		}
		else if ( action == "first" )
		{
			start = 0;
		}
		else if ( action == "previous" )
		{
			start = len >= 0 ?
				start - len :
				0;
	
			if ( start < 0 )
			{
				start = 0;
			}
		}
		else if ( action == "next" )
		{
			if ( start + len < records )
			{
				start += len;
			}
		}
		else if ( action == "last" )
		{
			start = Math.floor( (records-1) / len) * len;
		}
		else if ( action === 'ellipsis' )
		{
			return;
		}
		else
		{
			_fnLog( settings, 0, "Unknown paging action: "+action, 5 );
		}
	
		var changed = settings._iDisplayStart !== start;
		settings._iDisplayStart = start;
	
		_fnCallbackFire( settings, null, changed ? 'page' : 'page-nc', [settings] );
	
		if ( changed && redraw ) {
			_fnDraw( settings );
		}
	
		return changed;
	}
	
	
	/**
	 * Generate the node required for the processing node
	 *  @param {object} settings DataTables settings object
	 */
	function _processingHtml ( settings )
	{
		var table = settings.nTable;
	
		if ( settings.oFeatures.bProcessing ) {
			var n = $('<div/>', {
					'id': settings.sTableId + '_processing',
					'class': settings.oClasses.processing.container,
					'role': 'status'
				} )
				.html( settings.oLanguage.sProcessing )
				.append('<div><div></div><div></div><div></div><div></div></div>')
				.insertBefore( table );
			
			$(table).on( 'processing.dt.DT', function (e, s, show) {
				n.css( 'display', show ? 'block' : 'none' );
			} );
		}
	}
	
	
	/**
	 * Display or hide the processing indicator
	 *  @param {object} settings DataTables settings object
	 *  @param {bool} show Show the processing indicator (true) or not (false)
	 */
	function _fnProcessingDisplay ( settings, show )
	{
		_fnCallbackFire( settings, null, 'processing', [settings, show] );
	}
	/**
	 * Add any control elements for the table - specifically scrolling
	 *  @param {object} settings dataTables settings object
	 *  @returns {node} Node to add to the DOM
	 *  @memberof DataTable#oApi
	 */
	function _fnFeatureHtmlTable ( settings )
	{
		var table = $(settings.nTable);
	
		// Scrolling from here on in
		var scroll = settings.oScroll;
	
		if ( scroll.sX === '' && scroll.sY === '' ) {
			return settings.nTable;
		}
	
		var scrollX = scroll.sX;
		var scrollY = scroll.sY;
		var classes = settings.oClasses.scrolling;
		var caption = settings.captionNode;
		var captionSide = caption ? caption._captionSide : null;
		var headerClone = $( table[0].cloneNode(false) );
		var footerClone = $( table[0].cloneNode(false) );
		var footer = table.children('tfoot');
		var _div = '<div/>';
		var size = function ( s ) {
			return !s ? null : _fnStringToCss( s );
		};
	
		if ( ! footer.length ) {
			footer = null;
		}
	
		/*
		 * The HTML structure that we want to generate in this function is:
		 *  div - scroller
		 *    div - scroll head
		 *      div - scroll head inner
		 *        table - scroll head table
		 *          thead - thead
		 *    div - scroll body
		 *      table - table (master table)
		 *        thead - thead clone for sizing
		 *        tbody - tbody
		 *    div - scroll foot
		 *      div - scroll foot inner
		 *        table - scroll foot table
		 *          tfoot - tfoot
		 */
		var scroller = $( _div, { 'class': classes.container } )
			.append(
				$(_div, { 'class': classes.header.self } )
					.css( {
						overflow: 'hidden',
						position: 'relative',
						border: 0,
						width: scrollX ? size(scrollX) : '100%'
					} )
					.append(
						$(_div, { 'class': classes.header.inner } )
							.css( {
								'box-sizing': 'content-box',
								width: scroll.sXInner || '100%'
							} )
							.append(
								headerClone
									.removeAttr('id')
									.css( 'margin-left', 0 )
									.append( captionSide === 'top' ? caption : null )
									.append(
										table.children('thead')
									)
							)
					)
			)
			.append(
				$(_div, { 'class': classes.body } )
					.css( {
						position: 'relative',
						overflow: 'auto',
						width: size( scrollX )
					} )
					.append( table )
			);
	
		if ( footer ) {
			scroller.append(
				$(_div, { 'class': classes.footer.self } )
					.css( {
						overflow: 'hidden',
						border: 0,
						width: scrollX ? size(scrollX) : '100%'
					} )
					.append(
						$(_div, { 'class': classes.footer.inner } )
							.append(
								footerClone
									.removeAttr('id')
									.css( 'margin-left', 0 )
									.append( captionSide === 'bottom' ? caption : null )
									.append(
										table.children('tfoot')
									)
							)
					)
			);
		}
	
		var children = scroller.children();
		var scrollHead = children[0];
		var scrollBody = children[1];
		var scrollFoot = footer ? children[2] : null;
	
		// When the body is scrolled, then we also want to scroll the headers
		$(scrollBody).on( 'scroll.DT', function () {
			var scrollLeft = this.scrollLeft;
	
			scrollHead.scrollLeft = scrollLeft;
	
			if ( footer ) {
				scrollFoot.scrollLeft = scrollLeft;
			}
		} );
	
		// When focus is put on the header cells, we might need to scroll the body
		$('th, td', scrollHead).on('focus', function () {
			var scrollLeft = scrollHead.scrollLeft;
	
			scrollBody.scrollLeft = scrollLeft;
	
			if ( footer ) {
				scrollBody.scrollLeft = scrollLeft;
			}
		});
	
		$(scrollBody).css('max-height', scrollY);
		if (! scroll.bCollapse) {
			$(scrollBody).css('height', scrollY);
		}
	
		settings.nScrollHead = scrollHead;
		settings.nScrollBody = scrollBody;
		settings.nScrollFoot = scrollFoot;
	
		// On redraw - align columns
		settings.aoDrawCallback.push(_fnScrollDraw);
	
		return scroller[0];
	}
	
	
	
	/**
	 * Update the header, footer and body tables for resizing - i.e. column
	 * alignment.
	 *
	 * Welcome to the most horrible function DataTables. The process that this
	 * function follows is basically:
	 *   1. Re-create the table inside the scrolling div
	 *   2. Correct colgroup > col values if needed
	 *   3. Copy colgroup > col over to header and footer
	 *   4. Clean up
	 *
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnScrollDraw ( settings )
	{
		// Given that this is such a monster function, a lot of variables are use
		// to try and keep the minimised size as small as possible
		var
			scroll         = settings.oScroll,
			barWidth       = scroll.iBarWidth,
			divHeader      = $(settings.nScrollHead),
			divHeaderInner = divHeader.children('div'),
			divHeaderTable = divHeaderInner.children('table'),
			divBodyEl      = settings.nScrollBody,
			divBody        = $(divBodyEl),
			divFooter      = $(settings.nScrollFoot),
			divFooterInner = divFooter.children('div'),
			divFooterTable = divFooterInner.children('table'),
			header         = $(settings.nTHead),
			table          = $(settings.nTable),
			footer         = settings.nTFoot && $('th, td', settings.nTFoot).length ? $(settings.nTFoot) : null,
			browser        = settings.oBrowser,
			headerCopy, footerCopy;
	
		// If the scrollbar visibility has changed from the last draw, we need to
		// adjust the column sizes as the table width will have changed to account
		// for the scrollbar
		var scrollBarVis = divBodyEl.scrollHeight > divBodyEl.clientHeight;
		
		if ( settings.scrollBarVis !== scrollBarVis && settings.scrollBarVis !== undefined ) {
			settings.scrollBarVis = scrollBarVis;
			_fnAdjustColumnSizing( settings );
			return; // adjust column sizing will call this function again
		}
		else {
			settings.scrollBarVis = scrollBarVis;
		}
	
		// 1. Re-create the table inside the scrolling div
		// Remove the old minimised thead and tfoot elements in the inner table
		table.children('thead, tfoot').remove();
	
		// Clone the current header and footer elements and then place it into the inner table
		headerCopy = header.clone().prependTo( table );
		headerCopy.find('th, td').removeAttr('tabindex');
		headerCopy.find('[id]').removeAttr('id');
	
		if ( footer ) {
			footerCopy = footer.clone().prependTo( table );
			footerCopy.find('[id]').removeAttr('id');
		}
	
		// 2. Correct colgroup > col values if needed
		// It is possible that the cell sizes are smaller than the content, so we need to
		// correct colgroup>col for such cases. This can happen if the auto width detection
		// uses a cell which has a longer string, but isn't the widest! For example 
		// "Chief Executive Officer (CEO)" is the longest string in the demo, but
		// "Systems Administrator" is actually the widest string since it doesn't collapse.
		// Note the use of translating into a column index to get the `col` element. This
		// is because of Responsive which might remove `col` elements, knocking the alignment
		// of the indexes out.
		if (settings.aiDisplay.length) {
			// Get the column sizes from the first row in the table
			var colSizes = table.find('tbody tr').eq(0).find('th, td').map(function (vis) {
				return {
					idx: _fnVisibleToColumnIndex(settings, vis),
					width: $(this).outerWidth()
				}
			});
	
			// Check against what the colgroup > col is set to and correct if needed
			for (var i=0 ; i<colSizes.length ; i++) {
				var colEl = settings.aoColumns[ colSizes[i].idx ].colEl[0];
				var colWidth = colEl.style.width.replace('px', '');
	
				if (colWidth !== colSizes[i].width) {
					colEl.style.width = colSizes[i].width + 'px';
				}
			}
		}
	
		// 3. Copy the colgroup over to the header and footer
		divHeaderTable
			.find('colgroup')
			.remove();
	
		divHeaderTable.append(settings.colgroup.clone());
	
		if ( footer ) {
			divFooterTable
				.find('colgroup')
				.remove();
	
			divFooterTable.append(settings.colgroup.clone());
		}
	
		// "Hide" the header and footer that we used for the sizing. We need to keep
		// the content of the cell so that the width applied to the header and body
		// both match, but we want to hide it completely.
		$('th, td', headerCopy).each(function () {
			$(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
		});
	
		if ( footer ) {
			$('th, td', footerCopy).each(function () {
				$(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
			});
		}
	
		// 4. Clean up
		// Figure out if there are scrollbar present - if so then we need a the header and footer to
		// provide a bit more space to allow "overflow" scrolling (i.e. past the scrollbar)
		var isScrolling = Math.floor(table.height()) > divBodyEl.clientHeight || divBody.css('overflow-y') == "scroll";
		var paddingSide = 'padding' + (browser.bScrollbarLeft ? 'Left' : 'Right' );
	
		// Set the width's of the header and footer tables
		var outerWidth = table.outerWidth();
	
		divHeaderTable.css('width', _fnStringToCss( outerWidth ));
		divHeaderInner
			.css('width', _fnStringToCss( outerWidth ))
			.css(paddingSide, isScrolling ? barWidth+"px" : "0px");
	
		if ( footer ) {
			divFooterTable.css('width', _fnStringToCss( outerWidth ));
			divFooterInner
				.css('width', _fnStringToCss( outerWidth ))
				.css(paddingSide, isScrolling ? barWidth+"px" : "0px");
		}
	
		// Correct DOM ordering for colgroup - comes before the thead
		table.children('colgroup').prependTo(table);
	
		// Adjust the position of the header in case we loose the y-scrollbar
		divBody.trigger('scroll');
	
		// If sorting or filtering has occurred, jump the scrolling back to the top
		// only if we aren't holding the position
		if ( (settings.bSorted || settings.bFiltered) && ! settings._drawHold ) {
			divBodyEl.scrollTop = 0;
		}
	}
	
	/**
	 * Calculate the width of columns for the table
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnCalculateColumnWidths ( settings )
	{
		// Not interested in doing column width calculation if auto-width is disabled
		if (! settings.oFeatures.bAutoWidth) {
			return;
		}
	
		var
			table = settings.nTable,
			columns = settings.aoColumns,
			scroll = settings.oScroll,
			scrollY = scroll.sY,
			scrollX = scroll.sX,
			scrollXInner = scroll.sXInner,
			visibleColumns = _fnGetColumns( settings, 'bVisible' ),
			tableWidthAttr = table.getAttribute('width'), // from DOM element
			tableContainer = table.parentNode,
			i, column, columnIdx;
	
		var styleWidth = table.style.width;
		if ( styleWidth && styleWidth.indexOf('%') !== -1 ) {
			tableWidthAttr = styleWidth;
		}
	
		// Let plug-ins know that we are doing a recalc, in case they have changed any of the
		// visible columns their own way (e.g. Responsive uses display:none).
		_fnCallbackFire(
			settings,
			null,
			'column-calc',
			{visible: visibleColumns},
			false
		);
	
		// Construct a single row, worst case, table with the widest
		// node in the data, assign any user defined widths, then insert it into
		// the DOM and allow the browser to do all the hard work of calculating
		// table widths
		var tmpTable = $(table.cloneNode())
			.css( 'visibility', 'hidden' )
			.removeAttr( 'id' );
	
		// Clean up the table body
		tmpTable.append('<tbody>')
		var tr = $('<tr/>').appendTo( tmpTable.find('tbody') );
	
		// Clone the table header and footer - we can't use the header / footer
		// from the cloned table, since if scrolling is active, the table's
		// real header and footer are contained in different table tags
		tmpTable
			.append( $(settings.nTHead).clone() )
			.append( $(settings.nTFoot).clone() );
	
		// Remove any assigned widths from the footer (from scrolling)
		tmpTable.find('tfoot th, tfoot td').css('width', '');
	
		// Apply custom sizing to the cloned header
		tmpTable.find('thead th, thead td').each( function () {
			// Get the `width` from the header layout
			var width = _fnColumnsSumWidth( settings, this, true, false );
	
			if ( width ) {
				this.style.width = width;
	
				// For scrollX we need to force the column width otherwise the
				// browser will collapse it. If this width is smaller than the
				// width the column requires, then it will have no effect
				if ( scrollX ) {
					$( this ).append( $('<div/>').css( {
						width: width,
						margin: 0,
						padding: 0,
						border: 0,
						height: 1
					} ) );
				}
			}
			else {
				this.style.width = '';
			}
		} );
	
		// Find the widest piece of data for each column and put it into the table
		for ( i=0 ; i<visibleColumns.length ; i++ ) {
			columnIdx = visibleColumns[i];
			column = columns[ columnIdx ];
	
			var longest = _fnGetMaxLenString(settings, columnIdx);
			var autoClass = _ext.type.className[column.sType];
			var text = longest + column.sContentPadding;
			var insert = longest.indexOf('<') === -1
				? document.createTextNode(text)
				: text
			
			$('<td/>')
				.addClass(autoClass)
				.addClass(column.sClass)
				.append(insert)
				.appendTo(tr);
		}
	
		// Tidy the temporary table - remove name attributes so there aren't
		// duplicated in the dom (radio elements for example)
		$('[name]', tmpTable).removeAttr('name');
	
		// Table has been built, attach to the document so we can work with it.
		// A holding element is used, positioned at the top of the container
		// with minimal height, so it has no effect on if the container scrolls
		// or not. Otherwise it might trigger scrolling when it actually isn't
		// needed
		var holder = $('<div/>').css( scrollX || scrollY ?
				{
					position: 'absolute',
					top: 0,
					left: 0,
					height: 1,
					right: 0,
					overflow: 'hidden'
				} :
				{}
			)
			.append( tmpTable )
			.appendTo( tableContainer );
	
		// When scrolling (X or Y) we want to set the width of the table as 
		// appropriate. However, when not scrolling leave the table width as it
		// is. This results in slightly different, but I think correct behaviour
		if ( scrollX && scrollXInner ) {
			tmpTable.width( scrollXInner );
		}
		else if ( scrollX ) {
			tmpTable.css( 'width', 'auto' );
			tmpTable.removeAttr('width');
	
			// If there is no width attribute or style, then allow the table to
			// collapse
			if ( tmpTable.width() < tableContainer.clientWidth && tableWidthAttr ) {
				tmpTable.width( tableContainer.clientWidth );
			}
		}
		else if ( scrollY ) {
			tmpTable.width( tableContainer.clientWidth );
		}
		else if ( tableWidthAttr ) {
			tmpTable.width( tableWidthAttr );
		}
	
		// Get the width of each column in the constructed table
		var total = 0;
		var bodyCells = tmpTable.find('tbody tr').eq(0).children();
	
		for ( i=0 ; i<visibleColumns.length ; i++ ) {
			// Use getBounding for sub-pixel accuracy, which we then want to round up!
			var bounding = bodyCells[i].getBoundingClientRect().width;
	
			// Total is tracked to remove any sub-pixel errors as the outerWidth
			// of the table might not equal the total given here
			total += bounding;
	
			// Width for each column to use
			columns[ visibleColumns[i] ].sWidth = _fnStringToCss( bounding );
		}
	
		table.style.width = _fnStringToCss( total );
	
		// Finished with the table - ditch it
		holder.remove();
	
		// If there is a width attr, we want to attach an event listener which
		// allows the table sizing to automatically adjust when the window is
		// resized. Use the width attr rather than CSS, since we can't know if the
		// CSS is a relative value or absolute - DOM read is always px.
		if ( tableWidthAttr ) {
			table.style.width = _fnStringToCss( tableWidthAttr );
		}
	
		if ( (tableWidthAttr || scrollX) && ! settings._reszEvt ) {
			var bindResize = function () {
				$(window).on('resize.DT-'+settings.sInstance, DataTable.util.throttle( function () {
					if (! settings.bDestroying) {
						_fnAdjustColumnSizing( settings );
					}
				} ) );
			};
	
			bindResize();
	
			settings._reszEvt = true;
		}
	}
	
	
	/**
	 * Get the maximum strlen for each data column
	 *  @param {object} settings dataTables settings object
	 *  @param {int} colIdx column of interest
	 *  @returns {string} string of the max length
	 *  @memberof DataTable#oApi
	 */
	function _fnGetMaxLenString( settings, colIdx )
	{
		var column = settings.aoColumns[colIdx];
	
		if (! column.maxLenString) {
			var s, max='', maxLen = -1;
		
			for ( var i=0, ien=settings.aiDisplayMaster.length ; i<ien ; i++ ) {
				var rowIdx = settings.aiDisplayMaster[i];
				var data = _fnGetRowDisplay(settings, rowIdx)[colIdx];
	
				var cellString = data && typeof data === 'object' && data.nodeType
					? data.innerHTML
					: data+'';
	
				// Remove id / name attributes from elements so they
				// don't interfere with existing elements
				cellString = cellString
					.replace(/id=".*?"/g, '')
					.replace(/name=".*?"/g, '');
	
				s = _stripHtml(cellString)
					.replace( /&nbsp;/g, ' ' );
		
				if ( s.length > maxLen ) {
					// We want the HTML in the string, but the length that
					// is important is the stripped string
					max = cellString;
					maxLen = s.length;
				}
			}
	
			column.maxLenString = max;
		}
	
		return column.maxLenString;
	}
	
	
	/**
	 * Append a CSS unit (only if required) to a string
	 *  @param {string} value to css-ify
	 *  @returns {string} value with css unit
	 *  @memberof DataTable#oApi
	 */
	function _fnStringToCss( s )
	{
		if ( s === null ) {
			return '0px';
		}
	
		if ( typeof s == 'number' ) {
			return s < 0 ?
				'0px' :
				s+'px';
		}
	
		// Check it has a unit character already
		return s.match(/\d$/) ?
			s+'px' :
			s;
	}
	
	/**
	 * Re-insert the `col` elements for current visibility
	 *
	 * @param {*} settings DT settings
	 */
	function _colGroup( settings ) {
		var cols = settings.aoColumns;
	
		settings.colgroup.empty();
	
		for (i=0 ; i<cols.length ; i++) {
			if (cols[i].bVisible) {
				settings.colgroup.append(cols[i].colEl);
			}
		}
	}
	
	
	function _fnSortInit( settings ) {
		var target = settings.nTHead;
		var headerRows = target.querySelectorAll('tr');
		var legacyTop = settings.bSortCellsTop;
		var notSelector = ':not([data-dt-order="disable"]):not([data-dt-order="icon-only"])';
		
		// Legacy support for `orderCellsTop`
		if (legacyTop === true) {
			target = headerRows[0];
		}
		else if (legacyTop === false) {
			target = headerRows[ headerRows.length - 1 ];
		}
	
		_fnSortAttachListener(
			settings,
			target,
			target === settings.nTHead
				? 'tr'+notSelector+' th'+notSelector+', tr'+notSelector+' td'+notSelector
				: 'th'+notSelector+', td'+notSelector
		);
	
		// Need to resolve the user input array into our internal structure
		var order = [];
		_fnSortResolve( settings, order, settings.aaSorting );
	
		settings.aaSorting = order;
	}
	
	
	function _fnSortAttachListener(settings, node, selector, column, callback) {
		_fnBindAction( node, selector, function (e) {
			var run = false;
			var columns = column === undefined
				? _fnColumnsFromHeader( e.target )
				: [column];
	
			if ( columns.length ) {
				for ( var i=0, ien=columns.length ; i<ien ; i++ ) {
					var ret = _fnSortAdd( settings, columns[i], i, e.shiftKey );
	
					if (ret !== false) {
						run = true;
					}					
	
					// If the first entry is no sort, then subsequent
					// sort columns are ignored
					if (settings.aaSorting.length === 1 && settings.aaSorting[0][1] === '') {
						break;
					}
				}
	
				if (run) {
					_fnProcessingDisplay( settings, true );
	
					// Allow the processing display to show
					setTimeout( function () {
						_fnSort( settings );
						_fnSortDisplay( settings, settings.aiDisplay );
	
						// Sort processing done - redraw has its own processing display
						_fnProcessingDisplay( settings, false );
	
						_fnReDraw( settings, false, false );
	
						if (callback) {
							callback();
						}
					}, 0);
				}
			}
		} );
	}
	
	/**
	 * Sort the display array to match the master's order
	 * @param {*} settings
	 */
	function _fnSortDisplay(settings, display) {
		var master = settings.aiDisplayMaster;
		var masterMap = {};
		var map = {};
		var i;
	
		// Rather than needing an `indexOf` on master array, we can create a map
		for (i=0 ; i<master.length ; i++) {
			masterMap[master[i]] = i;
		}
	
		// And then cache what would be the indexOf fom the display
		for (i=0 ; i<display.length ; i++) {
			map[display[i]] = masterMap[display[i]];
		}
	
		display.sort(function(a, b){
			// Short version of this function is simply `master.indexOf(a) - master.indexOf(b);`
			return map[a] - map[b];
		});
	}
	
	
	function _fnSortResolve (settings, nestedSort, sort) {
		var push = function ( a ) {
			if ($.isPlainObject(a)) {
				if (a.idx !== undefined) {
					// Index based ordering
					nestedSort.push([a.idx, a.dir]);
				}
				else if (a.name) {
					// Name based ordering
					var cols = _pluck( settings.aoColumns, 'sName');
					var idx = cols.indexOf(a.name);
	
					if (idx !== -1) {
						nestedSort.push([idx, a.dir]);
					}
				}
			}
			else {
				// Plain column index and direction pair
				nestedSort.push(a);
			}
		};
	
		if ( $.isPlainObject(sort) ) {
			// Object
			push(sort);
		}
		else if ( sort.length && typeof sort[0] === 'number' ) {
			// 1D array
			push(sort);
		}
		else if ( sort.length ) {
			// 2D array
			for (var z=0; z<sort.length; z++) {
				push(sort[z]); // Object or array
			}
		}
	}
	
	
	function _fnSortFlatten ( settings )
	{
		var
			i, k, kLen,
			aSort = [],
			extSort = DataTable.ext.type.order,
			aoColumns = settings.aoColumns,
			aDataSort, iCol, sType, srcCol,
			fixed = settings.aaSortingFixed,
			fixedObj = $.isPlainObject( fixed ),
			nestedSort = [];
		
		if ( ! settings.oFeatures.bSort ) {
			return aSort;
		}
	
		// Build the sort array, with pre-fix and post-fix options if they have been
		// specified
		if ( Array.isArray( fixed ) ) {
			_fnSortResolve( settings, nestedSort, fixed );
		}
	
		if ( fixedObj && fixed.pre ) {
			_fnSortResolve( settings, nestedSort, fixed.pre );
		}
	
		_fnSortResolve( settings, nestedSort, settings.aaSorting );
	
		if (fixedObj && fixed.post ) {
			_fnSortResolve( settings, nestedSort, fixed.post );
		}
	
		for ( i=0 ; i<nestedSort.length ; i++ )
		{
			srcCol = nestedSort[i][0];
	
			if ( aoColumns[ srcCol ] ) {
				aDataSort = aoColumns[ srcCol ].aDataSort;
	
				for ( k=0, kLen=aDataSort.length ; k<kLen ; k++ )
				{
					iCol = aDataSort[k];
					sType = aoColumns[ iCol ].sType || 'string';
	
					if ( nestedSort[i]._idx === undefined ) {
						nestedSort[i]._idx = aoColumns[iCol].asSorting.indexOf(nestedSort[i][1]);
					}
	
					if ( nestedSort[i][1] ) {
						aSort.push( {
							src:       srcCol,
							col:       iCol,
							dir:       nestedSort[i][1],
							index:     nestedSort[i]._idx,
							type:      sType,
							formatter: extSort[ sType+"-pre" ],
							sorter:    extSort[ sType+"-"+nestedSort[i][1] ]
						} );
					}
				}
			}
		}
	
		return aSort;
	}
	
	/**
	 * Change the order of the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSort ( oSettings, col, dir )
	{
		var
			i, ien, iLen,
			aiOrig = [],
			extSort = DataTable.ext.type.order,
			aoData = oSettings.aoData,
			sortCol,
			displayMaster = oSettings.aiDisplayMaster,
			aSort;
	
		// Resolve any column types that are unknown due to addition or invalidation
		// @todo Can this be moved into a 'data-ready' handler which is called when
		//   data is going to be used in the table?
		_fnColumnTypes( oSettings );
	
		// Allow a specific column to be sorted, which will _not_ alter the display
		// master
		if (col !== undefined) {
			var srcCol = oSettings.aoColumns[col];
			aSort = [{
				src:       col,
				col:       col,
				dir:       dir,
				index:     0,
				type:      srcCol.sType,
				formatter: extSort[ srcCol.sType+"-pre" ],
				sorter:    extSort[ srcCol.sType+"-"+dir ]
			}];
			displayMaster = displayMaster.slice();
		}
		else {
			aSort = _fnSortFlatten( oSettings );
		}
	
		for ( i=0, ien=aSort.length ; i<ien ; i++ ) {
			sortCol = aSort[i];
	
			// Load the data needed for the sort, for each cell
			_fnSortData( oSettings, sortCol.col );
		}
	
		/* No sorting required if server-side or no sorting array */
		if ( _fnDataSource( oSettings ) != 'ssp' && aSort.length !== 0 )
		{
			// Reset the initial positions on each pass so we get a stable sort
			for ( i=0, iLen=displayMaster.length ; i<iLen ; i++ ) {
				aiOrig[ i ] = i;
			}
	
			// If the first sort is desc, then reverse the array to preserve original
			// order, just in reverse
			if (aSort.length && aSort[0].dir === 'desc') {
				aiOrig.reverse();
			}
	
			/* Do the sort - here we want multi-column sorting based on a given data source (column)
			 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
			 * follow on it's own, but this is what we want (example two column sorting):
			 *  fnLocalSorting = function(a,b){
			 *    var test;
			 *    test = oSort['string-asc']('data11', 'data12');
			 *      if (test !== 0)
			 *        return test;
			 *    test = oSort['numeric-desc']('data21', 'data22');
			 *    if (test !== 0)
			 *      return test;
			 *    return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
			 *  }
			 * Basically we have a test for each sorting column, if the data in that column is equal,
			 * test the next column. If all columns match, then we use a numeric sort on the row
			 * positions in the original data array to provide a stable sort.
			 */
			displayMaster.sort( function ( a, b ) {
				var
					x, y, k, test, sort,
					len=aSort.length,
					dataA = aoData[a]._aSortData,
					dataB = aoData[b]._aSortData;
	
				for ( k=0 ; k<len ; k++ ) {
					sort = aSort[k];
	
					// Data, which may have already been through a `-pre` function
					x = dataA[ sort.col ];
					y = dataB[ sort.col ];
	
					if (sort.sorter) {
						// If there is a custom sorter (`-asc` or `-desc`) for this
						// data type, use it
						test = sort.sorter(x, y);
	
						if ( test !== 0 ) {
							return test;
						}
					}
					else {
						// Otherwise, use generic sorting
						test = x<y ? -1 : x>y ? 1 : 0;
	
						if ( test !== 0 ) {
							return sort.dir === 'asc' ? test : -test;
						}
					}
				}
	
				x = aiOrig[a];
				y = aiOrig[b];
	
				return x<y ? -1 : x>y ? 1 : 0;
			} );
		}
		else if ( aSort.length === 0 ) {
			// Apply index order
			displayMaster.sort(function (x, y) {
				return x<y ? -1 : x>y ? 1 : 0;
			});
		}
	
		if (col === undefined) {
			// Tell the draw function that we have sorted the data
			oSettings.bSorted = true;
	
			_fnCallbackFire( oSettings, null, 'order', [oSettings, aSort] );
		}
	
		return displayMaster;
	}
	
	
	/**
	 * Function to run on user sort request
	 *  @param {object} settings dataTables settings object
	 *  @param {node} attachTo node to attach the handler to
	 *  @param {int} colIdx column sorting index
	 *  @param {int} addIndex Counter
	 *  @param {boolean} [shift=false] Shift click add
	 *  @param {function} [callback] callback function
	 *  @memberof DataTable#oApi
	 */
	function _fnSortAdd ( settings, colIdx, addIndex, shift )
	{
		var col = settings.aoColumns[ colIdx ];
		var sorting = settings.aaSorting;
		var asSorting = col.asSorting;
		var nextSortIdx;
		var next = function ( a, overflow ) {
			var idx = a._idx;
			if ( idx === undefined ) {
				idx = asSorting.indexOf(a[1]);
			}
	
			return idx+1 < asSorting.length ?
				idx+1 :
				overflow ?
					null :
					0;
		};
	
		if ( ! col.bSortable ) {
			return false;
		}
	
		// Convert to 2D array if needed
		if ( typeof sorting[0] === 'number' ) {
			sorting = settings.aaSorting = [ sorting ];
		}
	
		// If appending the sort then we are multi-column sorting
		if ( (shift || addIndex) && settings.oFeatures.bSortMulti ) {
			// Are we already doing some kind of sort on this column?
			var sortIdx = _pluck(sorting, '0').indexOf(colIdx);
	
			if ( sortIdx !== -1 ) {
				// Yes, modify the sort
				nextSortIdx = next( sorting[sortIdx], true );
	
				if ( nextSortIdx === null && sorting.length === 1 ) {
					nextSortIdx = 0; // can't remove sorting completely
				}
	
				if ( nextSortIdx === null ) {
					sorting.splice( sortIdx, 1 );
				}
				else {
					sorting[sortIdx][1] = asSorting[ nextSortIdx ];
					sorting[sortIdx]._idx = nextSortIdx;
				}
			}
			else if (shift) {
				// No sort on this column yet, being added by shift click
				// add it as itself
				sorting.push( [ colIdx, asSorting[0], 0 ] );
				sorting[sorting.length-1]._idx = 0;
			}
			else {
				// No sort on this column yet, being added from a colspan
				// so add with same direction as first column
				sorting.push( [ colIdx, sorting[0][1], 0 ] );
				sorting[sorting.length-1]._idx = 0;
			}
		}
		else if ( sorting.length && sorting[0][0] == colIdx ) {
			// Single column - already sorting on this column, modify the sort
			nextSortIdx = next( sorting[0] );
	
			sorting.length = 1;
			sorting[0][1] = asSorting[ nextSortIdx ];
			sorting[0]._idx = nextSortIdx;
		}
		else {
			// Single column - sort only on this column
			sorting.length = 0;
			sorting.push( [ colIdx, asSorting[0] ] );
			sorting[0]._idx = 0;
		}
	}
	
	
	/**
	 * Set the sorting classes on table's body, Note: it is safe to call this function
	 * when bSort and bSortClasses are false
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSortingClasses( settings )
	{
		var oldSort = settings.aLastSort;
		var sortClass = settings.oClasses.order.position;
		var sort = _fnSortFlatten( settings );
		var features = settings.oFeatures;
		var i, ien, colIdx;
	
		if ( features.bSort && features.bSortClasses ) {
			// Remove old sorting classes
			for ( i=0, ien=oldSort.length ; i<ien ; i++ ) {
				colIdx = oldSort[i].src;
	
				// Remove column sorting
				$( _pluck( settings.aoData, 'anCells', colIdx ) )
					.removeClass( sortClass + (i<2 ? i+1 : 3) );
			}
	
			// Add new column sorting
			for ( i=0, ien=sort.length ; i<ien ; i++ ) {
				colIdx = sort[i].src;
	
				$( _pluck( settings.aoData, 'anCells', colIdx ) )
					.addClass( sortClass + (i<2 ? i+1 : 3) );
			}
		}
	
		settings.aLastSort = sort;
	}
	
	
	// Get the data to sort a column, be it from cache, fresh (populating the
	// cache), or from a sort formatter
	function _fnSortData( settings, colIdx )
	{
		// Custom sorting function - provided by the sort data type
		var column = settings.aoColumns[ colIdx ];
		var customSort = DataTable.ext.order[ column.sSortDataType ];
		var customData;
	
		if ( customSort ) {
			customData = customSort.call( settings.oInstance, settings, colIdx,
				_fnColumnIndexToVisible( settings, colIdx )
			);
		}
	
		// Use / populate cache
		var row, cellData;
		var formatter = DataTable.ext.type.order[ column.sType+"-pre" ];
		var data = settings.aoData;
	
		for ( var rowIdx=0 ; rowIdx<data.length ; rowIdx++ ) {
			// Sparse array
			if (! data[rowIdx]) {
				continue;
			}
	
			row = data[rowIdx];
	
			if ( ! row._aSortData ) {
				row._aSortData = [];
			}
	
			if ( ! row._aSortData[colIdx] || customSort ) {
				cellData = customSort ?
					customData[rowIdx] : // If there was a custom sort function, use data from there
					_fnGetCellData( settings, rowIdx, colIdx, 'sort' );
	
				row._aSortData[ colIdx ] = formatter ?
					formatter( cellData, settings ) :
					cellData;
			}
		}
	}
	
	
	/**
	 * State information for a table
	 *
	 * @param {*} settings
	 * @returns State object
	 */
	function _fnSaveState ( settings )
	{
		if (settings._bLoadingState) {
			return;
		}
	
		/* Store the interesting variables */
		var state = {
			time:    +new Date(),
			start:   settings._iDisplayStart,
			length:  settings._iDisplayLength,
			order:   $.extend( true, [], settings.aaSorting ),
			search:  $.extend({}, settings.oPreviousSearch),
			columns: settings.aoColumns.map( function ( col, i ) {
				return {
					visible: col.bVisible,
					search: $.extend({}, settings.aoPreSearchCols[i])
				};
			} )
		};
	
		settings.oSavedState = state;
		_fnCallbackFire( settings, "aoStateSaveParams", 'stateSaveParams', [settings, state] );
		
		if ( settings.oFeatures.bStateSave && !settings.bDestroying )
		{
			settings.fnStateSaveCallback.call( settings.oInstance, settings, state );
		}	
	}
	
	
	/**
	 * Attempt to load a saved table state
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} oInit DataTables init object so we can override settings
	 *  @param {function} callback Callback to execute when the state has been loaded
	 *  @memberof DataTable#oApi
	 */
	function _fnLoadState ( settings, init, callback )
	{
		if ( ! settings.oFeatures.bStateSave ) {
			callback();
			return;
		}
	
		var loaded = function(state) {
			_fnImplementState(settings, state, callback);
		}
	
		var state = settings.fnStateLoadCallback.call( settings.oInstance, settings, loaded );
	
		if ( state !== undefined ) {
			_fnImplementState( settings, state, callback );
		}
		// otherwise, wait for the loaded callback to be executed
	
		return true;
	}
	
	function _fnImplementState ( settings, s, callback) {
		var i, ien;
		var columns = settings.aoColumns;
		settings._bLoadingState = true;
	
		// When StateRestore was introduced the state could now be implemented at any time
		// Not just initialisation. To do this an api instance is required in some places
		var api = settings._bInitComplete ? new DataTable.Api(settings) : null;
	
		if ( ! s || ! s.time ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Reject old data
		var duration = settings.iStateDuration;
		if ( duration > 0 && s.time < +new Date() - (duration*1000) ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Allow custom and plug-in manipulation functions to alter the saved data set and
		// cancelling of loading by returning false
		var abStateLoad = _fnCallbackFire( settings, 'aoStateLoadParams', 'stateLoadParams', [settings, s] );
		if ( abStateLoad.indexOf(false) !== -1 ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Number of columns have changed - all bets are off, no restore of settings
		if ( s.columns && columns.length !== s.columns.length ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Store the saved state so it might be accessed at any time
		settings.oLoadedState = $.extend( true, {}, s );
	
		// This is needed for ColReorder, which has to happen first to allow all
		// the stored indexes to be usable. It is not publicly documented.
		_fnCallbackFire( settings, null, 'stateLoadInit', [settings, s], true );
	
		// Page Length
		if ( s.length !== undefined ) {
			// If already initialised just set the value directly so that the select element is also updated
			if (api) {
				api.page.len(s.length)
			}
			else {
				settings._iDisplayLength   = s.length;
			}
		}
	
		// Restore key features - todo - for 1.11 this needs to be done by
		// subscribed events
		if ( s.start !== undefined ) {
			if(api === null) {
				settings._iDisplayStart    = s.start;
				settings.iInitDisplayStart = s.start;
			}
			else {
				_fnPageChange(settings, s.start/settings._iDisplayLength);
			}
		}
	
		// Order
		if ( s.order !== undefined ) {
			settings.aaSorting = [];
			$.each( s.order, function ( i, col ) {
				settings.aaSorting.push( col[0] >= columns.length ?
					[ 0, col[1] ] :
					col
				);
			} );
		}
	
		// Search
		if ( s.search !== undefined ) {
			$.extend( settings.oPreviousSearch, s.search );
		}
	
		// Columns
		if ( s.columns ) {
			for ( i=0, ien=s.columns.length ; i<ien ; i++ ) {
				var col = s.columns[i];
	
				// Visibility
				if ( col.visible !== undefined ) {
					// If the api is defined, the table has been initialised so we need to use it rather than internal settings
					if (api) {
						// Don't redraw the columns on every iteration of this loop, we will do this at the end instead
						api.column(i).visible(col.visible, false);
					}
					else {
						columns[i].bVisible = col.visible;
					}
				}
	
				// Search
				if ( col.search !== undefined ) {
					$.extend( settings.aoPreSearchCols[i], col.search );
				}
			}
			
			// If the api is defined then we need to adjust the columns once the visibility has been changed
			if (api) {
				api.columns.adjust();
			}
		}
	
		settings._bLoadingState = false;
		_fnCallbackFire( settings, 'aoStateLoaded', 'stateLoaded', [settings, s] );
		callback();
	}
	
	/**
	 * Log an error message
	 *  @param {object} settings dataTables settings object
	 *  @param {int} level log error messages, or display them to the user
	 *  @param {string} msg error message
	 *  @param {int} tn Technical note id to get more information about the error.
	 *  @memberof DataTable#oApi
	 */
	function _fnLog( settings, level, msg, tn )
	{
		msg = 'DataTables warning: '+
			(settings ? 'table id='+settings.sTableId+' - ' : '')+msg;
	
		if ( tn ) {
			msg += '. For more information about this error, please see '+
			'https://datatables.net/tn/'+tn;
		}
	
		if ( ! level  ) {
			// Backwards compatibility pre 1.10
			var ext = DataTable.ext;
			var type = ext.sErrMode || ext.errMode;
	
			if ( settings ) {
				_fnCallbackFire( settings, null, 'dt-error', [ settings, tn, msg ], true );
			}
	
			if ( type == 'alert' ) {
				alert( msg );
			}
			else if ( type == 'throw' ) {
				throw new Error(msg);
			}
			else if ( typeof type == 'function' ) {
				type( settings, tn, msg );
			}
		}
		else if ( window.console && console.log ) {
			console.log( msg );
		}
	}
	
	
	/**
	 * See if a property is defined on one object, if so assign it to the other object
	 *  @param {object} ret target object
	 *  @param {object} src source object
	 *  @param {string} name property
	 *  @param {string} [mappedName] name to map too - optional, name used if not given
	 *  @memberof DataTable#oApi
	 */
	function _fnMap( ret, src, name, mappedName )
	{
		if ( Array.isArray( name ) ) {
			$.each( name, function (i, val) {
				if ( Array.isArray( val ) ) {
					_fnMap( ret, src, val[0], val[1] );
				}
				else {
					_fnMap( ret, src, val );
				}
			} );
	
			return;
		}
	
		if ( mappedName === undefined ) {
			mappedName = name;
		}
	
		if ( src[name] !== undefined ) {
			ret[mappedName] = src[name];
		}
	}
	
	
	/**
	 * Extend objects - very similar to jQuery.extend, but deep copy objects, and
	 * shallow copy arrays. The reason we need to do this, is that we don't want to
	 * deep copy array init values (such as aaSorting) since the dev wouldn't be
	 * able to override them, but we do want to deep copy arrays.
	 *  @param {object} out Object to extend
	 *  @param {object} extender Object from which the properties will be applied to
	 *      out
	 *  @param {boolean} breakRefs If true, then arrays will be sliced to take an
	 *      independent copy with the exception of the `data` or `aaData` parameters
	 *      if they are present. This is so you can pass in a collection to
	 *      DataTables and have that used as your data source without breaking the
	 *      references
	 *  @returns {object} out Reference, just for convenience - out === the return.
	 *  @memberof DataTable#oApi
	 *  @todo This doesn't take account of arrays inside the deep copied objects.
	 */
	function _fnExtend( out, extender, breakRefs )
	{
		var val;
	
		for ( var prop in extender ) {
			if ( Object.prototype.hasOwnProperty.call(extender, prop) ) {
				val = extender[prop];
	
				if ( $.isPlainObject( val ) ) {
					if ( ! $.isPlainObject( out[prop] ) ) {
						out[prop] = {};
					}
					$.extend( true, out[prop], val );
				}
				else if ( breakRefs && prop !== 'data' && prop !== 'aaData' && Array.isArray(val) ) {
					out[prop] = val.slice();
				}
				else {
					out[prop] = val;
				}
			}
		}
	
		return out;
	}
	
	
	/**
	 * Bind an event handers to allow a click or return key to activate the callback.
	 * This is good for accessibility since a return on the keyboard will have the
	 * same effect as a click, if the element has focus.
	 *  @param {element} n Element to bind the action to
	 *  @param {object|string} selector Selector (for delegated events) or data object
	 *   to pass to the triggered function
	 *  @param {function} fn Callback function for when the event is triggered
	 *  @memberof DataTable#oApi
	 */
	function _fnBindAction( n, selector, fn )
	{
		$(n)
			.on( 'click.DT', selector, function (e) {
				fn(e);
			} )
			.on( 'keypress.DT', selector, function (e){
				if ( e.which === 13 ) {
					e.preventDefault();
					fn(e);
				}
			} )
			.on( 'selectstart.DT', selector, function () {
				// Don't want a double click resulting in text selection
				return false;
			} );
	}
	
	
	/**
	 * Register a callback function. Easily allows a callback function to be added to
	 * an array store of callback functions that can then all be called together.
	 *  @param {object} settings dataTables settings object
	 *  @param {string} store Name of the array storage for the callbacks in oSettings
	 *  @param {function} fn Function to be called back
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackReg( settings, store, fn )
	{
		if ( fn ) {
			settings[store].push(fn);
		}
	}
	
	
	/**
	 * Fire callback functions and trigger events. Note that the loop over the
	 * callback array store is done backwards! Further note that you do not want to
	 * fire off triggers in time sensitive applications (for example cell creation)
	 * as its slow.
	 *  @param {object} settings dataTables settings object
	 *  @param {string} callbackArr Name of the array storage for the callbacks in
	 *      oSettings
	 *  @param {string} eventName Name of the jQuery custom event to trigger. If
	 *      null no trigger is fired
	 *  @param {array} args Array of arguments to pass to the callback function /
	 *      trigger
	 *  @param {boolean} [bubbles] True if the event should bubble
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackFire( settings, callbackArr, eventName, args, bubbles )
	{
		var ret = [];
	
		if ( callbackArr ) {
			ret = settings[callbackArr].slice().reverse().map( function (val) {
				return val.apply( settings.oInstance, args );
			} );
		}
	
		if ( eventName !== null) {
			var e = $.Event( eventName+'.dt' );
			var table = $(settings.nTable);
			
			// Expose the DataTables API on the event object for easy access
			e.dt = settings.api;
	
			table[bubbles ?  'trigger' : 'triggerHandler']( e, args );
	
			// If not yet attached to the document, trigger the event
			// on the body directly to sort of simulate the bubble
			if (bubbles && table.parents('body').length === 0) {
				$('body').trigger( e, args );
			}
	
			ret.push( e.result );
		}
	
		return ret;
	}
	
	
	function _fnLengthOverflow ( settings )
	{
		var
			start = settings._iDisplayStart,
			end = settings.fnDisplayEnd(),
			len = settings._iDisplayLength;
	
		/* If we have space to show extra rows (backing up from the end point - then do so */
		if ( start >= end )
		{
			start = end - len;
		}
	
		// Keep the start record on the current page
		start -= (start % len);
	
		if ( len === -1 || start < 0 )
		{
			start = 0;
		}
	
		settings._iDisplayStart = start;
	}
	
	
	function _fnRenderer( settings, type )
	{
		var renderer = settings.renderer;
		var host = DataTable.ext.renderer[type];
	
		if ( $.isPlainObject( renderer ) && renderer[type] ) {
			// Specific renderer for this type. If available use it, otherwise use
			// the default.
			return host[renderer[type]] || host._;
		}
		else if ( typeof renderer === 'string' ) {
			// Common renderer - if there is one available for this type use it,
			// otherwise use the default
			return host[renderer] || host._;
		}
	
		// Use the default
		return host._;
	}
	
	
	/**
	 * Detect the data source being used for the table. Used to simplify the code
	 * a little (ajax) and to make it compress a little smaller.
	 *
	 *  @param {object} settings dataTables settings object
	 *  @returns {string} Data source
	 *  @memberof DataTable#oApi
	 */
	function _fnDataSource ( settings )
	{
		if ( settings.oFeatures.bServerSide ) {
			return 'ssp';
		}
		else if ( settings.ajax ) {
			return 'ajax';
		}
		return 'dom';
	}
	
	/**
	 * Common replacement for language strings
	 *
	 * @param {*} settings DT settings object
	 * @param {*} str String with values to replace
	 * @param {*} entries Plural number for _ENTRIES_ - can be undefined
	 * @returns String
	 */
	function _fnMacros ( settings, str, entries )
	{
		// When infinite scrolling, we are always starting at 1. _iDisplayStart is
		// used only internally
		var
			formatter  = settings.fnFormatNumber,
			start      = settings._iDisplayStart+1,
			len        = settings._iDisplayLength,
			vis        = settings.fnRecordsDisplay(),
			max        = settings.fnRecordsTotal(),
			all        = len === -1;
	
		return str.
			replace(/_START_/g, formatter.call( settings, start ) ).
			replace(/_END_/g,   formatter.call( settings, settings.fnDisplayEnd() ) ).
			replace(/_MAX_/g,   formatter.call( settings, max ) ).
			replace(/_TOTAL_/g, formatter.call( settings, vis ) ).
			replace(/_PAGE_/g,  formatter.call( settings, all ? 1 : Math.ceil( start / len ) ) ).
			replace(/_PAGES_/g, formatter.call( settings, all ? 1 : Math.ceil( vis / len ) ) ).
			replace(/_ENTRIES_/g, settings.api.i18n('entries', '', entries) ).
			replace(/_ENTRIES-MAX_/g, settings.api.i18n('entries', '', max) ).
			replace(/_ENTRIES-TOTAL_/g, settings.api.i18n('entries', '', vis) );
	}
	
	
	
	/**
	 * Computed structure of the DataTables API, defined by the options passed to
	 * `DataTable.Api.register()` when building the API.
	 *
	 * The structure is built in order to speed creation and extension of the Api
	 * objects since the extensions are effectively pre-parsed.
	 *
	 * The array is an array of objects with the following structure, where this
	 * base array represents the Api prototype base:
	 *
	 *     [
	 *       {
	 *         name:      'data'                -- string   - Property name
	 *         val:       function () {},       -- function - Api method (or undefined if just an object
	 *         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	 *         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	 *       },
	 *       {
	 *         name:     'row'
	 *         val:       {},
	 *         methodExt: [ ... ],
	 *         propExt:   [
	 *           {
	 *             name:      'data'
	 *             val:       function () {},
	 *             methodExt: [ ... ],
	 *             propExt:   [ ... ]
	 *           },
	 *           ...
	 *         ]
	 *       }
	 *     ]
	 *
	 * @type {Array}
	 * @ignore
	 */
	var __apiStruct = [];
	
	
	/**
	 * `Array.prototype` reference.
	 *
	 * @type object
	 * @ignore
	 */
	var __arrayProto = Array.prototype;
	
	
	/**
	 * Abstraction for `context` parameter of the `Api` constructor to allow it to
	 * take several different forms for ease of use.
	 *
	 * Each of the input parameter types will be converted to a DataTables settings
	 * object where possible.
	 *
	 * @param  {string|node|jQuery|object} mixed DataTable identifier. Can be one
	 *   of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 *   * `DataTables.Api` - API instance
	 * @return {array|null} Matching DataTables settings objects. `null` or
	 *   `undefined` is returned if no matching DataTable is found.
	 * @ignore
	 */
	var _toSettings = function ( mixed )
	{
		var idx, jq;
		var settings = DataTable.settings;
		var tables = _pluck(settings, 'nTable');
	
		if ( ! mixed ) {
			return [];
		}
		else if ( mixed.nTable && mixed.oFeatures ) {
			// DataTables settings object
			return [ mixed ];
		}
		else if ( mixed.nodeName && mixed.nodeName.toLowerCase() === 'table' ) {
			// Table node
			idx = tables.indexOf(mixed);
			return idx !== -1 ? [ settings[idx] ] : null;
		}
		else if ( mixed && typeof mixed.settings === 'function' ) {
			return mixed.settings().toArray();
		}
		else if ( typeof mixed === 'string' ) {
			// jQuery selector
			jq = $(mixed).get();
		}
		else if ( mixed instanceof $ ) {
			// jQuery object (also DataTables instance)
			jq = mixed.get();
		}
	
		if ( jq ) {
			return settings.filter(function (v, idx) {
				return jq.includes(tables[idx]);
			});
		}
	};
	
	
	/**
	 * DataTables API class - used to control and interface with  one or more
	 * DataTables enhanced tables.
	 *
	 * The API class is heavily based on jQuery, presenting a chainable interface
	 * that you can use to interact with tables. Each instance of the API class has
	 * a "context" - i.e. the tables that it will operate on. This could be a single
	 * table, all tables on a page or a sub-set thereof.
	 *
	 * Additionally the API is designed to allow you to easily work with the data in
	 * the tables, retrieving and manipulating it as required. This is done by
	 * presenting the API class as an array like interface. The contents of the
	 * array depend upon the actions requested by each method (for example
	 * `rows().nodes()` will return an array of nodes, while `rows().data()` will
	 * return an array of objects or arrays depending upon your table's
	 * configuration). The API object has a number of array like methods (`push`,
	 * `pop`, `reverse` etc) as well as additional helper methods (`each`, `pluck`,
	 * `unique` etc) to assist your working with the data held in a table.
	 *
	 * Most methods (those which return an Api instance) are chainable, which means
	 * the return from a method call also has all of the methods available that the
	 * top level object had. For example, these two calls are equivalent:
	 *
	 *     // Not chained
	 *     api.row.add( {...} );
	 *     api.draw();
	 *
	 *     // Chained
	 *     api.row.add( {...} ).draw();
	 *
	 * @class DataTable.Api
	 * @param {array|object|string|jQuery} context DataTable identifier. This is
	 *   used to define which DataTables enhanced tables this API will operate on.
	 *   Can be one of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 * @param {array} [data] Data to initialise the Api instance with.
	 *
	 * @example
	 *   // Direct initialisation during DataTables construction
	 *   var api = $('#example').DataTable();
	 *
	 * @example
	 *   // Initialisation using a DataTables jQuery object
	 *   var api = $('#example').dataTable().api();
	 *
	 * @example
	 *   // Initialisation as a constructor
	 *   var api = new DataTable.Api( 'table.dataTable' );
	 */
	_Api = function ( context, data )
	{
		if ( ! (this instanceof _Api) ) {
			return new _Api( context, data );
		}
	
		var settings = [];
		var ctxSettings = function ( o ) {
			var a = _toSettings( o );
			if ( a ) {
				settings.push.apply( settings, a );
			}
		};
	
		if ( Array.isArray( context ) ) {
			for ( var i=0, ien=context.length ; i<ien ; i++ ) {
				ctxSettings( context[i] );
			}
		}
		else {
			ctxSettings( context );
		}
	
		// Remove duplicates
		this.context = settings.length > 1
			? _unique( settings )
			: settings;
	
		// Initial data
		if ( data ) {
			this.push.apply(this, data);
		}
	
		// selector
		this.selector = {
			rows: null,
			cols: null,
			opts: null
		};
	
		_Api.extend( this, this, __apiStruct );
	};
	
	DataTable.Api = _Api;
	
	// Don't destroy the existing prototype, just extend it. Required for jQuery 2's
	// isPlainObject.
	$.extend( _Api.prototype, {
		any: function ()
		{
			return this.count() !== 0;
		},
	
		context: [], // array of table settings objects
	
		count: function ()
		{
			return this.flatten().length;
		},
	
		each: function ( fn )
		{
			for ( var i=0, ien=this.length ; i<ien; i++ ) {
				fn.call( this, this[i], i, this );
			}
	
			return this;
		},
	
		eq: function ( idx )
		{
			var ctx = this.context;
	
			return ctx.length > idx ?
				new _Api( ctx[idx], this[idx] ) :
				null;
		},
	
		filter: function ( fn )
		{
			var a = __arrayProto.filter.call( this, fn, this );
	
			return new _Api( this.context, a );
		},
	
		flatten: function ()
		{
			var a = [];
	
			return new _Api( this.context, a.concat.apply( a, this.toArray() ) );
		},
	
		get: function ( idx )
		{
			return this[ idx ];
		},
	
		join:    __arrayProto.join,
	
		includes: function ( find ) {
			return this.indexOf( find ) === -1 ? false : true;
		},
	
		indexOf: __arrayProto.indexOf,
	
		iterator: function ( flatten, type, fn, alwaysNew ) {
			var
				a = [], ret,
				i, ien, j, jen,
				context = this.context,
				rows, items, item,
				selector = this.selector;
	
			// Argument shifting
			if ( typeof flatten === 'string' ) {
				alwaysNew = fn;
				fn = type;
				type = flatten;
				flatten = false;
			}
	
			for ( i=0, ien=context.length ; i<ien ; i++ ) {
				var apiInst = new _Api( context[i] );
	
				if ( type === 'table' ) {
					ret = fn.call( apiInst, context[i], i );
	
					if ( ret !== undefined ) {
						a.push( ret );
					}
				}
				else if ( type === 'columns' || type === 'rows' ) {
					// this has same length as context - one entry for each table
					ret = fn.call( apiInst, context[i], this[i], i );
	
					if ( ret !== undefined ) {
						a.push( ret );
					}
				}
				else if ( type === 'every' || type === 'column' || type === 'column-rows' || type === 'row' || type === 'cell' ) {
					// columns and rows share the same structure.
					// 'this' is an array of column indexes for each context
					items = this[i];
	
					if ( type === 'column-rows' ) {
						rows = _selector_row_indexes( context[i], selector.opts );
					}
	
					for ( j=0, jen=items.length ; j<jen ; j++ ) {
						item = items[j];
	
						if ( type === 'cell' ) {
							ret = fn.call( apiInst, context[i], item.row, item.column, i, j );
						}
						else {
							ret = fn.call( apiInst, context[i], item, i, j, rows );
						}
	
						if ( ret !== undefined ) {
							a.push( ret );
						}
					}
				}
			}
	
			if ( a.length || alwaysNew ) {
				var api = new _Api( context, flatten ? a.concat.apply( [], a ) : a );
				var apiSelector = api.selector;
				apiSelector.rows = selector.rows;
				apiSelector.cols = selector.cols;
				apiSelector.opts = selector.opts;
				return api;
			}
			return this;
		},
	
		lastIndexOf: __arrayProto.lastIndexOf,
	
		length:  0,
	
		map: function ( fn )
		{
			var a = __arrayProto.map.call( this, fn, this );
	
			return new _Api( this.context, a );
		},
	
		pluck: function ( prop )
		{
			var fn = DataTable.util.get(prop);
	
			return this.map( function ( el ) {
				return fn(el);
			} );
		},
	
		pop:     __arrayProto.pop,
	
		push:    __arrayProto.push,
	
		reduce: __arrayProto.reduce,
	
		reduceRight: __arrayProto.reduceRight,
	
		reverse: __arrayProto.reverse,
	
		// Object with rows, columns and opts
		selector: null,
	
		shift:   __arrayProto.shift,
	
		slice: function () {
			return new _Api( this.context, this );
		},
	
		sort:    __arrayProto.sort,
	
		splice:  __arrayProto.splice,
	
		toArray: function ()
		{
			return __arrayProto.slice.call( this );
		},
	
		to$: function ()
		{
			return $( this );
		},
	
		toJQuery: function ()
		{
			return $( this );
		},
	
		unique: function ()
		{
			return new _Api( this.context, _unique(this.toArray()) );
		},
	
		unshift: __arrayProto.unshift
	} );
	
	
	function _api_scope( scope, fn, struc ) {
		return function () {
			var ret = fn.apply( scope || this, arguments );
	
			// Method extension
			_Api.extend( ret, ret, struc.methodExt );
			return ret;
		};
	}
	
	function _api_find( src, name ) {
		for ( var i=0, ien=src.length ; i<ien ; i++ ) {
			if ( src[i].name === name ) {
				return src[i];
			}
		}
		return null;
	}
	
	window.__apiStruct = __apiStruct;
	
	_Api.extend = function ( scope, obj, ext )
	{
		// Only extend API instances and static properties of the API
		if ( ! ext.length || ! obj || ( ! (obj instanceof _Api) && ! obj.__dt_wrapper ) ) {
			return;
		}
	
		var
			i, ien,
			struct;
	
		for ( i=0, ien=ext.length ; i<ien ; i++ ) {
			struct = ext[i];
	
			if (struct.name === '__proto__') {
				continue;
			}
	
			// Value
			obj[ struct.name ] = struct.type === 'function' ?
				_api_scope( scope, struct.val, struct ) :
				struct.type === 'object' ?
					{} :
					struct.val;
	
			obj[ struct.name ].__dt_wrapper = true;
	
			// Property extension
			_Api.extend( scope, obj[ struct.name ], struct.propExt );
		}
	};
	
	//     [
	//       {
	//         name:      'data'                -- string   - Property name
	//         val:       function () {},       -- function - Api method (or undefined if just an object
	//         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	//         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	//       },
	//       {
	//         name:     'row'
	//         val:       {},
	//         methodExt: [ ... ],
	//         propExt:   [
	//           {
	//             name:      'data'
	//             val:       function () {},
	//             methodExt: [ ... ],
	//             propExt:   [ ... ]
	//           },
	//           ...
	//         ]
	//       }
	//     ]
	
	
	_Api.register = _api_register = function ( name, val )
	{
		if ( Array.isArray( name ) ) {
			for ( var j=0, jen=name.length ; j<jen ; j++ ) {
				_Api.register( name[j], val );
			}
			return;
		}
	
		var
			i, ien,
			heir = name.split('.'),
			struct = __apiStruct,
			key, method;
	
		for ( i=0, ien=heir.length ; i<ien ; i++ ) {
			method = heir[i].indexOf('()') !== -1;
			key = method ?
				heir[i].replace('()', '') :
				heir[i];
	
			var src = _api_find( struct, key );
			if ( ! src ) {
				src = {
					name:      key,
					val:       {},
					methodExt: [],
					propExt:   [],
					type:      'object'
				};
				struct.push( src );
			}
	
			if ( i === ien-1 ) {
				src.val = val;
				src.type = typeof val === 'function' ?
					'function' :
					$.isPlainObject( val ) ?
						'object' :
						'other';
			}
			else {
				struct = method ?
					src.methodExt :
					src.propExt;
			}
		}
	};
	
	_Api.registerPlural = _api_registerPlural = function ( pluralName, singularName, val ) {
		_Api.register( pluralName, val );
	
		_Api.register( singularName, function () {
			var ret = val.apply( this, arguments );
	
			if ( ret === this ) {
				// Returned item is the API instance that was passed in, return it
				return this;
			}
			else if ( ret instanceof _Api ) {
				// New API instance returned, want the value from the first item
				// in the returned array for the singular result.
				return ret.length ?
					Array.isArray( ret[0] ) ?
						new _Api( ret.context, ret[0] ) : // Array results are 'enhanced'
						ret[0] :
					undefined;
			}
	
			// Non-API return - just fire it back
			return ret;
		} );
	};
	
	
	/**
	 * Selector for HTML tables. Apply the given selector to the give array of
	 * DataTables settings objects.
	 *
	 * @param {string|integer} [selector] jQuery selector string or integer
	 * @param  {array} Array of DataTables settings objects to be filtered
	 * @return {array}
	 * @ignore
	 */
	var __table_selector = function ( selector, a )
	{
		if ( Array.isArray(selector) ) {
			var result = [];
	
			selector.forEach(function (sel) {
				var inner = __table_selector(sel, a);
	
				result.push.apply(result, inner);
			});
	
			return result.filter( function (item) {
				return item;
			});
		}
	
		// Integer is used to pick out a table by index
		if ( typeof selector === 'number' ) {
			return [ a[ selector ] ];
		}
	
		// Perform a jQuery selector on the table nodes
		var nodes = a.map( function (el) {
			return el.nTable;
		} );
	
		return $(nodes)
			.filter( selector )
			.map( function () {
				// Need to translate back from the table node to the settings
				var idx = nodes.indexOf(this);
				return a[ idx ];
			} )
			.toArray();
	};
	
	
	
	/**
	 * Context selector for the API's context (i.e. the tables the API instance
	 * refers to.
	 *
	 * @name    DataTable.Api#tables
	 * @param {string|integer} [selector] Selector to pick which tables the iterator
	 *   should operate on. If not given, all tables in the current context are
	 *   used. This can be given as a jQuery selector (for example `':gt(0)'`) to
	 *   select multiple tables or as an integer to select a single table.
	 * @returns {DataTable.Api} Returns a new API instance if a selector is given.
	 */
	_api_register( 'tables()', function ( selector ) {
		// A new instance is created if there was a selector specified
		return selector !== undefined && selector !== null ?
			new _Api( __table_selector( selector, this.context ) ) :
			this;
	} );
	
	
	_api_register( 'table()', function ( selector ) {
		var tables = this.tables( selector );
		var ctx = tables.context;
	
		// Truncate to the first matched table
		return ctx.length ?
			new _Api( ctx[0] ) :
			tables;
	} );
	
	// Common methods, combined to reduce size
	[
		['nodes', 'node', 'nTable'],
		['body', 'body', 'nTBody'],
		['header', 'header', 'nTHead'],
		['footer', 'footer', 'nTFoot'],
	].forEach(function (item) {
		_api_registerPlural(
			'tables().' + item[0] + '()',
			'table().' + item[1] + '()' ,
			function () {
				return this.iterator( 'table', function ( ctx ) {
					return ctx[item[2]];
				}, 1 );
			}
		);
	});
	
	// Structure methods
	[
		['header', 'aoHeader'],
		['footer', 'aoFooter'],
	].forEach(function (item) {
		_api_register( 'table().' + item[0] + '.structure()' , function (selector) {
			var indexes = this.columns(selector).indexes().flatten();
			var ctx = this.context[0];
			
			return _fnHeaderLayout(ctx, ctx[item[1]], indexes);
		} );
	})
	
	
	_api_registerPlural( 'tables().containers()', 'table().container()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTableWrapper;
		}, 1 );
	} );
	
	_api_register( 'tables().every()', function ( fn ) {
		var that = this;
	
		return this.iterator('table', function (s, i) {
			fn.call(that.table(i), i);
		});
	});
	
	_api_register( 'caption()', function ( value, side ) {
		var context = this.context;
	
		// Getter - return existing node's content
		if ( value === undefined ) {
			var caption = context[0].captionNode;
	
			return caption && context.length ?
				caption.innerHTML : 
				null;
		}
	
		return this.iterator( 'table', function ( ctx ) {
			var table = $(ctx.nTable);
			var caption = $(ctx.captionNode);
			var container = $(ctx.nTableWrapper);
	
			// Create the node if it doesn't exist yet
			if ( ! caption.length ) {
				caption = $('<caption/>').html( value );
				ctx.captionNode = caption[0];
	
				// If side isn't set, we need to insert into the document to let the
				// CSS decide so we can read it back, otherwise there is no way to
				// know if the CSS would put it top or bottom for scrolling
				if (! side) {
					table.prepend(caption);
	
					side = caption.css('caption-side');
				}
			}
	
			caption.html( value );
	
			if ( side ) {
				caption.css( 'caption-side', side );
				caption[0]._captionSide = side;
			}
	
			if (container.find('div.dataTables_scroll').length) {
				var selector = (side === 'top' ? 'Head' : 'Foot');
	
				container.find('div.dataTables_scroll'+ selector +' table').prepend(caption);
			}
			else {
				table.prepend(caption);
			}
		}, 1 );
	} );
	
	_api_register( 'caption.node()', function () {
		var ctx = this.context;
	
		return ctx.length ? ctx[0].captionNode : null;
	} );
	
	
	/**
	 * Redraw the tables in the current context.
	 */
	_api_register( 'draw()', function ( paging ) {
		return this.iterator( 'table', function ( settings ) {
			if ( paging === 'page' ) {
				_fnDraw( settings );
			}
			else {
				if ( typeof paging === 'string' ) {
					paging = paging === 'full-hold' ?
						false :
						true;
				}
	
				_fnReDraw( settings, paging===false );
			}
		} );
	} );
	
	
	
	/**
	 * Get the current page index.
	 *
	 * @return {integer} Current page index (zero based)
	 *//**
	 * Set the current page.
	 *
	 * Note that if you attempt to show a page which does not exist, DataTables will
	 * not throw an error, but rather reset the paging.
	 *
	 * @param {integer|string} action The paging action to take. This can be one of:
	 *  * `integer` - The page index to jump to
	 *  * `string` - An action to take:
	 *    * `first` - Jump to first page.
	 *    * `next` - Jump to the next page
	 *    * `previous` - Jump to previous page
	 *    * `last` - Jump to the last page.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'page()', function ( action ) {
		if ( action === undefined ) {
			return this.page.info().page; // not an expensive call
		}
	
		// else, have an action to take on all tables
		return this.iterator( 'table', function ( settings ) {
			_fnPageChange( settings, action );
		} );
	} );
	
	
	/**
	 * Paging information for the first table in the current context.
	 *
	 * If you require paging information for another table, use the `table()` method
	 * with a suitable selector.
	 *
	 * @return {object} Object with the following properties set:
	 *  * `page` - Current page index (zero based - i.e. the first page is `0`)
	 *  * `pages` - Total number of pages
	 *  * `start` - Display index for the first record shown on the current page
	 *  * `end` - Display index for the last record shown on the current page
	 *  * `length` - Display length (number of records). Note that generally `start
	 *    + length = end`, but this is not always true, for example if there are
	 *    only 2 records to show on the final page, with a length of 10.
	 *  * `recordsTotal` - Full data set length
	 *  * `recordsDisplay` - Data set length once the current filtering criterion
	 *    are applied.
	 */
	_api_register( 'page.info()', function () {
		if ( this.context.length === 0 ) {
			return undefined;
		}
	
		var
			settings   = this.context[0],
			start      = settings._iDisplayStart,
			len        = settings.oFeatures.bPaginate ? settings._iDisplayLength : -1,
			visRecords = settings.fnRecordsDisplay(),
			all        = len === -1;
	
		return {
			"page":           all ? 0 : Math.floor( start / len ),
			"pages":          all ? 1 : Math.ceil( visRecords / len ),
			"start":          start,
			"end":            settings.fnDisplayEnd(),
			"length":         len,
			"recordsTotal":   settings.fnRecordsTotal(),
			"recordsDisplay": visRecords,
			"serverSide":     _fnDataSource( settings ) === 'ssp'
		};
	} );
	
	
	/**
	 * Get the current page length.
	 *
	 * @return {integer} Current page length. Note `-1` indicates that all records
	 *   are to be shown.
	 *//**
	 * Set the current page length.
	 *
	 * @param {integer} Page length to set. Use `-1` to show all records.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'page.len()', function ( len ) {
		// Note that we can't call this function 'length()' because `length`
		// is a Javascript property of functions which defines how many arguments
		// the function expects.
		if ( len === undefined ) {
			return this.context.length !== 0 ?
				this.context[0]._iDisplayLength :
				undefined;
		}
	
		// else, set the page length
		return this.iterator( 'table', function ( settings ) {
			_fnLengthChange( settings, len );
		} );
	} );
	
	
	
	var __reload = function ( settings, holdPosition, callback ) {
		// Use the draw event to trigger a callback
		if ( callback ) {
			var api = new _Api( settings );
	
			api.one( 'draw', function () {
				callback( api.ajax.json() );
			} );
		}
	
		if ( _fnDataSource( settings ) == 'ssp' ) {
			_fnReDraw( settings, holdPosition );
		}
		else {
			_fnProcessingDisplay( settings, true );
	
			// Cancel an existing request
			var xhr = settings.jqXHR;
			if ( xhr && xhr.readyState !== 4 ) {
				xhr.abort();
			}
	
			// Trigger xhr
			_fnBuildAjax( settings, {}, function( json ) {
				_fnClearTable( settings );
	
				var data = _fnAjaxDataSrc( settings, json );
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					_fnAddData( settings, data[i] );
				}
	
				_fnReDraw( settings, holdPosition );
				_fnInitComplete( settings );
				_fnProcessingDisplay( settings, false );
			} );
		}
	};
	
	
	/**
	 * Get the JSON response from the last Ajax request that DataTables made to the
	 * server. Note that this returns the JSON from the first table in the current
	 * context.
	 *
	 * @return {object} JSON received from the server.
	 */
	_api_register( 'ajax.json()', function () {
		var ctx = this.context;
	
		if ( ctx.length > 0 ) {
			return ctx[0].json;
		}
	
		// else return undefined;
	} );
	
	
	/**
	 * Get the data submitted in the last Ajax request
	 */
	_api_register( 'ajax.params()', function () {
		var ctx = this.context;
	
		if ( ctx.length > 0 ) {
			return ctx[0].oAjaxData;
		}
	
		// else return undefined;
	} );
	
	
	/**
	 * Reload tables from the Ajax data source. Note that this function will
	 * automatically re-draw the table when the remote data has been loaded.
	 *
	 * @param {boolean} [reset=true] Reset (default) or hold the current paging
	 *   position. A full re-sort and re-filter is performed when this method is
	 *   called, which is why the pagination reset is the default action.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.reload()', function ( callback, resetPaging ) {
		return this.iterator( 'table', function (settings) {
			__reload( settings, resetPaging===false, callback );
		} );
	} );
	
	
	/**
	 * Get the current Ajax URL. Note that this returns the URL from the first
	 * table in the current context.
	 *
	 * @return {string} Current Ajax source URL
	 *//**
	 * Set the Ajax URL. Note that this will set the URL for all tables in the
	 * current context.
	 *
	 * @param {string} url URL to set.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.url()', function ( url ) {
		var ctx = this.context;
	
		if ( url === undefined ) {
			// get
			if ( ctx.length === 0 ) {
				return undefined;
			}
			ctx = ctx[0];
	
			return $.isPlainObject( ctx.ajax ) ?
				ctx.ajax.url :
				ctx.ajax;
		}
	
		// set
		return this.iterator( 'table', function ( settings ) {
			if ( $.isPlainObject( settings.ajax ) ) {
				settings.ajax.url = url;
			}
			else {
				settings.ajax = url;
			}
		} );
	} );
	
	
	/**
	 * Load data from the newly set Ajax URL. Note that this method is only
	 * available when `ajax.url()` is used to set a URL. Additionally, this method
	 * has the same effect as calling `ajax.reload()` but is provided for
	 * convenience when setting a new URL. Like `ajax.reload()` it will
	 * automatically redraw the table once the remote data has been loaded.
	 *
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.url().load()', function ( callback, resetPaging ) {
		// Same as a reload, but makes sense to present it for easy access after a
		// url change
		return this.iterator( 'table', function ( ctx ) {
			__reload( ctx, resetPaging===false, callback );
		} );
	} );
	
	
	
	
	var _selector_run = function ( type, selector, selectFn, settings, opts )
	{
		var
			out = [], res,
			a, i, ien, j, jen,
			selectorType = typeof selector;
	
		// Can't just check for isArray here, as an API or jQuery instance might be
		// given with their array like look
		if ( ! selector || selectorType === 'string' || selectorType === 'function' || selector.length === undefined ) {
			selector = [ selector ];
		}
	
		for ( i=0, ien=selector.length ; i<ien ; i++ ) {
			// Only split on simple strings - complex expressions will be jQuery selectors
			a = selector[i] && selector[i].split && ! selector[i].match(/[[(:]/) ?
				selector[i].split(',') :
				[ selector[i] ];
	
			for ( j=0, jen=a.length ; j<jen ; j++ ) {
				res = selectFn( typeof a[j] === 'string' ? (a[j]).trim() : a[j] );
	
				// Remove empty items
				res = res.filter( function (item) {
					return item !== null && item !== undefined;
				});
	
				if ( res && res.length ) {
					out = out.concat( res );
				}
			}
		}
	
		// selector extensions
		var ext = _ext.selector[ type ];
		if ( ext.length ) {
			for ( i=0, ien=ext.length ; i<ien ; i++ ) {
				out = ext[i]( settings, opts, out );
			}
		}
	
		return _unique( out );
	};
	
	
	var _selector_opts = function ( opts )
	{
		if ( ! opts ) {
			opts = {};
		}
	
		// Backwards compatibility for 1.9- which used the terminology filter rather
		// than search
		if ( opts.filter && opts.search === undefined ) {
			opts.search = opts.filter;
		}
	
		return $.extend( {
			search: 'none',
			order: 'current',
			page: 'all'
		}, opts );
	};
	
	
	// Reduce the API instance to the first item found
	var _selector_first = function ( old )
	{
		let inst = new _Api(old.context[0]);
	
		// Use a push rather than passing to the constructor, since it will
		// merge arrays down automatically, which isn't what is wanted here
		if (old.length) {
			inst.push( old[0] );
		}
	
		inst.selector = old.selector;
	
		// Limit to a single row / column / cell
		if (inst.length && inst[0].length > 1) {
			inst[0].splice(1);
		}
	
		return inst;
	};
	
	
	var _selector_row_indexes = function ( settings, opts )
	{
		var
			i, ien, tmp, a=[],
			displayFiltered = settings.aiDisplay,
			displayMaster = settings.aiDisplayMaster;
	
		var
			search = opts.search,  // none, applied, removed
			order  = opts.order,   // applied, current, index (original - compatibility with 1.9)
			page   = opts.page;    // all, current
	
		if ( page == 'current' ) {
			// Current page implies that order=current and filter=applied, since it is
			// fairly senseless otherwise, regardless of what order and search actually
			// are
			for ( i=settings._iDisplayStart, ien=settings.fnDisplayEnd() ; i<ien ; i++ ) {
				a.push( displayFiltered[i] );
			}
		}
		else if ( order == 'current' || order == 'applied' ) {
			if ( search == 'none') {
				a = displayMaster.slice();
			}
			else if ( search == 'applied' ) {
				a = displayFiltered.slice();
			}
			else if ( search == 'removed' ) {
				// O(n+m) solution by creating a hash map
				var displayFilteredMap = {};
	
				for ( i=0, ien=displayFiltered.length ; i<ien ; i++ ) {
					displayFilteredMap[displayFiltered[i]] = null;
				}
	
				displayMaster.forEach(function (item) {
					if (! Object.prototype.hasOwnProperty.call(displayFilteredMap, item)) {
						a.push(item);
					}
				});
			}
		}
		else if ( order == 'index' || order == 'original' ) {
			for ( i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
				if (! settings.aoData[i]) {
					continue;
				}
	
				if ( search == 'none' ) {
					a.push( i );
				}
				else { // applied | removed
					tmp = displayFiltered.indexOf(i);
	
					if ((tmp === -1 && search == 'removed') ||
						(tmp >= 0   && search == 'applied') )
					{
						a.push( i );
					}
				}
			}
		}
		else if ( typeof order === 'number' ) {
			// Order the rows by the given column
			var ordered = _fnSort(settings, order, 'asc');
	
			if (search === 'none') {
				a = ordered;
			}
			else { // applied | removed
				for (i=0; i<ordered.length; i++) {
					tmp = displayFiltered.indexOf(ordered[i]);
	
					if ((tmp === -1 && search == 'removed') ||
						(tmp >= 0   && search == 'applied') )
					{
						a.push( ordered[i] );
					}
				}
			}
		}
	
		return a;
	};
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Rows
	 *
	 * {}          - no selector - use all available rows
	 * {integer}   - row aoData index
	 * {node}      - TR node
	 * {string}    - jQuery selector to apply to the TR elements
	 * {array}     - jQuery array of nodes, or simply an array of TR nodes
	 *
	 */
	var __row_selector = function ( settings, selector, opts )
	{
		var rows;
		var run = function ( sel ) {
			var selInt = _intVal( sel );
			var aoData = settings.aoData;
	
			// Short cut - selector is a number and no options provided (default is
			// all records, so no need to check if the index is in there, since it
			// must be - dev error if the index doesn't exist).
			if ( selInt !== null && ! opts ) {
				return [ selInt ];
			}
	
			if ( ! rows ) {
				rows = _selector_row_indexes( settings, opts );
			}
	
			if ( selInt !== null && rows.indexOf(selInt) !== -1 ) {
				// Selector - integer
				return [ selInt ];
			}
			else if ( sel === null || sel === undefined || sel === '' ) {
				// Selector - none
				return rows;
			}
	
			// Selector - function
			if ( typeof sel === 'function' ) {
				return rows.map( function (idx) {
					var row = aoData[ idx ];
					return sel( idx, row._aData, row.nTr ) ? idx : null;
				} );
			}
	
			// Selector - node
			if ( sel.nodeName ) {
				var rowIdx = sel._DT_RowIndex;  // Property added by DT for fast lookup
				var cellIdx = sel._DT_CellIndex;
	
				if ( rowIdx !== undefined ) {
					// Make sure that the row is actually still present in the table
					return aoData[ rowIdx ] && aoData[ rowIdx ].nTr === sel ?
						[ rowIdx ] :
						[];
				}
				else if ( cellIdx ) {
					return aoData[ cellIdx.row ] && aoData[ cellIdx.row ].nTr === sel.parentNode ?
						[ cellIdx.row ] :
						[];
				}
				else {
					var host = $(sel).closest('*[data-dt-row]');
					return host.length ?
						[ host.data('dt-row') ] :
						[];
				}
			}
	
			// ID selector. Want to always be able to select rows by id, regardless
			// of if the tr element has been created or not, so can't rely upon
			// jQuery here - hence a custom implementation. This does not match
			// Sizzle's fast selector or HTML4 - in HTML5 the ID can be anything,
			// but to select it using a CSS selector engine (like Sizzle or
			// querySelect) it would need to need to be escaped for some characters.
			// DataTables simplifies this for row selectors since you can select
			// only a row. A # indicates an id any anything that follows is the id -
			// unescaped.
			if ( typeof sel === 'string' && sel.charAt(0) === '#' ) {
				// get row index from id
				var rowObj = settings.aIds[ sel.replace( /^#/, '' ) ];
				if ( rowObj !== undefined ) {
					return [ rowObj.idx ];
				}
	
				// need to fall through to jQuery in case there is DOM id that
				// matches
			}
			
			// Get nodes in the order from the `rows` array with null values removed
			var nodes = _removeEmpty(
				_pluck_order( settings.aoData, rows, 'nTr' )
			);
	
			// Selector - jQuery selector string, array of nodes or jQuery object/
			// As jQuery's .filter() allows jQuery objects to be passed in filter,
			// it also allows arrays, so this will cope with all three options
			return $(nodes)
				.filter( sel )
				.map( function () {
					return this._DT_RowIndex;
				} )
				.toArray();
		};
	
		var matched = _selector_run( 'row', selector, run, settings, opts );
	
		if (opts.order === 'current' || opts.order === 'applied') {
			_fnSortDisplay(settings, matched);
		}
	
		return matched;
	};
	
	
	_api_register( 'rows()', function ( selector, opts ) {
		// argument shifting
		if ( selector === undefined ) {
			selector = '';
		}
		else if ( $.isPlainObject( selector ) ) {
			opts = selector;
			selector = '';
		}
	
		opts = _selector_opts( opts );
	
		var inst = this.iterator( 'table', function ( settings ) {
			return __row_selector( settings, selector, opts );
		}, 1 );
	
		// Want argument shifting here and in __row_selector?
		inst.selector.rows = selector;
		inst.selector.opts = opts;
	
		return inst;
	} );
	
	_api_register( 'rows().nodes()', function () {
		return this.iterator( 'row', function ( settings, row ) {
			return settings.aoData[ row ].nTr || undefined;
		}, 1 );
	} );
	
	_api_register( 'rows().data()', function () {
		return this.iterator( true, 'rows', function ( settings, rows ) {
			return _pluck_order( settings.aoData, rows, '_aData' );
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().cache()', 'row().cache()', function ( type ) {
		return this.iterator( 'row', function ( settings, row ) {
			var r = settings.aoData[ row ];
			return type === 'search' ? r._aFilterData : r._aSortData;
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().invalidate()', 'row().invalidate()', function ( src ) {
		return this.iterator( 'row', function ( settings, row ) {
			_fnInvalidate( settings, row, src );
		} );
	} );
	
	_api_registerPlural( 'rows().indexes()', 'row().index()', function () {
		return this.iterator( 'row', function ( settings, row ) {
			return row;
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().ids()', 'row().id()', function ( hash ) {
		var a = [];
		var context = this.context;
	
		// `iterator` will drop undefined values, but in this case we want them
		for ( var i=0, ien=context.length ; i<ien ; i++ ) {
			for ( var j=0, jen=this[i].length ; j<jen ; j++ ) {
				var id = context[i].rowIdFn( context[i].aoData[ this[i][j] ]._aData );
				a.push( (hash === true ? '#' : '' )+ id );
			}
		}
	
		return new _Api( context, a );
	} );
	
	_api_registerPlural( 'rows().remove()', 'row().remove()', function () {
		this.iterator( 'row', function ( settings, row ) {
			var data = settings.aoData;
			var rowData = data[ row ];
	
			// Delete from the display arrays
			var idx = settings.aiDisplayMaster.indexOf(row);
			if (idx !== -1) {
				settings.aiDisplayMaster.splice(idx, 1);
			}
	
			// For server-side processing tables - subtract the deleted row from the count
			if ( settings._iRecordsDisplay > 0 ) {
				settings._iRecordsDisplay--;
			}
	
			// Check for an 'overflow' they case for displaying the table
			_fnLengthOverflow( settings );
	
			// Remove the row's ID reference if there is one
			var id = settings.rowIdFn( rowData._aData );
			if ( id !== undefined ) {
				delete settings.aIds[ id ];
			}
	
			data[row] = null;
		} );
	
		return this;
	} );
	
	
	_api_register( 'rows.add()', function ( rows ) {
		var newRows = this.iterator( 'table', function ( settings ) {
				var row, i, ien;
				var out = [];
	
				for ( i=0, ien=rows.length ; i<ien ; i++ ) {
					row = rows[i];
	
					if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
						out.push( _fnAddTr( settings, row )[0] );
					}
					else {
						out.push( _fnAddData( settings, row ) );
					}
				}
	
				return out;
			}, 1 );
	
		// Return an Api.rows() extended instance, so rows().nodes() etc can be used
		var modRows = this.rows( -1 );
		modRows.pop();
		modRows.push.apply(modRows, newRows);
	
		return modRows;
	} );
	
	
	
	
	
	/**
	 *
	 */
	_api_register( 'row()', function ( selector, opts ) {
		return _selector_first( this.rows( selector, opts ) );
	} );
	
	
	_api_register( 'row().data()', function ( data ) {
		var ctx = this.context;
	
		if ( data === undefined ) {
			// Get
			return ctx.length && this.length && this[0].length ?
				ctx[0].aoData[ this[0] ]._aData :
				undefined;
		}
	
		// Set
		var row = ctx[0].aoData[ this[0] ];
		row._aData = data;
	
		// If the DOM has an id, and the data source is an array
		if ( Array.isArray( data ) && row.nTr && row.nTr.id ) {
			_fnSetObjectDataFn( ctx[0].rowId )( data, row.nTr.id );
		}
	
		// Automatically invalidate
		_fnInvalidate( ctx[0], this[0], 'data' );
	
		return this;
	} );
	
	
	_api_register( 'row().node()', function () {
		var ctx = this.context;
	
		return ctx.length && this.length && this[0].length ?
			ctx[0].aoData[ this[0] ].nTr || null :
			null;
	} );
	
	
	_api_register( 'row.add()', function ( row ) {
		// Allow a jQuery object to be passed in - only a single row is added from
		// it though - the first element in the set
		if ( row instanceof $ && row.length ) {
			row = row[0];
		}
	
		var rows = this.iterator( 'table', function ( settings ) {
			if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
				return _fnAddTr( settings, row )[0];
			}
			return _fnAddData( settings, row );
		} );
	
		// Return an Api.rows() extended instance, with the newly added row selected
		return this.row( rows[0] );
	} );
	
	
	$(document).on('plugin-init.dt', function (e, context) {
		var api = new _Api( context );
	
		api.on( 'stateSaveParams.DT', function ( e, settings, d ) {
			// This could be more compact with the API, but it is a lot faster as a simple
			// internal loop
			var idFn = settings.rowIdFn;
			var rows = settings.aiDisplayMaster;
			var ids = [];
	
			for (var i=0 ; i<rows.length ; i++) {
				var rowIdx = rows[i];
				var data = settings.aoData[rowIdx];
	
				if (data._detailsShow) {
					ids.push( '#' + idFn(data._aData) );
				}
			}
	
			d.childRows = ids;
		});
	
		// For future state loads (e.g. with StateRestore)
		api.on( 'stateLoaded.DT', function (e, settings, state) {
			__details_state_load( api, state );
		});
	
		// And the initial load state
		__details_state_load( api, api.state.loaded() );
	});
	
	var __details_state_load = function (api, state)
	{
		if ( state && state.childRows ) {
			api
				.rows( state.childRows.map(function (id) {
					// Escape any `:` characters from the row id, unless previously escaped
					return id.replace(/(?<!\\):/g, '\\:');
				}) )
				.every( function () {
					_fnCallbackFire( api.settings()[0], null, 'requestChild', [ this ] )
				});
		}
	}
	
	var __details_add = function ( ctx, row, data, klass )
	{
		// Convert to array of TR elements
		var rows = [];
		var addRow = function ( r, k ) {
			// Recursion to allow for arrays of jQuery objects
			if ( Array.isArray( r ) || r instanceof $ ) {
				for ( var i=0, ien=r.length ; i<ien ; i++ ) {
					addRow( r[i], k );
				}
				return;
			}
	
			// If we get a TR element, then just add it directly - up to the dev
			// to add the correct number of columns etc
			if ( r.nodeName && r.nodeName.toLowerCase() === 'tr' ) {
				r.setAttribute( 'data-dt-row', row.idx );
				rows.push( r );
			}
			else {
				// Otherwise create a row with a wrapper
				var created = $('<tr><td></td></tr>')
					.attr( 'data-dt-row', row.idx )
					.addClass( k );
				
				$('td', created)
					.addClass( k )
					.html( r )[0].colSpan = _fnVisbleColumns( ctx );
	
				rows.push( created[0] );
			}
		};
	
		addRow( data, klass );
	
		if ( row._details ) {
			row._details.detach();
		}
	
		row._details = $(rows);
	
		// If the children were already shown, that state should be retained
		if ( row._detailsShow ) {
			row._details.insertAfter( row.nTr );
		}
	};
	
	
	// Make state saving of child row details async to allow them to be batch processed
	var __details_state = DataTable.util.throttle(
		function (ctx) {
			_fnSaveState( ctx[0] )
		},
		500
	);
	
	
	var __details_remove = function ( api, idx )
	{
		var ctx = api.context;
	
		if ( ctx.length ) {
			var row = ctx[0].aoData[ idx !== undefined ? idx : api[0] ];
	
			if ( row && row._details ) {
				row._details.remove();
	
				row._detailsShow = undefined;
				row._details = undefined;
				$( row.nTr ).removeClass( 'dt-hasChild' );
				__details_state( ctx );
			}
		}
	};
	
	
	var __details_display = function ( api, show ) {
		var ctx = api.context;
	
		if ( ctx.length && api.length ) {
			var row = ctx[0].aoData[ api[0] ];
	
			if ( row._details ) {
				row._detailsShow = show;
	
				if ( show ) {
					row._details.insertAfter( row.nTr );
					$( row.nTr ).addClass( 'dt-hasChild' );
				}
				else {
					row._details.detach();
					$( row.nTr ).removeClass( 'dt-hasChild' );
				}
	
				_fnCallbackFire( ctx[0], null, 'childRow', [ show, api.row( api[0] ) ] )
	
				__details_events( ctx[0] );
				__details_state( ctx );
			}
		}
	};
	
	
	var __details_events = function ( settings )
	{
		var api = new _Api( settings );
		var namespace = '.dt.DT_details';
		var drawEvent = 'draw'+namespace;
		var colvisEvent = 'column-sizing'+namespace;
		var destroyEvent = 'destroy'+namespace;
		var data = settings.aoData;
	
		api.off( drawEvent +' '+ colvisEvent +' '+ destroyEvent );
	
		if ( _pluck( data, '_details' ).length > 0 ) {
			// On each draw, insert the required elements into the document
			api.on( drawEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				api.rows( {page:'current'} ).eq(0).each( function (idx) {
					// Internal data grab
					var row = data[ idx ];
	
					if ( row._detailsShow ) {
						row._details.insertAfter( row.nTr );
					}
				} );
			} );
	
			// Column visibility change - update the colspan
			api.on( colvisEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				// Update the colspan for the details rows (note, only if it already has
				// a colspan)
				var row, visible = _fnVisbleColumns( ctx );
	
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					row = data[i];
	
					if ( row && row._details ) {
						row._details.each(function () {
							var el = $(this).children('td');
	
							if (el.length == 1) {
								el.attr('colspan', visible);
							}
						});
					}
				}
			} );
	
			// Table destroyed - nuke any child rows
			api.on( destroyEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					if ( data[i] && data[i]._details ) {
						__details_remove( api, i );
					}
				}
			} );
		}
	};
	
	// Strings for the method names to help minification
	var _emp = '';
	var _child_obj = _emp+'row().child';
	var _child_mth = _child_obj+'()';
	
	// data can be:
	//  tr
	//  string
	//  jQuery or array of any of the above
	_api_register( _child_mth, function ( data, klass ) {
		var ctx = this.context;
	
		if ( data === undefined ) {
			// get
			return ctx.length && this.length && ctx[0].aoData[ this[0] ]
				? ctx[0].aoData[ this[0] ]._details
				: undefined;
		}
		else if ( data === true ) {
			// show
			this.child.show();
		}
		else if ( data === false ) {
			// remove
			__details_remove( this );
		}
		else if ( ctx.length && this.length ) {
			// set
			__details_add( ctx[0], ctx[0].aoData[ this[0] ], data, klass );
		}
	
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.show()',
		_child_mth+'.show()' // only when `child()` was called with parameters (without
	], function () {         // it returns an object and this method is not executed)
		__details_display( this, true );
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.hide()',
		_child_mth+'.hide()' // only when `child()` was called with parameters (without
	], function () {         // it returns an object and this method is not executed)
		__details_display( this, false );
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.remove()',
		_child_mth+'.remove()' // only when `child()` was called with parameters (without
	], function () {           // it returns an object and this method is not executed)
		__details_remove( this );
		return this;
	} );
	
	
	_api_register( _child_obj+'.isShown()', function () {
		var ctx = this.context;
	
		if ( ctx.length && this.length ) {
			// _detailsShown as false or undefined will fall through to return false
			return ctx[0].aoData[ this[0] ]._detailsShow || false;
		}
		return false;
	} );
	
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Columns
	 *
	 * {integer}           - column index (>=0 count from left, <0 count from right)
	 * "{integer}:visIdx"  - visible column index (i.e. translate to column index)  (>=0 count from left, <0 count from right)
	 * "{integer}:visible" - alias for {integer}:visIdx  (>=0 count from left, <0 count from right)
	 * "{string}:name"     - column name
	 * "{string}"          - jQuery selector on column header nodes
	 *
	 */
	
	// can be an array of these items, comma separated list, or an array of comma
	// separated lists
	
	var __re_column_selector = /^([^:]+):(name|title|visIdx|visible)$/;
	
	
	// r1 and r2 are redundant - but it means that the parameters match for the
	// iterator callback in columns().data()
	var __columnData = function ( settings, column, r1, r2, rows, type ) {
		var a = [];
		for ( var row=0, ien=rows.length ; row<ien ; row++ ) {
			a.push( _fnGetCellData( settings, rows[row], column, type ) );
		}
		return a;
	};
	
	
	var __column_header = function ( settings, column, row ) {
		var header = settings.aoHeader;
		var target = row !== undefined
			? row
			: settings.bSortCellsTop // legacy support
				? 0
				: header.length - 1;
	
		return header[target][column].cell;
	};
	
	var __column_selector = function ( settings, selector, opts )
	{
		var
			columns = settings.aoColumns,
			names = _pluck( columns, 'sName' ),
			titles = _pluck( columns, 'sTitle' ),
			cells = DataTable.util.get('[].[].cell')(settings.aoHeader),
			nodes = _unique( _flatten([], cells) );
		
		var run = function ( s ) {
			var selInt = _intVal( s );
	
			// Selector - all
			if ( s === '' ) {
				return _range( columns.length );
			}
	
			// Selector - index
			if ( selInt !== null ) {
				return [ selInt >= 0 ?
					selInt : // Count from left
					columns.length + selInt // Count from right (+ because its a negative value)
				];
			}
	
			// Selector = function
			if ( typeof s === 'function' ) {
				var rows = _selector_row_indexes( settings, opts );
	
				return columns.map(function (col, idx) {
					return s(
							idx,
							__columnData( settings, idx, 0, 0, rows ),
							__column_header( settings, idx )
						) ? idx : null;
				});
			}
	
			// jQuery or string selector
			var match = typeof s === 'string' ?
				s.match( __re_column_selector ) :
				'';
	
			if ( match ) {
				switch( match[2] ) {
					case 'visIdx':
					case 'visible':
						var idx = parseInt( match[1], 10 );
						// Visible index given, convert to column index
						if ( idx < 0 ) {
							// Counting from the right
							var visColumns = columns.map( function (col,i) {
								return col.bVisible ? i : null;
							} );
							return [ visColumns[ visColumns.length + idx ] ];
						}
						// Counting from the left
						return [ _fnVisibleToColumnIndex( settings, idx ) ];
	
					case 'name':
						// match by name. `names` is column index complete and in order
						return names.map( function (name, i) {
							return name === match[1] ? i : null;
						} );
	
					case 'title':
						// match by column title
						return titles.map( function (title, i) {
							return title === match[1] ? i : null;
						} );
	
					default:
						return [];
				}
			}
	
			// Cell in the table body
			if ( s.nodeName && s._DT_CellIndex ) {
				return [ s._DT_CellIndex.column ];
			}
	
			// jQuery selector on the TH elements for the columns
			var jqResult = $( nodes )
				.filter( s )
				.map( function () {
					return _fnColumnsFromHeader( this ); // `nodes` is column index complete and in order
				} )
				.toArray();
	
			if ( jqResult.length || ! s.nodeName ) {
				return jqResult;
			}
	
			// Otherwise a node which might have a `dt-column` data attribute, or be
			// a child or such an element
			var host = $(s).closest('*[data-dt-column]');
			return host.length ?
				[ host.data('dt-column') ] :
				[];
		};
	
		return _selector_run( 'column', selector, run, settings, opts );
	};
	
	
	var __setColumnVis = function ( settings, column, vis ) {
		var
			cols = settings.aoColumns,
			col  = cols[ column ],
			data = settings.aoData,
			cells, i, ien, tr;
	
		// Get
		if ( vis === undefined ) {
			return col.bVisible;
		}
	
		// Set
		// No change
		if ( col.bVisible === vis ) {
			return false;
		}
	
		if ( vis ) {
			// Insert column
			// Need to decide if we should use appendChild or insertBefore
			var insertBefore = _pluck(cols, 'bVisible').indexOf(true, column+1);
	
			for ( i=0, ien=data.length ; i<ien ; i++ ) {
				if (data[i]) {
					tr = data[i].nTr;
					cells = data[i].anCells;
	
					if ( tr ) {
						// insertBefore can act like appendChild if 2nd arg is null
						tr.insertBefore( cells[ column ], cells[ insertBefore ] || null );
					}
				}
			}
		}
		else {
			// Remove column
			$( _pluck( settings.aoData, 'anCells', column ) ).detach();
		}
	
		// Common actions
		col.bVisible = vis;
	
		_colGroup(settings);
		
		return true;
	};
	
	
	_api_register( 'columns()', function ( selector, opts ) {
		// argument shifting
		if ( selector === undefined ) {
			selector = '';
		}
		else if ( $.isPlainObject( selector ) ) {
			opts = selector;
			selector = '';
		}
	
		opts = _selector_opts( opts );
	
		var inst = this.iterator( 'table', function ( settings ) {
			return __column_selector( settings, selector, opts );
		}, 1 );
	
		// Want argument shifting here and in _row_selector?
		inst.selector.cols = selector;
		inst.selector.opts = opts;
	
		return inst;
	} );
	
	_api_registerPlural( 'columns().header()', 'column().header()', function ( row ) {
		return this.iterator( 'column', function (settings, column) {
			return __column_header(settings, column, row);
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().footer()', 'column().footer()', function ( row ) {
		return this.iterator( 'column', function ( settings, column ) {
			var footer = settings.aoFooter;
	
			if (! footer.length) {
				return null;
			}
	
			return settings.aoFooter[row !== undefined ? row : 0][column].cell;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().data()', 'column().data()', function () {
		return this.iterator( 'column-rows', __columnData, 1 );
	} );
	
	_api_registerPlural( 'columns().render()', 'column().render()', function ( type ) {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return __columnData( settings, column, i, j, rows, type );
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().dataSrc()', 'column().dataSrc()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column].mData;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().cache()', 'column().cache()', function ( type ) {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return _pluck_order( settings.aoData, rows,
				type === 'search' ? '_aFilterData' : '_aSortData', column
			);
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().init()', 'column().init()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column];
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().nodes()', 'column().nodes()', function () {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return _pluck_order( settings.aoData, rows, 'anCells', column ) ;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().titles()', 'column().title()', function (title, row) {
		return this.iterator( 'column', function ( settings, column ) {
			// Argument shifting
			if (typeof title === 'number') {
				row = title;
				title = undefined;
			}
	
			var span = $('span.dt-column-title', this.column(column).header(row));
	
			if (title !== undefined) {
				span.html(title);
				return this;
			}
	
			return span.html();
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().types()', 'column().type()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			var type = settings.aoColumns[column].sType;
	
			// If the type was invalidated, then resolve it. This actually does
			// all columns at the moment. Would only happen once if getting all
			// column's data types.
			if (! type) {
				_fnColumnTypes(settings);
			}
	
			return type;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().visible()', 'column().visible()', function ( vis, calc ) {
		var that = this;
		var changed = [];
		var ret = this.iterator( 'column', function ( settings, column ) {
			if ( vis === undefined ) {
				return settings.aoColumns[ column ].bVisible;
			} // else
			
			if (__setColumnVis( settings, column, vis )) {
				changed.push(column);
			}
		} );
	
		// Group the column visibility changes
		if ( vis !== undefined ) {
			this.iterator( 'table', function ( settings ) {
				// Redraw the header after changes
				_fnDrawHead( settings, settings.aoHeader );
				_fnDrawHead( settings, settings.aoFooter );
		
				// Update colspan for no records display. Child rows and extensions will use their own
				// listeners to do this - only need to update the empty table item here
				if ( ! settings.aiDisplay.length ) {
					$(settings.nTBody).find('td[colspan]').attr('colspan', _fnVisbleColumns(settings));
				}
		
				_fnSaveState( settings );
	
				// Second loop once the first is done for events
				that.iterator( 'column', function ( settings, column ) {
					if (changed.includes(column)) {
						_fnCallbackFire( settings, null, 'column-visibility', [settings, column, vis, calc] );
					}
				} );
	
				if ( changed.length && (calc === undefined || calc) ) {
					that.columns.adjust();
				}
			});
		}
	
		return ret;
	} );
	
	_api_registerPlural( 'columns().widths()', 'column().width()', function () {
		// Injects a fake row into the table for just a moment so the widths can
		// be read, regardless of colspan in the header and rows being present in
		// the body
		var columns = this.columns(':visible').count();
		var row = $('<tr>').html('<td>' + Array(columns).join('</td><td>') + '</td>');
	
		$(this.table().body()).append(row);
	
		var widths = row.children().map(function () {
			return $(this).outerWidth();
		});
	
		row.remove();
		
		return this.iterator( 'column', function ( settings, column ) {
			var visIdx = _fnColumnIndexToVisible( settings, column );
	
			return visIdx !== null ? widths[visIdx] : 0;
		}, 1);
	} );
	
	_api_registerPlural( 'columns().indexes()', 'column().index()', function ( type ) {
		return this.iterator( 'column', function ( settings, column ) {
			return type === 'visible' ?
				_fnColumnIndexToVisible( settings, column ) :
				column;
		}, 1 );
	} );
	
	_api_register( 'columns.adjust()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnAdjustColumnSizing( settings );
		}, 1 );
	} );
	
	_api_register( 'column.index()', function ( type, idx ) {
		if ( this.context.length !== 0 ) {
			var ctx = this.context[0];
	
			if ( type === 'fromVisible' || type === 'toData' ) {
				return _fnVisibleToColumnIndex( ctx, idx );
			}
			else if ( type === 'fromData' || type === 'toVisible' ) {
				return _fnColumnIndexToVisible( ctx, idx );
			}
		}
	} );
	
	_api_register( 'column()', function ( selector, opts ) {
		return _selector_first( this.columns( selector, opts ) );
	} );
	
	var __cell_selector = function ( settings, selector, opts )
	{
		var data = settings.aoData;
		var rows = _selector_row_indexes( settings, opts );
		var cells = _removeEmpty( _pluck_order( data, rows, 'anCells' ) );
		var allCells = $(_flatten( [], cells ));
		var row;
		var columns = settings.aoColumns.length;
		var a, i, ien, j, o, host;
	
		var run = function ( s ) {
			var fnSelector = typeof s === 'function';
	
			if ( s === null || s === undefined || fnSelector ) {
				// All cells and function selectors
				a = [];
	
				for ( i=0, ien=rows.length ; i<ien ; i++ ) {
					row = rows[i];
	
					for ( j=0 ; j<columns ; j++ ) {
						o = {
							row: row,
							column: j
						};
	
						if ( fnSelector ) {
							// Selector - function
							host = data[ row ];
	
							if ( s( o, _fnGetCellData(settings, row, j), host.anCells ? host.anCells[j] : null ) ) {
								a.push( o );
							}
						}
						else {
							// Selector - all
							a.push( o );
						}
					}
				}
	
				return a;
			}
			
			// Selector - index
			if ( $.isPlainObject( s ) ) {
				// Valid cell index and its in the array of selectable rows
				return s.column !== undefined && s.row !== undefined && rows.indexOf(s.row) !== -1 ?
					[s] :
					[];
			}
	
			// Selector - jQuery filtered cells
			var jqResult = allCells
				.filter( s )
				.map( function (i, el) {
					return { // use a new object, in case someone changes the values
						row:    el._DT_CellIndex.row,
						column: el._DT_CellIndex.column
					};
				} )
				.toArray();
	
			if ( jqResult.length || ! s.nodeName ) {
				return jqResult;
			}
	
			// Otherwise the selector is a node, and there is one last option - the
			// element might be a child of an element which has dt-row and dt-column
			// data attributes
			host = $(s).closest('*[data-dt-row]');
			return host.length ?
				[ {
					row: host.data('dt-row'),
					column: host.data('dt-column')
				} ] :
				[];
		};
	
		return _selector_run( 'cell', selector, run, settings, opts );
	};
	
	
	
	
	_api_register( 'cells()', function ( rowSelector, columnSelector, opts ) {
		// Argument shifting
		if ( $.isPlainObject( rowSelector ) ) {
			// Indexes
			if ( rowSelector.row === undefined ) {
				// Selector options in first parameter
				opts = rowSelector;
				rowSelector = null;
			}
			else {
				// Cell index objects in first parameter
				opts = columnSelector;
				columnSelector = null;
			}
		}
		if ( $.isPlainObject( columnSelector ) ) {
			opts = columnSelector;
			columnSelector = null;
		}
	
		// Cell selector
		if ( columnSelector === null || columnSelector === undefined ) {
			return this.iterator( 'table', function ( settings ) {
				return __cell_selector( settings, rowSelector, _selector_opts( opts ) );
			} );
		}
	
		// The default built in options need to apply to row and columns
		var internalOpts = opts ? {
			page: opts.page,
			order: opts.order,
			search: opts.search
		} : {};
	
		// Row + column selector
		var columns = this.columns( columnSelector, internalOpts );
		var rows = this.rows( rowSelector, internalOpts );
		var i, ien, j, jen;
	
		var cellsNoOpts = this.iterator( 'table', function ( settings, idx ) {
			var a = [];
	
			for ( i=0, ien=rows[idx].length ; i<ien ; i++ ) {
				for ( j=0, jen=columns[idx].length ; j<jen ; j++ ) {
					a.push( {
						row:    rows[idx][i],
						column: columns[idx][j]
					} );
				}
			}
	
			return a;
		}, 1 );
	
		// There is currently only one extension which uses a cell selector extension
		// It is a _major_ performance drag to run this if it isn't needed, so this is
		// an extension specific check at the moment
		var cells = opts && opts.selected ?
			this.cells( cellsNoOpts, opts ) :
			cellsNoOpts;
	
		$.extend( cells.selector, {
			cols: columnSelector,
			rows: rowSelector,
			opts: opts
		} );
	
		return cells;
	} );
	
	
	_api_registerPlural( 'cells().nodes()', 'cell().node()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			var data = settings.aoData[ row ];
	
			return data && data.anCells ?
				data.anCells[ column ] :
				undefined;
		}, 1 );
	} );
	
	
	_api_register( 'cells().data()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return _fnGetCellData( settings, row, column );
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().cache()', 'cell().cache()', function ( type ) {
		type = type === 'search' ? '_aFilterData' : '_aSortData';
	
		return this.iterator( 'cell', function ( settings, row, column ) {
			return settings.aoData[ row ][ type ][ column ];
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().render()', 'cell().render()', function ( type ) {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return _fnGetCellData( settings, row, column, type );
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().indexes()', 'cell().index()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return {
				row: row,
				column: column,
				columnVisible: _fnColumnIndexToVisible( settings, column )
			};
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().invalidate()', 'cell().invalidate()', function ( src ) {
		return this.iterator( 'cell', function ( settings, row, column ) {
			_fnInvalidate( settings, row, src, column );
		} );
	} );
	
	
	
	_api_register( 'cell()', function ( rowSelector, columnSelector, opts ) {
		return _selector_first( this.cells( rowSelector, columnSelector, opts ) );
	} );
	
	
	_api_register( 'cell().data()', function ( data ) {
		var ctx = this.context;
		var cell = this[0];
	
		if ( data === undefined ) {
			// Get
			return ctx.length && cell.length ?
				_fnGetCellData( ctx[0], cell[0].row, cell[0].column ) :
				undefined;
		}
	
		// Set
		_fnSetCellData( ctx[0], cell[0].row, cell[0].column, data );
		_fnInvalidate( ctx[0], cell[0].row, 'data', cell[0].column );
	
		return this;
	} );
	
	
	
	/**
	 * Get current ordering (sorting) that has been applied to the table.
	 *
	 * @returns {array} 2D array containing the sorting information for the first
	 *   table in the current context. Each element in the parent array represents
	 *   a column being sorted upon (i.e. multi-sorting with two columns would have
	 *   2 inner arrays). The inner arrays may have 2 or 3 elements. The first is
	 *   the column index that the sorting condition applies to, the second is the
	 *   direction of the sort (`desc` or `asc`) and, optionally, the third is the
	 *   index of the sorting order from the `column.sorting` initialisation array.
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {integer} order Column index to sort upon.
	 * @param {string} direction Direction of the sort to be applied (`asc` or `desc`)
	 * @returns {DataTables.Api} this
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {array} order 1D array of sorting information to be applied.
	 * @param {array} [...] Optional additional sorting conditions
	 * @returns {DataTables.Api} this
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {array} order 2D array of sorting information to be applied.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'order()', function ( order, dir ) {
		var ctx = this.context;
		var args = Array.prototype.slice.call( arguments );
	
		if ( order === undefined ) {
			// get
			return ctx.length !== 0 ?
				ctx[0].aaSorting :
				undefined;
		}
	
		// set
		if ( typeof order === 'number' ) {
			// Simple column / direction passed in
			order = [ [ order, dir ] ];
		}
		else if ( args.length > 1 ) {
			// Arguments passed in (list of 1D arrays)
			order = args;
		}
		// otherwise a 2D array was passed in
	
		return this.iterator( 'table', function ( settings ) {
			settings.aaSorting = Array.isArray(order) ? order.slice() : order;
		} );
	} );
	
	
	/**
	 * Attach a sort listener to an element for a given column
	 *
	 * @param {node|jQuery|string} node Identifier for the element(s) to attach the
	 *   listener to. This can take the form of a single DOM node, a jQuery
	 *   collection of nodes or a jQuery selector which will identify the node(s).
	 * @param {integer} column the column that a click on this node will sort on
	 * @param {function} [callback] callback function when sort is run
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'order.listener()', function ( node, column, callback ) {
		return this.iterator( 'table', function ( settings ) {
			_fnSortAttachListener(settings, node, {}, column, callback);
		} );
	} );
	
	
	_api_register( 'order.fixed()', function ( set ) {
		if ( ! set ) {
			var ctx = this.context;
			var fixed = ctx.length ?
				ctx[0].aaSortingFixed :
				undefined;
	
			return Array.isArray( fixed ) ?
				{ pre: fixed } :
				fixed;
		}
	
		return this.iterator( 'table', function ( settings ) {
			settings.aaSortingFixed = $.extend( true, {}, set );
		} );
	} );
	
	
	// Order by the selected column(s)
	_api_register( [
		'columns().order()',
		'column().order()'
	], function ( dir ) {
		var that = this;
	
		if ( ! dir ) {
			return this.iterator( 'column', function ( settings, idx ) {
				var sort = _fnSortFlatten( settings );
	
				for ( var i=0, ien=sort.length ; i<ien ; i++ ) {
					if ( sort[i].col === idx ) {
						return sort[i].dir;
					}
				}
	
				return null;
			}, 1 );
		}
		else {
			return this.iterator( 'table', function ( settings, i ) {
				settings.aaSorting = that[i].map( function (col) {
					return [ col, dir ];
				} );
			} );
		}
	} );
	
	_api_registerPlural('columns().orderable()', 'column().orderable()', function ( directions ) {
		return this.iterator( 'column', function ( settings, idx ) {
			var col = settings.aoColumns[idx];
	
			return directions ?
				col.asSorting :
				col.bSortable;
		}, 1 );
	} );
	
	
	_api_register( 'processing()', function ( show ) {
		return this.iterator( 'table', function ( ctx ) {
			_fnProcessingDisplay( ctx, show );
		} );
	} );
	
	
	_api_register( 'search()', function ( input, regex, smart, caseInsen ) {
		var ctx = this.context;
	
		if ( input === undefined ) {
			// get
			return ctx.length !== 0 ?
				ctx[0].oPreviousSearch.search :
				undefined;
		}
	
		// set
		return this.iterator( 'table', function ( settings ) {
			if ( ! settings.oFeatures.bFilter ) {
				return;
			}
	
			if (typeof regex === 'object') {
				// New style options to pass to the search builder
				_fnFilterComplete( settings, $.extend( settings.oPreviousSearch, regex, {
					search: input
				} ) );
			}
			else {
				// Compat for the old options
				_fnFilterComplete( settings, $.extend( settings.oPreviousSearch, {
					search: input,
					regex:  regex === null ? false : regex,
					smart:  smart === null ? true  : smart,
					caseInsensitive: caseInsen === null ? true : caseInsen
				} ) );
			}
		} );
	} );
	
	_api_register( 'search.fixed()', function ( name, search ) {
		var ret = this.iterator( true, 'table', function ( settings ) {
			var fixed = settings.searchFixed;
	
			if (! name) {
				return Object.keys(fixed)
			}
			else if (search === undefined) {
				return fixed[name];
			}
			else if (search === null) {
				delete fixed[name];
			}
			else {
				fixed[name] = search;
			}
	
			return this;
		} );
	
		return name !== undefined && search === undefined
			? ret[0]
			: ret;
	} );
	
	_api_registerPlural(
		'columns().search()',
		'column().search()',
		function ( input, regex, smart, caseInsen ) {
			return this.iterator( 'column', function ( settings, column ) {
				var preSearch = settings.aoPreSearchCols;
	
				if ( input === undefined ) {
					// get
					return preSearch[ column ].search;
				}
	
				// set
				if ( ! settings.oFeatures.bFilter ) {
					return;
				}
	
				if (typeof regex === 'object') {
					// New style options to pass to the search builder
					$.extend( preSearch[ column ], regex, {
						search: input
					} );
				}
				else {
					// Old style (with not all options available)
					$.extend( preSearch[ column ], {
						search: input,
						regex:  regex === null ? false : regex,
						smart:  smart === null ? true  : smart,
						caseInsensitive: caseInsen === null ? true : caseInsen
					} );
				}
	
				_fnFilterComplete( settings, settings.oPreviousSearch );
			} );
		}
	);
	
	_api_register([
			'columns().search.fixed()',
			'column().search.fixed()'
		],
		function ( name, search ) {
			var ret = this.iterator( true, 'column', function ( settings, colIdx ) {
				var fixed = settings.aoColumns[colIdx].searchFixed;
	
				if (! name) {
					return Object.keys(fixed)
				}
				else if (search === undefined) {
					return fixed[name];
				}
				else if (search === null) {
					delete fixed[name];
				}
				else {
					fixed[name] = search;
				}
	
				return this;
			} );
	
			return name !== undefined && search === undefined
				? ret[0]
				: ret;
		}
	);
	/*
	 * State API methods
	 */
	
	_api_register( 'state()', function ( set, ignoreTime ) {
		// getter
		if ( ! set ) {
			return this.context.length ?
				this.context[0].oSavedState :
				null;
		}
	
		var setMutate = $.extend( true, {}, set );
	
		// setter
		return this.iterator( 'table', function ( settings ) {
			if ( ignoreTime !== false ) {
				setMutate.time = +new Date() + 100;
			}
	
			_fnImplementState( settings, setMutate, function(){} );
		} );
	} );
	
	
	_api_register( 'state.clear()', function () {
		return this.iterator( 'table', function ( settings ) {
			// Save an empty object
			settings.fnStateSaveCallback.call( settings.oInstance, settings, {} );
		} );
	} );
	
	
	_api_register( 'state.loaded()', function () {
		return this.context.length ?
			this.context[0].oLoadedState :
			null;
	} );
	
	
	_api_register( 'state.save()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnSaveState( settings );
		} );
	} );
	
	/**
	 * Set the jQuery or window object to be used by DataTables
	 *
	 * @param {*} module Library / container object
	 * @param {string} [type] Library or container type `lib`, `win` or `datetime`.
	 *   If not provided, automatic detection is attempted.
	 */
	DataTable.use = function (module, type) {
		if (type === 'lib' || module.fn) {
			$ = module;
		}
		else if (type == 'win' || module.document) {
			window = module;
			document = module.document;
		}
		else if (type === 'datetime' || module.type === 'DateTime') {
			DataTable.DateTime = module;
		}
	}
	
	/**
	 * CommonJS factory function pass through. This will check if the arguments
	 * given are a window object or a jQuery object. If so they are set
	 * accordingly.
	 * @param {*} root Window
	 * @param {*} jq jQUery
	 * @returns {boolean} Indicator
	 */
	DataTable.factory = function (root, jq) {
		var is = false;
	
		// Test if the first parameter is a window object
		if (root && root.document) {
			window = root;
			document = root.document;
		}
	
		// Test if the second parameter is a jQuery object
		if (jq && jq.fn && jq.fn.jquery) {
			$ = jq;
			is = true;
		}
	
		return is;
	}
	
	/**
	 * Provide a common method for plug-ins to check the version of DataTables being
	 * used, in order to ensure compatibility.
	 *
	 *  @param {string} version Version string to check for, in the format "X.Y.Z".
	 *    Note that the formats "X" and "X.Y" are also acceptable.
	 *  @param {string} [version2=current DataTables version] As above, but optional.
	 *   If not given the current DataTables version will be used.
	 *  @returns {boolean} true if this version of DataTables is greater or equal to
	 *    the required version, or false if this version of DataTales is not
	 *    suitable
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    alert( $.fn.dataTable.versionCheck( '1.9.0' ) );
	 */
	DataTable.versionCheck = function( version, version2 )
	{
		var aThis = version2 ?
			version2.split('.') :
			DataTable.version.split('.');
		var aThat = version.split('.');
		var iThis, iThat;
	
		for ( var i=0, iLen=aThat.length ; i<iLen ; i++ ) {
			iThis = parseInt( aThis[i], 10 ) || 0;
			iThat = parseInt( aThat[i], 10 ) || 0;
	
			// Parts are the same, keep comparing
			if (iThis === iThat) {
				continue;
			}
	
			// Parts are different, return immediately
			return iThis > iThat;
		}
	
		return true;
	};
	
	
	/**
	 * Check if a `<table>` node is a DataTable table already or not.
	 *
	 *  @param {node|jquery|string} table Table node, jQuery object or jQuery
	 *      selector for the table to test. Note that if more than more than one
	 *      table is passed on, only the first will be checked
	 *  @returns {boolean} true the table given is a DataTable, or false otherwise
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    if ( ! $.fn.DataTable.isDataTable( '#example' ) ) {
	 *      $('#example').dataTable();
	 *    }
	 */
	DataTable.isDataTable = function ( table )
	{
		var t = $(table).get(0);
		var is = false;
	
		if ( table instanceof DataTable.Api ) {
			return true;
		}
	
		$.each( DataTable.settings, function (i, o) {
			var head = o.nScrollHead ? $('table', o.nScrollHead)[0] : null;
			var foot = o.nScrollFoot ? $('table', o.nScrollFoot)[0] : null;
	
			if ( o.nTable === t || head === t || foot === t ) {
				is = true;
			}
		} );
	
		return is;
	};
	
	
	/**
	 * Get all DataTable tables that have been initialised - optionally you can
	 * select to get only currently visible tables.
	 *
	 *  @param {boolean} [visible=false] Flag to indicate if you want all (default)
	 *    or visible tables only.
	 *  @returns {array} Array of `table` nodes (not DataTable instances) which are
	 *    DataTables
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    $.each( $.fn.dataTable.tables(true), function () {
	 *      $(table).DataTable().columns.adjust();
	 *    } );
	 */
	DataTable.tables = function ( visible )
	{
		var api = false;
	
		if ( $.isPlainObject( visible ) ) {
			api = visible.api;
			visible = visible.visible;
		}
	
		var a = DataTable.settings
			.filter( function (o) {
				return !visible || (visible && $(o.nTable).is(':visible')) 
					? true
					: false;
			} )
			.map( function (o) {
				return o.nTable;
			});
	
		return api ?
			new _Api( a ) :
			a;
	};
	
	
	/**
	 * Convert from camel case parameters to Hungarian notation. This is made public
	 * for the extensions to provide the same ability as DataTables core to accept
	 * either the 1.9 style Hungarian notation, or the 1.10+ style camelCase
	 * parameters.
	 *
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 */
	DataTable.camelToHungarian = _fnCamelToHungarian;
	
	
	
	/**
	 *
	 */
	_api_register( '$()', function ( selector, opts ) {
		var
			rows   = this.rows( opts ).nodes(), // Get all rows
			jqRows = $(rows);
	
		return $( [].concat(
			jqRows.filter( selector ).toArray(),
			jqRows.find( selector ).toArray()
		) );
	} );
	
	
	// jQuery functions to operate on the tables
	$.each( [ 'on', 'one', 'off' ], function (i, key) {
		_api_register( key+'()', function ( /* event, handler */ ) {
			var args = Array.prototype.slice.call(arguments);
	
			// Add the `dt` namespace automatically if it isn't already present
			args[0] = args[0].split( /\s/ ).map( function ( e ) {
				return ! e.match(/\.dt\b/) ?
					e+'.dt' :
					e;
				} ).join( ' ' );
	
			var inst = $( this.tables().nodes() );
			inst[key].apply( inst, args );
			return this;
		} );
	} );
	
	
	_api_register( 'clear()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnClearTable( settings );
		} );
	} );
	
	
	_api_register( 'error()', function (msg) {
		return this.iterator( 'table', function ( settings ) {
			_fnLog( settings, 0, msg );
		} );
	} );
	
	
	_api_register( 'settings()', function () {
		return new _Api( this.context, this.context );
	} );
	
	
	_api_register( 'init()', function () {
		var ctx = this.context;
		return ctx.length ? ctx[0].oInit : null;
	} );
	
	
	_api_register( 'data()', function () {
		return this.iterator( 'table', function ( settings ) {
			return _pluck( settings.aoData, '_aData' );
		} ).flatten();
	} );
	
	
	_api_register( 'trigger()', function ( name, args, bubbles ) {
		return this.iterator( 'table', function ( settings ) {
			return _fnCallbackFire( settings, null, name, args, bubbles );
		} ).flatten();
	} );
	
	
	_api_register( 'ready()', function ( fn ) {
		var ctx = this.context;
	
		// Get status of first table
		if (! fn) {
			return ctx.length
				? (ctx[0]._bInitComplete || false)
				: null;
		}
	
		// Function to run either once the table becomes ready or
		// immediately if it is already ready.
		return this.tables().every(function () {
			if (this.context[0]._bInitComplete) {
				fn.call(this);
			}
			else {
				this.on('init', function () {
					fn.call(this);
				});
			}
		} );
	} );
	
	
	_api_register( 'destroy()', function ( remove ) {
		remove = remove || false;
	
		return this.iterator( 'table', function ( settings ) {
			var classes   = settings.oClasses;
			var table     = settings.nTable;
			var tbody     = settings.nTBody;
			var thead     = settings.nTHead;
			var tfoot     = settings.nTFoot;
			var jqTable   = $(table);
			var jqTbody   = $(tbody);
			var jqWrapper = $(settings.nTableWrapper);
			var rows      = settings.aoData.map( function (r) { return r ? r.nTr : null; } );
			var orderClasses = classes.order;
	
			// Flag to note that the table is currently being destroyed - no action
			// should be taken
			settings.bDestroying = true;
	
			// Fire off the destroy callbacks for plug-ins etc
			_fnCallbackFire( settings, "aoDestroyCallback", "destroy", [settings], true );
	
			// If not being removed from the document, make all columns visible
			if ( ! remove ) {
				new _Api( settings ).columns().visible( true );
			}
	
			// Blitz all `DT` namespaced events (these are internal events, the
			// lowercase, `dt` events are user subscribed and they are responsible
			// for removing them
			jqWrapper.off('.DT').find(':not(tbody *)').off('.DT');
			$(window).off('.DT-'+settings.sInstance);
	
			// When scrolling we had to break the table up - restore it
			if ( table != thead.parentNode ) {
				jqTable.children('thead').detach();
				jqTable.append( thead );
			}
	
			if ( tfoot && table != tfoot.parentNode ) {
				jqTable.children('tfoot').detach();
				jqTable.append( tfoot );
			}
	
			settings.colgroup.remove();
	
			settings.aaSorting = [];
			settings.aaSortingFixed = [];
			_fnSortingClasses( settings );
	
			$('th, td', thead)
				.removeClass(
					orderClasses.canAsc + ' ' +
					orderClasses.canDesc + ' ' +
					orderClasses.isAsc + ' ' +
					orderClasses.isDesc
				)
				.css('width', '');
	
			// Add the TR elements back into the table in their original order
			jqTbody.children().detach();
			jqTbody.append( rows );
	
			var orig = settings.nTableWrapper.parentNode;
			var insertBefore = settings.nTableWrapper.nextSibling;
	
			// Remove the DataTables generated nodes, events and classes
			var removedMethod = remove ? 'remove' : 'detach';
			jqTable[ removedMethod ]();
			jqWrapper[ removedMethod ]();
	
			// If we need to reattach the table to the document
			if ( ! remove && orig ) {
				// insertBefore acts like appendChild if !arg[1]
				orig.insertBefore( table, insertBefore );
	
				// Restore the width of the original table - was read from the style property,
				// so we can restore directly to that
				jqTable
					.css( 'width', settings.sDestroyWidth )
					.removeClass( classes.table );
			}
	
			/* Remove the settings object from the settings array */
			var idx = DataTable.settings.indexOf(settings);
			if ( idx !== -1 ) {
				DataTable.settings.splice( idx, 1 );
			}
		} );
	} );
	
	
	// Add the `every()` method for rows, columns and cells in a compact form
	$.each( [ 'column', 'row', 'cell' ], function ( i, type ) {
		_api_register( type+'s().every()', function ( fn ) {
			var opts = this.selector.opts;
			var api = this;
			var inst;
			var counter = 0;
	
			return this.iterator( 'every', function ( settings, selectedIdx, tableIdx ) {
				inst = api[ type ](selectedIdx, opts);
	
				if (type === 'cell') {
					fn.call(inst, inst[0][0].row, inst[0][0].column, tableIdx, counter);
				}
				else {
					fn.call(inst, selectedIdx, tableIdx, counter);
				}
	
				counter++;
			} );
		} );
	} );
	
	
	// i18n method for extensions to be able to use the language object from the
	// DataTable
	_api_register( 'i18n()', function ( token, def, plural ) {
		var ctx = this.context[0];
		var resolved = _fnGetObjectDataFn( token )( ctx.oLanguage );
	
		if ( resolved === undefined ) {
			resolved = def;
		}
	
		if ( $.isPlainObject( resolved ) ) {
			resolved = plural !== undefined && resolved[ plural ] !== undefined ?
				resolved[ plural ] :
				resolved._;
		}
	
		return typeof resolved === 'string'
			? resolved.replace( '%d', plural ) // nb: plural might be undefined,
			: resolved;
	} );
	
	/**
	 * Version string for plug-ins to check compatibility. Allowed format is
	 * `a.b.c-d` where: a:int, b:int, c:int, d:string(dev|beta|alpha). `d` is used
	 * only for non-release builds. See https://semver.org/ for more information.
	 *  @member
	 *  @type string
	 *  @default Version number
	 */
	DataTable.version = "2.0.5";
	
	/**
	 * Private data store, containing all of the settings objects that are
	 * created for the tables on a given page.
	 *
	 * Note that the `DataTable.settings` object is aliased to
	 * `jQuery.fn.dataTableExt` through which it may be accessed and
	 * manipulated, or `jQuery.fn.dataTable.settings`.
	 *  @member
	 *  @type array
	 *  @default []
	 *  @private
	 */
	DataTable.settings = [];
	
	/**
	 * Object models container, for the various models that DataTables has
	 * available to it. These models define the objects that are used to hold
	 * the active state and configuration of the table.
	 *  @namespace
	 */
	DataTable.models = {};
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * search information for the global filter and individual column filters.
	 *  @namespace
	 */
	DataTable.models.oSearch = {
		/**
		 * Flag to indicate if the filtering should be case insensitive or not
		 */
		"caseInsensitive": true,
	
		/**
		 * Applied search term
		 */
		"search": "",
	
		/**
		 * Flag to indicate if the search term should be interpreted as a
		 * regular expression (true) or not (false) and therefore and special
		 * regex characters escaped.
		 */
		"regex": false,
	
		/**
		 * Flag to indicate if DataTables is to use its smart filtering or not.
		 */
		"smart": true,
	
		/**
		 * Flag to indicate if DataTables should only trigger a search when
		 * the return key is pressed.
		 */
		"return": false
	};
	
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * each individual row. This is the object format used for the settings
	 * aoData array.
	 *  @namespace
	 */
	DataTable.models.oRow = {
		/**
		 * TR element for the row
		 */
		"nTr": null,
	
		/**
		 * Array of TD elements for each row. This is null until the row has been
		 * created.
		 */
		"anCells": null,
	
		/**
		 * Data object from the original data source for the row. This is either
		 * an array if using the traditional form of DataTables, or an object if
		 * using mData options. The exact type will depend on the passed in
		 * data from the data source, or will be an array if using DOM a data
		 * source.
		 */
		"_aData": [],
	
		/**
		 * Sorting data cache - this array is ostensibly the same length as the
		 * number of columns (although each index is generated only as it is
		 * needed), and holds the data that is used for sorting each column in the
		 * row. We do this cache generation at the start of the sort in order that
		 * the formatting of the sort data need be done only once for each cell
		 * per sort. This array should not be read from or written to by anything
		 * other than the master sorting methods.
		 */
		"_aSortData": null,
	
		/**
		 * Per cell filtering data cache. As per the sort data cache, used to
		 * increase the performance of the filtering in DataTables
		 */
		"_aFilterData": null,
	
		/**
		 * Filtering data cache. This is the same as the cell filtering cache, but
		 * in this case a string rather than an array. This is easily computed with
		 * a join on `_aFilterData`, but is provided as a cache so the join isn't
		 * needed on every search (memory traded for performance)
		 */
		"_sFilterRow": null,
	
		/**
		 * Denote if the original data source was from the DOM, or the data source
		 * object. This is used for invalidating data, so DataTables can
		 * automatically read data from the original source, unless uninstructed
		 * otherwise.
		 */
		"src": null,
	
		/**
		 * Index in the aoData array. This saves an indexOf lookup when we have the
		 * object, but want to know the index
		 */
		"idx": -1,
	
		/**
		 * Cached display value
		 */
		displayData: null
	};
	
	
	/**
	 * Template object for the column information object in DataTables. This object
	 * is held in the settings aoColumns array and contains all the information that
	 * DataTables needs about each individual column.
	 *
	 * Note that this object is related to {@link DataTable.defaults.column}
	 * but this one is the internal data store for DataTables's cache of columns.
	 * It should NOT be manipulated outside of DataTables. Any configuration should
	 * be done through the initialisation options.
	 *  @namespace
	 */
	DataTable.models.oColumn = {
		/**
		 * Column index.
		 */
		"idx": null,
	
		/**
		 * A list of the columns that sorting should occur on when this column
		 * is sorted. That this property is an array allows multi-column sorting
		 * to be defined for a column (for example first name / last name columns
		 * would benefit from this). The values are integers pointing to the
		 * columns to be sorted on (typically it will be a single integer pointing
		 * at itself, but that doesn't need to be the case).
		 */
		"aDataSort": null,
	
		/**
		 * Define the sorting directions that are applied to the column, in sequence
		 * as the column is repeatedly sorted upon - i.e. the first value is used
		 * as the sorting direction when the column if first sorted (clicked on).
		 * Sort it again (click again) and it will move on to the next index.
		 * Repeat until loop.
		 */
		"asSorting": null,
	
		/**
		 * Flag to indicate if the column is searchable, and thus should be included
		 * in the filtering or not.
		 */
		"bSearchable": null,
	
		/**
		 * Flag to indicate if the column is sortable or not.
		 */
		"bSortable": null,
	
		/**
		 * Flag to indicate if the column is currently visible in the table or not
		 */
		"bVisible": null,
	
		/**
		 * Store for manual type assignment using the `column.type` option. This
		 * is held in store so we can manipulate the column's `sType` property.
		 */
		"_sManualType": null,
	
		/**
		 * Flag to indicate if HTML5 data attributes should be used as the data
		 * source for filtering or sorting. True is either are.
		 */
		"_bAttrSrc": false,
	
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 */
		"fnCreatedCell": null,
	
		/**
		 * Function to get data from a cell in a column. You should <b>never</b>
		 * access data directly through _aData internally in DataTables - always use
		 * the method attached to this property. It allows mData to function as
		 * required. This function is automatically assigned by the column
		 * initialisation method
		 */
		"fnGetData": null,
	
		/**
		 * Function to set data for a cell in the column. You should <b>never</b>
		 * set the data directly to _aData internally in DataTables - always use
		 * this method. It allows mData to function as required. This function
		 * is automatically assigned by the column initialisation method
		 */
		"fnSetData": null,
	
		/**
		 * Property to read the value for the cells in the column from the data
		 * source array / object. If null, then the default content is used, if a
		 * function is given then the return from the function is used.
		 */
		"mData": null,
	
		/**
		 * Partner property to mData which is used (only when defined) to get
		 * the data - i.e. it is basically the same as mData, but without the
		 * 'set' option, and also the data fed to it is the result from mData.
		 * This is the rendering method to match the data method of mData.
		 */
		"mRender": null,
	
		/**
		 * The class to apply to all TD elements in the table's TBODY for the column
		 */
		"sClass": null,
	
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 */
		"sContentPadding": null,
	
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because mData
		 * is set to null, or because the data source itself is null).
		 */
		"sDefaultContent": null,
	
		/**
		 * Name for the column, allowing reference to the column by name as well as
		 * by index (needs a lookup to work by name).
		 */
		"sName": null,
	
		/**
		 * Custom sorting data type - defines which of the available plug-ins in
		 * afnSortData the custom sorting will use - if any is defined.
		 */
		"sSortDataType": 'std',
	
		/**
		 * Class to be applied to the header element when sorting on this column
		 */
		"sSortingClass": null,
	
		/**
		 * Title of the column - what is seen in the TH element (nTh).
		 */
		"sTitle": null,
	
		/**
		 * Column sorting and filtering type
		 */
		"sType": null,
	
		/**
		 * Width of the column
		 */
		"sWidth": null,
	
		/**
		 * Width of the column when it was first "encountered"
		 */
		"sWidthOrig": null,
	
		/** Cached string which is the longest in the column */
		maxLenString: null,
	
		/**
		 * Store for named searches
		 */
		searchFixed: null
	};
	
	
	/*
	 * Developer note: The properties of the object below are given in Hungarian
	 * notation, that was used as the interface for DataTables prior to v1.10, however
	 * from v1.10 onwards the primary interface is camel case. In order to avoid
	 * breaking backwards compatibility utterly with this change, the Hungarian
	 * version is still, internally the primary interface, but is is not documented
	 * - hence the @name tags in each doc comment. This allows a Javascript function
	 * to create a map from Hungarian notation to camel case (going the other direction
	 * would require each property to be listed, which would add around 3K to the size
	 * of DataTables, while this method is about a 0.5K hit).
	 *
	 * Ultimately this does pave the way for Hungarian notation to be dropped
	 * completely, but that is a massive amount of work and will break current
	 * installs (therefore is on-hold until v2).
	 */
	
	/**
	 * Initialisation options that can be given to DataTables at initialisation
	 * time.
	 *  @namespace
	 */
	DataTable.defaults = {
		/**
		 * An array of data to use for the table, passed in at initialisation which
		 * will be used in preference to any data which is already in the DOM. This is
		 * particularly useful for constructing tables purely in Javascript, for
		 * example with a custom Ajax call.
		 */
		"aaData": null,
	
	
		/**
		 * If ordering is enabled, then DataTables will perform a first pass sort on
		 * initialisation. You can define which column(s) the sort is performed
		 * upon, and the sorting direction, with this variable. The `sorting` array
		 * should contain an array for each column to be sorted initially containing
		 * the column's index and a direction string ('asc' or 'desc').
		 */
		"aaSorting": [[0,'asc']],
	
	
		/**
		 * This parameter is basically identical to the `sorting` parameter, but
		 * cannot be overridden by user interaction with the table. What this means
		 * is that you could have a column (visible or hidden) which the sorting
		 * will always be forced on first - any sorting after that (from the user)
		 * will then be performed as required. This can be useful for grouping rows
		 * together.
		 */
		"aaSortingFixed": [],
	
	
		/**
		 * DataTables can be instructed to load data to display in the table from a
		 * Ajax source. This option defines how that Ajax call is made and where to.
		 *
		 * The `ajax` property has three different modes of operation, depending on
		 * how it is defined. These are:
		 *
		 * * `string` - Set the URL from where the data should be loaded from.
		 * * `object` - Define properties for `jQuery.ajax`.
		 * * `function` - Custom data get function
		 *
		 * `string`
		 * --------
		 *
		 * As a string, the `ajax` property simply defines the URL from which
		 * DataTables will load data.
		 *
		 * `object`
		 * --------
		 *
		 * As an object, the parameters in the object are passed to
		 * [jQuery.ajax](https://api.jquery.com/jQuery.ajax/) allowing fine control
		 * of the Ajax request. DataTables has a number of default parameters which
		 * you can override using this option. Please refer to the jQuery
		 * documentation for a full description of the options available, although
		 * the following parameters provide additional options in DataTables or
		 * require special consideration:
		 *
		 * * `data` - As with jQuery, `data` can be provided as an object, but it
		 *   can also be used as a function to manipulate the data DataTables sends
		 *   to the server. The function takes a single parameter, an object of
		 *   parameters with the values that DataTables has readied for sending. An
		 *   object may be returned which will be merged into the DataTables
		 *   defaults, or you can add the items to the object that was passed in and
		 *   not return anything from the function. This supersedes `fnServerParams`
		 *   from DataTables 1.9-.
		 *
		 * * `dataSrc` - By default DataTables will look for the property `data` (or
		 *   `aaData` for compatibility with DataTables 1.9-) when obtaining data
		 *   from an Ajax source or for server-side processing - this parameter
		 *   allows that property to be changed. You can use Javascript dotted
		 *   object notation to get a data source for multiple levels of nesting, or
		 *   it my be used as a function. As a function it takes a single parameter,
		 *   the JSON returned from the server, which can be manipulated as
		 *   required, with the returned value being that used by DataTables as the
		 *   data source for the table.
		 *
		 * * `success` - Should not be overridden it is used internally in
		 *   DataTables. To manipulate / transform the data returned by the server
		 *   use `ajax.dataSrc`, or use `ajax` as a function (see below).
		 *
		 * `function`
		 * ----------
		 *
		 * As a function, making the Ajax call is left up to yourself allowing
		 * complete control of the Ajax request. Indeed, if desired, a method other
		 * than Ajax could be used to obtain the required data, such as Web storage
		 * or an AIR database.
		 *
		 * The function is given four parameters and no return is required. The
		 * parameters are:
		 *
		 * 1. _object_ - Data to send to the server
		 * 2. _function_ - Callback function that must be executed when the required
		 *    data has been obtained. That data should be passed into the callback
		 *    as the only parameter
		 * 3. _object_ - DataTables settings object for the table
		 */
		"ajax": null,
	
	
		/**
		 * This parameter allows you to readily specify the entries in the length drop
		 * down menu that DataTables shows when pagination is enabled. It can be
		 * either a 1D array of options which will be used for both the displayed
		 * option and the value, or a 2D array which will use the array in the first
		 * position as the value, and the array in the second position as the
		 * displayed options (useful for language strings such as 'All').
		 *
		 * Note that the `pageLength` property will be automatically set to the
		 * first value given in this array, unless `pageLength` is also provided.
		 */
		"aLengthMenu": [ 10, 25, 50, 100 ],
	
	
		/**
		 * The `columns` option in the initialisation parameter allows you to define
		 * details about the way individual columns behave. For a full list of
		 * column options that can be set, please see
		 * {@link DataTable.defaults.column}. Note that if you use `columns` to
		 * define your columns, you must have an entry in the array for every single
		 * column that you have in your table (these can be null if you don't which
		 * to specify any options).
		 */
		"aoColumns": null,
	
		/**
		 * Very similar to `columns`, `columnDefs` allows you to target a specific
		 * column, multiple columns, or all columns, using the `targets` property of
		 * each object in the array. This allows great flexibility when creating
		 * tables, as the `columnDefs` arrays can be of any length, targeting the
		 * columns you specifically want. `columnDefs` may use any of the column
		 * options available: {@link DataTable.defaults.column}, but it _must_
		 * have `targets` defined in each object in the array. Values in the `targets`
		 * array may be:
		 *   <ul>
		 *     <li>a string - class name will be matched on the TH for the column</li>
		 *     <li>0 or a positive integer - column index counting from the left</li>
		 *     <li>a negative integer - column index counting from the right</li>
		 *     <li>the string "_all" - all columns (i.e. assign a default)</li>
		 *   </ul>
		 */
		"aoColumnDefs": null,
	
	
		/**
		 * Basically the same as `search`, this parameter defines the individual column
		 * filtering state at initialisation time. The array must be of the same size
		 * as the number of columns, and each element be an object with the parameters
		 * `search` and `escapeRegex` (the latter is optional). 'null' is also
		 * accepted and the default will be used.
		 */
		"aoSearchCols": [],
	
	
		/**
		 * Enable or disable automatic column width calculation. This can be disabled
		 * as an optimisation (it takes some time to calculate the widths) if the
		 * tables widths are passed in using `columns`.
		 */
		"bAutoWidth": true,
	
	
		/**
		 * Deferred rendering can provide DataTables with a huge speed boost when you
		 * are using an Ajax or JS data source for the table. This option, when set to
		 * true, will cause DataTables to defer the creation of the table elements for
		 * each row until they are needed for a draw - saving a significant amount of
		 * time.
		 */
		"bDeferRender": true,
	
	
		/**
		 * Replace a DataTable which matches the given selector and replace it with
		 * one which has the properties of the new initialisation object passed. If no
		 * table matches the selector, then the new DataTable will be constructed as
		 * per normal.
		 */
		"bDestroy": false,
	
	
		/**
		 * Enable or disable filtering of data. Filtering in DataTables is "smart" in
		 * that it allows the end user to input multiple words (space separated) and
		 * will match a row containing those words, even if not in the order that was
		 * specified (this allow matching across multiple columns). Note that if you
		 * wish to use filtering in DataTables this must remain 'true' - to remove the
		 * default filtering input box and retain filtering abilities, please use
		 * {@link DataTable.defaults.dom}.
		 */
		"bFilter": true,
	
		/**
		 * Used only for compatiblity with DT1
		 * @deprecated
		 */
		"bInfo": true,
	
		/**
		 * Used only for compatiblity with DT1
		 * @deprecated
		 */
		"bLengthChange": true,
	
		/**
		 * Enable or disable pagination.
		 */
		"bPaginate": true,
	
	
		/**
		 * Enable or disable the display of a 'processing' indicator when the table is
		 * being processed (e.g. a sort). This is particularly useful for tables with
		 * large amounts of data where it can take a noticeable amount of time to sort
		 * the entries.
		 */
		"bProcessing": false,
	
	
		/**
		 * Retrieve the DataTables object for the given selector. Note that if the
		 * table has already been initialised, this parameter will cause DataTables
		 * to simply return the object that has already been set up - it will not take
		 * account of any changes you might have made to the initialisation object
		 * passed to DataTables (setting this parameter to true is an acknowledgement
		 * that you understand this). `destroy` can be used to reinitialise a table if
		 * you need.
		 */
		"bRetrieve": false,
	
	
		/**
		 * When vertical (y) scrolling is enabled, DataTables will force the height of
		 * the table's viewport to the given height at all times (useful for layout).
		 * However, this can look odd when filtering data down to a small data set,
		 * and the footer is left "floating" further down. This parameter (when
		 * enabled) will cause DataTables to collapse the table's viewport down when
		 * the result set will fit within the given Y height.
		 */
		"bScrollCollapse": false,
	
	
		/**
		 * Configure DataTables to use server-side processing. Note that the
		 * `ajax` parameter must also be given in order to give DataTables a
		 * source to obtain the required data for each draw.
		 */
		"bServerSide": false,
	
	
		/**
		 * Enable or disable sorting of columns. Sorting of individual columns can be
		 * disabled by the `sortable` option for each column.
		 */
		"bSort": true,
	
	
		/**
		 * Enable or display DataTables' ability to sort multiple columns at the
		 * same time (activated by shift-click by the user).
		 */
		"bSortMulti": true,
	
	
		/**
		 * Allows control over whether DataTables should use the top (true) unique
		 * cell that is found for a single column, or the bottom (false - default).
		 * This is useful when using complex headers.
		 */
		"bSortCellsTop": null,
	
	
		/**
		 * Enable or disable the addition of the classes `sorting\_1`, `sorting\_2` and
		 * `sorting\_3` to the columns which are currently being sorted on. This is
		 * presented as a feature switch as it can increase processing time (while
		 * classes are removed and added) so for large data sets you might want to
		 * turn this off.
		 */
		"bSortClasses": true,
	
	
		/**
		 * Enable or disable state saving. When enabled HTML5 `localStorage` will be
		 * used to save table display information such as pagination information,
		 * display length, filtering and sorting. As such when the end user reloads
		 * the page the display display will match what thy had previously set up.
		 */
		"bStateSave": false,
	
	
		/**
		 * This function is called when a TR element is created (and all TD child
		 * elements have been inserted), or registered if using a DOM source, allowing
		 * manipulation of the TR element (adding classes etc).
		 */
		"fnCreatedRow": null,
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify any aspect you want about the created DOM.
		 */
		"fnDrawCallback": null,
	
	
		/**
		 * Identical to fnHeaderCallback() but for the table footer this function
		 * allows you to modify the table footer on every 'draw' event.
		 */
		"fnFooterCallback": null,
	
	
		/**
		 * When rendering large numbers in the information element for the table
		 * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
		 * to have a comma separator for the 'thousands' units (e.g. 1 million is
		 * rendered as "1,000,000") to help readability for the end user. This
		 * function will override the default method DataTables uses.
		 */
		"fnFormatNumber": function ( toFormat ) {
			return toFormat.toString().replace(
				/\B(?=(\d{3})+(?!\d))/g,
				this.oLanguage.sThousands
			);
		},
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify the header row. This can be used to calculate and
		 * display useful information about the table.
		 */
		"fnHeaderCallback": null,
	
	
		/**
		 * The information element can be used to convey information about the current
		 * state of the table. Although the internationalisation options presented by
		 * DataTables are quite capable of dealing with most customisations, there may
		 * be times where you wish to customise the string further. This callback
		 * allows you to do exactly that.
		 */
		"fnInfoCallback": null,
	
	
		/**
		 * Called when the table has been initialised. Normally DataTables will
		 * initialise sequentially and there will be no need for this function,
		 * however, this does not hold true when using external language information
		 * since that is obtained using an async XHR call.
		 */
		"fnInitComplete": null,
	
	
		/**
		 * Called at the very start of each table draw and can be used to cancel the
		 * draw by returning false, any other return (including undefined) results in
		 * the full draw occurring).
		 */
		"fnPreDrawCallback": null,
	
	
		/**
		 * This function allows you to 'post process' each row after it have been
		 * generated for each table draw, but before it is rendered on screen. This
		 * function might be used for setting the row class name etc.
		 */
		"fnRowCallback": null,
	
	
		/**
		 * Load the table state. With this function you can define from where, and how, the
		 * state of a table is loaded. By default DataTables will load from `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 */
		"fnStateLoadCallback": function ( settings ) {
			try {
				return JSON.parse(
					(settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem(
						'DataTables_'+settings.sInstance+'_'+location.pathname
					)
				);
			} catch (e) {
				return {};
			}
		},
	
	
		/**
		 * Callback which allows modification of the saved state prior to loading that state.
		 * This callback is called when the table is loading state from the stored data, but
		 * prior to the settings object being modified by the saved state. Note that for
		 * plug-in authors, you should use the `stateLoadParams` event to load parameters for
		 * a plug-in.
		 */
		"fnStateLoadParams": null,
	
	
		/**
		 * Callback that is called when the state has been loaded from the state saving method
		 * and the DataTables settings object has been modified as a result of the loaded state.
		 */
		"fnStateLoaded": null,
	
	
		/**
		 * Save the table state. This function allows you to define where and how the state
		 * information for the table is stored By default DataTables will use `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 */
		"fnStateSaveCallback": function ( settings, data ) {
			try {
				(settings.iStateDuration === -1 ? sessionStorage : localStorage).setItem(
					'DataTables_'+settings.sInstance+'_'+location.pathname,
					JSON.stringify( data )
				);
			} catch (e) {
				// noop
			}
		},
	
	
		/**
		 * Callback which allows modification of the state to be saved. Called when the table
		 * has changed state a new state save is required. This method allows modification of
		 * the state saving object prior to actually doing the save, including addition or
		 * other state properties or modification. Note that for plug-in authors, you should
		 * use the `stateSaveParams` event to save parameters for a plug-in.
		 */
		"fnStateSaveParams": null,
	
	
		/**
		 * Duration for which the saved state information is considered valid. After this period
		 * has elapsed the state will be returned to the default.
		 * Value is given in seconds.
		 */
		"iStateDuration": 7200,
	
	
		/**
		 * Number of rows to display on a single page when using pagination. If
		 * feature enabled (`lengthChange`) then the end user will be able to override
		 * this to a custom setting using a pop-up menu.
		 */
		"iDisplayLength": 10,
	
	
		/**
		 * Define the starting point for data display when using DataTables with
		 * pagination. Note that this parameter is the number of records, rather than
		 * the page number, so if you have 10 records per page and want to start on
		 * the third page, it should be "20".
		 */
		"iDisplayStart": 0,
	
	
		/**
		 * By default DataTables allows keyboard navigation of the table (sorting, paging,
		 * and filtering) by adding a `tabindex` attribute to the required elements. This
		 * allows you to tab through the controls and press the enter key to activate them.
		 * The tabindex is default 0, meaning that the tab follows the flow of the document.
		 * You can overrule this using this parameter if you wish. Use a value of -1 to
		 * disable built-in keyboard navigation.
		 */
		"iTabIndex": 0,
	
	
		/**
		 * Classes that DataTables assigns to the various components and features
		 * that it adds to the HTML table. This allows classes to be configured
		 * during initialisation in addition to through the static
		 * {@link DataTable.ext.oStdClasses} object).
		 */
		"oClasses": {},
	
	
		/**
		 * All strings that DataTables uses in the user interface that it creates
		 * are defined in this object, allowing you to modified them individually or
		 * completely replace them all as required.
		 */
		"oLanguage": {
			/**
			 * Strings that are used for WAI-ARIA labels and controls only (these are not
			 * actually visible on the page, but will be read by screenreaders, and thus
			 * must be internationalised as well).
			 */
			"oAria": {
				/**
				 * ARIA label that is added to the table headers when the column may be sorted
				 */
				"orderable": ": Activate to sort",
	
				/**
				 * ARIA label that is added to the table headers when the column is currently being sorted
				 */
				"orderableReverse": ": Activate to invert sorting",
	
				/**
				 * ARIA label that is added to the table headers when the column is currently being 
				 * sorted and next step is to remove sorting
				 */
				"orderableRemove": ": Activate to remove sorting",
	
				paginate: {
					first: 'First',
					last: 'Last',
					next: 'Next',
					previous: 'Previous'
				}
			},
	
			/**
			 * Pagination string used by DataTables for the built-in pagination
			 * control types.
			 */
			"oPaginate": {
				/**
				 * Label and character for first page button («)
				 */
				"sFirst": "\u00AB",
	
				/**
				 * Last page button (»)
				 */
				"sLast": "\u00BB",
	
				/**
				 * Next page button (›)
				 */
				"sNext": "\u203A",
	
				/**
				 * Previous page button (‹)
				 */
				"sPrevious": "\u2039",
			},
	
			/**
			 * Plural object for the data type the table is showing
			 */
			entries: {
				_: "entries",
				1: "entry"
			},
	
			/**
			 * This string is shown in preference to `zeroRecords` when the table is
			 * empty of data (regardless of filtering). Note that this is an optional
			 * parameter - if it is not given, the value of `zeroRecords` will be used
			 * instead (either the default or given value).
			 */
			"sEmptyTable": "No data available in table",
	
	
			/**
			 * This string gives information to the end user about the information
			 * that is current on display on the page. The following tokens can be
			 * used in the string and will be dynamically replaced as the table
			 * display updates. This tokens can be placed anywhere in the string, or
			 * removed as needed by the language requires:
			 *
			 * * `\_START\_` - Display index of the first record on the current page
			 * * `\_END\_` - Display index of the last record on the current page
			 * * `\_TOTAL\_` - Number of records in the table after filtering
			 * * `\_MAX\_` - Number of records in the table without filtering
			 * * `\_PAGE\_` - Current page number
			 * * `\_PAGES\_` - Total number of pages of data in the table
			 */
			"sInfo": "Showing _START_ to _END_ of _TOTAL_ _ENTRIES-TOTAL_",
	
	
			/**
			 * Display information string for when the table is empty. Typically the
			 * format of this string should match `info`.
			 */
			"sInfoEmpty": "Showing 0 to 0 of 0 _ENTRIES-TOTAL_",
	
	
			/**
			 * When a user filters the information in a table, this string is appended
			 * to the information (`info`) to give an idea of how strong the filtering
			 * is. The variable _MAX_ is dynamically updated.
			 */
			"sInfoFiltered": "(filtered from _MAX_ total _ENTRIES-MAX_)",
	
	
			/**
			 * If can be useful to append extra information to the info string at times,
			 * and this variable does exactly that. This information will be appended to
			 * the `info` (`infoEmpty` and `infoFiltered` in whatever combination they are
			 * being used) at all times.
			 */
			"sInfoPostFix": "",
	
	
			/**
			 * This decimal place operator is a little different from the other
			 * language options since DataTables doesn't output floating point
			 * numbers, so it won't ever use this for display of a number. Rather,
			 * what this parameter does is modify the sort methods of the table so
			 * that numbers which are in a format which has a character other than
			 * a period (`.`) as a decimal place will be sorted numerically.
			 *
			 * Note that numbers with different decimal places cannot be shown in
			 * the same table and still be sortable, the table must be consistent.
			 * However, multiple different tables on the page can use different
			 * decimal place characters.
			 */
			"sDecimal": "",
	
	
			/**
			 * DataTables has a build in number formatter (`formatNumber`) which is
			 * used to format large numbers that are used in the table information.
			 * By default a comma is used, but this can be trivially changed to any
			 * character you wish with this parameter.
			 */
			"sThousands": ",",
	
	
			/**
			 * Detail the action that will be taken when the drop down menu for the
			 * pagination length option is changed. The '_MENU_' variable is replaced
			 * with a default select list of 10, 25, 50 and 100, and can be replaced
			 * with a custom select box if required.
			 */
			"sLengthMenu": "_MENU_ _ENTRIES_ per page",
	
	
			/**
			 * When using Ajax sourced data and during the first draw when DataTables is
			 * gathering the data, this message is shown in an empty row in the table to
			 * indicate to the end user the the data is being loaded. Note that this
			 * parameter is not used when loading data by server-side processing, just
			 * Ajax sourced data with client-side processing.
			 */
			"sLoadingRecords": "Loading...",
	
	
			/**
			 * Text which is displayed when the table is processing a user action
			 * (usually a sort command or similar).
			 */
			"sProcessing": "",
	
	
			/**
			 * Details the actions that will be taken when the user types into the
			 * filtering input text box. The variable "_INPUT_", if used in the string,
			 * is replaced with the HTML text box for the filtering input allowing
			 * control over where it appears in the string. If "_INPUT_" is not given
			 * then the input box is appended to the string automatically.
			 */
			"sSearch": "Search:",
	
	
			/**
			 * Assign a `placeholder` attribute to the search `input` element
			 *  @type string
			 *  @default 
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.searchPlaceholder
			 */
			"sSearchPlaceholder": "",
	
	
			/**
			 * All of the language information can be stored in a file on the
			 * server-side, which DataTables will look up if this parameter is passed.
			 * It must store the URL of the language file, which is in a JSON format,
			 * and the object has the same properties as the oLanguage object in the
			 * initialiser object (i.e. the above parameters). Please refer to one of
			 * the example language files to see how this works in action.
			 */
			"sUrl": "",
	
	
			/**
			 * Text shown inside the table records when the is no information to be
			 * displayed after filtering. `emptyTable` is shown when there is simply no
			 * information in the table at all (regardless of filtering).
			 */
			"sZeroRecords": "No matching records found"
		},
	
	
		/**
		 * This parameter allows you to have define the global filtering state at
		 * initialisation time. As an object the `search` parameter must be
		 * defined, but all other parameters are optional. When `regex` is true,
		 * the search string will be treated as a regular expression, when false
		 * (default) it will be treated as a straight string. When `smart`
		 * DataTables will use it's smart filtering methods (to word match at
		 * any point in the data), when false this will not be done.
		 */
		"oSearch": $.extend( {}, DataTable.models.oSearch ),
	
	
		/**
		 * Table and control layout. This replaces the legacy `dom` option.
		 */
		layout: {
			topStart: 'pageLength',
			topEnd: 'search',
			bottomStart: 'info',
			bottomEnd: 'paging'
		},
	
	
		/**
		 * Legacy DOM layout option
		 */
		"sDom": null,
	
	
		/**
		 * Search delay option. This will throttle full table searches that use the
		 * DataTables provided search input element (it does not effect calls to
		 * `dt-api search()`, providing a delay before the search is made.
		 */
		"searchDelay": null,
	
	
		/**
		 * DataTables features six different built-in options for the buttons to
		 * display for pagination control:
		 *
		 * * `numbers` - Page number buttons only
		 * * `simple` - 'Previous' and 'Next' buttons only
		 * * 'simple_numbers` - 'Previous' and 'Next' buttons, plus page numbers
		 * * `full` - 'First', 'Previous', 'Next' and 'Last' buttons
		 * * `full_numbers` - 'First', 'Previous', 'Next' and 'Last' buttons, plus page numbers
		 * * `first_last_numbers` - 'First' and 'Last' buttons, plus page numbers
		 */
		"sPaginationType": "full_numbers",
	
	
		/**
		 * Enable horizontal scrolling. When a table is too wide to fit into a
		 * certain layout, or you have a large number of columns in the table, you
		 * can enable x-scrolling to show the table in a viewport, which can be
		 * scrolled. This property can be `true` which will allow the table to
		 * scroll horizontally when needed, or any CSS unit, or a number (in which
		 * case it will be treated as a pixel measurement). Setting as simply `true`
		 * is recommended.
		 */
		"sScrollX": "",
	
	
		/**
		 * This property can be used to force a DataTable to use more width than it
		 * might otherwise do when x-scrolling is enabled. For example if you have a
		 * table which requires to be well spaced, this parameter is useful for
		 * "over-sizing" the table, and thus forcing scrolling. This property can by
		 * any CSS unit, or a number (in which case it will be treated as a pixel
		 * measurement).
		 */
		"sScrollXInner": "",
	
	
		/**
		 * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
		 * to the given height, and enable scrolling for any data which overflows the
		 * current viewport. This can be used as an alternative to paging to display
		 * a lot of data in a small area (although paging and scrolling can both be
		 * enabled at the same time). This property can be any CSS unit, or a number
		 * (in which case it will be treated as a pixel measurement).
		 */
		"sScrollY": "",
	
	
		/**
		 * __Deprecated__ The functionality provided by this parameter has now been
		 * superseded by that provided through `ajax`, which should be used instead.
		 *
		 * Set the HTTP method that is used to make the Ajax call for server-side
		 * processing or Ajax sourced data.
		 */
		"sServerMethod": "GET",
	
	
		/**
		 * DataTables makes use of renderers when displaying HTML elements for
		 * a table. These renderers can be added or modified by plug-ins to
		 * generate suitable mark-up for a site. For example the Bootstrap
		 * integration plug-in for DataTables uses a paging button renderer to
		 * display pagination buttons in the mark-up required by Bootstrap.
		 *
		 * For further information about the renderers available see
		 * DataTable.ext.renderer
		 */
		"renderer": null,
	
	
		/**
		 * Set the data property name that DataTables should use to get a row's id
		 * to set as the `id` property in the node.
		 */
		"rowId": "DT_RowId",
	
	
		/**
		 * Caption value
		 */
		"caption": null
	};
	
	_fnHungarianMap( DataTable.defaults );
	
	
	
	/*
	 * Developer note - See note in model.defaults.js about the use of Hungarian
	 * notation and camel case.
	 */
	
	/**
	 * Column options that can be given to DataTables at initialisation time.
	 *  @namespace
	 */
	DataTable.defaults.column = {
		/**
		 * Define which column(s) an order will occur on for this column. This
		 * allows a column's ordering to take multiple columns into account when
		 * doing a sort or use the data from a different column. For example first
		 * name / last name columns make sense to do a multi-column sort over the
		 * two columns.
		 */
		"aDataSort": null,
		"iDataSort": -1,
	
		ariaTitle: '',
	
	
		/**
		 * You can control the default ordering direction, and even alter the
		 * behaviour of the sort handler (i.e. only allow ascending ordering etc)
		 * using this parameter.
		 */
		"asSorting": [ 'asc', 'desc', '' ],
	
	
		/**
		 * Enable or disable filtering on the data in this column.
		 */
		"bSearchable": true,
	
	
		/**
		 * Enable or disable ordering on this column.
		 */
		"bSortable": true,
	
	
		/**
		 * Enable or disable the display of this column.
		 */
		"bVisible": true,
	
	
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 */
		"fnCreatedCell": null,
	
	
		/**
		 * This property can be used to read data from any data source property,
		 * including deeply nested objects / properties. `data` can be given in a
		 * number of different ways which effect its behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object. Note that
		 *      function notation is recommended for use in `render` rather than
		 *      `data` as it is much simpler to use as a renderer.
		 * * `null` - use the original data source for the row rather than plucking
		 *   data directly from it. This action has effects on two other
		 *   initialisation options:
		 *    * `defaultContent` - When null is given as the `data` option and
		 *      `defaultContent` is specified for the column, the value defined by
		 *      `defaultContent` will be used for the cell.
		 *    * `render` - When null is used for the `data` option and the `render`
		 *      option is specified for the column, the whole data source for the
		 *      row is used for the renderer.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * `{array|object}` The data source for the row
		 *      * `{string}` The type call data requested - this will be 'set' when
		 *        setting data or 'filter', 'display', 'type', 'sort' or undefined
		 *        when gathering data. Note that when `undefined` is given for the
		 *        type DataTables expects to get the raw data for the object back<
		 *      * `{*}` Data to set when the second parameter is 'set'.
		 *    * Return:
		 *      * The return value from the function is not required when 'set' is
		 *        the type of call, but otherwise the return is what will be used
		 *        for the data requested.
		 *
		 * Note that `data` is a getter and setter option. If you just require
		 * formatting of data for output, you will likely want to use `render` which
		 * is simply a getter and thus simpler to use.
		 *
		 * Note that prior to DataTables 1.9.2 `data` was called `mDataProp`. The
		 * name change reflects the flexibility of this property and is consistent
		 * with the naming of mRender. If 'mDataProp' is given, then it will still
		 * be used by DataTables, as it automatically maps the old name to the new
		 * if required.
		 */
		"mData": null,
	
	
		/**
		 * This property is the rendering partner to `data` and it is suggested that
		 * when you want to manipulate data for display (including filtering,
		 * sorting etc) without altering the underlying data for the table, use this
		 * property. `render` can be considered to be the the read only companion to
		 * `data` which is read / write (then as such more complex). Like `data`
		 * this option can be given in a number of different ways to effect its
		 * behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object.
		 * * `object` - use different data for the different data types requested by
		 *   DataTables ('filter', 'display', 'type' or 'sort'). The property names
		 *   of the object is the data type the property refers to and the value can
		 *   defined using an integer, string or function using the same rules as
		 *   `render` normally does. Note that an `_` option _must_ be specified.
		 *   This is the default value to use if you haven't specified a value for
		 *   the data type requested by DataTables.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * {array|object} The data source for the row (based on `data`)
		 *      * {string} The type call data requested - this will be 'filter',
		 *        'display', 'type' or 'sort'.
		 *      * {array|object} The full data source for the row (not based on
		 *        `data`)
		 *    * Return:
		 *      * The return value from the function is what will be used for the
		 *        data requested.
		 */
		"mRender": null,
	
	
		/**
		 * Change the cell type created for the column - either TD cells or TH cells. This
		 * can be useful as TH cells have semantic meaning in the table body, allowing them
		 * to act as a header for a row (you may wish to add scope='row' to the TH elements).
		 */
		"sCellType": "td",
	
	
		/**
		 * Class to give to each cell in this column.
		 */
		"sClass": "",
	
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 * Generally you shouldn't need this!
		 */
		"sContentPadding": "",
	
	
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because `data`
		 * is set to null, or because the data source itself is null).
		 */
		"sDefaultContent": null,
	
	
		/**
		 * This parameter is only used in DataTables' server-side processing. It can
		 * be exceptionally useful to know what columns are being displayed on the
		 * client side, and to map these to database fields. When defined, the names
		 * also allow DataTables to reorder information from the server if it comes
		 * back in an unexpected order (i.e. if you switch your columns around on the
		 * client-side, your server-side code does not also need updating).
		 */
		"sName": "",
	
	
		/**
		 * Defines a data source type for the ordering which can be used to read
		 * real-time information from the table (updating the internally cached
		 * version) prior to ordering. This allows ordering to occur on user
		 * editable elements such as form inputs.
		 */
		"sSortDataType": "std",
	
	
		/**
		 * The title of this column.
		 */
		"sTitle": null,
	
	
		/**
		 * The type allows you to specify how the data for this column will be
		 * ordered. Four types (string, numeric, date and html (which will strip
		 * HTML tags before ordering)) are currently available. Note that only date
		 * formats understood by Javascript's Date() object will be accepted as type
		 * date. For example: "Mar 26, 2008 5:03 PM". May take the values: 'string',
		 * 'numeric', 'date' or 'html' (by default). Further types can be adding
		 * through plug-ins.
		 */
		"sType": null,
	
	
		/**
		 * Defining the width of the column, this parameter may take any CSS value
		 * (3em, 20px etc). DataTables applies 'smart' widths to columns which have not
		 * been given a specific width through this interface ensuring that the table
		 * remains readable.
		 */
		"sWidth": null
	};
	
	_fnHungarianMap( DataTable.defaults.column );
	
	
	
	/**
	 * DataTables settings object - this holds all the information needed for a
	 * given table, including configuration, data and current application of the
	 * table options. DataTables does not have a single instance for each DataTable
	 * with the settings attached to that instance, but rather instances of the
	 * DataTable "class" are created on-the-fly as needed (typically by a
	 * $().dataTable() call) and the settings object is then applied to that
	 * instance.
	 *
	 * Note that this object is related to {@link DataTable.defaults} but this
	 * one is the internal data store for DataTables's cache of columns. It should
	 * NOT be manipulated outside of DataTables. Any configuration should be done
	 * through the initialisation options.
	 */
	DataTable.models.oSettings = {
		/**
		 * Primary features of DataTables and their enablement state.
		 */
		"oFeatures": {
	
			/**
			 * Flag to say if DataTables should automatically try to calculate the
			 * optimum table and columns widths (true) or not (false).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bAutoWidth": null,
	
			/**
			 * Delay the creation of TR and TD elements until they are actually
			 * needed by a driven page draw. This can give a significant speed
			 * increase for Ajax source and Javascript source data, but makes no
			 * difference at all for DOM and server-side processing tables.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bDeferRender": null,
	
			/**
			 * Enable filtering on the table or not. Note that if this is disabled
			 * then there is no filtering at all on the table, including fnFilter.
			 * To just remove the filtering input use sDom and remove the 'f' option.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bFilter": null,
	
			/**
			 * Used only for compatiblity with DT1
			 * @deprecated
			 */
			"bInfo": true,
	
			/**
			 * Used only for compatiblity with DT1
			 * @deprecated
			 */
			"bLengthChange": true,
	
			/**
			 * Pagination enabled or not. Note that if this is disabled then length
			 * changing must also be disabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bPaginate": null,
	
			/**
			 * Processing indicator enable flag whenever DataTables is enacting a
			 * user request - typically an Ajax request for server-side processing.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bProcessing": null,
	
			/**
			 * Server-side processing enabled flag - when enabled DataTables will
			 * get all data from the server for every draw - there is no filtering,
			 * sorting or paging done on the client-side.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bServerSide": null,
	
			/**
			 * Sorting enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSort": null,
	
			/**
			 * Multi-column sorting
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSortMulti": null,
	
			/**
			 * Apply a class to the columns which are being sorted to provide a
			 * visual highlight or not. This can slow things down when enabled since
			 * there is a lot of DOM interaction.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSortClasses": null,
	
			/**
			 * State saving enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bStateSave": null
		},
	
	
		/**
		 * Scrolling settings for a table.
		 */
		"oScroll": {
			/**
			 * When the table is shorter in height than sScrollY, collapse the
			 * table container down to the height of the table (when true).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bCollapse": null,
	
			/**
			 * Width of the scrollbar for the web-browser's platform. Calculated
			 * during table initialisation.
			 */
			"iBarWidth": 0,
	
			/**
			 * Viewport width for horizontal scrolling. Horizontal scrolling is
			 * disabled if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"sX": null,
	
			/**
			 * Width to expand the table to when using x-scrolling. Typically you
			 * should not need to use this.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @deprecated
			 */
			"sXInner": null,
	
			/**
			 * Viewport height for vertical scrolling. Vertical scrolling is disabled
			 * if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"sY": null
		},
	
		/**
		 * Language information for the table.
		 */
		"oLanguage": {
			/**
			 * Information callback function. See
			 * {@link DataTable.defaults.fnInfoCallback}
			 */
			"fnInfoCallback": null
		},
	
		/**
		 * Browser support parameters
		 */
		"oBrowser": {
			/**
			 * Determine if the vertical scrollbar is on the right or left of the
			 * scrolling container - needed for rtl language layout, although not
			 * all browsers move the scrollbar (Safari).
			 */
			"bScrollbarLeft": false,
	
			/**
			 * Browser scrollbar width
			 */
			"barWidth": 0
		},
	
	
		"ajax": null,
	
	
		/**
		 * Array referencing the nodes which are used for the features. The
		 * parameters of this object match what is allowed by sDom - i.e.
		 *   <ul>
		 *     <li>'l' - Length changing</li>
		 *     <li>'f' - Filtering input</li>
		 *     <li>'t' - The table!</li>
		 *     <li>'i' - Information</li>
		 *     <li>'p' - Pagination</li>
		 *     <li>'r' - pRocessing</li>
		 *   </ul>
		 */
		"aanFeatures": [],
	
		/**
		 * Store data information - see {@link DataTable.models.oRow} for detailed
		 * information.
		 */
		"aoData": [],
	
		/**
		 * Array of indexes which are in the current display (after filtering etc)
		 */
		"aiDisplay": [],
	
		/**
		 * Array of indexes for display - no filtering
		 */
		"aiDisplayMaster": [],
	
		/**
		 * Map of row ids to data indexes
		 */
		"aIds": {},
	
		/**
		 * Store information about each column that is in use
		 */
		"aoColumns": [],
	
		/**
		 * Store information about the table's header
		 */
		"aoHeader": [],
	
		/**
		 * Store information about the table's footer
		 */
		"aoFooter": [],
	
		/**
		 * Store the applied global search information in case we want to force a
		 * research or compare the old search to a new one.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"oPreviousSearch": {},
	
		/**
		 * Store for named searches
		 */
		searchFixed: {},
	
		/**
		 * Store the applied search for each column - see
		 * {@link DataTable.models.oSearch} for the format that is used for the
		 * filtering information for each column.
		 */
		"aoPreSearchCols": [],
	
		/**
		 * Sorting that is applied to the table. Note that the inner arrays are
		 * used in the following manner:
		 * <ul>
		 *   <li>Index 0 - column number</li>
		 *   <li>Index 1 - current sorting direction</li>
		 * </ul>
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aaSorting": null,
	
		/**
		 * Sorting that is always applied to the table (i.e. prefixed in front of
		 * aaSorting).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aaSortingFixed": [],
	
		/**
		 * If restoring a table - we should restore its width
		 */
		"sDestroyWidth": 0,
	
		/**
		 * Callback functions array for every time a row is inserted (i.e. on a draw).
		 */
		"aoRowCallback": [],
	
		/**
		 * Callback functions for the header on each draw.
		 */
		"aoHeaderCallback": [],
	
		/**
		 * Callback function for the footer on each draw.
		 */
		"aoFooterCallback": [],
	
		/**
		 * Array of callback functions for draw callback functions
		 */
		"aoDrawCallback": [],
	
		/**
		 * Array of callback functions for row created function
		 */
		"aoRowCreatedCallback": [],
	
		/**
		 * Callback functions for just before the table is redrawn. A return of
		 * false will be used to cancel the draw.
		 */
		"aoPreDrawCallback": [],
	
		/**
		 * Callback functions for when the table has been initialised.
		 */
		"aoInitComplete": [],
	
	
		/**
		 * Callbacks for modifying the settings to be stored for state saving, prior to
		 * saving state.
		 */
		"aoStateSaveParams": [],
	
		/**
		 * Callbacks for modifying the settings that have been stored for state saving
		 * prior to using the stored values to restore the state.
		 */
		"aoStateLoadParams": [],
	
		/**
		 * Callbacks for operating on the settings object once the saved state has been
		 * loaded
		 */
		"aoStateLoaded": [],
	
		/**
		 * Cache the table ID for quick access
		 */
		"sTableId": "",
	
		/**
		 * The TABLE node for the main table
		 */
		"nTable": null,
	
		/**
		 * Permanent ref to the thead element
		 */
		"nTHead": null,
	
		/**
		 * Permanent ref to the tfoot element - if it exists
		 */
		"nTFoot": null,
	
		/**
		 * Permanent ref to the tbody element
		 */
		"nTBody": null,
	
		/**
		 * Cache the wrapper node (contains all DataTables controlled elements)
		 */
		"nTableWrapper": null,
	
		/**
		 * Indicate if all required information has been read in
		 */
		"bInitialised": false,
	
		/**
		 * Information about open rows. Each object in the array has the parameters
		 * 'nTr' and 'nParent'
		 */
		"aoOpenRows": [],
	
		/**
		 * Dictate the positioning of DataTables' control elements - see
		 * {@link DataTable.model.oInit.sDom}.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sDom": null,
	
		/**
		 * Search delay (in mS)
		 */
		"searchDelay": null,
	
		/**
		 * Which type of pagination should be used.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sPaginationType": "two_button",
	
		/**
		 * Number of paging controls on the page. Only used for backwards compatibility
		 */
		pagingControls: 0,
	
		/**
		 * The state duration (for `stateSave`) in seconds.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"iStateDuration": 0,
	
		/**
		 * Array of callback functions for state saving. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the JSON string to save that has been thus far created. Returns
		 *       a JSON string to be inserted into a json object
		 *       (i.e. '"param": [ 0, 1, 2]')</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 */
		"aoStateSave": [],
	
		/**
		 * Array of callback functions for state loading. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the object stored. May return false to cancel state loading</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 */
		"aoStateLoad": [],
	
		/**
		 * State that was saved. Useful for back reference
		 */
		"oSavedState": null,
	
		/**
		 * State that was loaded. Useful for back reference
		 */
		"oLoadedState": null,
	
		/**
		 * Note if draw should be blocked while getting data
		 */
		"bAjaxDataGet": true,
	
		/**
		 * The last jQuery XHR object that was used for server-side data gathering.
		 * This can be used for working with the XHR information in one of the
		 * callbacks
		 */
		"jqXHR": null,
	
		/**
		 * JSON returned from the server in the last Ajax request
		 */
		"json": undefined,
	
		/**
		 * Data submitted as part of the last Ajax request
		 */
		"oAjaxData": undefined,
	
		/**
		 * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
		 * required).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sServerMethod": null,
	
		/**
		 * Format numbers for display.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"fnFormatNumber": null,
	
		/**
		 * List of options that can be used for the user selectable length menu.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aLengthMenu": null,
	
		/**
		 * Counter for the draws that the table does. Also used as a tracker for
		 * server-side processing
		 */
		"iDraw": 0,
	
		/**
		 * Indicate if a redraw is being done - useful for Ajax
		 */
		"bDrawing": false,
	
		/**
		 * Draw index (iDraw) of the last error when parsing the returned data
		 */
		"iDrawError": -1,
	
		/**
		 * Paging display length
		 */
		"_iDisplayLength": 10,
	
		/**
		 * Paging start point - aiDisplay index
		 */
		"_iDisplayStart": 0,
	
		/**
		 * Server-side processing - number of records in the result set
		 * (i.e. before filtering), Use fnRecordsTotal rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 */
		"_iRecordsTotal": 0,
	
		/**
		 * Server-side processing - number of records in the current display set
		 * (i.e. after filtering). Use fnRecordsDisplay rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 */
		"_iRecordsDisplay": 0,
	
		/**
		 * The classes to use for the table
		 */
		"oClasses": {},
	
		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if filtering has been done in the draw. Deprecated in favour of
		 * events.
		 *  @deprecated
		 */
		"bFiltered": false,
	
		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if sorting has been done in the draw. Deprecated in favour of
		 * events.
		 *  @deprecated
		 */
		"bSorted": false,
	
		/**
		 * Indicate that if multiple rows are in the header and there is more than
		 * one unique cell per column, if the top one (true) or bottom one (false)
		 * should be used for sorting / title by DataTables.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"bSortCellsTop": null,
	
		/**
		 * Initialisation object that is used for the table
		 */
		"oInit": null,
	
		/**
		 * Destroy callback functions - for plug-ins to attach themselves to the
		 * destroy so they can clean up markup and events.
		 */
		"aoDestroyCallback": [],
	
	
		/**
		 * Get the number of records in the current record set, before filtering
		 */
		"fnRecordsTotal": function ()
		{
			return _fnDataSource( this ) == 'ssp' ?
				this._iRecordsTotal * 1 :
				this.aiDisplayMaster.length;
		},
	
		/**
		 * Get the number of records in the current record set, after filtering
		 */
		"fnRecordsDisplay": function ()
		{
			return _fnDataSource( this ) == 'ssp' ?
				this._iRecordsDisplay * 1 :
				this.aiDisplay.length;
		},
	
		/**
		 * Get the display end point - aiDisplay index
		 */
		"fnDisplayEnd": function ()
		{
			var
				len      = this._iDisplayLength,
				start    = this._iDisplayStart,
				calc     = start + len,
				records  = this.aiDisplay.length,
				features = this.oFeatures,
				paginate = features.bPaginate;
	
			if ( features.bServerSide ) {
				return paginate === false || len === -1 ?
					start + records :
					Math.min( start+len, this._iRecordsDisplay );
			}
			else {
				return ! paginate || calc>records || len===-1 ?
					records :
					calc;
			}
		},
	
		/**
		 * The DataTables object for this table
		 */
		"oInstance": null,
	
		/**
		 * Unique identifier for each instance of the DataTables object. If there
		 * is an ID on the table node, then it takes that value, otherwise an
		 * incrementing internal counter is used.
		 */
		"sInstance": null,
	
		/**
		 * tabindex attribute value that is added to DataTables control elements, allowing
		 * keyboard navigation of the table and its controls.
		 */
		"iTabIndex": 0,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollHead": null,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollFoot": null,
	
		/**
		 * Last applied sort
		 */
		"aLastSort": [],
	
		/**
		 * Stored plug-in instances
		 */
		"oPlugins": {},
	
		/**
		 * Function used to get a row's id from the row's data
		 */
		"rowIdFn": null,
	
		/**
		 * Data location where to store a row's id
		 */
		"rowId": null,
	
		caption: '',
	
		captionNode: null,
	
		colgroup: null
	};
	
	/**
	 * Extension object for DataTables that is used to provide all extension
	 * options.
	 *
	 * Note that the `DataTable.ext` object is available through
	 * `jQuery.fn.dataTable.ext` where it may be accessed and manipulated. It is
	 * also aliased to `jQuery.fn.dataTableExt` for historic reasons.
	 *  @namespace
	 *  @extends DataTable.models.ext
	 */
	
	
	var extPagination = DataTable.ext.pager;
	
	// Paging buttons configuration
	$.extend( extPagination, {
		simple: function () {
			return [ 'previous', 'next' ];
		},
	
		full: function () {
			return [  'first', 'previous', 'next', 'last' ];
		},
	
		numbers: function () {
			return [ 'numbers' ];
		},
	
		simple_numbers: function () {
			return [ 'previous', 'numbers', 'next' ];
		},
	
		full_numbers: function () {
			return [ 'first', 'previous', 'numbers', 'next', 'last' ];
		},
		
		first_last: function () {
			return ['first', 'last'];
		},
		
		first_last_numbers: function () {
			return ['first', 'numbers', 'last'];
		},
	
		// For testing and plug-ins to use
		_numbers: _pagingNumbers,
	
		// Number of number buttons - legacy, use `numbers` option for paging feature
		numbers_length: 7
	} );
	
	
	$.extend( true, DataTable.ext.renderer, {
		pagingButton: {
			_: function (settings, buttonType, content, active, disabled) {
				var classes = settings.oClasses.paging;
				var btnClasses = [classes.button];
				var btn;
	
				if (active) {
					btnClasses.push(classes.active);
				}
	
				if (disabled) {
					btnClasses.push(classes.disabled)
				}
	
				if (buttonType === 'ellipsis') {
					btn = $('<span class="ellipsis"></span>').html(content)[0];
				}
				else {
					btn = $('<button>', {
						class: btnClasses.join(' '),
						role: 'link',
						type: 'button'
					}).html(content);
				}
	
				return {
					display: btn,
					clicker: btn
				}
			}
		},
	
		pagingContainer: {
			_: function (settings, buttons) {
				// No wrapping element - just append directly to the host
				return buttons;
			}
		}
	} );
	
	// Common function to remove new lines, strip HTML and diacritic control
	var _filterString = function (stripHtml, normalize) {
		return function (str) {
			if (_empty(str) || typeof str !== 'string') {
				return str;
			}
	
			str = str.replace( _re_new_lines, " " );
	
			if (stripHtml) {
				str = _stripHtml(str);
			}
	
			if (normalize) {
				str = _normalize(str, false);
			}
	
			return str;
		};
	}
	
	/*
	 * Public helper functions. These aren't used internally by DataTables, or
	 * called by any of the options passed into DataTables, but they can be used
	 * externally by developers working with DataTables. They are helper functions
	 * to make working with DataTables a little bit easier.
	 */
	
	function __mldFnName(name) {
		return name.replace(/[\W]/g, '_')
	}
	
	// Common logic for moment, luxon or a date action
	function __mld( dt, momentFn, luxonFn, dateFn, arg1 ) {
		if (window.moment) {
			return dt[momentFn]( arg1 );
		}
		else if (window.luxon) {
			return dt[luxonFn]( arg1 );
		}
		
		return dateFn ? dt[dateFn]( arg1 ) : dt;
	}
	
	
	var __mlWarning = false;
	function __mldObj (d, format, locale) {
		var dt;
	
		if (window.moment) {
			dt = window.moment.utc( d, format, locale, true );
	
			if (! dt.isValid()) {
				return null;
			}
		}
		else if (window.luxon) {
			dt = format && typeof d === 'string'
				? window.luxon.DateTime.fromFormat( d, format )
				: window.luxon.DateTime.fromISO( d );
	
			if (! dt.isValid) {
				return null;
			}
	
			dt.setLocale(locale);
		}
		else if (! format) {
			// No format given, must be ISO
			dt = new Date(d);
		}
		else {
			if (! __mlWarning) {
				alert('DataTables warning: Formatted date without Moment.js or Luxon - https://datatables.net/tn/17');
			}
	
			__mlWarning = true;
		}
	
		return dt;
	}
	
	// Wrapper for date, datetime and time which all operate the same way with the exception of
	// the output string for auto locale support
	function __mlHelper (localeString) {
		return function ( from, to, locale, def ) {
			// Luxon and Moment support
			// Argument shifting
			if ( arguments.length === 0 ) {
				locale = 'en';
				to = null; // means toLocaleString
				from = null; // means iso8601
			}
			else if ( arguments.length === 1 ) {
				locale = 'en';
				to = from;
				from = null;
			}
			else if ( arguments.length === 2 ) {
				locale = to;
				to = from;
				from = null;
			}
	
			var typeName = 'datetime' + (to ? '-' + __mldFnName(to) : '');
	
			// Add type detection and sorting specific to this date format - we need to be able to identify
			// date type columns as such, rather than as numbers in extensions. Hence the need for this.
			if (! DataTable.ext.type.order[typeName]) {
				DataTable.type(typeName, {
					detect: function (d) {
						// The renderer will give the value to type detect as the type!
						return d === typeName ? typeName : false;
					},
					order: {
						pre: function (d) {
							// The renderer gives us Moment, Luxon or Date obects for the sorting, all of which have a
							// `valueOf` which gives milliseconds epoch
							return d.valueOf();
						}
					},
					className: 'dt-right'
				});
			}
		
			return function ( d, type ) {
				// Allow for a default value
				if (d === null || d === undefined) {
					if (def === '--now') {
						// We treat everything as UTC further down, so no changes are
						// made, as such need to get the local date / time as if it were
						// UTC
						var local = new Date();
						d = new Date( Date.UTC(
							local.getFullYear(), local.getMonth(), local.getDate(),
							local.getHours(), local.getMinutes(), local.getSeconds()
						) );
					}
					else {
						d = '';
					}
				}
	
				if (type === 'type') {
					// Typing uses the type name for fast matching
					return typeName;
				}
	
				if (d === '') {
					return type !== 'sort'
						? ''
						: __mldObj('0000-01-01 00:00:00', null, locale);
				}
	
				// Shortcut. If `from` and `to` are the same, we are using the renderer to
				// format for ordering, not display - its already in the display format.
				if ( to !== null && from === to && type !== 'sort' && type !== 'type' && ! (d instanceof Date) ) {
					return d;
				}
	
				var dt = __mldObj(d, from, locale);
	
				if (dt === null) {
					return d;
				}
	
				if (type === 'sort') {
					return dt;
				}
				
				var formatted = to === null
					? __mld(dt, 'toDate', 'toJSDate', '')[localeString]()
					: __mld(dt, 'format', 'toFormat', 'toISOString', to);
	
				// XSS protection
				return type === 'display' ?
					_escapeHtml( formatted ) :
					formatted;
			};
		}
	}
	
	// Based on locale, determine standard number formatting
	// Fallback for legacy browsers is US English
	var __thousands = ',';
	var __decimal = '.';
	
	if (window.Intl !== undefined) {
		try {
			var num = new Intl.NumberFormat().formatToParts(100000.1);
		
			for (var i=0 ; i<num.length ; i++) {
				if (num[i].type === 'group') {
					__thousands = num[i].value;
				}
				else if (num[i].type === 'decimal') {
					__decimal = num[i].value;
				}
			}
		}
		catch (e) {
			// noop
		}
	}
	
	// Formatted date time detection - use by declaring the formats you are going to use
	DataTable.datetime = function ( format, locale ) {
		var typeName = 'datetime-detect-' + __mldFnName(format);
	
		if (! locale) {
			locale = 'en';
		}
	
		if (! DataTable.ext.type.order[typeName]) {
			DataTable.type(typeName, {
				detect: function (d) {
					var dt = __mldObj(d, format, locale);
					return d === '' || dt ? typeName : false;
				},
				order: {
					pre: function (d) {
						return __mldObj(d, format, locale) || 0;
					}
				},
				className: 'dt-right'
			});
		}
	}
	
	/**
	 * Helpers for `columns.render`.
	 *
	 * The options defined here can be used with the `columns.render` initialisation
	 * option to provide a display renderer. The following functions are defined:
	 *
	 * * `moment` - Uses the MomentJS library to convert from a given format into another.
	 * This renderer has three overloads:
	 *   * 1 parameter:
	 *     * `string` - Format to convert to (assumes input is ISO8601 and locale is `en`)
	 *   * 2 parameters:
	 *     * `string` - Format to convert from
	 *     * `string` - Format to convert to. Assumes `en` locale
	 *   * 3 parameters:
	 *     * `string` - Format to convert from
	 *     * `string` - Format to convert to
	 *     * `string` - Locale
	 * * `number` - Will format numeric data (defined by `columns.data`) for
	 *   display, retaining the original unformatted data for sorting and filtering.
	 *   It takes 5 parameters:
	 *   * `string` - Thousands grouping separator
	 *   * `string` - Decimal point indicator
	 *   * `integer` - Number of decimal points to show
	 *   * `string` (optional) - Prefix.
	 *   * `string` (optional) - Postfix (/suffix).
	 * * `text` - Escape HTML to help prevent XSS attacks. It has no optional
	 *   parameters.
	 *
	 * @example
	 *   // Column definition using the number renderer
	 *   {
	 *     data: "salary",
	 *     render: $.fn.dataTable.render.number( '\'', '.', 0, '$' )
	 *   }
	 *
	 * @namespace
	 */
	DataTable.render = {
		date: __mlHelper('toLocaleDateString'),
		datetime: __mlHelper('toLocaleString'),
		time: __mlHelper('toLocaleTimeString'),
		number: function ( thousands, decimal, precision, prefix, postfix ) {
			// Auto locale detection
			if (thousands === null || thousands === undefined) {
				thousands = __thousands;
			}
	
			if (decimal === null || decimal === undefined) {
				decimal = __decimal;
			}
	
			return {
				display: function ( d ) {
					if ( typeof d !== 'number' && typeof d !== 'string' ) {
						return d;
					}
	
					if (d === '' || d === null) {
						return d;
					}
	
					var negative = d < 0 ? '-' : '';
					var flo = parseFloat( d );
					var abs = Math.abs(flo);
	
					// Scientific notation for large and small numbers
					if (abs >= 100000000000 || (abs < 0.0001 && abs !== 0) ) {
						var exp = flo.toExponential(precision).split(/e\+?/);
						return exp[0] + ' x 10<sup>' + exp[1] + '</sup>';
					}
	
					// If NaN then there isn't much formatting that we can do - just
					// return immediately, escaping any HTML (this was supposed to
					// be a number after all)
					if ( isNaN( flo ) ) {
						return _escapeHtml( d );
					}
	
					flo = flo.toFixed( precision );
					d = Math.abs( flo );
	
					var intPart = parseInt( d, 10 );
					var floatPart = precision ?
						decimal+(d - intPart).toFixed( precision ).substring( 2 ):
						'';
	
					// If zero, then can't have a negative prefix
					if (intPart === 0 && parseFloat(floatPart) === 0) {
						negative = '';
					}
	
					return negative + (prefix||'') +
						intPart.toString().replace(
							/\B(?=(\d{3})+(?!\d))/g, thousands
						) +
						floatPart +
						(postfix||'');
				}
			};
		},
	
		text: function () {
			return {
				display: _escapeHtml,
				filter: _escapeHtml
			};
		}
	};
	
	
	var _extTypes = DataTable.ext.type;
	
	// Get / set type
	DataTable.type = function (name, prop, val) {
		if (! prop) {
			return {
				className: _extTypes.className[name],
				detect: _extTypes.detect.find(function (fn) {
					return fn.name === name;
				}),
				order: {
					pre: _extTypes.order[name + '-pre'],
					asc: _extTypes.order[name + '-asc'],
					desc: _extTypes.order[name + '-desc']
				},
				render: _extTypes.render[name],
				search: _extTypes.search[name]
			};
		}
	
		var setProp = function(prop, propVal) {
			_extTypes[prop][name] = propVal;
		};
		var setDetect = function (fn) {
			// Wrap to allow the function to return `true` rather than
			// specifying the type name.
			var cb = function (d, s) {
				var ret = fn(d, s);
	
				return ret === true
					? name
					: ret;
			};
			Object.defineProperty(cb, "name", {value: name});
	
			var idx = _extTypes.detect.findIndex(function (fn) {
				return fn.name === name;
			});
	
			if (idx === -1) {
				_extTypes.detect.unshift(cb);
			}
			else {
				_extTypes.detect.splice(idx, 1, cb);
			}
		};
		var setOrder = function (obj) {
			_extTypes.order[name + '-pre'] = obj.pre; // can be undefined
			_extTypes.order[name + '-asc'] = obj.asc; // can be undefined
			_extTypes.order[name + '-desc'] = obj.desc; // can be undefined
		};
	
		// prop is optional
		if (val === undefined) {
			val = prop;
			prop = null;
		}
	
		if (prop === 'className') {
			setProp('className', val);
		}
		else if (prop === 'detect') {
			setDetect(val);
		}
		else if (prop === 'order') {
			setOrder(val);
		}
		else if (prop === 'render') {
			setProp('render', val);
		}
		else if (prop === 'search') {
			setProp('search', val);
		}
		else if (! prop) {
			if (val.className) {
				setProp('className', val.className);
			}
	
			if (val.detect !== undefined) {
				setDetect(val.detect);
			}
	
			if (val.order) {
				setOrder(val.order);
			}
	
			if (val.render !== undefined) {
				setProp('render', val.render);
			}
	
			if (val.search !== undefined) {
				setProp('search', val.search);
			}
		}
	}
	
	// Get a list of types
	DataTable.types = function () {
		return _extTypes.detect.map(function (fn) {
			return fn.name;
		});
	};
	
	//
	// Built in data types
	//
	
	DataTable.type('string', {
		detect: function () {
			return 'string';
		},
		order: {
			pre: function ( a ) {
				// This is a little complex, but faster than always calling toString,
				// http://jsperf.com/tostring-v-check
				return _empty(a) ?
					'' :
					typeof a === 'string' ?
						a.toLowerCase() :
						! a.toString ?
							'' :
							a.toString();
			}
		},
		search: _filterString(false, true)
	});
	
	
	DataTable.type('html', {
		detect: function ( d ) {
			return _empty( d ) || (typeof d === 'string' && d.indexOf('<') !== -1) ?
				'html' : null;
		},
		order: {
			pre: function ( a ) {
				return _empty(a) ?
					'' :
					a.replace ?
						_stripHtml(a).trim().toLowerCase() :
						a+'';
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('date', {
		className: 'dt-type-date',
		detect: function ( d )
		{
			// V8 tries _very_ hard to make a string passed into `Date.parse()`
			// valid, so we need to use a regex to restrict date formats. Use a
			// plug-in for anything other than ISO8601 style strings
			if ( d && !(d instanceof Date) && ! _re_date.test(d) ) {
				return null;
			}
			var parsed = Date.parse(d);
			return (parsed !== null && !isNaN(parsed)) || _empty(d) ? 'date' : null;
		},
		order: {
			pre: function ( d ) {
				var ts = Date.parse( d );
				return isNaN(ts) ? -Infinity : ts;
			}
		}
	});
	
	
	DataTable.type('html-num-fmt', {
		className: 'dt-type-numeric',
		detect: function ( d, settings )
		{
			var decimal = settings.oLanguage.sDecimal;
			return _htmlNumeric( d, decimal, true ) ? 'html-num-fmt' : null;
		},
		order: {
			pre: function ( d, s ) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp, _re_html, _re_formatted_numeric );
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('html-num', {
		className: 'dt-type-numeric',
		detect: function ( d, settings )
		{
			var decimal = settings.oLanguage.sDecimal;
			return _htmlNumeric( d, decimal ) ? 'html-num' : null;
		},
		order: {
			pre: function ( d, s ) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp, _re_html );
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('num-fmt', {
		className: 'dt-type-numeric',
		detect: function ( d, settings )
		{
			var decimal = settings.oLanguage.sDecimal;
			return _isNumber( d, decimal, true ) ? 'num-fmt' : null;
		},
		order: {
			pre: function ( d, s ) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp, _re_formatted_numeric );
			}
		}
	});
	
	
	DataTable.type('num', {
		className: 'dt-type-numeric',
		detect: function ( d, settings )
		{
			var decimal = settings.oLanguage.sDecimal;
			return _isNumber( d, decimal ) ? 'num' : null;
		},
		order: {
			pre: function (d, s) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp );
			}
		}
	});
	
	
	
	
	var __numericReplace = function ( d, decimalPlace, re1, re2 ) {
		if ( d !== 0 && (!d || d === '-') ) {
			return -Infinity;
		}
		
		var type = typeof d;
	
		if (type === 'number' || type === 'bigint') {
			return d;
		}
	
		// If a decimal place other than `.` is used, it needs to be given to the
		// function so we can detect it and replace with a `.` which is the only
		// decimal place Javascript recognises - it is not locale aware.
		if ( decimalPlace ) {
			d = _numToDecimal( d, decimalPlace );
		}
	
		if ( d.replace ) {
			if ( re1 ) {
				d = d.replace( re1, '' );
			}
	
			if ( re2 ) {
				d = d.replace( re2, '' );
			}
		}
	
		return d * 1;
	};
	
	
	$.extend( true, DataTable.ext.renderer, {
		footer: {
			_: function ( settings, cell, classes ) {
				cell.addClass(classes.tfoot.cell);
			}
		},
	
		header: {
			_: function ( settings, cell, classes ) {
				cell.addClass(classes.thead.cell);
	
				if (! settings.oFeatures.bSort) {
					cell.addClass(classes.order.none);
				}
	
				var legacyTop = settings.bSortCellsTop;
				var headerRows = cell.closest('thead').find('tr');
				var rowIdx = cell.parent().index();
	
				// Conditions to not apply the ordering icons
				if (
					// Cells and rows which have the attribute to disable the icons
					cell.attr('data-dt-order') === 'disable' ||
					cell.parent().attr('data-dt-order') === 'disable' ||
	
					// Legacy support for `orderCellsTop`. If it is set, then cells
					// which are not in the top or bottom row of the header (depending
					// on the value) do not get the sorting classes applied to them
					(legacyTop === true && rowIdx !== 0) ||
					(legacyTop === false && rowIdx !== headerRows.length - 1)
				) {
					return;
				}
	
				// No additional mark-up required
				// Attach a sort listener to update on sort - note that using the
				// `DT` namespace will allow the event to be removed automatically
				// on destroy, while the `dt` namespaced event is the one we are
				// listening for
				$(settings.nTable).on( 'order.dt.DT', function ( e, ctx, sorting ) {
					if ( settings !== ctx ) { // need to check this this is the host
						return;               // table, not a nested one
					}
	
					var orderClasses = classes.order;
					var columns = ctx.api.columns( cell );
					var col = settings.aoColumns[columns.flatten()[0]];
					var orderable = columns.orderable().includes(true);
					var ariaType = '';
					var indexes = columns.indexes();
					var sortDirs = columns.orderable(true).flatten();
					var orderedColumns = ',' + sorting.map( function (val) {
						return val.col;
					} ).join(',') + ',';
	
					cell
						.removeClass(
							orderClasses.isAsc +' '+
							orderClasses.isDesc
						)
						.toggleClass( orderClasses.none, ! orderable )
						.toggleClass( orderClasses.canAsc, orderable && sortDirs.includes('asc') )
						.toggleClass( orderClasses.canDesc, orderable && sortDirs.includes('desc') );
					
					var sortIdx = orderedColumns.indexOf( ',' + indexes.toArray().join(',') + ',' );
	
					if ( sortIdx !== -1 ) {
						// Get the ordering direction for the columns under this cell
						// Note that it is possible for a cell to be asc and desc sorting
						// (column spanning cells)
						var orderDirs = columns.order();
	
						cell.addClass(
							orderDirs.includes('asc') ? orderClasses.isAsc : '' +
							orderDirs.includes('desc') ? orderClasses.isDesc : ''
						);
					}
	
					// The ARIA spec says that only one column should be marked with aria-sort
					if ( sortIdx === 0 ) {
						var firstSort = sorting[0];
						var sortOrder = col.asSorting;
	
						cell.attr('aria-sort', firstSort.dir === 'asc' ? 'ascending' : 'descending');
	
						// Determine if the next click will remove sorting or change the sort
						ariaType = ! sortOrder[firstSort.index + 1] ? 'Remove' : 'Reverse';
					}
					else {
						cell.removeAttr('aria-sort');
					}
	
					cell.attr('aria-label', orderable
						? col.ariaTitle + ctx.api.i18n('oAria.orderable' + ariaType)
						: col.ariaTitle
					);
	
					if (orderable) {
						cell.find('.dt-column-title').attr('role', 'button');
						cell.attr('tabindex', 0)
					}
				} );
			}
		},
	
		layout: {
			_: function ( settings, container, items ) {
				var row = $('<div/>')
					.addClass('dt-layout-row')
					.appendTo( container );
	
				$.each( items, function (key, val) {
					var klass = ! val.table ?
						'dt-'+key+' ' :
						'';
	
					if (val.table) {
						row.addClass('dt-layout-table');
					}
	
					$('<div/>')
						.attr({
							id: val.id || null,
							"class": 'dt-layout-cell '+klass+(val.className || '')
						})
						.append( val.contents )
						.appendTo( row );
				} );
			}
		}
	} );
	
	
	DataTable.feature = {};
	
	// Third parameter is internal only!
	DataTable.feature.register = function ( name, cb, legacy ) {
		DataTable.ext.features[ name ] = cb;
	
		if (legacy) {
			_ext.feature.push({
				cFeature: legacy,
				fnInit: cb
			});
		}
	};
	
	DataTable.feature.register( 'info', function ( settings, opts ) {
		// For compatibility with the legacy `info` top level option
		if (! settings.oFeatures.bInfo) {
			return null;
		}
	
		var
			lang  = settings.oLanguage,
			tid = settings.sTableId,
			n = $('<div/>', {
				'class': settings.oClasses.info.container,
			} );
	
		opts = $.extend({
			callback: lang.fnInfoCallback,
			empty: lang.sInfoEmpty,
			postfix: lang.sInfoPostFix,
			search: lang.sInfoFiltered,
			text: lang.sInfo,
		}, opts);
	
	
		// Update display on each draw
		settings.aoDrawCallback.push(function (s) {
			_fnUpdateInfo(s, opts, n);
		});
	
		// For the first info display in the table, we add a callback and aria information.
		if (! settings._infoEl) {
			n.attr({
				'aria-live': 'polite',
				id: tid+'_info',
				role: 'status'
			});
	
			// Table is described by our info div
			$(settings.nTable).attr( 'aria-describedby', tid+'_info' );
	
			settings._infoEl = n;
		}
	
		return n;
	}, 'i' );
	
	/**
	 * Update the information elements in the display
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnUpdateInfo ( settings, opts, node )
	{
		var
			start = settings._iDisplayStart+1,
			end   = settings.fnDisplayEnd(),
			max   = settings.fnRecordsTotal(),
			total = settings.fnRecordsDisplay(),
			out   = total
				? opts.text
				: opts.empty;
	
		if ( total !== max ) {
			// Record set after filtering
			out += ' ' + opts.search;
		}
	
		// Convert the macros
		out += opts.postfix;
		out = _fnMacros( settings, out );
	
		if ( opts.callback ) {
			out = opts.callback.call( settings.oInstance,
				settings, start, end, max, total, out
			);
		}
	
		node.html( out );
	
		_fnCallbackFire(settings, null, 'info', [settings, node[0], out]);
	}
	
	var __searchCounter = 0;
	
	// opts
	// - text
	// - placeholder
	DataTable.feature.register( 'search', function ( settings, opts ) {
		// Don't show the input if filtering isn't available on the table
		if (! settings.oFeatures.bFilter) {
			return null;
		}
	
		var classes = settings.oClasses.search;
		var tableId = settings.sTableId;
		var language = settings.oLanguage;
		var previousSearch = settings.oPreviousSearch;
		var input = '<input type="search" class="'+classes.input+'"/>';
	
		opts = $.extend({
			placeholder: language.sSearchPlaceholder,
			text: language.sSearch
		}, opts);
	
		// The _INPUT_ is optional - is appended if not present
		if (opts.text.indexOf('_INPUT_') === -1) {
			opts.text += '_INPUT_';
		}
	
		opts.text = _fnMacros(settings, opts.text);
	
		// We can put the <input> outside of the label if it is at the start or end
		// which helps improve accessability (not all screen readers like implicit
		// for elements).
		var end = opts.text.match(/_INPUT_$/);
		var start = opts.text.match(/^_INPUT_/);
		var removed = opts.text.replace(/_INPUT_/, '');
		var str = '<label>' + opts.text + '</label>';
	
		if (start) {
			str = '_INPUT_<label>' + removed + '</label>';
		}
		else if (end) {
			str = '<label>' + removed + '</label>_INPUT_';
		}
	
		var filter = $('<div>')
			.addClass(classes.container)
			.append(str.replace(/_INPUT_/, input));
	
		// add for and id to label and input
		filter.find('label').attr('for', 'dt-search-' + __searchCounter);
		filter.find('input').attr('id', 'dt-search-' + __searchCounter);
		__searchCounter++;
	
		var searchFn = function(event) {
			var val = this.value;
	
			if(previousSearch.return && event.key !== "Enter") {
				return;
			}
	
			/* Now do the filter */
			if ( val != previousSearch.search ) {
				previousSearch.search = val;
	
				_fnFilterComplete( settings, previousSearch );
	
				// Need to redraw, without resorting
				settings._iDisplayStart = 0;
				_fnDraw( settings );
			}
		};
	
		var searchDelay = settings.searchDelay !== null ?
			settings.searchDelay :
			0;
	
		var jqFilter = $('input', filter)
			.val( previousSearch.search )
			.attr( 'placeholder', opts.placeholder )
			.on(
				'keyup.DT search.DT input.DT paste.DT cut.DT',
				searchDelay ?
					DataTable.util.debounce( searchFn, searchDelay ) :
					searchFn
			)
			.on( 'mouseup.DT', function(e) {
				// Edge fix! Edge 17 does not trigger anything other than mouse events when clicking
				// on the clear icon (Edge bug 17584515). This is safe in other browsers as `searchFn`
				// checks the value to see if it has changed. In other browsers it won't have.
				setTimeout( function () {
					searchFn.call(jqFilter[0], e);
				}, 10);
			} )
			.on( 'keypress.DT', function(e) {
				/* Prevent form submission */
				if ( e.keyCode == 13 ) {
					return false;
				}
			} )
			.attr('aria-controls', tableId);
	
		// Update the input elements whenever the table is filtered
		$(settings.nTable).on( 'search.dt.DT', function ( ev, s ) {
			if ( settings === s && jqFilter[0] !== document.activeElement ) {
				jqFilter.val( typeof previousSearch.search !== 'function'
					? previousSearch.search
					: ''
				);
			}
		} );
	
		return filter;
	}, 'f' );
	
	// opts
	// - type - button configuration
	// - buttons - number of buttons to show - must be odd
	DataTable.feature.register( 'paging', function ( settings, opts ) {
		// Don't show the paging input if the table doesn't have paging enabled
		if (! settings.oFeatures.bPaginate) {
			return null;
		}
	
		opts = $.extend({
			buttons: DataTable.ext.pager.numbers_length,
			type: settings.sPaginationType,
			boundaryNumbers: true
		}, opts);
	
		// To be removed in 2.1
		if (opts.numbers) {
			opts.buttons = opts.numbers;
		}
	
		var host = $('<div/>').addClass( settings.oClasses.paging.container + ' paging_' + opts.type );
		var draw = function () {
			_pagingDraw(settings, host, opts);
		};
	
		settings.aoDrawCallback.push(draw);
	
		// Responsive redraw of paging control
		$(settings.nTable).on('column-sizing.dt.DT', draw);
	
		return host;
	}, 'p' );
	
	function _pagingDraw(settings, host, opts) {
		if (! settings._bInitComplete) {
			return;
		}
	
		var
			plugin = DataTable.ext.pager[ opts.type ],
			aria = settings.oLanguage.oAria.paginate || {},
			start      = settings._iDisplayStart,
			len        = settings._iDisplayLength,
			visRecords = settings.fnRecordsDisplay(),
			all        = len === -1,
			page = all ? 0 : Math.ceil( start / len ),
			pages = all ? 1 : Math.ceil( visRecords / len ),
			buttons = plugin()
				.map(function (val) {
					return val === 'numbers'
						? _pagingNumbers(page, pages, opts.buttons, opts.boundaryNumbers)
						: val;
				})
				.flat();
	
		var buttonEls = [];
	
		for (var i=0 ; i<buttons.length ; i++) {
			var button = buttons[i];
	
			var btnInfo = _pagingButtonInfo(settings, button, page, pages);
			var btn = _fnRenderer( settings, 'pagingButton' )(
				settings,
				button,
				btnInfo.display,
				btnInfo.active,
				btnInfo.disabled
			);
	
			// Common attributes
			$(btn.clicker).attr({
				'aria-controls': settings.sTableId,
				'aria-disabled': btnInfo.disabled ? 'true' : null,
				'aria-current': btnInfo.active ? 'page' : null,
				'aria-label': aria[ button ],
				'data-dt-idx': button,
				'tabIndex': btnInfo.disabled ? -1 : settings.iTabIndex,
			});
	
			if (typeof button !== 'number') {
				$(btn.clicker).addClass(button);
			}
	
			_fnBindAction(
				btn.clicker, {action: button}, function(e) {
					e.preventDefault();
	
					_fnPageChange( settings, e.data.action, true );
				}
			);
	
			buttonEls.push(btn.display);
		}
	
		var wrapped = _fnRenderer(settings, 'pagingContainer')(
			settings, buttonEls
		);
	
		var activeEl = host.find(document.activeElement).data('dt-idx');
	
		host.empty().append(wrapped);
	
		if ( activeEl !== undefined ) {
			host.find( '[data-dt-idx='+activeEl+']' ).trigger('focus');
		}
	
		// Responsive - check if the buttons are over two lines based on the
		// height of the buttons and the container.
		if (
			buttonEls.length && // any buttons
			opts.numbers > 1 && // prevent infinite
			$(host).height() >= ($(buttonEls[0]).outerHeight() * 2) - 10
		) {
			_pagingDraw(settings, host, $.extend({}, opts, { numbers: opts.numbers - 2 }));
		}
	}
	
	/**
	 * Get properties for a button based on the current paging state of the table
	 *
	 * @param {*} settings DT settings object
	 * @param {*} button The button type in question
	 * @param {*} page Table's current page
	 * @param {*} pages Number of pages
	 * @returns Info object
	 */
	function _pagingButtonInfo(settings, button, page, pages) {
		var lang = settings.oLanguage.oPaginate;
		var o = {
			display: '',
			active: false,
			disabled: false
		};
	
		switch ( button ) {
			case 'ellipsis':
				o.display = '&#x2026;';
				o.disabled = true;
				break;
	
			case 'first':
				o.display = lang.sFirst;
	
				if (page === 0) {
					o.disabled = true;
				}
				break;
	
			case 'previous':
				o.display = lang.sPrevious;
	
				if ( page === 0 ) {
					o.disabled = true;
				}
				break;
	
			case 'next':
				o.display = lang.sNext;
	
				if ( pages === 0 || page === pages-1 ) {
					o.disabled = true;
				}
				break;
	
			case 'last':
				o.display = lang.sLast;
	
				if ( pages === 0 || page === pages-1 ) {
					o.disabled = true;
				}
				break;
	
			default:
				if ( typeof button === 'number' ) {
					o.display = settings.fnFormatNumber( button + 1 );
					
					if (page === button) {
						o.active = true;
					}
				}
				break;
		}
	
		return o;
	}
	
	/**
	 * Compute what number buttons to show in the paging control
	 *
	 * @param {*} page Current page
	 * @param {*} pages Total number of pages
	 * @param {*} buttons Target number of number buttons
	 * @param {boolean} addFirstLast Indicate if page 1 and end should be included
	 * @returns Buttons to show
	 */
	function _pagingNumbers ( page, pages, buttons, addFirstLast ) {
		var
			numbers = [],
			half = Math.floor(buttons / 2),
			before = addFirstLast ? 2 : 1,
			after = addFirstLast ? 1 : 0;
	
		if ( pages <= buttons ) {
			numbers = _range(0, pages);
		}
		else if (buttons === 1) {
			// Single button - current page only
			numbers = [page];
		}
		else if (buttons === 3) {
			// Special logic for just three buttons
			if (page <= 1) {
				numbers = [0, 1, 'ellipsis'];
			}
			else if (page >= pages - 2) {
				numbers = _range(pages-2, pages);
				numbers.unshift('ellipsis');
			}
			else {
				numbers = ['ellipsis', page, 'ellipsis'];
			}
		}
		else if ( page <= half ) {
			numbers = _range(0, buttons-before);
			numbers.push('ellipsis');
	
			if (addFirstLast) {
				numbers.push(pages-1);
			}
		}
		else if ( page >= pages - 1 - half ) {
			numbers = _range(pages-(buttons-before), pages);
			numbers.unshift('ellipsis');
	
			if (addFirstLast) {
				numbers.unshift(0);
			}
		}
		else {
			numbers = _range(page-half+before, page+half-after);
			numbers.push('ellipsis');
			numbers.unshift('ellipsis');
	
			if (addFirstLast) {
				numbers.push(pages-1);
				numbers.unshift(0);
			}
		}
	
		return numbers;
	}
	
	var __lengthCounter = 0;
	
	// opts
	// - menu
	// - text
	DataTable.feature.register( 'pageLength', function ( settings, opts ) {
		var features = settings.oFeatures;
	
		// For compatibility with the legacy `pageLength` top level option
		if (! features.bPaginate || ! features.bLengthChange) {
			return null;
		}
	
		opts = $.extend({
			menu: settings.aLengthMenu,
			text: settings.oLanguage.sLengthMenu
		}, opts);
	
		var
			classes  = settings.oClasses.length,
			tableId  = settings.sTableId,
			menu     = opts.menu,
			lengths  = [],
			language = [],
			i;
	
		// Options can be given in a number of ways
		if (Array.isArray( menu[0] )) {
			// Old 1.x style - 2D array
			lengths = menu[0];
			language = menu[1];
		}
		else {
			for ( i=0 ; i<menu.length ; i++ ) {
				// An object with different label and value
				if ($.isPlainObject(menu[i])) {
					lengths.push(menu[i].value);
					language.push(menu[i].label);
				}
				else {
					// Or just a number to display and use
					lengths.push(menu[i]);
					language.push(menu[i]);
				}
			}
		}
	
		// We can put the <select> outside of the label if it is at the start or
		// end which helps improve accessability (not all screen readers like
		// implicit for elements).
		var end = opts.text.match(/_MENU_$/);
		var start = opts.text.match(/^_MENU_/);
		var removed = opts.text.replace(/_MENU_/, '');
		var str = '<label>' + opts.text + '</label>';
	
		if (start) {
			str = '_MENU_<label>' + removed + '</label>';
		}
		else if (end) {
			str = '<label>' + removed + '</label>_MENU_';
		}
	
		// Wrapper element - use a span as a holder for where the select will go
		var div = $('<div/>')
			.addClass( classes.container )
			.append(
				str.replace( '_MENU_', '<span></span>' )
			);
	
		// Save text node content for macro updating
		var textNodes = [];
		div.find('label')[0].childNodes.forEach(function (el) {
			if (el.nodeType === Node.TEXT_NODE) {
				textNodes.push({
					el: el,
					text: el.textContent
				});
			}
		})
	
		// Update the label text in case it has an entries value
		var updateEntries = function (len) {
			textNodes.forEach(function (node) {
				node.el.textContent = _fnMacros(settings, node.text, len);
			});
		}
	
		// Next, the select itself, along with the options
		var select = $('<select/>', {
			'name':          tableId+'_length',
			'aria-controls': tableId,
			'class':         classes.select
		} );
	
		for ( i=0 ; i<lengths.length ; i++ ) {
			select[0][ i ] = new Option(
				typeof language[i] === 'number' ?
					settings.fnFormatNumber( language[i] ) :
					language[i],
				lengths[i]
			);
		}
	
		// add for and id to label and input
		div.find('label').attr('for', 'dt-length-' + __lengthCounter);
		select.attr('id', 'dt-length-' + __lengthCounter);
		__lengthCounter++;
	
		// Swap in the select list
		div.find('span').replaceWith(select);
	
		// Can't use `select` variable as user might provide their own and the
		// reference is broken by the use of outerHTML
		$('select', div)
			.val( settings._iDisplayLength )
			.on( 'change.DT', function() {
				_fnLengthChange( settings, $(this).val() );
				_fnDraw( settings );
			} );
	
		// Update node value whenever anything changes the table's length
		$(settings.nTable).on( 'length.dt.DT', function (e, s, len) {
			if ( settings === s ) {
				$('select', div).val( len );
	
				// Resolve plurals in the text for the new length
				updateEntries(len);
			}
		} );
	
		updateEntries(settings._iDisplayLength);
	
		return div;
	}, 'l' );
	
	// jQuery access
	$.fn.dataTable = DataTable;
	
	// Provide access to the host jQuery object (circular reference)
	DataTable.$ = $;
	
	// Legacy aliases
	$.fn.dataTableSettings = DataTable.settings;
	$.fn.dataTableExt = DataTable.ext;
	
	// With a capital `D` we return a DataTables API instance rather than a
	// jQuery object
	$.fn.DataTable = function ( opts ) {
		return $(this).dataTable( opts ).api();
	};
	
	// All properties that are available to $.fn.dataTable should also be
	// available on $.fn.DataTable
	$.each( DataTable, function ( prop, val ) {
		$.fn.DataTable[ prop ] = val;
	} );

	return DataTable;
}));


/*! DataTables jQuery UI integration
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



/**
 * DataTables integration for jQuery UI.
 *
 * This file sets the defaults and adds options to DataTables to style its
 * controls using jQuery UI. See https://datatables.net/manual/styling/jqueryui
 * for further information.
 */

$.extend( true, DataTable.ext.classes, {
	container: 'dt-container dt-jqueryui',
	paging: {
		active: 'ui-state-disabled',
		button: 'fg-button ui-button ui-state-default',
		container: 'dt-paging fg-buttonset ui-buttonset fg-buttonset-multi ui-buttonset-multi',
		disabled: 'ui-state-disabled'
	},
	thead: {
		cell: 'ui-state-default fg-toolbar ui-toolbar ui-widget-header'
	},
	tfoot: {
		cell: 'ui-state-default ui-widget-header'
	},
	grid: {
		row: 'dt-layout-row ui-helper-clearfix',
		cell: 'dt-layout-cell'
	}
} );


DataTable.ext.renderer.layout.jqueryui = function ( settings, container, items ) {
	var classes = settings.oClasses;
	var row = $( '<div/>', {
			"class": classes.grid.row
		} )
		.appendTo( container );

	$.each( items, function (key, val) {
		var cell = $( '<div/>', {
				id: val.id || null,
				"class": classes.grid.cell + ' dt-'+key+' '+(val.className || '')
			} )
			.append( val.contents )
			.appendTo( row );

		if ($(val.contents).hasClass('dataTable')) {
			cell.addClass('table');
		}
	} );
};

// Set the defaults for DataTables initialisation
$.extend(true, DataTable.defaults, {
	renderer: 'jqueryui'
});


return DataTable;
}));


/*! Buttons for DataTables 3.0.2
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



// Used for namespacing events added to the document by each instance, so they
// can be removed on destroy
var _instCounter = 0;

// Button namespacing counter for namespacing events on individual buttons
var _buttonCounter = 0;

var _dtButtons = DataTable.ext.buttons;

// Custom entity decoder for data export
var _entityDecoder = null;

// Allow for jQuery slim
function _fadeIn(el, duration, fn) {
	if ($.fn.animate) {
		el.stop().fadeIn(duration, fn);
	}
	else {
		el.css('display', 'block');

		if (fn) {
			fn.call(el);
		}
	}
}

function _fadeOut(el, duration, fn) {
	if ($.fn.animate) {
		el.stop().fadeOut(duration, fn);
	}
	else {
		el.css('display', 'none');

		if (fn) {
			fn.call(el);
		}
	}
}

/**
 * [Buttons description]
 * @param {[type]}
 * @param {[type]}
 */
var Buttons = function (dt, config) {
	if (!DataTable.versionCheck('2')) {
		throw 'Warning: Buttons requires DataTables 2 or newer';
	}

	// If not created with a `new` keyword then we return a wrapper function that
	// will take the settings object for a DT. This allows easy use of new instances
	// with the `layout` option - e.g. `topLeft: $.fn.dataTable.Buttons( ... )`.
	if (!(this instanceof Buttons)) {
		return function (settings) {
			return new Buttons(settings, dt).container();
		};
	}

	// If there is no config set it to an empty object
	if (typeof config === 'undefined') {
		config = {};
	}

	// Allow a boolean true for defaults
	if (config === true) {
		config = {};
	}

	// For easy configuration of buttons an array can be given
	if (Array.isArray(config)) {
		config = { buttons: config };
	}

	this.c = $.extend(true, {}, Buttons.defaults, config);

	// Don't want a deep copy for the buttons
	if (config.buttons) {
		this.c.buttons = config.buttons;
	}

	this.s = {
		dt: new DataTable.Api(dt),
		buttons: [],
		listenKeys: '',
		namespace: 'dtb' + _instCounter++
	};

	this.dom = {
		container: $('<' + this.c.dom.container.tag + '/>').addClass(
			this.c.dom.container.className
		)
	};

	this._constructor();
};

$.extend(Buttons.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods
	 */

	/**
	 * Get the action of a button
	 * @param  {int|string} Button index
	 * @return {function}
	 */ /**
	 * Set the action of a button
	 * @param  {node} node Button element
	 * @param  {function} action Function to set
	 * @return {Buttons} Self for chaining
	 */
	action: function (node, action) {
		var button = this._nodeToButton(node);

		if (action === undefined) {
			return button.conf.action;
		}

		button.conf.action = action;

		return this;
	},

	/**
	 * Add an active class to the button to make to look active or get current
	 * active state.
	 * @param  {node} node Button element
	 * @param  {boolean} [flag] Enable / disable flag
	 * @return {Buttons} Self for chaining or boolean for getter
	 */
	active: function (node, flag) {
		var button = this._nodeToButton(node);
		var klass = this.c.dom.button.active;
		var jqNode = $(button.node);

		if (
			button.inCollection &&
			this.c.dom.collection.button &&
			this.c.dom.collection.button.active !== undefined
		) {
			klass = this.c.dom.collection.button.active;
		}

		if (flag === undefined) {
			return jqNode.hasClass(klass);
		}

		jqNode.toggleClass(klass, flag === undefined ? true : flag);

		return this;
	},

	/**
	 * Add a new button
	 * @param {object} config Button configuration object, base string name or function
	 * @param {int|string} [idx] Button index for where to insert the button
	 * @param {boolean} [draw=true] Trigger a draw. Set a false when adding
	 *   lots of buttons, until the last button.
	 * @return {Buttons} Self for chaining
	 */
	add: function (config, idx, draw) {
		var buttons = this.s.buttons;

		if (typeof idx === 'string') {
			var split = idx.split('-');
			var base = this.s;

			for (var i = 0, ien = split.length - 1; i < ien; i++) {
				base = base.buttons[split[i] * 1];
			}

			buttons = base.buttons;
			idx = split[split.length - 1] * 1;
		}

		this._expandButton(
			buttons,
			config,
			config !== undefined ? config.split : undefined,
			(config === undefined ||
				config.split === undefined ||
				config.split.length === 0) &&
				base !== undefined,
			false,
			idx
		);

		if (draw === undefined || draw === true) {
			this._draw();
		}

		return this;
	},

	/**
	 * Clear buttons from a collection and then insert new buttons
	 */
	collectionRebuild: function (node, newButtons) {
		var button = this._nodeToButton(node);

		if (newButtons !== undefined) {
			var i;
			// Need to reverse the array
			for (i = button.buttons.length - 1; i >= 0; i--) {
				this.remove(button.buttons[i].node);
			}

			// If the collection has prefix and / or postfix buttons we need to add them in
			if (button.conf.prefixButtons) {
				newButtons.unshift.apply(newButtons, button.conf.prefixButtons);
			}

			if (button.conf.postfixButtons) {
				newButtons.push.apply(newButtons, button.conf.postfixButtons);
			}

			for (i = 0; i < newButtons.length; i++) {
				var newBtn = newButtons[i];

				this._expandButton(
					button.buttons,
					newBtn,
					newBtn !== undefined &&
						newBtn.config !== undefined &&
						newBtn.config.split !== undefined,
					true,
					newBtn.parentConf !== undefined &&
						newBtn.parentConf.split !== undefined,
					null,
					newBtn.parentConf
				);
			}
		}

		this._draw(button.collection, button.buttons);
	},

	/**
	 * Get the container node for the buttons
	 * @return {jQuery} Buttons node
	 */
	container: function () {
		return this.dom.container;
	},

	/**
	 * Disable a button
	 * @param  {node} node Button node
	 * @return {Buttons} Self for chaining
	 */
	disable: function (node) {
		var button = this._nodeToButton(node);

		$(button.node)
			.addClass(this.c.dom.button.disabled)
			.prop('disabled', true);

		return this;
	},

	/**
	 * Destroy the instance, cleaning up event handlers and removing DOM
	 * elements
	 * @return {Buttons} Self for chaining
	 */
	destroy: function () {
		// Key event listener
		$('body').off('keyup.' + this.s.namespace);

		// Individual button destroy (so they can remove their own events if
		// needed). Take a copy as the array is modified by `remove`
		var buttons = this.s.buttons.slice();
		var i, ien;

		for (i = 0, ien = buttons.length; i < ien; i++) {
			this.remove(buttons[i].node);
		}

		// Container
		this.dom.container.remove();

		// Remove from the settings object collection
		var buttonInsts = this.s.dt.settings()[0];

		for (i = 0, ien = buttonInsts.length; i < ien; i++) {
			if (buttonInsts.inst === this) {
				buttonInsts.splice(i, 1);
				break;
			}
		}

		return this;
	},

	/**
	 * Enable / disable a button
	 * @param  {node} node Button node
	 * @param  {boolean} [flag=true] Enable / disable flag
	 * @return {Buttons} Self for chaining
	 */
	enable: function (node, flag) {
		if (flag === false) {
			return this.disable(node);
		}

		var button = this._nodeToButton(node);
		$(button.node)
			.removeClass(this.c.dom.button.disabled)
			.prop('disabled', false);

		return this;
	},

	/**
	 * Get a button's index
	 *
	 * This is internally recursive
	 * @param {element} node Button to get the index of
	 * @return {string} Button index
	 */
	index: function (node, nested, buttons) {
		if (!nested) {
			nested = '';
			buttons = this.s.buttons;
		}

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			var inner = buttons[i].buttons;

			if (buttons[i].node === node) {
				return nested + i;
			}

			if (inner && inner.length) {
				var match = this.index(node, i + '-', inner);

				if (match !== null) {
					return match;
				}
			}
		}

		return null;
	},

	/**
	 * Get the instance name for the button set selector
	 * @return {string} Instance name
	 */
	name: function () {
		return this.c.name;
	},

	/**
	 * Get a button's node of the buttons container if no button is given
	 * @param  {node} [node] Button node
	 * @return {jQuery} Button element, or container
	 */
	node: function (node) {
		if (!node) {
			return this.dom.container;
		}

		var button = this._nodeToButton(node);
		return $(button.node);
	},

	/**
	 * Set / get a processing class on the selected button
	 * @param {element} node Triggering button node
	 * @param  {boolean} flag true to add, false to remove, undefined to get
	 * @return {boolean|Buttons} Getter value or this if a setter.
	 */
	processing: function (node, flag) {
		var dt = this.s.dt;
		var button = this._nodeToButton(node);

		if (flag === undefined) {
			return $(button.node).hasClass('processing');
		}

		$(button.node).toggleClass('processing', flag);

		$(dt.table().node()).triggerHandler('buttons-processing.dt', [
			flag,
			dt.button(node),
			dt,
			$(node),
			button.conf
		]);

		return this;
	},

	/**
	 * Remove a button.
	 * @param  {node} node Button node
	 * @return {Buttons} Self for chaining
	 */
	remove: function (node) {
		var button = this._nodeToButton(node);
		var host = this._nodeToHost(node);
		var dt = this.s.dt;

		// Remove any child buttons first
		if (button.buttons.length) {
			for (var i = button.buttons.length - 1; i >= 0; i--) {
				this.remove(button.buttons[i].node);
			}
		}

		button.conf.destroying = true;

		// Allow the button to remove event handlers, etc
		if (button.conf.destroy) {
			button.conf.destroy.call(dt.button(node), dt, $(node), button.conf);
		}

		this._removeKey(button.conf);

		$(button.node).remove();

		var idx = $.inArray(button, host);
		host.splice(idx, 1);

		return this;
	},

	/**
	 * Get the text for a button
	 * @param  {int|string} node Button index
	 * @return {string} Button text
	 */ /**
	 * Set the text for a button
	 * @param  {int|string|function} node Button index
	 * @param  {string} label Text
	 * @return {Buttons} Self for chaining
	 */
	text: function (node, label) {
		var button = this._nodeToButton(node);
		var textNode = button.textNode;
		var dt = this.s.dt;
		var jqNode = $(button.node);
		var text = function (opt) {
			return typeof opt === 'function'
				? opt(dt, jqNode, button.conf)
				: opt;
		};

		if (label === undefined) {
			return text(button.conf.text);
		}

		button.conf.text = label;
		textNode.html(text(label));

		return this;
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Buttons constructor
	 * @private
	 */
	_constructor: function () {
		var that = this;
		var dt = this.s.dt;
		var dtSettings = dt.settings()[0];
		var buttons = this.c.buttons;

		if (!dtSettings._buttons) {
			dtSettings._buttons = [];
		}

		dtSettings._buttons.push({
			inst: this,
			name: this.c.name
		});

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			this.add(buttons[i]);
		}

		dt.on('destroy', function (e, settings) {
			if (settings === dtSettings) {
				that.destroy();
			}
		});

		// Global key event binding to listen for button keys
		$('body').on('keyup.' + this.s.namespace, function (e) {
			if (
				!document.activeElement ||
				document.activeElement === document.body
			) {
				// SUse a string of characters for fast lookup of if we need to
				// handle this
				var character = String.fromCharCode(e.keyCode).toLowerCase();

				if (that.s.listenKeys.toLowerCase().indexOf(character) !== -1) {
					that._keypress(character, e);
				}
			}
		});
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Add a new button to the key press listener
	 * @param {object} conf Resolved button configuration object
	 * @private
	 */
	_addKey: function (conf) {
		if (conf.key) {
			this.s.listenKeys += $.isPlainObject(conf.key)
				? conf.key.key
				: conf.key;
		}
	},

	/**
	 * Insert the buttons into the container. Call without parameters!
	 * @param  {node} [container] Recursive only - Insert point
	 * @param  {array} [buttons] Recursive only - Buttons array
	 * @private
	 */
	_draw: function (container, buttons) {
		if (!container) {
			container = this.dom.container;
			buttons = this.s.buttons;
		}

		container.children().detach();

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			container.append(buttons[i].inserter);
			container.append(' ');

			if (buttons[i].buttons && buttons[i].buttons.length) {
				this._draw(buttons[i].collection, buttons[i].buttons);
			}
		}
	},

	/**
	 * Create buttons from an array of buttons
	 * @param  {array} attachTo Buttons array to attach to
	 * @param  {object} button Button definition
	 * @param  {boolean} inCollection true if the button is in a collection
	 * @private
	 */
	_expandButton: function (
		attachTo,
		button,
		split,
		inCollection,
		inSplit,
		attachPoint,
		parentConf
	) {
		var dt = this.s.dt;
		var isSplit = false;
		var domCollection = this.c.dom.collection;
		var buttons = !Array.isArray(button) ? [button] : button;

		if (button === undefined) {
			buttons = !Array.isArray(split) ? [split] : split;
		}

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			var conf = this._resolveExtends(buttons[i]);

			if (!conf) {
				continue;
			}

			isSplit = conf.config && conf.config.split ? true : false;

			// If the configuration is an array, then expand the buttons at this
			// point
			if (Array.isArray(conf)) {
				this._expandButton(
					attachTo,
					conf,
					built !== undefined && built.conf !== undefined
						? built.conf.split
						: undefined,
					inCollection,
					parentConf !== undefined && parentConf.split !== undefined,
					attachPoint,
					parentConf
				);
				continue;
			}

			var built = this._buildButton(
				conf,
				inCollection,
				conf.split !== undefined ||
					(conf.config !== undefined &&
						conf.config.split !== undefined),
				inSplit
			);
			if (!built) {
				continue;
			}

			if (attachPoint !== undefined && attachPoint !== null) {
				attachTo.splice(attachPoint, 0, built);
				attachPoint++;
			}
			else {
				attachTo.push(built);
			}

			// Create the dropdown for a collection
			if (built.conf.buttons) {
				built.collection = $(
					'<' + domCollection.container.content.tag + '/>'
				);
				built.conf._collection = built.collection;

				$(built.node).append(domCollection.action.dropHtml);

				this._expandButton(
					built.buttons,
					built.conf.buttons,
					built.conf.split,
					!isSplit,
					isSplit,
					attachPoint,
					built.conf
				);
			}

			// And the split collection
			if (built.conf.split) {
				built.collection = $('<' + domCollection.container.tag + '/>');
				built.conf._collection = built.collection;

				for (var j = 0; j < built.conf.split.length; j++) {
					var item = built.conf.split[j];

					if (typeof item === 'object') {
						item.parent = parentConf;

						if (item.collectionLayout === undefined) {
							item.collectionLayout = built.conf.collectionLayout;
						}

						if (item.dropup === undefined) {
							item.dropup = built.conf.dropup;
						}

						if (item.fade === undefined) {
							item.fade = built.conf.fade;
						}
					}
				}

				this._expandButton(
					built.buttons,
					built.conf.buttons,
					built.conf.split,
					!isSplit,
					isSplit,
					attachPoint,
					built.conf
				);
			}

			built.conf.parent = parentConf;

			// init call is made here, rather than buildButton as it needs to
			// be selectable, and for that it needs to be in the buttons array
			if (conf.init) {
				conf.init.call(dt.button(built.node), dt, $(built.node), conf);
			}
		}
	},

	/**
	 * Create an individual button
	 * @param  {object} config            Resolved button configuration
	 * @param  {boolean} inCollection `true` if a collection button
	 * @return {object} Completed button description object
	 * @private
	 */
	_buildButton: function (config, inCollection, isSplit, inSplit) {
		var that = this;
		var configDom = this.c.dom;
		var textNode;
		var dt = this.s.dt;
		var text = function (opt) {
			return typeof opt === 'function' ? opt(dt, button, config) : opt;
		};

		// Create an object that describes the button which can be in `dom.button`, or
		// `dom.collection.button` or `dom.split.button` or `dom.collection.split.button`!
		// Each should extend from `dom.button`.
		var dom = $.extend(true, {}, configDom.button);

		if (inCollection && isSplit && configDom.collection.split) {
			$.extend(true, dom, configDom.collection.split.action);
		}
		else if (inSplit || inCollection) {
			$.extend(true, dom, configDom.collection.button);
		}
		else if (isSplit) {
			$.extend(true, dom, configDom.split.button);
		}

		// Spacers don't do much other than insert an element into the DOM
		if (config.spacer) {
			var spacer = $('<' + dom.spacer.tag + '/>')
				.addClass(
					'dt-button-spacer ' +
						config.style +
						' ' +
						dom.spacer.className
				)
				.html(text(config.text));

			return {
				conf: config,
				node: spacer,
				inserter: spacer,
				buttons: [],
				inCollection: inCollection,
				isSplit: isSplit,
				collection: null,
				textNode: spacer
			};
		}

		// Make sure that the button is available based on whatever requirements
		// it has. For example, PDF button require pdfmake
		if (
			config.available &&
			!config.available(dt, config) &&
			!config.html
		) {
			return false;
		}

		var button;

		if (!config.html) {
			var run = function (e, dt, button, config, done) {
				config.action.call(dt.button(button), e, dt, button, config, done);

				$(dt.table().node()).triggerHandler('buttons-action.dt', [
					dt.button(button),
					dt,
					button,
					config
				]);
			};

			var action = function(e, dt, button, config) {
				if (config.async) {
					that.processing(button[0], true);

					setTimeout(function () {
						run(e, dt, button, config, function () {
							that.processing(button[0], false);
						});
					}, config.async);
				}
				else {
					run(e, dt, button, config, function () {});
				}
			}

			var tag = config.tag || dom.tag;
			var clickBlurs =
				config.clickBlurs === undefined ? true : config.clickBlurs;

			button = $('<' + tag + '/>')
				.addClass(dom.className)
				.attr('tabindex', this.s.dt.settings()[0].iTabIndex)
				.attr('aria-controls', this.s.dt.table().node().id)
				.on('click.dtb', function (e) {
					e.preventDefault();

					if (!button.hasClass(dom.disabled) && config.action) {
						action(e, dt, button, config);
					}

					if (clickBlurs) {
						button.trigger('blur');
					}
				})
				.on('keypress.dtb', function (e) {
					if (e.keyCode === 13) {
						e.preventDefault();

						if (!button.hasClass(dom.disabled) && config.action) {
							action(e, dt, button, config);
						}
					}
				});

			// Make `a` tags act like a link
			if (tag.toLowerCase() === 'a') {
				button.attr('href', '#');
			}

			// Button tags should have `type=button` so they don't have any default behaviour
			if (tag.toLowerCase() === 'button') {
				button.attr('type', 'button');
			}

			if (dom.liner.tag) {
				var liner = $('<' + dom.liner.tag + '/>')
					.html(text(config.text))
					.addClass(dom.liner.className);

				if (dom.liner.tag.toLowerCase() === 'a') {
					liner.attr('href', '#');
				}

				button.append(liner);
				textNode = liner;
			}
			else {
				button.html(text(config.text));
				textNode = button;
			}

			if (config.enabled === false) {
				button.addClass(dom.disabled);
			}

			if (config.className) {
				button.addClass(config.className);
			}

			if (config.titleAttr) {
				button.attr('title', text(config.titleAttr));
			}

			if (config.attr) {
				button.attr(config.attr);
			}

			if (!config.namespace) {
				config.namespace = '.dt-button-' + _buttonCounter++;
			}

			if (config.config !== undefined && config.config.split) {
				config.split = config.config.split;
			}
		}
		else {
			button = $(config.html);
		}

		var buttonContainer = this.c.dom.buttonContainer;
		var inserter;
		if (buttonContainer && buttonContainer.tag) {
			inserter = $('<' + buttonContainer.tag + '/>')
				.addClass(buttonContainer.className)
				.append(button);
		}
		else {
			inserter = button;
		}

		this._addKey(config);

		// Style integration callback for DOM manipulation
		// Note that this is _not_ documented. It is currently
		// for style integration only
		if (this.c.buttonCreated) {
			inserter = this.c.buttonCreated(config, inserter);
		}

		var splitDiv;

		if (isSplit) {
			var dropdownConf = inCollection
				? $.extend(true, this.c.dom.split, this.c.dom.collection.split)
				: this.c.dom.split;
			var wrapperConf = dropdownConf.wrapper;

			splitDiv = $('<' + wrapperConf.tag + '/>')
				.addClass(wrapperConf.className)
				.append(button);

			var dropButtonConfig = $.extend(config, {
				align: dropdownConf.dropdown.align,
				attr: {
					'aria-haspopup': 'dialog',
					'aria-expanded': false
				},
				className: dropdownConf.dropdown.className,
				closeButton: false,
				splitAlignClass: dropdownConf.dropdown.splitAlignClass,
				text: dropdownConf.dropdown.text
			});

			this._addKey(dropButtonConfig);

			var splitAction = function (e, dt, button, config) {
				_dtButtons.split.action.call(
					dt.button(splitDiv),
					e,
					dt,
					button,
					config
				);

				$(dt.table().node()).triggerHandler('buttons-action.dt', [
					dt.button(button),
					dt,
					button,
					config
				]);
				button.attr('aria-expanded', true);
			};

			var dropButton = $(
				'<button class="' +
					dropdownConf.dropdown.className +
					' dt-button"></button>'
			)
				.html(dropdownConf.dropdown.dropHtml)
				.on('click.dtb', function (e) {
					e.preventDefault();
					e.stopPropagation();

					if (!dropButton.hasClass(dom.disabled)) {
						splitAction(e, dt, dropButton, dropButtonConfig);
					}
					if (clickBlurs) {
						dropButton.trigger('blur');
					}
				})
				.on('keypress.dtb', function (e) {
					if (e.keyCode === 13) {
						e.preventDefault();

						if (!dropButton.hasClass(dom.disabled)) {
							splitAction(e, dt, dropButton, dropButtonConfig);
						}
					}
				});

			if (config.split.length === 0) {
				dropButton.addClass('dtb-hide-drop');
			}

			splitDiv.append(dropButton).attr(dropButtonConfig.attr);
		}

		return {
			conf: config,
			node: isSplit ? splitDiv.get(0) : button.get(0),
			inserter: isSplit ? splitDiv : inserter,
			buttons: [],
			inCollection: inCollection,
			isSplit: isSplit,
			inSplit: inSplit,
			collection: null,
			textNode: textNode
		};
	},

	/**
	 * Get the button object from a node (recursive)
	 * @param  {node} node Button node
	 * @param  {array} [buttons] Button array, uses base if not defined
	 * @return {object} Button object
	 * @private
	 */
	_nodeToButton: function (node, buttons) {
		if (!buttons) {
			buttons = this.s.buttons;
		}

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			if (buttons[i].node === node) {
				return buttons[i];
			}

			if (buttons[i].buttons.length) {
				var ret = this._nodeToButton(node, buttons[i].buttons);

				if (ret) {
					return ret;
				}
			}
		}
	},

	/**
	 * Get container array for a button from a button node (recursive)
	 * @param  {node} node Button node
	 * @param  {array} [buttons] Button array, uses base if not defined
	 * @return {array} Button's host array
	 * @private
	 */
	_nodeToHost: function (node, buttons) {
		if (!buttons) {
			buttons = this.s.buttons;
		}

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			if (buttons[i].node === node) {
				return buttons;
			}

			if (buttons[i].buttons.length) {
				var ret = this._nodeToHost(node, buttons[i].buttons);

				if (ret) {
					return ret;
				}
			}
		}
	},

	/**
	 * Handle a key press - determine if any button's key configured matches
	 * what was typed and trigger the action if so.
	 * @param  {string} character The character pressed
	 * @param  {object} e Key event that triggered this call
	 * @private
	 */
	_keypress: function (character, e) {
		// Check if this button press already activated on another instance of Buttons
		if (e._buttonsHandled) {
			return;
		}

		var run = function (conf, node) {
			if (!conf.key) {
				return;
			}

			if (conf.key === character) {
				e._buttonsHandled = true;
				$(node).click();
			}
			else if ($.isPlainObject(conf.key)) {
				if (conf.key.key !== character) {
					return;
				}

				if (conf.key.shiftKey && !e.shiftKey) {
					return;
				}

				if (conf.key.altKey && !e.altKey) {
					return;
				}

				if (conf.key.ctrlKey && !e.ctrlKey) {
					return;
				}

				if (conf.key.metaKey && !e.metaKey) {
					return;
				}

				// Made it this far - it is good
				e._buttonsHandled = true;
				$(node).click();
			}
		};

		var recurse = function (a) {
			for (var i = 0, ien = a.length; i < ien; i++) {
				run(a[i].conf, a[i].node);

				if (a[i].buttons.length) {
					recurse(a[i].buttons);
				}
			}
		};

		recurse(this.s.buttons);
	},

	/**
	 * Remove a key from the key listener for this instance (to be used when a
	 * button is removed)
	 * @param  {object} conf Button configuration
	 * @private
	 */
	_removeKey: function (conf) {
		if (conf.key) {
			var character = $.isPlainObject(conf.key) ? conf.key.key : conf.key;

			// Remove only one character, as multiple buttons could have the
			// same listening key
			var a = this.s.listenKeys.split('');
			var idx = $.inArray(character, a);
			a.splice(idx, 1);
			this.s.listenKeys = a.join('');
		}
	},

	/**
	 * Resolve a button configuration
	 * @param  {string|function|object} conf Button config to resolve
	 * @return {object} Button configuration
	 * @private
	 */
	_resolveExtends: function (conf) {
		var that = this;
		var dt = this.s.dt;
		var i, ien;
		var toConfObject = function (base) {
			var loop = 0;

			// Loop until we have resolved to a button configuration, or an
			// array of button configurations (which will be iterated
			// separately)
			while (!$.isPlainObject(base) && !Array.isArray(base)) {
				if (base === undefined) {
					return;
				}

				if (typeof base === 'function') {
					base = base.call(that, dt, conf);

					if (!base) {
						return false;
					}
				}
				else if (typeof base === 'string') {
					if (!_dtButtons[base]) {
						return { html: base };
					}

					base = _dtButtons[base];
				}

				loop++;
				if (loop > 30) {
					// Protect against misconfiguration killing the browser
					throw 'Buttons: Too many iterations';
				}
			}

			return Array.isArray(base) ? base : $.extend({}, base);
		};

		conf = toConfObject(conf);

		while (conf && conf.extend) {
			// Use `toConfObject` in case the button definition being extended
			// is itself a string or a function
			if (!_dtButtons[conf.extend]) {
				throw 'Cannot extend unknown button type: ' + conf.extend;
			}

			var objArray = toConfObject(_dtButtons[conf.extend]);
			if (Array.isArray(objArray)) {
				return objArray;
			}
			else if (!objArray) {
				// This is a little brutal as it might be possible to have a
				// valid button without the extend, but if there is no extend
				// then the host button would be acting in an undefined state
				return false;
			}

			// Stash the current class name
			var originalClassName = objArray.className;

			if (conf.config !== undefined && objArray.config !== undefined) {
				conf.config = $.extend({}, objArray.config, conf.config);
			}

			conf = $.extend({}, objArray, conf);

			// The extend will have overwritten the original class name if the
			// `conf` object also assigned a class, but we want to concatenate
			// them so they are list that is combined from all extended buttons
			if (originalClassName && conf.className !== originalClassName) {
				conf.className = originalClassName + ' ' + conf.className;
			}

			// Although we want the `conf` object to overwrite almost all of
			// the properties of the object being extended, the `extend`
			// property should come from the object being extended
			conf.extend = objArray.extend;
		}

		// Buttons to be added to a collection  -gives the ability to define
		// if buttons should be added to the start or end of a collection
		var postfixButtons = conf.postfixButtons;
		if (postfixButtons) {
			if (!conf.buttons) {
				conf.buttons = [];
			}

			for (i = 0, ien = postfixButtons.length; i < ien; i++) {
				conf.buttons.push(postfixButtons[i]);
			}
		}

		var prefixButtons = conf.prefixButtons;
		if (prefixButtons) {
			if (!conf.buttons) {
				conf.buttons = [];
			}

			for (i = 0, ien = prefixButtons.length; i < ien; i++) {
				conf.buttons.splice(i, 0, prefixButtons[i]);
			}
		}

		return conf;
	},

	/**
	 * Display (and replace if there is an existing one) a popover attached to a button
	 * @param {string|node} content Content to show
	 * @param {DataTable.Api} hostButton DT API instance of the button
	 * @param {object} inOpts Options (see object below for all options)
	 */
	_popover: function (content, hostButton, inOpts) {
		var dt = hostButton;
		var c = this.c;
		var closed = false;
		var options = $.extend(
			{
				align: 'button-left', // button-right, dt-container, split-left, split-right
				autoClose: false,
				background: true,
				backgroundClassName: 'dt-button-background',
				closeButton: true,
				containerClassName: c.dom.collection.container.className,
				contentClassName: c.dom.collection.container.content.className,
				collectionLayout: '',
				collectionTitle: '',
				dropup: false,
				fade: 400,
				popoverTitle: '',
				rightAlignClassName: 'dt-button-right',
				tag: c.dom.collection.container.tag
			},
			inOpts
		);

		var containerSelector =
			options.tag + '.' + options.containerClassName.replace(/ /g, '.');
		var hostNode = hostButton.node();

		var close = function () {
			closed = true;

			_fadeOut($(containerSelector), options.fade, function () {
				$(this).detach();
			});

			$(
				dt
					.buttons('[aria-haspopup="dialog"][aria-expanded="true"]')
					.nodes()
			).attr('aria-expanded', 'false');

			$('div.dt-button-background').off('click.dtb-collection');
			Buttons.background(
				false,
				options.backgroundClassName,
				options.fade,
				hostNode
			);

			$(window).off('resize.resize.dtb-collection');
			$('body').off('.dtb-collection');
			dt.off('buttons-action.b-internal');
			dt.off('destroy');
		};

		if (content === false) {
			close();
			return;
		}

		var existingExpanded = $(
			dt.buttons('[aria-haspopup="dialog"][aria-expanded="true"]').nodes()
		);
		if (existingExpanded.length) {
			// Reuse the current position if the button that was triggered is inside an existing collection
			if (hostNode.closest(containerSelector).length) {
				hostNode = existingExpanded.eq(0);
			}

			close();
		}

		// Try to be smart about the layout
		var cnt = $('.dt-button', content).length;
		var mod = '';

		if (cnt === 3) {
			mod = 'dtb-b3';
		}
		else if (cnt === 2) {
			mod = 'dtb-b2';
		}
		else if (cnt === 1) {
			mod = 'dtb-b1';
		}

		var display = $('<' + options.tag + '/>')
			.addClass(options.containerClassName)
			.addClass(options.collectionLayout)
			.addClass(options.splitAlignClass)
			.addClass(mod)
			.css('display', 'none')
			.attr({
				'aria-modal': true,
				role: 'dialog'
			});

		content = $(content)
			.addClass(options.contentClassName)
			.attr('role', 'menu')
			.appendTo(display);

		hostNode.attr('aria-expanded', 'true');

		if (hostNode.parents('body')[0] !== document.body) {
			hostNode = document.body.lastChild;
		}

		if (options.popoverTitle) {
			display.prepend(
				'<div class="dt-button-collection-title">' +
					options.popoverTitle +
					'</div>'
			);
		}
		else if (options.collectionTitle) {
			display.prepend(
				'<div class="dt-button-collection-title">' +
					options.collectionTitle +
					'</div>'
			);
		}

		if (options.closeButton) {
			display
				.prepend('<div class="dtb-popover-close">&times;</div>')
				.addClass('dtb-collection-closeable');
		}

		_fadeIn(display.insertAfter(hostNode), options.fade);

		var tableContainer = $(hostButton.table().container());
		var position = display.css('position');

		if (options.span === 'container' || options.align === 'dt-container') {
			hostNode = hostNode.parent();
			display.css('width', tableContainer.width());
		}

		// Align the popover relative to the DataTables container
		// Useful for wide popovers such as SearchPanes
		if (position === 'absolute') {
			// Align relative to the host button
			var offsetParent = $(hostNode[0].offsetParent);
			var buttonPosition = hostNode.position();
			var buttonOffset = hostNode.offset();
			var tableSizes = offsetParent.offset();
			var containerPosition = offsetParent.position();
			var computed = window.getComputedStyle(offsetParent[0]);

			tableSizes.height = offsetParent.outerHeight();
			tableSizes.width =
				offsetParent.width() + parseFloat(computed.paddingLeft);
			tableSizes.right = tableSizes.left + tableSizes.width;
			tableSizes.bottom = tableSizes.top + tableSizes.height;

			// Set the initial position so we can read height / width
			var top = buttonPosition.top + hostNode.outerHeight();
			var left = buttonPosition.left;

			display.css({
				top: top,
				left: left
			});

			// Get the popover position
			computed = window.getComputedStyle(display[0]);
			var popoverSizes = display.offset();

			popoverSizes.height = display.outerHeight();
			popoverSizes.width = display.outerWidth();
			popoverSizes.right = popoverSizes.left + popoverSizes.width;
			popoverSizes.bottom = popoverSizes.top + popoverSizes.height;
			popoverSizes.marginTop = parseFloat(computed.marginTop);
			popoverSizes.marginBottom = parseFloat(computed.marginBottom);

			// First position per the class requirements - pop up and right align
			if (options.dropup) {
				top =
					buttonPosition.top -
					popoverSizes.height -
					popoverSizes.marginTop -
					popoverSizes.marginBottom;
			}

			if (
				options.align === 'button-right' ||
				display.hasClass(options.rightAlignClassName)
			) {
				left =
					buttonPosition.left -
					popoverSizes.width +
					hostNode.outerWidth();
			}

			// Container alignment - make sure it doesn't overflow the table container
			if (
				options.align === 'dt-container' ||
				options.align === 'container'
			) {
				if (left < buttonPosition.left) {
					left = -buttonPosition.left;
				}
			}

			// Window adjustment
			if (
				containerPosition.left + left + popoverSizes.width >
				$(window).width()
			) {
				// Overflowing the document to the right
				left =
					$(window).width() -
					popoverSizes.width -
					containerPosition.left;
			}

			if (buttonOffset.left + left < 0) {
				// Off to the left of the document
				left = -buttonOffset.left;
			}

			if (
				containerPosition.top + top + popoverSizes.height >
				$(window).height() + $(window).scrollTop()
			) {
				// Pop up if otherwise we'd need the user to scroll down
				top =
					buttonPosition.top -
					popoverSizes.height -
					popoverSizes.marginTop -
					popoverSizes.marginBottom;
			}

			if (containerPosition.top + top < $(window).scrollTop()) {
				// Correction for when the top is beyond the top of the page
				top = buttonPosition.top + hostNode.outerHeight();
			}

			// Calculations all done - now set it
			display.css({
				top: top,
				left: left
			});
		}
		else {
			// Fix position - centre on screen
			var place = function () {
				var half = $(window).height() / 2;

				var top = display.height() / 2;
				if (top > half) {
					top = half;
				}

				display.css('marginTop', top * -1);
			};

			place();

			$(window).on('resize.dtb-collection', function () {
				place();
			});
		}

		if (options.background) {
			Buttons.background(
				true,
				options.backgroundClassName,
				options.fade,
				options.backgroundHost || hostNode
			);
		}

		// This is bonkers, but if we don't have a click listener on the
		// background element, iOS Safari will ignore the body click
		// listener below. An empty function here is all that is
		// required to make it work...
		$('div.dt-button-background').on(
			'click.dtb-collection',
			function () {}
		);

		if (options.autoClose) {
			setTimeout(function () {
				dt.on('buttons-action.b-internal', function (e, btn, dt, node) {
					if (node[0] === hostNode[0]) {
						return;
					}
					close();
				});
			}, 0);
		}

		$(display).trigger('buttons-popover.dt');

		dt.on('destroy', close);

		setTimeout(function () {
			closed = false;
			$('body')
				.on('click.dtb-collection', function (e) {
					if (closed) {
						return;
					}

					// andSelf is deprecated in jQ1.8, but we want 1.7 compat
					var back = $.fn.addBack ? 'addBack' : 'andSelf';
					var parent = $(e.target).parent()[0];

					if (
						(!$(e.target).parents()[back]().filter(content)
							.length &&
							!$(parent).hasClass('dt-buttons')) ||
						$(e.target).hasClass('dt-button-background')
					) {
						close();
					}
				})
				.on('keyup.dtb-collection', function (e) {
					if (e.keyCode === 27) {
						close();
					}
				})
				.on('keydown.dtb-collection', function (e) {
					// Focus trap for tab key
					var elements = $('a, button', content);
					var active = document.activeElement;

					if (e.keyCode !== 9) {
						// tab
						return;
					}

					if (elements.index(active) === -1) {
						// If current focus is not inside the popover
						elements.first().focus();
						e.preventDefault();
					}
					else if (e.shiftKey) {
						// Reverse tabbing order when shift key is pressed
						if (active === elements[0]) {
							elements.last().focus();
							e.preventDefault();
						}
					}
					else {
						if (active === elements.last()[0]) {
							elements.first().focus();
							e.preventDefault();
						}
					}
				});
		}, 0);
	}
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Statics
 */

/**
 * Show / hide a background layer behind a collection
 * @param  {boolean} Flag to indicate if the background should be shown or
 *   hidden
 * @param  {string} Class to assign to the background
 * @static
 */
Buttons.background = function (show, className, fade, insertPoint) {
	if (fade === undefined) {
		fade = 400;
	}
	if (!insertPoint) {
		insertPoint = document.body;
	}

	if (show) {
		_fadeIn(
			$('<div/>')
				.addClass(className)
				.css('display', 'none')
				.insertAfter(insertPoint),
			fade
		);
	}
	else {
		_fadeOut($('div.' + className), fade, function () {
			$(this).removeClass(className).remove();
		});
	}
};

/**
 * Instance selector - select Buttons instances based on an instance selector
 * value from the buttons assigned to a DataTable. This is only useful if
 * multiple instances are attached to a DataTable.
 * @param  {string|int|array} Instance selector - see `instance-selector`
 *   documentation on the DataTables site
 * @param  {array} Button instance array that was attached to the DataTables
 *   settings object
 * @return {array} Buttons instances
 * @static
 */
Buttons.instanceSelector = function (group, buttons) {
	if (group === undefined || group === null) {
		return $.map(buttons, function (v) {
			return v.inst;
		});
	}

	var ret = [];
	var names = $.map(buttons, function (v) {
		return v.name;
	});

	// Flatten the group selector into an array of single options
	var process = function (input) {
		if (Array.isArray(input)) {
			for (var i = 0, ien = input.length; i < ien; i++) {
				process(input[i]);
			}
			return;
		}

		if (typeof input === 'string') {
			if (input.indexOf(',') !== -1) {
				// String selector, list of names
				process(input.split(','));
			}
			else {
				// String selector individual name
				var idx = $.inArray(input.trim(), names);

				if (idx !== -1) {
					ret.push(buttons[idx].inst);
				}
			}
		}
		else if (typeof input === 'number') {
			// Index selector
			ret.push(buttons[input].inst);
		}
		else if (typeof input === 'object' && input.nodeName) {
			// Element selector
			for (var j = 0; j < buttons.length; j++) {
				if (buttons[j].inst.dom.container[0] === input) {
					ret.push(buttons[j].inst);
				}
			}
		}
		else if (typeof input === 'object') {
			// Actual instance selector
			ret.push(input);
		}
	};

	process(group);

	return ret;
};

/**
 * Button selector - select one or more buttons from a selector input so some
 * operation can be performed on them.
 * @param  {array} Button instances array that the selector should operate on
 * @param  {string|int|node|jQuery|array} Button selector - see
 *   `button-selector` documentation on the DataTables site
 * @return {array} Array of objects containing `inst` and `idx` properties of
 *   the selected buttons so you know which instance each button belongs to.
 * @static
 */
Buttons.buttonSelector = function (insts, selector) {
	var ret = [];
	var nodeBuilder = function (a, buttons, baseIdx) {
		var button;
		var idx;

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			button = buttons[i];

			if (button) {
				idx = baseIdx !== undefined ? baseIdx + i : i + '';

				a.push({
					node: button.node,
					name: button.conf.name,
					idx: idx
				});

				if (button.buttons) {
					nodeBuilder(a, button.buttons, idx + '-');
				}
			}
		}
	};

	var run = function (selector, inst) {
		var i, ien;
		var buttons = [];
		nodeBuilder(buttons, inst.s.buttons);

		var nodes = $.map(buttons, function (v) {
			return v.node;
		});

		if (Array.isArray(selector) || selector instanceof $) {
			for (i = 0, ien = selector.length; i < ien; i++) {
				run(selector[i], inst);
			}
			return;
		}

		if (selector === null || selector === undefined || selector === '*') {
			// Select all
			for (i = 0, ien = buttons.length; i < ien; i++) {
				ret.push({
					inst: inst,
					node: buttons[i].node
				});
			}
		}
		else if (typeof selector === 'number') {
			// Main button index selector
			if (inst.s.buttons[selector]) {
				ret.push({
					inst: inst,
					node: inst.s.buttons[selector].node
				});
			}
		}
		else if (typeof selector === 'string') {
			if (selector.indexOf(',') !== -1) {
				// Split
				var a = selector.split(',');

				for (i = 0, ien = a.length; i < ien; i++) {
					run(a[i].trim(), inst);
				}
			}
			else if (selector.match(/^\d+(\-\d+)*$/)) {
				// Sub-button index selector
				var indexes = $.map(buttons, function (v) {
					return v.idx;
				});

				ret.push({
					inst: inst,
					node: buttons[$.inArray(selector, indexes)].node
				});
			}
			else if (selector.indexOf(':name') !== -1) {
				// Button name selector
				var name = selector.replace(':name', '');

				for (i = 0, ien = buttons.length; i < ien; i++) {
					if (buttons[i].name === name) {
						ret.push({
							inst: inst,
							node: buttons[i].node
						});
					}
				}
			}
			else {
				// jQuery selector on the nodes
				$(nodes)
					.filter(selector)
					.each(function () {
						ret.push({
							inst: inst,
							node: this
						});
					});
			}
		}
		else if (typeof selector === 'object' && selector.nodeName) {
			// Node selector
			var idx = $.inArray(selector, nodes);

			if (idx !== -1) {
				ret.push({
					inst: inst,
					node: nodes[idx]
				});
			}
		}
	};

	for (var i = 0, ien = insts.length; i < ien; i++) {
		var inst = insts[i];

		run(selector, inst);
	}

	return ret;
};

/**
 * Default function used for formatting output data.
 * @param {*} str Data to strip
 */
Buttons.stripData = function (str, config) {
	if (typeof str !== 'string') {
		return str;
	}

	// Always remove script tags
	str = Buttons.stripHtmlScript(str);

	// Always remove comments
	str = Buttons.stripHtmlComments(str);

	if (!config || config.stripHtml) {
		str = DataTable.util.stripHtml(str);
	}

	if (!config || config.trim) {
		str = str.trim();
	}

	if (!config || config.stripNewlines) {
		str = str.replace(/\n/g, ' ');
	}

	if (!config || config.decodeEntities) {
		if (_entityDecoder) {
			str = _entityDecoder(str);
		}
		else {
			_exportTextarea.innerHTML = str;
			str = _exportTextarea.value;
		}
	}

	return str;
};

/**
 * Provide a custom entity decoding function - e.g. a regex one, which can be
 * much faster than the built in DOM option, but also larger code size.
 * @param {function} fn
 */
Buttons.entityDecoder = function (fn) {
	_entityDecoder = fn;
};

/**
 * Common function for stripping HTML comments
 *
 * @param {*} input 
 * @returns 
 */
Buttons.stripHtmlComments = function (input) {
	var previous;  
	
	do {  
		previous = input;
		input = input.replace(/(<!--.*?--!?>)|(<!--[\S\s]+?--!?>)|(<!--[\S\s]*?$)/g, '');
	} while (input !== previous);  

	return input;  
};

/**
 * Common function for stripping HTML script tags
 *
 * @param {*} input 
 * @returns 
 */
Buttons.stripHtmlScript = function (input) {
	var previous;  
	
	do {  
		previous = input;
		input = input.replace(/<script\b[^<]*(?:(?!<\/script[^>]*>)<[^<]*)*<\/script[^>]*>/gi, '');
	} while (input !== previous);  

	return input;  
};

/**
 * Buttons defaults. For full documentation, please refer to the docs/option
 * directory or the DataTables site.
 * @type {Object}
 * @static
 */
Buttons.defaults = {
	buttons: ['copy', 'excel', 'csv', 'pdf', 'print'],
	name: 'main',
	tabIndex: 0,
	dom: {
		container: {
			tag: 'div',
			className: 'dt-buttons'
		},
		collection: {
			action: {
				// action button
				dropHtml: '<span class="dt-button-down-arrow">&#x25BC;</span>'
			},
			container: {
				// The element used for the dropdown
				className: 'dt-button-collection',
				content: {
					className: '',
					tag: 'div'
				},
				tag: 'div'
			}
			// optionally
			// , button: IButton - buttons inside the collection container
			// , split: ISplit - splits inside the collection container
		},
		button: {
			tag: 'button',
			className: 'dt-button',
			active: 'dt-button-active', // class name
			disabled: 'disabled', // class name
			spacer: {
				className: 'dt-button-spacer',
				tag: 'span'
			},
			liner: {
				tag: 'span',
				className: ''
			}
		},
		split: {
			action: {
				// action button
				className: 'dt-button-split-drop-button dt-button',
				tag: 'button'
			},
			dropdown: {
				// button to trigger the dropdown
				align: 'split-right',
				className: 'dt-button-split-drop',
				dropHtml: '<span class="dt-button-down-arrow">&#x25BC;</span>',
				splitAlignClass: 'dt-button-split-left',
				tag: 'button'
			},
			wrapper: {
				// wrap around both
				className: 'dt-button-split',
				tag: 'div'
			}
		}
	}
};

/**
 * Version information
 * @type {string}
 * @static
 */
Buttons.version = '3.0.2';

$.extend(_dtButtons, {
	collection: {
		text: function (dt) {
			return dt.i18n('buttons.collection', 'Collection');
		},
		className: 'buttons-collection',
		closeButton: false,
		init: function (dt, button) {
			button.attr('aria-expanded', false);
		},
		action: function (e, dt, button, config) {
			if (config._collection.parents('body').length) {
				this.popover(false, config);
			}
			else {
				this.popover(config._collection, config);
			}

			// When activated using a key - auto focus on the
			// first item in the popover
			if (e.type === 'keypress') {
				$('a, button', config._collection).eq(0).focus();
			}
		},
		attr: {
			'aria-haspopup': 'dialog'
		}
		// Also the popover options, defined in Buttons.popover
	},
	split: {
		text: function (dt) {
			return dt.i18n('buttons.split', 'Split');
		},
		className: 'buttons-split',
		closeButton: false,
		init: function (dt, button) {
			return button.attr('aria-expanded', false);
		},
		action: function (e, dt, button, config) {
			this.popover(config._collection, config);
		},
		attr: {
			'aria-haspopup': 'dialog'
		}
		// Also the popover options, defined in Buttons.popover
	},
	copy: function () {
		if (_dtButtons.copyHtml5) {
			return 'copyHtml5';
		}
	},
	csv: function (dt, conf) {
		if (_dtButtons.csvHtml5 && _dtButtons.csvHtml5.available(dt, conf)) {
			return 'csvHtml5';
		}
	},
	excel: function (dt, conf) {
		if (
			_dtButtons.excelHtml5 &&
			_dtButtons.excelHtml5.available(dt, conf)
		) {
			return 'excelHtml5';
		}
	},
	pdf: function (dt, conf) {
		if (_dtButtons.pdfHtml5 && _dtButtons.pdfHtml5.available(dt, conf)) {
			return 'pdfHtml5';
		}
	},
	pageLength: function (dt) {
		var lengthMenu = dt.settings()[0].aLengthMenu;
		var vals = [];
		var lang = [];
		var text = function (dt) {
			return dt.i18n(
				'buttons.pageLength',
				{
					'-1': 'Show all rows',
					_: 'Show %d rows'
				},
				dt.page.len()
			);
		};

		// Support for DataTables 1.x 2D array
		if (Array.isArray(lengthMenu[0])) {
			vals = lengthMenu[0];
			lang = lengthMenu[1];
		}
		else {
			for (var i = 0; i < lengthMenu.length; i++) {
				var option = lengthMenu[i];

				// Support for DataTables 2 object in the array
				if ($.isPlainObject(option)) {
					vals.push(option.value);
					lang.push(option.label);
				}
				else {
					vals.push(option);
					lang.push(option);
				}
			}
		}

		return {
			extend: 'collection',
			text: text,
			className: 'buttons-page-length',
			autoClose: true,
			buttons: $.map(vals, function (val, i) {
				return {
					text: lang[i],
					className: 'button-page-length',
					action: function (e, dt) {
						dt.page.len(val).draw();
					},
					init: function (dt, node, conf) {
						var that = this;
						var fn = function () {
							that.active(dt.page.len() === val);
						};

						dt.on('length.dt' + conf.namespace, fn);
						fn();
					},
					destroy: function (dt, node, conf) {
						dt.off('length.dt' + conf.namespace);
					}
				};
			}),
			init: function (dt, node, conf) {
				var that = this;
				dt.on('length.dt' + conf.namespace, function () {
					that.text(conf.text);
				});
			},
			destroy: function (dt, node, conf) {
				dt.off('length.dt' + conf.namespace);
			}
		};
	},
	spacer: {
		style: 'empty',
		spacer: true,
		text: function (dt) {
			return dt.i18n('buttons.spacer', '');
		}
	}
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables API
 *
 * For complete documentation, please refer to the docs/api directory or the
 * DataTables site
 */

// Buttons group and individual button selector
DataTable.Api.register('buttons()', function (group, selector) {
	// Argument shifting
	if (selector === undefined) {
		selector = group;
		group = undefined;
	}

	this.selector.buttonGroup = group;

	var res = this.iterator(
		true,
		'table',
		function (ctx) {
			if (ctx._buttons) {
				return Buttons.buttonSelector(
					Buttons.instanceSelector(group, ctx._buttons),
					selector
				);
			}
		},
		true
	);

	res._groupSelector = group;
	return res;
});

// Individual button selector
DataTable.Api.register('button()', function (group, selector) {
	// just run buttons() and truncate
	var buttons = this.buttons(group, selector);

	if (buttons.length > 1) {
		buttons.splice(1, buttons.length);
	}

	return buttons;
});

// Active buttons
DataTable.Api.registerPlural(
	'buttons().active()',
	'button().active()',
	function (flag) {
		if (flag === undefined) {
			return this.map(function (set) {
				return set.inst.active(set.node);
			});
		}

		return this.each(function (set) {
			set.inst.active(set.node, flag);
		});
	}
);

// Get / set button action
DataTable.Api.registerPlural(
	'buttons().action()',
	'button().action()',
	function (action) {
		if (action === undefined) {
			return this.map(function (set) {
				return set.inst.action(set.node);
			});
		}

		return this.each(function (set) {
			set.inst.action(set.node, action);
		});
	}
);

// Collection control
DataTable.Api.registerPlural(
	'buttons().collectionRebuild()',
	'button().collectionRebuild()',
	function (buttons) {
		return this.each(function (set) {
			for (var i = 0; i < buttons.length; i++) {
				if (typeof buttons[i] === 'object') {
					buttons[i].parentConf = set;
				}
			}
			set.inst.collectionRebuild(set.node, buttons);
		});
	}
);

// Enable / disable buttons
DataTable.Api.register(
	['buttons().enable()', 'button().enable()'],
	function (flag) {
		return this.each(function (set) {
			set.inst.enable(set.node, flag);
		});
	}
);

// Disable buttons
DataTable.Api.register(
	['buttons().disable()', 'button().disable()'],
	function () {
		return this.each(function (set) {
			set.inst.disable(set.node);
		});
	}
);

// Button index
DataTable.Api.register('button().index()', function () {
	var idx = null;

	this.each(function (set) {
		var res = set.inst.index(set.node);

		if (res !== null) {
			idx = res;
		}
	});

	return idx;
});

// Get button nodes
DataTable.Api.registerPlural(
	'buttons().nodes()',
	'button().node()',
	function () {
		var jq = $();

		// jQuery will automatically reduce duplicates to a single entry
		$(
			this.each(function (set) {
				jq = jq.add(set.inst.node(set.node));
			})
		);

		return jq;
	}
);

// Get / set button processing state
DataTable.Api.registerPlural(
	'buttons().processing()',
	'button().processing()',
	function (flag) {
		if (flag === undefined) {
			return this.map(function (set) {
				return set.inst.processing(set.node);
			});
		}

		return this.each(function (set) {
			set.inst.processing(set.node, flag);
		});
	}
);

// Get / set button text (i.e. the button labels)
DataTable.Api.registerPlural(
	'buttons().text()',
	'button().text()',
	function (label) {
		if (label === undefined) {
			return this.map(function (set) {
				return set.inst.text(set.node);
			});
		}

		return this.each(function (set) {
			set.inst.text(set.node, label);
		});
	}
);

// Trigger a button's action
DataTable.Api.registerPlural(
	'buttons().trigger()',
	'button().trigger()',
	function () {
		return this.each(function (set) {
			set.inst.node(set.node).trigger('click');
		});
	}
);

// Button resolver to the popover
DataTable.Api.register('button().popover()', function (content, options) {
	return this.map(function (set) {
		return set.inst._popover(content, this.button(this[0].node), options);
	});
});

// Get the container elements
DataTable.Api.register('buttons().containers()', function () {
	var jq = $();
	var groupSelector = this._groupSelector;

	// We need to use the group selector directly, since if there are no buttons
	// the result set will be empty
	this.iterator(true, 'table', function (ctx) {
		if (ctx._buttons) {
			var insts = Buttons.instanceSelector(groupSelector, ctx._buttons);

			for (var i = 0, ien = insts.length; i < ien; i++) {
				jq = jq.add(insts[i].container());
			}
		}
	});

	return jq;
});

DataTable.Api.register('buttons().container()', function () {
	// API level of nesting is `buttons()` so we can zip into the containers method
	return this.containers().eq(0);
});

// Add a new button
DataTable.Api.register('button().add()', function (idx, conf, draw) {
	var ctx = this.context;

	// Don't use `this` as it could be empty - select the instances directly
	if (ctx.length) {
		var inst = Buttons.instanceSelector(
			this._groupSelector,
			ctx[0]._buttons
		);

		if (inst.length) {
			inst[0].add(conf, idx, draw);
		}
	}

	return this.button(this._groupSelector, idx);
});

// Destroy the button sets selected
DataTable.Api.register('buttons().destroy()', function () {
	this.pluck('inst')
		.unique()
		.each(function (inst) {
			inst.destroy();
		});

	return this;
});

// Remove a button
DataTable.Api.registerPlural(
	'buttons().remove()',
	'buttons().remove()',
	function () {
		this.each(function (set) {
			set.inst.remove(set.node);
		});

		return this;
	}
);

// Information box that can be used by buttons
var _infoTimer;
DataTable.Api.register('buttons.info()', function (title, message, time) {
	var that = this;

	if (title === false) {
		this.off('destroy.btn-info');
		_fadeOut($('#datatables_buttons_info'), 400, function () {
			$(this).remove();
		});
		clearTimeout(_infoTimer);
		_infoTimer = null;

		return this;
	}

	if (_infoTimer) {
		clearTimeout(_infoTimer);
	}

	if ($('#datatables_buttons_info').length) {
		$('#datatables_buttons_info').remove();
	}

	title = title ? '<h2>' + title + '</h2>' : '';

	_fadeIn(
		$('<div id="datatables_buttons_info" class="dt-button-info"/>')
			.html(title)
			.append(
				$('<div/>')[typeof message === 'string' ? 'html' : 'append'](
					message
				)
			)
			.css('display', 'none')
			.appendTo('body')
	);

	if (time !== undefined && time !== 0) {
		_infoTimer = setTimeout(function () {
			that.buttons.info(false);
		}, time);
	}

	this.on('destroy.btn-info', function () {
		that.buttons.info(false);
	});

	return this;
});

// Get data from the table for export - this is common to a number of plug-in
// buttons so it is included in the Buttons core library
DataTable.Api.register('buttons.exportData()', function (options) {
	if (this.context.length) {
		return _exportData(new DataTable.Api(this.context[0]), options);
	}
});

// Get information about the export that is common to many of the export data
// types (DRY)
DataTable.Api.register('buttons.exportInfo()', function (conf) {
	if (!conf) {
		conf = {};
	}

	return {
		filename: _filename(conf, this),
		title: _title(conf, this),
		messageTop: _message(this, conf, conf.message || conf.messageTop, 'top'),
		messageBottom: _message(this, conf, conf.messageBottom, 'bottom')
	};
});

/**
 * Get the file name for an exported file.
 *
 * @param {object} config Button configuration
 * @param {object} dt DataTable instance
 */
var _filename = function (config, dt) {
	// Backwards compatibility
	var filename =
		config.filename === '*' &&
		config.title !== '*' &&
		config.title !== undefined &&
		config.title !== null &&
		config.title !== ''
			? config.title
			: config.filename;

	if (typeof filename === 'function') {
		filename = filename(config, dt);
	}

	if (filename === undefined || filename === null) {
		return null;
	}

	if (filename.indexOf('*') !== -1) {
		filename = filename.replace(/\*/g, $('head > title').text()).trim();
	}

	// Strip characters which the OS will object to
	filename = filename.replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, '');

	var extension = _stringOrFunction(config.extension, config, dt);
	if (!extension) {
		extension = '';
	}

	return filename + extension;
};

/**
 * Simply utility method to allow parameters to be given as a function
 *
 * @param {undefined|string|function} option Option
 * @return {null|string} Resolved value
 */
var _stringOrFunction = function (option, config, dt) {
	if (option === null || option === undefined) {
		return null;
	}
	else if (typeof option === 'function') {
		return option(config, dt);
	}
	return option;
};

/**
 * Get the title for an exported file.
 *
 * @param {object} config	Button configuration
 */
var _title = function (config, dt) {
	var title = _stringOrFunction(config.title, config, dt);

	return title === null
		? null
		: title.indexOf('*') !== -1
		? title.replace(/\*/g, $('head > title').text() || 'Exported data')
		: title;
};

var _message = function (dt, config, option, position) {
	var message = _stringOrFunction(option, config, dt);
	if (message === null) {
		return null;
	}

	var caption = $('caption', dt.table().container()).eq(0);
	if (message === '*') {
		var side = caption.css('caption-side');
		if (side !== position) {
			return null;
		}

		return caption.length ? caption.text() : '';
	}

	return message;
};

var _exportTextarea = $('<textarea/>')[0];
var _exportData = function (dt, inOpts) {
	var config = $.extend(
		true,
		{},
		{
			rows: null,
			columns: '',
			modifier: {
				search: 'applied',
				order: 'applied'
			},
			orthogonal: 'display',
			stripHtml: true,
			stripNewlines: true,
			decodeEntities: true,
			trim: true,
			format: {
				header: function (d) {
					return Buttons.stripData(d, config);
				},
				footer: function (d) {
					return Buttons.stripData(d, config);
				},
				body: function (d) {
					return Buttons.stripData(d, config);
				}
			},
			customizeData: null,
			customizeZip: null
		},
		inOpts
	);

	var header = dt
		.columns(config.columns)
		.indexes()
		.map(function (idx) {
			var col = dt.column(idx);
			return config.format.header(col.title(), idx, col.header());
		})
		.toArray();

	var footer = dt.table().footer()
		? dt
				.columns(config.columns)
				.indexes()
				.map(function (idx) {
					var el = dt.column(idx).footer();
					var val = '';

					if (el) {
						var inner = $('.dt-column-title', el);

						val = inner.length
							? inner.html()
							: $(el).html();
					}

					return config.format.footer(val, idx, el);
				})
				.toArray()
		: null;

	// If Select is available on this table, and any rows are selected, limit the export
	// to the selected rows. If no rows are selected, all rows will be exported. Specify
	// a `selected` modifier to control directly.
	var modifier = $.extend({}, config.modifier);
	if (
		dt.select &&
		typeof dt.select.info === 'function' &&
		modifier.selected === undefined
	) {
		if (
			dt.rows(config.rows, $.extend({ selected: true }, modifier)).any()
		) {
			$.extend(modifier, { selected: true });
		}
	}

	var rowIndexes = dt.rows(config.rows, modifier).indexes().toArray();
	var selectedCells = dt.cells(rowIndexes, config.columns, {
		order: modifier.order
	});
	var cells = selectedCells.render(config.orthogonal).toArray();
	var cellNodes = selectedCells.nodes().toArray();
	var cellIndexes = selectedCells.indexes().toArray();

	var columns = dt.columns(config.columns).count();
	var rows = columns > 0 ? cells.length / columns : 0;
	var body = [];
	var cellCounter = 0;

	for (var i = 0, ien = rows; i < ien; i++) {
		var row = [columns];

		for (var j = 0; j < columns; j++) {
			row[j] = config.format.body(
				cells[cellCounter],
				cellIndexes[cellCounter].row,
				cellIndexes[cellCounter].column,
				cellNodes[cellCounter]
			);
			cellCounter++;
		}

		body[i] = row;
	}

	var data = {
		header: header,
		headerStructure: _headerFormatter(
			config.format.header,
			dt.table().header.structure(config.columns)
		),
		footer: footer,
		footerStructure: _headerFormatter(
			config.format.footer,
			dt.table().footer.structure(config.columns)
		),
		body: body
	};

	if (config.customizeData) {
		config.customizeData(data);
	}

	return data;
};

function _headerFormatter(formatter, struct) {
	for (var i=0 ; i<struct.length ; i++) {
		for (var j=0 ; j<struct[i].length ; j++) {
			var item = struct[i][j];

			if (item) {
				item.title = formatter(
					item.title,
					j,
					item.cell
				);
			}
		}
	}

	return struct;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables interface
 */

// Attach to DataTables objects for global access
$.fn.dataTable.Buttons = Buttons;
$.fn.DataTable.Buttons = Buttons;

// DataTables creation - check if the buttons have been defined for this table,
// they will have been if the `B` option was used in `dom`, otherwise we should
// create the buttons instance here so they can be inserted into the document
// using the API. Listen for `init` for compatibility with pre 1.10.10, but to
// be removed in future.
$(document).on('init.dt plugin-init.dt', function (e, settings) {
	if (e.namespace !== 'dt') {
		return;
	}

	var opts = settings.oInit.buttons || DataTable.defaults.buttons;

	if (opts && !settings._buttons) {
		new Buttons(settings, opts).container();
	}
});

function _init(settings, options) {
	var api = new DataTable.Api(settings);
	var opts = options
		? options
		: api.init().buttons || DataTable.defaults.buttons;

	return new Buttons(api, opts).container();
}

// DataTables 1 `dom` feature option
DataTable.ext.feature.push({
	fnInit: _init,
	cFeature: 'B'
});

// DataTables 2 layout feature
if (DataTable.feature) {
	DataTable.feature.register('buttons', _init);
}


return DataTable;
}));


/*! jQuery UI integration for DataTables' Buttons
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net-jqui', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net-jqui')(root, $);
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



$.extend(true, DataTable.Buttons.defaults, {
	dom: {
		collection: {
			action: {
				dropHtml: '<span class="ui-button-icon-primary ui-icon ui-icon-triangle-1-s"/>'
			},
			button: {
				active: 'dt-button-active'
			}
		},
		container: {
			className: 'dt-buttons ui-buttonset'
		},
		button: {
			className: 'dt-button ui-button ui-corner-all',
			disabled: 'ui-state-disabled',
			active: 'ui-state-active',
			liner: {
				tag: 'span',
				className: ''
			}
		},
		split: {
			action: {
				tag: 'button',
				className: 'dt-button-split-drop-button ui-button ui-corner-left'
			},
			dropdown: {
				tag: 'button',
				dropHtml: '<span class="ui-button-icon-primary ui-icon ui-icon-triangle-1-s"/>',
				className: 'dt-button-split-drop ui-button ui-corner-right'
			},
			wrapper: {
				tag: 'div',
				className: 'dt-button-split'
			}
		}
	}
});


return DataTable;
}));


/*!
 * Column visibility buttons for Buttons and DataTables.
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



$.extend(DataTable.ext.buttons, {
	// A collection of column visibility buttons
	colvis: function (dt, conf) {
		var node = null;
		var buttonConf = {
			extend: 'collection',
			init: function (dt, n) {
				node = n;
			},
			text: function (dt) {
				return dt.i18n('buttons.colvis', 'Column visibility');
			},
			className: 'buttons-colvis',
			closeButton: false,
			buttons: [
				{
					extend: 'columnsToggle',
					columns: conf.columns,
					columnText: conf.columnText
				}
			]
		};

		// Rebuild the collection with the new column structure if columns are reordered
		dt.on('column-reorder.dt' + conf.namespace, function () {
			dt.button(null, dt.button(null, node).node()).collectionRebuild([
				{
					extend: 'columnsToggle',
					columns: conf.columns,
					columnText: conf.columnText
				}
			]);
		});

		return buttonConf;
	},

	// Selected columns with individual buttons - toggle column visibility
	columnsToggle: function (dt, conf) {
		var columns = dt
			.columns(conf.columns)
			.indexes()
			.map(function (idx) {
				return {
					extend: 'columnToggle',
					columns: idx,
					columnText: conf.columnText
				};
			})
			.toArray();

		return columns;
	},

	// Single button to toggle column visibility
	columnToggle: function (dt, conf) {
		return {
			extend: 'columnVisibility',
			columns: conf.columns,
			columnText: conf.columnText
		};
	},

	// Selected columns with individual buttons - set column visibility
	columnsVisibility: function (dt, conf) {
		var columns = dt
			.columns(conf.columns)
			.indexes()
			.map(function (idx) {
				return {
					extend: 'columnVisibility',
					columns: idx,
					visibility: conf.visibility,
					columnText: conf.columnText
				};
			})
			.toArray();

		return columns;
	},

	// Single button to set column visibility
	columnVisibility: {
		columns: undefined, // column selector
		text: function (dt, button, conf) {
			return conf._columnText(dt, conf);
		},
		className: 'buttons-columnVisibility',
		action: function (e, dt, button, conf) {
			var col = dt.columns(conf.columns);
			var curr = col.visible();

			col.visible(
				conf.visibility !== undefined ? conf.visibility : !(curr.length ? curr[0] : false)
			);
		},
		init: function (dt, button, conf) {
			var that = this;
			button.attr('data-cv-idx', conf.columns);

			dt.on('column-visibility.dt' + conf.namespace, function (e, settings) {
				if (!settings.bDestroying && settings.nTable == dt.settings()[0].nTable) {
					that.active(dt.column(conf.columns).visible());
				}
			}).on('column-reorder.dt' + conf.namespace, function () {
				// Button has been removed from the DOM
				if (conf.destroying) {
					return;
				}

				if (dt.columns(conf.columns).count() !== 1) {
					return;
				}

				// This button controls the same column index but the text for the column has
				// changed
				that.text(conf._columnText(dt, conf));

				// Since its a different column, we need to check its visibility
				that.active(dt.column(conf.columns).visible());
			});

			this.active(dt.column(conf.columns).visible());
		},
		destroy: function (dt, button, conf) {
			dt.off('column-visibility.dt' + conf.namespace).off(
				'column-reorder.dt' + conf.namespace
			);
		},

		_columnText: function (dt, conf) {
			if (typeof conf.text === 'string') {
				return conf.text;
			}

			var title = dt.column(conf.columns).title();
			var idx = dt.column(conf.columns).index();

			title = title
				.replace(/\n/g, ' ') // remove new lines
				.replace(/<br\s*\/?>/gi, ' ') // replace line breaks with spaces
				.replace(/<select(.*?)<\/select\s*>/gi, ''); // remove select tags, including options text

			// Strip HTML comments
			title = DataTable.Buttons.stripHtmlComments(title);

			// Use whatever HTML stripper DataTables is configured for
			title = DataTable.util.stripHtml(title).trim();

			return conf.columnText ? conf.columnText(dt, idx, title) : title;
		}
	},

	colvisRestore: {
		className: 'buttons-colvisRestore',

		text: function (dt) {
			return dt.i18n('buttons.colvisRestore', 'Restore visibility');
		},

		init: function (dt, button, conf) {
			// Use a private parameter on the column. This gets moved around with the
			// column if ColReorder changes the order
			dt.columns().every(function () {
				var init = this.init();

				if (init.__visOriginal === undefined) {
					init.__visOriginal = this.visible();
				}
			});
		},

		action: function (e, dt, button, conf) {
			dt.columns().every(function (i) {
				var init = this.init();

				this.visible(init.__visOriginal);
			});
		}
	},

	colvisGroup: {
		className: 'buttons-colvisGroup',

		action: function (e, dt, button, conf) {
			dt.columns(conf.show).visible(true, false);
			dt.columns(conf.hide).visible(false, false);

			dt.columns.adjust();
		},

		show: [],

		hide: []
	}
});


return DataTable;
}));


/*!
 * HTML5 export buttons for Buttons and DataTables.
 * © SpryMedia Ltd - datatables.net/license
 *
 * FileSaver.js (1.3.3) - MIT license
 * Copyright © 2016 Eli Grey - http://eligrey.com
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



// Allow the constructor to pass in JSZip and PDFMake from external requires.
// Otherwise, use globally defined variables, if they are available.
var useJszip;
var usePdfmake;

function _jsZip() {
	return useJszip || window.JSZip;
}
function _pdfMake() {
	return usePdfmake || window.pdfMake;
}

DataTable.Buttons.pdfMake = function (_) {
	if (!_) {
		return _pdfMake();
	}
	usePdfmake = _;
};

DataTable.Buttons.jszip = function (_) {
	if (!_) {
		return _jsZip();
	}
	useJszip = _;
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FileSaver.js dependency
 */

/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

var _saveAs = (function (view) {
	'use strict';
	// IE <10 is explicitly unsupported
	if (
		typeof view === 'undefined' ||
		(typeof navigator !== 'undefined' &&
			/MSIE [1-9]\./.test(navigator.userAgent))
	) {
		return;
	}
	var doc = view.document,
		// only get URL when necessary in case Blob.js hasn't overridden it yet
		get_URL = function () {
			return view.URL || view.webkitURL || view;
		},
		save_link = doc.createElementNS('http://www.w3.org/1999/xhtml', 'a'),
		can_use_save_link = 'download' in save_link,
		click = function (node) {
			var event = new MouseEvent('click');
			node.dispatchEvent(event);
		},
		is_safari = /constructor/i.test(view.HTMLElement) || view.safari,
		is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent),
		throw_outside = function (ex) {
			(view.setImmediate || view.setTimeout)(function () {
				throw ex;
			}, 0);
		},
		force_saveable_type = 'application/octet-stream',
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		arbitrary_revoke_timeout = 1000 * 40, // in ms
		revoke = function (file) {
			var revoker = function () {
				if (typeof file === 'string') {
					// file is an object URL
					get_URL().revokeObjectURL(file);
				}
				else {
					// file is a File
					file.remove();
				}
			};
			setTimeout(revoker, arbitrary_revoke_timeout);
		},
		dispatch = function (filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver['on' + event_types[i]];
				if (typeof listener === 'function') {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		},
		auto_bom = function (blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (
				/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(
					blob.type
				)
			) {
				return new Blob([String.fromCharCode(0xfeff), blob], {
					type: blob.type
				});
			}
			return blob;
		},
		FileSaver = function (blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var filesaver = this,
				type = blob.type,
				force = type === force_saveable_type,
				object_url,
				dispatch_all = function () {
					dispatch(
						filesaver,
						'writestart progress write writeend'.split(' ')
					);
				},
				// on any filesys errors revert to saving with object URLs
				fs_error = function () {
					if (
						(is_chrome_ios || (force && is_safari)) &&
						view.FileReader
					) {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function () {
							var url = is_chrome_ios
								? reader.result
								: reader.result.replace(
										/^data:[^;]*;/,
										'data:attachment/file;'
								);
							var popup = view.open(url, '_blank');
							if (!popup) view.location.href = url;
							url = undefined; // release reference before dispatching
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (!object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (force) {
						view.location.href = object_url;
					}
					else {
						var opened = view.open(object_url, '_blank');
						if (!opened) {
							// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
							view.location.href = object_url;
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				};
			filesaver.readyState = filesaver.INIT;

			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function () {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}

			fs_error();
		},
		FS_proto = FileSaver.prototype,
		saveAs = function (blob, name, no_auto_bom) {
			return new FileSaver(
				blob,
				name || blob.name || 'download',
				no_auto_bom
			);
		};
	// IE 10+ (native saveAs)
	if (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob) {
		return function (blob, name, no_auto_bom) {
			name = name || blob.name || 'download';

			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name);
		};
	}

	FS_proto.abort = function () {};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
		FS_proto.onwritestart =
		FS_proto.onprogress =
		FS_proto.onwrite =
		FS_proto.onabort =
		FS_proto.onerror =
		FS_proto.onwriteend =
			null;

	return saveAs;
})(
	(typeof self !== 'undefined' && self) ||
		(typeof window !== 'undefined' && window) ||
		this.content
);

// Expose file saver on the DataTables API. Can't attach to `DataTables.Buttons`
// since this file can be loaded before Button's core!
DataTable.fileSave = _saveAs;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Local (private) functions
 */

/**
 * Get the sheet name for Excel exports.
 *
 * @param {object}	config Button configuration
 */
var _sheetname = function (config) {
	var sheetName = 'Sheet1';

	if (config.sheetName) {
		sheetName = config.sheetName.replace(/[\[\]\*\/\\\?\:]/g, '');
	}

	return sheetName;
};

/**
 * Get the newline character(s)
 *
 * @param {object}	config Button configuration
 * @return {string}				Newline character
 */
var _newLine = function (config) {
	return config.newline
		? config.newline
		: navigator.userAgent.match(/Windows/)
		? '\r\n'
		: '\n';
};

/**
 * Combine the data from the `buttons.exportData` method into a string that
 * will be used in the export file.
 *
 * @param	{DataTable.Api} dt		 DataTables API instance
 * @param	{object}				config Button configuration
 * @return {object}							 The data to export
 */
var _exportData = function (dt, config) {
	var newLine = _newLine(config);
	var data = dt.buttons.exportData(config.exportOptions);
	var boundary = config.fieldBoundary;
	var separator = config.fieldSeparator;
	var reBoundary = new RegExp(boundary, 'g');
	var escapeChar = config.escapeChar !== undefined ? config.escapeChar : '\\';
	var join = function (a) {
		var s = '';

		// If there is a field boundary, then we might need to escape it in
		// the source data
		for (var i = 0, ien = a.length; i < ien; i++) {
			if (i > 0) {
				s += separator;
			}

			s += boundary
				? boundary +
				('' + a[i]).replace(reBoundary, escapeChar + boundary) +
				boundary
				: a[i];
		}

		return s;
	};

	var header = '';
	var footer = '';
	var body = [];

	if (config.header) {
		header =
			data.headerStructure
				.map(function (row) {
					return join(
						row.map(function (cell) {
							return cell ? cell.title : '';
						})
					);
				})
				.join(newLine) + newLine;
	}

	if (config.footer && data.footer) {
		footer =
			data.footerStructure
				.map(function (row) {
					return join(
						row.map(function (cell) {
							return cell ? cell.title : '';
						})
					);
				})
				.join(newLine) + newLine;
	}

	for (var i = 0, ien = data.body.length; i < ien; i++) {
		body.push(join(data.body[i]));
	}

	return {
		str: header + body.join(newLine) + newLine + footer,
		rows: body.length
	};
};

/**
 * Older versions of Safari (prior to tech preview 18) don't support the
 * download option required.
 *
 * @return {Boolean} `true` if old Safari
 */
var _isDuffSafari = function () {
	var safari =
		navigator.userAgent.indexOf('Safari') !== -1 &&
		navigator.userAgent.indexOf('Chrome') === -1 &&
		navigator.userAgent.indexOf('Opera') === -1;

	if (!safari) {
		return false;
	}

	var version = navigator.userAgent.match(/AppleWebKit\/(\d+\.\d+)/);
	if (version && version.length > 1 && version[1] * 1 < 603.1) {
		return true;
	}

	return false;
};

/**
 * Convert from numeric position to letter for column names in Excel
 * @param  {int} n Column number
 * @return {string} Column letter(s) name
 */
function createCellPos(n) {
	var ordA = 'A'.charCodeAt(0);
	var ordZ = 'Z'.charCodeAt(0);
	var len = ordZ - ordA + 1;
	var s = '';

	while (n >= 0) {
		s = String.fromCharCode((n % len) + ordA) + s;
		n = Math.floor(n / len) - 1;
	}

	return s;
}

try {
	var _serialiser = new XMLSerializer();
	var _ieExcel;
} catch (t) {
	// noop
}

/**
 * Recursively add XML files from an object's structure to a ZIP file. This
 * allows the XSLX file to be easily defined with an object's structure matching
 * the files structure.
 *
 * @param {JSZip} zip ZIP package
 * @param {object} obj Object to add (recursive)
 */
function _addToZip(zip, obj) {
	if (_ieExcel === undefined) {
		// Detect if we are dealing with IE's _awful_ serialiser by seeing if it
		// drop attributes
		_ieExcel =
			_serialiser
				.serializeToString(
					new window.DOMParser().parseFromString(
						excelStrings['xl/worksheets/sheet1.xml'],
						'text/xml'
					)
				)
				.indexOf('xmlns:r') === -1;
	}

	$.each(obj, function (name, val) {
		if ($.isPlainObject(val)) {
			var newDir = zip.folder(name);
			_addToZip(newDir, val);
		}
		else {
			if (_ieExcel) {
				// IE's XML serialiser will drop some name space attributes from
				// from the root node, so we need to save them. Do this by
				// replacing the namespace nodes with a regular attribute that
				// we convert back when serialised. Edge does not have this
				// issue
				var worksheet = val.childNodes[0];
				var i, ien;
				var attrs = [];

				for (i = worksheet.attributes.length - 1; i >= 0; i--) {
					var attrName = worksheet.attributes[i].nodeName;
					var attrValue = worksheet.attributes[i].nodeValue;

					if (attrName.indexOf(':') !== -1) {
						attrs.push({ name: attrName, value: attrValue });

						worksheet.removeAttribute(attrName);
					}
				}

				for (i = 0, ien = attrs.length; i < ien; i++) {
					var attr = val.createAttribute(
						attrs[i].name.replace(':', '_dt_b_namespace_token_')
					);
					attr.value = attrs[i].value;
					worksheet.setAttributeNode(attr);
				}
			}

			var str = _serialiser.serializeToString(val);

			// Fix IE's XML
			if (_ieExcel) {
				// IE doesn't include the XML declaration
				if (str.indexOf('<?xml') === -1) {
					str =
						'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
						str;
				}

				// Return namespace attributes to being as such
				str = str.replace(/_dt_b_namespace_token_/g, ':');

				// Remove testing name space that IE puts into the space preserve attr
				str = str.replace(/xmlns:NS[\d]+="" NS[\d]+:/g, '');
			}

			// Safari, IE and Edge will put empty name space attributes onto
			// various elements making them useless. This strips them out
			str = str.replace(/<([^<>]*?) xmlns=""([^<>]*?)>/g, '<$1 $2>');

			zip.file(name, str);
		}
	});
}

/**
 * Create an XML node and add any children, attributes, etc without needing to
 * be verbose in the DOM.
 *
 * @param  {object} doc      XML document
 * @param  {string} nodeName Node name
 * @param  {object} opts     Options - can be `attr` (attributes), `children`
 *   (child nodes) and `text` (text content)
 * @return {node}            Created node
 */
function _createNode(doc, nodeName, opts) {
	var tempNode = doc.createElement(nodeName);

	if (opts) {
		if (opts.attr) {
			$(tempNode).attr(opts.attr);
		}

		if (opts.children) {
			$.each(opts.children, function (key, value) {
				tempNode.appendChild(value);
			});
		}

		if (opts.text !== null && opts.text !== undefined) {
			tempNode.appendChild(doc.createTextNode(opts.text));
		}
	}

	return tempNode;
}

/**
 * Get the width for an Excel column based on the contents of that column
 * @param  {object} data Data for export
 * @param  {int}    col  Column index
 * @return {int}         Column width
 */
function _excelColWidth(data, col) {
	var max = data.header[col].length;
	var len, lineSplit, str;

	if (data.footer && data.footer[col] && data.footer[col].length > max) {
		max = data.footer[col].length;
	}

	for (var i = 0, ien = data.body.length; i < ien; i++) {
		var point = data.body[i][col];
		str = point !== null && point !== undefined ? point.toString() : '';

		// If there is a newline character, workout the width of the column
		// based on the longest line in the string
		if (str.indexOf('\n') !== -1) {
			lineSplit = str.split('\n');
			lineSplit.sort(function (a, b) {
				return b.length - a.length;
			});

			len = lineSplit[0].length;
		}
		else {
			len = str.length;
		}

		if (len > max) {
			max = len;
		}

		// Max width rather than having potentially massive column widths
		if (max > 40) {
			return 54; // 40 * 1.35
		}
	}

	max *= 1.35;

	// And a min width
	return max > 6 ? max : 6;
}

// Excel - Pre-defined strings to build a basic XLSX file
var excelStrings = {
	'_rels/.rels':
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
		'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
		'</Relationships>',

	'xl/_rels/workbook.xml.rels':
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
		'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
		'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
		'</Relationships>',

	'[Content_Types].xml':
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
		'<Default Extension="xml" ContentType="application/xml" />' +
		'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />' +
		'<Default Extension="jpeg" ContentType="image/jpeg" />' +
		'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />' +
		'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />' +
		'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" />' +
		'</Types>',

	'xl/workbook.xml':
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
		'<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/>' +
		'<workbookPr showInkAnnotation="0" autoCompressPictures="0"/>' +
		'<bookViews>' +
		'<workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/>' +
		'</bookViews>' +
		'<sheets>' +
		'<sheet name="Sheet1" sheetId="1" r:id="rId1"/>' +
		'</sheets>' +
		'<definedNames/>' +
		'</workbook>',

	'xl/worksheets/sheet1.xml':
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' +
		'<sheetData/>' +
		'<mergeCells count="0"/>' +
		'</worksheet>',

	'xl/styles.xml':
		'<?xml version="1.0" encoding="UTF-8"?>' +
		'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' +
		'<numFmts count="6">' +
		'<numFmt numFmtId="164" formatCode="[$$-409]#,##0.00;-[$$-409]#,##0.00"/>' +
		'<numFmt numFmtId="165" formatCode="&quot;£&quot;#,##0.00"/>' +
		'<numFmt numFmtId="166" formatCode="[$€-2] #,##0.00"/>' +
		'<numFmt numFmtId="167" formatCode="0.0%"/>' +
		'<numFmt numFmtId="168" formatCode="#,##0;(#,##0)"/>' +
		'<numFmt numFmtId="169" formatCode="#,##0.00;(#,##0.00)"/>' +
		'</numFmts>' +
		'<fonts count="5" x14ac:knownFonts="1">' +
		'<font>' +
		'<sz val="11" />' +
		'<name val="Calibri" />' +
		'</font>' +
		'<font>' +
		'<sz val="11" />' +
		'<name val="Calibri" />' +
		'<color rgb="FFFFFFFF" />' +
		'</font>' +
		'<font>' +
		'<sz val="11" />' +
		'<name val="Calibri" />' +
		'<b />' +
		'</font>' +
		'<font>' +
		'<sz val="11" />' +
		'<name val="Calibri" />' +
		'<i />' +
		'</font>' +
		'<font>' +
		'<sz val="11" />' +
		'<name val="Calibri" />' +
		'<u />' +
		'</font>' +
		'</fonts>' +
		'<fills count="6">' +
		'<fill>' +
		'<patternFill patternType="none" />' +
		'</fill>' +
		'<fill>' + // Excel appears to use this as a dotted background regardless of values but
		'<patternFill patternType="none" />' + // to be valid to the schema, use a patternFill
		'</fill>' +
		'<fill>' +
		'<patternFill patternType="solid">' +
		'<fgColor rgb="FFD9D9D9" />' +
		'<bgColor indexed="64" />' +
		'</patternFill>' +
		'</fill>' +
		'<fill>' +
		'<patternFill patternType="solid">' +
		'<fgColor rgb="FFD99795" />' +
		'<bgColor indexed="64" />' +
		'</patternFill>' +
		'</fill>' +
		'<fill>' +
		'<patternFill patternType="solid">' +
		'<fgColor rgb="ffc6efce" />' +
		'<bgColor indexed="64" />' +
		'</patternFill>' +
		'</fill>' +
		'<fill>' +
		'<patternFill patternType="solid">' +
		'<fgColor rgb="ffc6cfef" />' +
		'<bgColor indexed="64" />' +
		'</patternFill>' +
		'</fill>' +
		'</fills>' +
		'<borders count="2">' +
		'<border>' +
		'<left />' +
		'<right />' +
		'<top />' +
		'<bottom />' +
		'<diagonal />' +
		'</border>' +
		'<border diagonalUp="false" diagonalDown="false">' +
		'<left style="thin">' +
		'<color auto="1" />' +
		'</left>' +
		'<right style="thin">' +
		'<color auto="1" />' +
		'</right>' +
		'<top style="thin">' +
		'<color auto="1" />' +
		'</top>' +
		'<bottom style="thin">' +
		'<color auto="1" />' +
		'</bottom>' +
		'<diagonal />' +
		'</border>' +
		'</borders>' +
		'<cellStyleXfs count="1">' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" />' +
		'</cellStyleXfs>' +
		'<cellXfs count="68">' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
		'<alignment horizontal="left"/>' +
		'</xf>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
		'<alignment horizontal="center"/>' +
		'</xf>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
		'<alignment horizontal="right"/>' +
		'</xf>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
		'<alignment horizontal="fill"/>' +
		'</xf>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
		'<alignment textRotation="90"/>' +
		'</xf>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
		'<alignment wrapText="1"/>' +
		'</xf>' +
		'<xf numFmtId="9"   fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="166" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="167" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="168" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="169" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="3" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="4" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="1" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="2" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="14" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'</cellXfs>' +
		'<cellStyles count="1">' +
		'<cellStyle name="Normal" xfId="0" builtinId="0" />' +
		'</cellStyles>' +
		'<dxfs count="0" />' +
		'<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4" />' +
		'</styleSheet>'
};
// Note we could use 3 `for` loops for the styles, but when gzipped there is
// virtually no difference in size, since the above can be easily compressed

// Pattern matching for special number formats. Perhaps this should be exposed
// via an API in future?
// Ref: section 3.8.30 - built in formatters in open spreadsheet
//   https://www.ecma-international.org/news/TC45_current_work/Office%20Open%20XML%20Part%204%20-%20Markup%20Language%20Reference.pdf
var _excelSpecials = [
	{
		match: /^\-?\d+\.\d%$/,
		style: 60,
		fmt: function (d) {
			return d / 100;
		}
	}, // Percent with d.p.
	{
		match: /^\-?\d+\.?\d*%$/,
		style: 56,
		fmt: function (d) {
			return d / 100;
		}
	}, // Percent
	{ match: /^\-?\$[\d,]+.?\d*$/, style: 57 }, // Dollars
	{ match: /^\-?£[\d,]+.?\d*$/, style: 58 }, // Pounds
	{ match: /^\-?€[\d,]+.?\d*$/, style: 59 }, // Euros
	{ match: /^\-?\d+$/, style: 65 }, // Numbers without thousand separators
	{ match: /^\-?\d+\.\d{2}$/, style: 66 }, // Numbers 2 d.p. without thousands separators
	{
		match: /^\([\d,]+\)$/,
		style: 61,
		fmt: function (d) {
			return -1 * d.replace(/[\(\)]/g, '');
		}
	}, // Negative numbers indicated by brackets
	{
		match: /^\([\d,]+\.\d{2}\)$/,
		style: 62,
		fmt: function (d) {
			return -1 * d.replace(/[\(\)]/g, '');
		}
	}, // Negative numbers indicated by brackets - 2d.p.
	{ match: /^\-?[\d,]+$/, style: 63 }, // Numbers with thousand separators
	{ match: /^\-?[\d,]+\.\d{2}$/, style: 64 },
	{
		match: /^[\d]{4}\-[01][\d]\-[0123][\d]$/,
		style: 67,
		fmt: function (d) {
			return Math.round(25569 + Date.parse(d) / (86400 * 1000));
		}
	} //Date yyyy-mm-dd
];

var _excelMergeCells = function (rels, row, column, rowspan, colspan) {
	var mergeCells = $('mergeCells', rels);

	mergeCells[0].appendChild(
		_createNode(rels, 'mergeCell', {
			attr: {
				ref:
					createCellPos(column) +
					row +
					':' +
					createCellPos(column + colspan - 1) +
					(row + rowspan - 1)
			}
		})
	);

	mergeCells.attr('count', parseFloat(mergeCells.attr('count')) + 1);
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Buttons
 */

//
// Copy to clipboard
//
DataTable.ext.buttons.copyHtml5 = {
	className: 'buttons-copy buttons-html5',

	text: function (dt) {
		return dt.i18n('buttons.copy', 'Copy');
	},

	action: function (e, dt, button, config, cb) {
		var exportData = _exportData(dt, config);
		var info = dt.buttons.exportInfo(config);
		var newline = _newLine(config);
		var output = exportData.str;
		var hiddenDiv = $('<div/>').css({
			height: 1,
			width: 1,
			overflow: 'hidden',
			position: 'fixed',
			top: 0,
			left: 0
		});

		if (info.title) {
			output = info.title + newline + newline + output;
		}

		if (info.messageTop) {
			output = info.messageTop + newline + newline + output;
		}

		if (info.messageBottom) {
			output = output + newline + newline + info.messageBottom;
		}

		if (config.customize) {
			output = config.customize(output, config, dt);
		}

		var textarea = $('<textarea readonly/>')
			.val(output)
			.appendTo(hiddenDiv);

		// For browsers that support the copy execCommand, try to use it
		if (document.queryCommandSupported('copy')) {
			hiddenDiv.appendTo(dt.table().container());
			textarea[0].focus();
			textarea[0].select();

			try {
				var successful = document.execCommand('copy');
				hiddenDiv.remove();

				if (successful) {
					dt.buttons.info(
						dt.i18n('buttons.copyTitle', 'Copy to clipboard'),
						dt.i18n(
							'buttons.copySuccess',
							{
								1: 'Copied one row to clipboard',
								_: 'Copied %d rows to clipboard'
							},
							exportData.rows
						),
						2000
					);

					cb();
					return;
				}
			} catch (t) {
				// noop
			}
		}

		// Otherwise we show the text box and instruct the user to use it
		var message = $(
			'<span>' +
				dt.i18n(
					'buttons.copyKeys',
					'Press <i>ctrl</i> or <i>\u2318</i> + <i>C</i> to copy the table data<br>to your system clipboard.<br><br>' +
						'To cancel, click this message or press escape.'
				) +
				'</span>'
		).append(hiddenDiv);

		dt.buttons.info(
			dt.i18n('buttons.copyTitle', 'Copy to clipboard'),
			message,
			0
		);

		// Select the text so when the user activates their system clipboard
		// it will copy that text
		textarea[0].focus();
		textarea[0].select();

		// Event to hide the message when the user is done
		var container = $(message).closest('.dt-button-info');
		var close = function () {
			container.off('click.buttons-copy');
			$(document).off('.buttons-copy');
			dt.buttons.info(false);
		};

		container.on('click.buttons-copy', close);
		$(document)
			.on('keydown.buttons-copy', function (e) {
				if (e.keyCode === 27) {
					// esc
					close();
					cb();
				}
			})
			.on('copy.buttons-copy cut.buttons-copy', function () {
				close();
				cb();
			});
	},

	async: 100,

	exportOptions: {},

	fieldSeparator: '\t',

	fieldBoundary: '',

	header: true,

	footer: true,

	title: '*',

	messageTop: '*',

	messageBottom: '*'
};

//
// CSV export
//
DataTable.ext.buttons.csvHtml5 = {
	bom: false,

	className: 'buttons-csv buttons-html5',

	available: function () {
		return window.FileReader !== undefined && window.Blob;
	},

	text: function (dt) {
		return dt.i18n('buttons.csv', 'CSV');
	},

	action: function (e, dt, button, config, cb) {
		// Set the text
		var output = _exportData(dt, config).str;
		var info = dt.buttons.exportInfo(config);
		var charset = config.charset;

		if (config.customize) {
			output = config.customize(output, config, dt);
		}

		if (charset !== false) {
			if (!charset) {
				charset = document.characterSet || document.charset;
			}

			if (charset) {
				charset = ';charset=' + charset;
			}
		}
		else {
			charset = '';
		}

		if (config.bom) {
			output = String.fromCharCode(0xfeff) + output;
		}

		_saveAs(
			new Blob([output], { type: 'text/csv' + charset }),
			info.filename,
			true
		);

		cb();
	},

	async: 100,

	filename: '*',

	extension: '.csv',

	exportOptions: {},

	fieldSeparator: ',',

	fieldBoundary: '"',

	escapeChar: '"',

	charset: null,

	header: true,

	footer: true
};

//
// Excel (xlsx) export
//
DataTable.ext.buttons.excelHtml5 = {
	className: 'buttons-excel buttons-html5',

	available: function () {
		return (
			window.FileReader !== undefined &&
			_jsZip() !== undefined &&
			!_isDuffSafari() &&
			_serialiser
		);
	},

	text: function (dt) {
		return dt.i18n('buttons.excel', 'Excel');
	},

	action: function (e, dt, button, config, cb) {
		var rowPos = 0;
		var dataStartRow, dataEndRow;
		var getXml = function (type) {
			var str = excelStrings[type];

			//str = str.replace( /xmlns:/g, 'xmlns_' ).replace( /mc:/g, 'mc_' );

			return $.parseXML(str);
		};
		var rels = getXml('xl/worksheets/sheet1.xml');
		var relsGet = rels.getElementsByTagName('sheetData')[0];

		var xlsx = {
			_rels: {
				'.rels': getXml('_rels/.rels')
			},
			xl: {
				_rels: {
					'workbook.xml.rels': getXml('xl/_rels/workbook.xml.rels')
				},
				'workbook.xml': getXml('xl/workbook.xml'),
				'styles.xml': getXml('xl/styles.xml'),
				worksheets: {
					'sheet1.xml': rels
				}
			},
			'[Content_Types].xml': getXml('[Content_Types].xml')
		};

		var data = dt.buttons.exportData(config.exportOptions);
		var currentRow, rowNode;
		var addRow = function (row) {
			currentRow = rowPos + 1;
			rowNode = _createNode(rels, 'row', { attr: { r: currentRow } });

			for (var i = 0, ien = row.length; i < ien; i++) {
				// Concat both the Cell Columns as a letter and the Row of the cell.
				var cellId = createCellPos(i) + '' + currentRow;
				var cell = null;

				// For null, undefined of blank cell, continue so it doesn't create the _createNode
				if (row[i] === null || row[i] === undefined || row[i] === '') {
					if (config.createEmptyCells === true) {
						row[i] = '';
					}
					else {
						continue;
					}
				}

				var originalContent = row[i];
				row[i] =
					typeof row[i].trim === 'function' ? row[i].trim() : row[i];

				// Special number formatting options
				for (var j = 0, jen = _excelSpecials.length; j < jen; j++) {
					var special = _excelSpecials[j];

					// TODO Need to provide the ability for the specials to say
					// if they are returning a string, since at the moment it is
					// assumed to be a number
					if (
						row[i].match &&
						!row[i].match(/^0\d+/) &&
						row[i].match(special.match)
					) {
						var val = row[i].replace(/[^\d\.\-]/g, '');

						if (special.fmt) {
							val = special.fmt(val);
						}

						cell = _createNode(rels, 'c', {
							attr: {
								r: cellId,
								s: special.style
							},
							children: [_createNode(rels, 'v', { text: val })]
						});

						break;
					}
				}

				if (!cell) {
					if (
						typeof row[i] === 'number' ||
						(row[i].match &&
							row[i].match(/^-?\d+(\.\d+)?([eE]\-?\d+)?$/) && // Includes exponential format
							!row[i].match(/^0\d+/))
					) {
						// Detect numbers - don't match numbers with leading zeros
						// or a negative anywhere but the start
						cell = _createNode(rels, 'c', {
							attr: {
								t: 'n',
								r: cellId
							},
							children: [_createNode(rels, 'v', { text: row[i] })]
						});
					}
					else {
						// String output - replace non standard characters for text output
						/*eslint no-control-regex: "off"*/
						var text = !originalContent.replace
							? originalContent
							: originalContent.replace(
									/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g,
									''
							);

						cell = _createNode(rels, 'c', {
							attr: {
								t: 'inlineStr',
								r: cellId
							},
							children: {
								row: _createNode(rels, 'is', {
									children: {
										row: _createNode(rels, 't', {
											text: text,
											attr: {
												'xml:space': 'preserve'
											}
										})
									}
								})
							}
						});
					}
				}

				rowNode.appendChild(cell);
			}

			relsGet.appendChild(rowNode);
			rowPos++;
		};

		var addHeader = function (structure) {
			structure.forEach(function (row) {
				addRow(
					row.map(function (cell) {
						return cell ? cell.title : '';
					}),
					rowPos
				);
				$('row:last c', rels).attr('s', '2'); // bold

				// Add any merge cells
				row.forEach(function (cell, columnCounter) {
					if (cell && (cell.colSpan > 1 || cell.rowSpan > 1)) {
						_excelMergeCells(
							rels,
							rowPos,
							columnCounter,
							cell.rowSpan,
							cell.colSpan
						);
					}
				});
			});
		};

		if (config.customizeData) {
			config.customizeData(data);
		}

		// Title and top messages
		var exportInfo = dt.buttons.exportInfo(config);
		if (exportInfo.title) {
			addRow([exportInfo.title], rowPos);
			_excelMergeCells(rels, rowPos, 0, 1, data.header.length);
			$('row:last c', rels).attr('s', '51'); // centre
		}

		if (exportInfo.messageTop) {
			addRow([exportInfo.messageTop], rowPos);
			_excelMergeCells(rels, rowPos, 0, 1, data.header.length);
		}

		// Table header
		if (config.header) {
			addHeader(data.headerStructure);
		}

		dataStartRow = rowPos;

		// Table body
		for (var n = 0, ie = data.body.length; n < ie; n++) {
			addRow(data.body[n], rowPos);
		}

		dataEndRow = rowPos;

		// Table footer
		if (config.footer && data.footer) {
			addHeader(data.footerStructure);
		}

		// Below the table
		if (exportInfo.messageBottom) {
			addRow([exportInfo.messageBottom], rowPos);
			_excelMergeCells(rels, rowPos, 0, 1, data.header.length);
		}

		// Set column widths
		var cols = _createNode(rels, 'cols');
		$('worksheet', rels).prepend(cols);

		for (var i = 0, ien = data.header.length; i < ien; i++) {
			cols.appendChild(
				_createNode(rels, 'col', {
					attr: {
						min: i + 1,
						max: i + 1,
						width: _excelColWidth(data, i),
						customWidth: 1
					}
				})
			);
		}

		// Workbook modifications
		var workbook = xlsx.xl['workbook.xml'];

		$('sheets sheet', workbook).attr('name', _sheetname(config));

		// Auto filter for columns
		if (config.autoFilter) {
			$('mergeCells', rels).before(
				_createNode(rels, 'autoFilter', {
					attr: {
						ref:
							'A' +
							dataStartRow +
							':' +
							createCellPos(data.header.length - 1) +
							dataEndRow
					}
				})
			);

			$('definedNames', workbook).append(
				_createNode(workbook, 'definedName', {
					attr: {
						name: '_xlnm._FilterDatabase',
						localSheetId: '0',
						hidden: 1
					},
					text:
						'\'' +
						_sheetname(config).replace(/'/g, '\'\'') +
						'\'!$A$' +
						dataStartRow +
						':' +
						createCellPos(data.header.length - 1) +
						dataEndRow
				})
			);
		}

		// Let the developer customise the document if they want to
		if (config.customize) {
			config.customize(xlsx, config, dt);
		}

		// Excel doesn't like an empty mergeCells tag
		if ($('mergeCells', rels).children().length === 0) {
			$('mergeCells', rels).remove();
		}

		var jszip = _jsZip();
		var zip = new jszip();
		var zipConfig = {
			compression: 'DEFLATE',
			type: 'blob',
			mimeType:
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		};

		_addToZip(zip, xlsx);

		// Modern Excel has a 218 character limit on the file name + path of the file (why!?)
		// https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3
		// So we truncate to allow for this.
		var filename = exportInfo.filename;

		if (filename > 175) {
			filename = filename.substr(0, 175);
		}

		// Let the developer customize the final zip file if they want to before it is generated and sent to the browser
		if (config.customizeZip) {
			config.customizeZip(zip, data, filename);
		}


		if (zip.generateAsync) {
			// JSZip 3+
			zip.generateAsync(zipConfig).then(function (blob) {
				_saveAs(blob, filename);
				cb();
			});
		}
		else {
			// JSZip 2.5
			_saveAs(zip.generate(zipConfig), filename);
			cb();
		}
	},

	async: 100,

	filename: '*',

	extension: '.xlsx',

	exportOptions: {},

	header: true,

	footer: true,

	title: '*',

	messageTop: '*',

	messageBottom: '*',

	createEmptyCells: false,

	autoFilter: false,

	sheetName: ''
};

//
// PDF export - using pdfMake - http://pdfmake.org
//
DataTable.ext.buttons.pdfHtml5 = {
	className: 'buttons-pdf buttons-html5',

	available: function () {
		return window.FileReader !== undefined && _pdfMake();
	},

	text: function (dt) {
		return dt.i18n('buttons.pdf', 'PDF');
	},

	action: function (e, dt, button, config, cb) {
		var data = dt.buttons.exportData(config.exportOptions);
		var info = dt.buttons.exportInfo(config);
		var rows = [];

		if (config.header) {
			data.headerStructure.forEach(function (row) {
				rows.push(
					row.map(function (cell) {
						return cell
							? {
									text: cell.title,
									colSpan: cell.colspan,
									rowSpan: cell.rowspan,
									style: 'tableHeader'
							}
							: {};
					})
				);
			});
		}

		for (var i = 0, ien = data.body.length; i < ien; i++) {
			rows.push(
				data.body[i].map(function (d) {
					return {
						text:
							d === null || d === undefined
								? ''
								: typeof d === 'string'
								? d
								: d.toString()
					};
				})
			);
		}

		if (config.footer) {
			data.footerStructure.forEach(function (row) {
				rows.push(
					row.map(function (cell) {
						return cell
							? {
									text: cell.title,
									colSpan: cell.colspan,
									rowSpan: cell.rowspan,
									style: 'tableHeader'
							}
							: {};
					})
				);
			});
		}

		var doc = {
			pageSize: config.pageSize,
			pageOrientation: config.orientation,
			content: [
				{
					style: 'table',
					table: {
						headerRows: data.headerStructure.length,
						footerRows: data.footerStructure.length, // Used for styling, doesn't do anything in pdfmake
						body: rows
					},
					layout: {
						hLineWidth: function (i, node) {
							if (i === 0 || i === node.table.body.length) {
								return 0;
							}
							return 0.5;
						},
						vLineWidth: function () {
							return 0;
						},
						hLineColor: function (i, node) {
							return i === node.table.headerRows ||
								i ===
									node.table.body.length -
										node.table.footerRows
								? '#333'
								: '#ddd';
						},
						fillColor: function (rowIndex) {
							if (rowIndex < data.headerStructure.length) {
								return '#fff';
							}
							return rowIndex % 2 === 0 ? '#f3f3f3' : null;
						},
						paddingTop: function () {
							return 5;
						},
						paddingBottom: function () {
							return 5;
						}
					}
				}
			],
			styles: {
				tableHeader: {
					bold: true,
					fontSize: 11,
					alignment: 'center'
				},
				tableFooter: {
					bold: true,
					fontSize: 11
				},
				table: {
					margin: [0, 5, 0, 5]
				},
				title: {
					alignment: 'center',
					fontSize: 13
				},
				message: {}
			},
			defaultStyle: {
				fontSize: 10
			}
		};

		if (info.messageTop) {
			doc.content.unshift({
				text: info.messageTop,
				style: 'message',
				margin: [0, 0, 0, 12]
			});
		}

		if (info.messageBottom) {
			doc.content.push({
				text: info.messageBottom,
				style: 'message',
				margin: [0, 0, 0, 12]
			});
		}

		if (info.title) {
			doc.content.unshift({
				text: info.title,
				style: 'title',
				margin: [0, 0, 0, 12]
			});
		}

		if (config.customize) {
			config.customize(doc, config, dt);
		}

		var pdf = _pdfMake().createPdf(doc);

		if (config.download === 'open' && !_isDuffSafari()) {
			pdf.open();
		}
		else {
			pdf.download(info.filename);
		}

		cb();
	},

	async: 100,

	title: '*',

	filename: '*',

	extension: '.pdf',

	exportOptions: {},

	orientation: 'portrait',

	// This isn't perfect, but it is close
	pageSize:
		navigator.language === 'en-US' || navigator.language === 'en-CA'
			? 'LETTER'
			: 'A4',

	header: true,

	footer: true,

	messageTop: '*',

	messageBottom: '*',

	customize: null,

	download: 'download'
};


return DataTable;
}));


/*!
 * Print button for Buttons and DataTables.
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



var _link = document.createElement('a');

/**
 * Clone link and style tags, taking into account the need to change the source
 * path.
 *
 * @param  {node}     el Element to convert
 */
var _styleToAbs = function (el) {
	var clone = $(el).clone()[0];

	if (clone.nodeName.toLowerCase() === 'link') {
		clone.href = _relToAbs(clone.href);
	}

	return clone.outerHTML;
};

/**
 * Convert a URL from a relative to an absolute address so it will work
 * correctly in the popup window which has no base URL.
 *
 * @param  {string} href URL
 */
var _relToAbs = function (href) {
	// Assign to a link on the original page so the browser will do all the
	// hard work of figuring out where the file actually is
	_link.href = href;
	var linkHost = _link.host;

	// IE doesn't have a trailing slash on the host
	// Chrome has it on the pathname
	if (linkHost.indexOf('/') === -1 && _link.pathname.indexOf('/') !== 0) {
		linkHost += '/';
	}

	return _link.protocol + '//' + linkHost + _link.pathname + _link.search;
};

DataTable.ext.buttons.print = {
	className: 'buttons-print',

	text: function (dt) {
		return dt.i18n('buttons.print', 'Print');
	},

	action: function (e, dt, button, config, cb) {
		var data = dt.buttons.exportData(
			$.extend({ decodeEntities: false }, config.exportOptions) // XSS protection
		);
		var exportInfo = dt.buttons.exportInfo(config);

		// Get the classes for the columns from the header cells
		var columnClasses = dt
			.columns(config.exportOptions.columns)
			.nodes()
			.map(function (n) {
				return n.className;
			})
			.toArray();

		var addRow = function (d, tag) {
			var str = '<tr>';

			for (var i = 0, ien = d.length; i < ien; i++) {
				// null and undefined aren't useful in the print output
				var dataOut = d[i] === null || d[i] === undefined ? '' : d[i];
				var classAttr = columnClasses[i]
					? 'class="' + columnClasses[i] + '"'
					: '';

				str +=
					'<' +
					tag +
					' ' +
					classAttr +
					'>' +
					dataOut +
					'</' +
					tag +
					'>';
			}

			return str + '</tr>';
		};

		// Construct a table for printing
		var html = '<table class="' + dt.table().node().className + '">';

		if (config.header) {
			var headerRows = data.headerStructure.map(function (row) {
				return (
					'<tr>' +
					row
						.map(function (cell) {
							return cell
								? '<th colspan="' +
										cell.colspan +
										'" rowspan="' +
										cell.rowspan +
										'">' +
										cell.title +
										'</th>'
								: '';
						})
						.join('') +
					'</tr>'
				);
			});

			html += '<thead>' + headerRows.join('') + '</thead>';
		}

		html += '<tbody>';
		for (var i = 0, ien = data.body.length; i < ien; i++) {
			html += addRow(data.body[i], 'td');
		}
		html += '</tbody>';

		if (config.footer && data.footer) {
			var footerRows = data.footerStructure.map(function (row) {
				return (
					'<tr>' +
					row
						.map(function (cell) {
							return cell
								? '<th colspan="' +
										cell.colspan +
										'" rowspan="' +
										cell.rowspan +
										'">' +
										cell.title +
										'</th>'
								: '';
						})
						.join('') +
					'</tr>'
				);
			});

			html += '<tfoot>' + footerRows.join('') + '</tfoot>';
		}
		html += '</table>';

		// Open a new window for the printable table
		var win = window.open('', '');

		if (!win) {
			dt.buttons.info(
				dt.i18n('buttons.printErrorTitle', 'Unable to open print view'),
				dt.i18n(
					'buttons.printErrorMsg',
					'Please allow popups in your browser for this site to be able to view the print view.'
				),
				5000
			);

			return;
		}

		win.document.close();

		// Inject the title and also a copy of the style and link tags from this
		// document so the table can retain its base styling. Note that we have
		// to use string manipulation as IE won't allow elements to be created
		// in the host document and then appended to the new window.
		var head = '<title>' + exportInfo.title + '</title>';
		$('style, link').each(function () {
			head += _styleToAbs(this);
		});

		try {
			win.document.head.innerHTML = head; // Work around for Edge
		} catch (e) {
			$(win.document.head).html(head); // Old IE
		}

		// Inject the table and other surrounding information
		win.document.body.innerHTML =
			'<h1>' +
			exportInfo.title +
			'</h1>' +
			'<div>' +
			(exportInfo.messageTop || '') +
			'</div>' +
			html +
			'<div>' +
			(exportInfo.messageBottom || '') +
			'</div>';

		$(win.document.body).addClass('dt-print-view');

		$('img', win.document.body).each(function (i, img) {
			img.setAttribute('src', _relToAbs(img.getAttribute('src')));
		});

		if (config.customize) {
			config.customize(win, config, dt);
		}

		// Allow stylesheets time to load
		var autoPrint = function () {
			if (config.autoPrint) {
				win.print(); // blocking - so close will not
				win.close(); // execute until this is done
			}
		};

		win.setTimeout(autoPrint, 1000);

		cb();
	},

	async: 100,

	title: '*',

	messageTop: '*',

	messageBottom: '*',

	exportOptions: {},

	header: true,

	footer: true,

	autoPrint: true,

	customize: null
};


return DataTable;
}));


/*! KeyTable 2.12.0
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



/**
 * @summary     KeyTable
 * @description Spreadsheet like keyboard navigation for DataTables
 * @version     2.12.0
 * @file        dataTables.keyTable.js
 * @author      SpryMedia Ltd
 * @contact     datatables.net
 * @copyright   Copyright SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

var namespaceCounter = 0;
var editorNamespaceCounter = 0;

var KeyTable = function (dt, opts) {
	// Sanity check that we are using DataTables 1.10 or newer
	if (!DataTable.versionCheck || !DataTable.versionCheck('1.10.8')) {
		throw 'KeyTable requires DataTables 1.10.8 or newer';
	}

	// User and defaults configuration object
	this.c = $.extend(true, {}, DataTable.defaults.keyTable, KeyTable.defaults, opts);

	// Internal settings
	this.s = {
		/** @type {DataTable.Api} DataTables' API instance */
		dt: new DataTable.Api(dt),

		/** Indicate when the DataTable is redrawing - take no action on key presses */
		dtDrawing: false,

		enable: true,

		/** @type {bool} Flag for if a draw is triggered by focus */
		focusDraw: false,

		/** @type {bool} Flag to indicate when waiting for a draw to happen.
		 *   Will ignore key presses at this point
		 */
		waitingForDraw: false,

		/** @type {object} Information about the last cell that was focused */
		lastFocus: null,

		/** @type {string} Unique namespace per instance */
		namespace: '.keyTable-' + namespaceCounter++,

		/** @type {Node} Input element for tabbing into the table */
		tabInput: null
	};

	// DOM items
	this.dom = {};

	// Check if row reorder has already been initialised on this table
	var settings = this.s.dt.settings()[0];
	var exisiting = settings.keytable;
	if (exisiting) {
		return exisiting;
	}

	settings.keytable = this;
	this._constructor();
};

$.extend(KeyTable.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * API methods for DataTables API interface
	 */

	/**
	 * Blur the table's cell focus
	 */
	blur: function () {
		this._blur();
	},

	/**
	 * Enable cell focus for the table
	 *
	 * @param  {string} state Can be `true`, `false` or `-string navigation-only`
	 */
	enable: function (state) {
		this.s.enable = state;
	},

	/**
	 * Get enable status
	 */
	enabled: function () {
		return this.s.enable;
	},

	/**
	 * Focus on a cell
	 * @param  {integer} row    Row index
	 * @param  {integer} column Column index
	 */
	focus: function (row, column) {
		this._focus(this.s.dt.cell(row, column));
	},

	/**
	 * Is the cell focused
	 * @param  {object} cell Cell index to check
	 * @returns {boolean} true if focused, false otherwise
	 */
	focused: function (cell) {
		var lastFocus = this.s.lastFocus;

		if (!lastFocus) {
			return false;
		}

		var lastIdx = this.s.lastFocus.cell.index();
		return cell.row === lastIdx.row && cell.column === lastIdx.column;
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Initialise the KeyTable instance
	 *
	 * @private
	 */
	_constructor: function () {
		this._tabInput();

		var that = this;
		var dt = this.s.dt;
		var table = $(dt.table().node());
		var namespace = this.s.namespace;
		var editorBlock = false;

		// Need to be able to calculate the cell positions relative to the table
		if (table.css('position') === 'static') {
			table.css('position', 'relative');
		}

		// Click to focus
		$(dt.table().body()).on('click' + namespace, 'th, td', function (e) {
			if (that.s.enable === false) {
				return;
			}

			var cell = dt.cell(this);

			if (!cell.any()) {
				return;
			}

			that._focus(cell, null, false, e);
		});

		// Key events
		$(document).on('keydown' + namespace, function (e) {
			if (!editorBlock && !that.s.dtDrawing) {
				that._key(e);
			}
			else {
				e.preventDefault();
			}
		});

		// Click blur
		if (this.c.blurable) {
			$(document).on('mousedown' + namespace, function (e) {
				// Click on the search input will blur focus
				if ($(e.target).parents('.dataTables_filter, .dt-search').length) {
					that._blur();
				}

				// If the click was inside the DataTables container, don't blur
				if ($(e.target).parents().filter(dt.table().container()).length) {
					return;
				}

				// Don't blur in Editor form
				if ($(e.target).parents('div.DTE').length) {
					return;
				}

				// Or an Editor date input
				if (
					$(e.target).parents('div.editor-datetime').length ||
					$(e.target).parents('div.dt-datetime').length
				) {
					return;
				}

				//If the click was inside the fixed columns container, don't blur
				if ($(e.target).parents().filter('.DTFC_Cloned').length) {
					return;
				}

				that._blur();
			});
		}

		if (this.c.editor) {
			var editor = this.c.editor;

			// Need to disable KeyTable when the main editor is shown
			editor.on('open.keyTableMain', function (e, mode, action) {
				if (mode !== 'inline' && that.s.enable) {
					that.enable(false);

					editor.one('close' + namespace, function () {
						that.enable(true);
					});
				}
			});

			if (this.c.editOnFocus) {
				dt.on(
					'key-focus' + namespace + ' key-refocus' + namespace,
					function (e, dt, cell, orig) {
						that._editor(null, orig, true);
					}
				);
			}

			// Activate Editor when a key is pressed (will be ignored, if
			// already active).
			dt.on('key' + namespace, function (e, dt, key, cell, orig) {
				that._editor(key, orig, false);
			});

			// Active editing on double click - it will already have focus from
			// the click event handler above
			$(dt.table().body()).on('dblclick' + namespace, 'th, td', function (e) {
				if (that.s.enable === false) {
					return;
				}

				var cell = dt.cell(this);

				if (!cell.any()) {
					return;
				}

				if (that.s.lastFocus && this !== that.s.lastFocus.cell.node()) {
					return;
				}

				that._editor(null, e, true);
			});

			// While Editor is busy processing, we don't want to process any key events
			editor
				.on('preSubmit', function () {
					editorBlock = true;
				})
				.on('preSubmitCancelled', function () {
					editorBlock = false;
				})
				.on('submitComplete', function () {
					editorBlock = false;
				});
		}

		// Stave saving
		// if ( dt.settings()[0].oFeatures.bStateSave ) {
		dt.on('stateSaveParams' + namespace, function (e, s, d) {
			d.keyTable = that.s.lastFocus ? that.s.lastFocus.cell.index() : null;
		});
		// }

		dt.on('column-visibility' + namespace, function (e) {
			that._tabInput();
		});

		dt.on('column-reorder' + namespace, function (e, s, d) {
			// Need to update the last focus cell's index
			var lastFocus = that.s.lastFocus;

			if (lastFocus && lastFocus.cell) {
				var curr = lastFocus.relative.column;

				// Manipulate the API instance to correct the column index
				lastFocus.cell[0][0].column = d.mapping.indexOf(curr);
				lastFocus.relative.column = d.mapping.indexOf(curr);
			}
		});

		// When the table is about to do a draw we need to block key
		// handling. This is only important for async draws - i.e.
		// server-side processing.
		dt.on('preDraw' + namespace + ' scroller-will-draw' + namespace, function (e) {
			that.s.dtDrawing = true;
		});

		// Redraw - retain focus on the current cell
		dt.on('draw' + namespace, function (e) {
			that.s.dtDrawing = false;

			that._tabInput();

			if (that.s.focusDraw) {
				return;
			}

			var lastFocus = that.s.lastFocus;

			if (lastFocus) {
				var relative = that.s.lastFocus.relative;
				var info = dt.page.info();
				var row = relative.row;

				if (info.recordsDisplay === 0) {
					return;
				}

				// If the refocus is outside the current draw zone -
				// don't attempt to refocus onto it
				if (row < info.start || row > info.start + info.length) {
					return;
				}

				// Reverse if needed
				if (row >= info.recordsDisplay) {
					row = info.recordsDisplay - 1;
				}

				that._focus(row, relative.column, true, e);
			}
		});

		// Clipboard support
		if (this.c.clipboard) {
			this._clipboard();
		}

		dt.on('destroy' + namespace, function () {
			that._blur(true);

			// Event tidy up
			dt.off(namespace);

			$(dt.table().body())
				.off('click' + namespace, 'th, td')
				.off('dblclick' + namespace, 'th, td');

			$(document)
				.off('mousedown' + namespace)
				.off('keydown' + namespace)
				.off('copy' + namespace)
				.off('paste' + namespace);
		});

		// Initial focus comes from state or options
		var state = dt.state.loaded();

		if (state && state.keyTable) {
			// Wait until init is done
			dt.one('init', function () {
				var cell = dt.cell(state.keyTable);

				// Ensure that the saved cell still exists
				if (cell.any()) {
					cell.focus();
				}
			});
		}
		else if (this.c.focus) {
			dt.cell(this.c.focus).focus();
		}
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Blur the control
	 *
	 * @param {boolean} [noEvents=false] Don't trigger updates / events (for destroying)
	 * @private
	 */
	_blur: function (noEvents) {
		if (!this.s.enable || !this.s.lastFocus) {
			return;
		}

		var cell = this.s.lastFocus.cell;

		$(cell.node()).removeClass(this.c.className);
		this.s.lastFocus = null;

		if (!noEvents) {
			this._updateFixedColumns(cell.index().column);

			this._emitEvent('key-blur', [this.s.dt, cell]);
		}
	},

	/**
	 * Clipboard interaction handlers
	 *
	 * @private
	 */
	_clipboard: function () {
		var dt = this.s.dt;
		var that = this;
		var namespace = this.s.namespace;
		var opts = this.c.clipboard;

		// IE8 doesn't support getting selected text
		if (!window.getSelection) {
			return;
		}

		if (opts === true || opts.copy) {
			$(document).on('copy' + namespace, function (ejq) {
				var e = ejq.originalEvent;
				var selection = window.getSelection().toString();
				var focused = that.s.lastFocus;

				// Only copy cell text to clipboard if there is no other selection
				// and there is a focused cell
				if (!selection && focused) {
					e.clipboardData.setData(
						'text/plain',
						focused.cell.render(that.c.clipboardOrthogonal)
					);
					e.preventDefault();
				}
			});
		}

		if (opts === true || opts.paste) {
			$(document).on('paste' + namespace, function (ejq) {
				var e = ejq.originalEvent;
				var focused = that.s.lastFocus;
				var activeEl = document.activeElement;
				var editor = that.c.editor;
				var pastedText;

				if (focused && (!activeEl || activeEl.nodeName.toLowerCase() === 'body')) {
					e.preventDefault();

					if (window.clipboardData && window.clipboardData.getData) {
						// IE
						pastedText = window.clipboardData.getData('Text');
					}
					else if (e.clipboardData && e.clipboardData.getData) {
						// Everything else
						pastedText = e.clipboardData.getData('text/plain');
					}

					if (editor) {
						// Got Editor - need to activate inline editing,
						// set the value and submit
						var options = that._inlineOptions(focused.cell.index());

						editor
							.inline(options.cell, options.field, options.options)
							.set(editor.displayed()[0], pastedText)
							.submit();
					}
					else {
						// No editor, so just dump the data in
						focused.cell.data(pastedText);
						dt.draw(false);
					}
				}
			});
		}
	},

	/**
	 * Get an array of the column indexes that KeyTable can operate on. This
	 * is a merge of the user supplied columns and the visible columns.
	 *
	 * @private
	 */
	_columns: function () {
		var dt = this.s.dt;
		var user = dt.columns(this.c.columns).indexes();
		var out = [];

		dt.columns(':visible').every(function (i) {
			if (user.indexOf(i) !== -1) {
				out.push(i);
			}
		});

		return out;
	},

	/**
	 * Perform excel like navigation for Editor by triggering an edit on key
	 * press
	 *
	 * @param  {integer} key Key code for the pressed key
	 * @param  {object} orig Original event
	 * @private
	 */
	_editor: function (key, orig, hardEdit) {
		// If nothing focused, we can't take any action
		if (!this.s.lastFocus) {
			return;
		}

		// DataTables draw event
		if (orig && orig.type === 'draw') {
			return;
		}

		var that = this;
		var dt = this.s.dt;
		var editor = this.c.editor;
		var editCell = this.s.lastFocus.cell;
		var namespace = this.s.namespace + 'e' + editorNamespaceCounter++;

		// Do nothing if there is already an inline edit in this cell
		if ($('div.DTE', editCell.node()).length) {
			return;
		}

		// Don't activate Editor on control key presses
		if (
			key !== null &&
			((key >= 0x00 && key <= 0x09) ||
				key === 0x0b ||
				key === 0x0c ||
				(key >= 0x0e && key <= 0x1f) ||
				(key >= 0x70 && key <= 0x7b) ||
				(key >= 0x7f && key <= 0x9f))
		) {
			return;
		}

		if (orig) {
			orig.stopPropagation();

			// Return key should do nothing - for textareas it would empty the
			// contents
			if (key === 13) {
				orig.preventDefault();
			}
		}

		var editInline = function () {
			var options = that._inlineOptions(editCell.index());

			editor
				.one('open' + namespace, function () {
					// Remove cancel open
					editor.off('cancelOpen' + namespace);

					// Excel style - select all text
					if (!hardEdit) {
						$(
							'div.DTE_Field_InputControl input, div.DTE_Field_InputControl textarea'
						).select();
					}

					// Reduce the keys the Keys listens for
					dt.keys.enable(hardEdit ? 'tab-only' : 'navigation-only');

					// On blur of the navigation submit
					dt.on('key-blur.editor', function (e, dt, cell) {
						// When Editor has its own blur enabled - do nothing here
						if (editor.s.editOpts.onBlur === 'submit') {
							return;
						}

						if (editor.displayed() && cell.node() === editCell.node()) {
							editor.submit();
						}
					});

					// Highlight the cell a different colour on full edit
					if (hardEdit) {
						$(dt.table().container()).addClass('dtk-focus-alt');
					}

					// If the dev cancels the submit, we need to return focus
					editor.on('preSubmitCancelled' + namespace, function () {
						setTimeout(function () {
							that._focus(editCell, null, false);
						}, 50);
					});

					editor.on('submitUnsuccessful' + namespace, function () {
						that._focus(editCell, null, false);
					});

					// Restore full key navigation on close
					editor.one('close' + namespace, function () {
						dt.keys.enable(true);
						dt.off('key-blur.editor');
						editor.off(namespace);
						$(dt.table().container()).removeClass('dtk-focus-alt');

						if (that.s.returnSubmit) {
							that.s.returnSubmit = false;
							that._emitEvent('key-return-submit', [dt, editCell]);
						}
					});
				})
				.one('cancelOpen' + namespace, function () {
					// `preOpen` can cancel the display of the form, so it
					// might be that the open event handler isn't needed
					editor.off(namespace);
				})
				.inline(options.cell, options.field, options.options);
		};

		// Editor 1.7 listens for `return` on keyup, so if return is the trigger
		// key, we need to wait for `keyup` otherwise Editor would just submit
		// the content triggered by this keypress.
		if (key === 13) {
			hardEdit = true;

			$(document).one('keyup', function () {
				// immediately removed
				editInline();
			});
		}
		else {
			editInline();
		}
	},

	_inlineOptions: function (cellIdx) {
		if (this.c.editorOptions) {
			return this.c.editorOptions(cellIdx);
		}

		return {
			cell: cellIdx,
			field: undefined,
			options: undefined
		};
	},

	/**
	 * Emit an event on the DataTable for listeners
	 *
	 * @param  {string} name Event name
	 * @param  {array} args Event arguments
	 * @private
	 */
	_emitEvent: function (name, args) {
		return this.s.dt.iterator('table', function (ctx, i) {
			return $(ctx.nTable).triggerHandler(name, args);
		});
	},

	/**
	 * Focus on a particular cell, shifting the table's paging if required
	 *
	 * @param  {DataTables.Api|integer} row Can be given as an API instance that
	 *   contains the cell to focus or as an integer. As the latter it is the
	 *   visible row index (from the whole data set) - NOT the data index
	 * @param  {integer} [column] Not required if a cell is given as the first
	 *   parameter. Otherwise this is the column data index for the cell to
	 *   focus on
	 * @param {boolean} [shift=true] Should the viewport be moved to show cell
	 * @private
	 */
	_focus: function (row, column, shift, originalEvent) {
		var that = this;
		var dt = this.s.dt;
		var pageInfo = dt.page.info();
		var lastFocus = this.s.lastFocus;

		if (!originalEvent) {
			originalEvent = null;
		}

		if (!this.s.enable) {
			return;
		}

		if (typeof row !== 'number') {
			// Its an API instance - check that there is actually a row
			if (!row.any()) {
				return;
			}

			// Convert the cell to a row and column
			var index = row.index();
			column = index.column;
			row = dt.rows({ filter: 'applied', order: 'applied' }).indexes().indexOf(index.row);

			// Don't focus rows that were filtered out.
			if (row < 0) {
				return;
			}

			// For server-side processing normalise the row by adding the start
			// point, since `rows().indexes()` includes only rows that are
			// available at the client-side
			if (pageInfo.serverSide) {
				row += pageInfo.start;
			}
		}

		// Is the row on the current page? If not, we need to redraw to show the
		// page
		if (
			pageInfo.length !== -1 &&
			(row < pageInfo.start || row >= pageInfo.start + pageInfo.length)
		) {
			this.s.focusDraw = true;
			this.s.waitingForDraw = true;

			dt.one('draw', function () {
				that.s.focusDraw = false;
				that.s.waitingForDraw = false;
				that._focus(row, column, undefined, originalEvent);
			})
				.page(Math.floor(row / pageInfo.length))
				.draw(false);

			return;
		}

		// In the available columns?
		if ($.inArray(column, this._columns()) === -1) {
			return;
		}

		// De-normalise the server-side processing row, so we select the row
		// in its displayed position
		if (pageInfo.serverSide) {
			row -= pageInfo.start;
		}

		// Get the cell from the current position - ignoring any cells which might
		// not have been rendered (therefore can't use `:eq()` selector).
		var cells = dt.cells(null, column, { search: 'applied', order: 'applied' }).flatten();
		var cell = dt.cell(cells[row]);

		// Prefocus check - this event allows a focus action to be disallowed.
		var preFocus = this._emitEvent('key-prefocus', [this.s.dt, cell, originalEvent || null]);
		if (preFocus.indexOf(false) !== -1) {
			return;
		}

		if (lastFocus) {
			// Don't trigger a refocus on the same cell
			if (lastFocus.node === cell.node()) {
				this._emitEvent('key-refocus', [this.s.dt, cell, originalEvent || null]);
				return;
			}

			// Otherwise blur the old focus
			this._blur();
		}

		// Clear focus from other tables
		this._removeOtherFocus();

		var node = $(cell.node());
		node.addClass(this.c.className);

		this._updateFixedColumns(column);

		// Shift viewpoint and page to make cell visible
		if (shift === undefined || shift === true) {
			this._scroll($(window), $(document.body), node, 'offset');

			var bodyParent = dt.table().body().parentNode;
			if (bodyParent !== dt.table().header().parentNode) {
				var parent = $(bodyParent.parentNode);

				this._scroll(parent, parent, node, 'position');
			}
		}

		// Event and finish
		var info = dt.page.info();

		this.s.lastFocus = {
			cell: cell,
			node: cell.node(),
			relative: {
				row: info.start + dt.rows({ page: 'current' }).indexes().indexOf(cell.index().row),
				column: cell.index().column
			}
		};

		this._emitEvent('key-focus', [this.s.dt, cell, originalEvent || null]);
		dt.state.save();
	},

	/**
	 * Handle key press
	 *
	 * @param  {object} e Event
	 * @private
	 */
	_key: function (e) {
		// If we are waiting for a draw to happen from another key event, then
		// do nothing for this new key press.
		if (this.s.waitingForDraw) {
			e.preventDefault();
			return;
		}

		// Ignore key presses in an Editor inline create row - it is not navigatable
		// by KeyTable
		if ($(e.target).closest('.dte-inlineAdd').length) {
			return;
		}

		var enable = this.s.enable;
		this.s.returnSubmit =
			(enable === 'navigation-only' || enable === 'tab-only') && e.keyCode === 13
				? true
				: false;

		var navEnable = enable === true || enable === 'navigation-only';
		if (!enable) {
			return;
		}

		if ((e.keyCode === 0 || e.ctrlKey || e.metaKey || e.altKey) && !(e.ctrlKey && e.altKey)) {
			return;
		}

		// If not focused, then there is no key action to take
		var lastFocus = this.s.lastFocus;
		if (!lastFocus) {
			return;
		}

		// And the last focus still exists!
		if (!this.s.dt.cell(lastFocus.node).any()) {
			this.s.lastFocus = null;
			return;
		}

		var that = this;
		var dt = this.s.dt;
		var scrolling = this.s.dt.settings()[0].oScroll.sY ? true : false;

		// If we are not listening for this key, do nothing
		if (this.c.keys && $.inArray(e.keyCode, this.c.keys) === -1) {
			return;
		}

		switch (e.keyCode) {
			case 9: // tab
				// `enable` can be tab-only
				e.preventDefault();

				this._keyAction(function () {
					that._shift(e, e.shiftKey ? 'left' : 'right', true);
				});
				break;

			case 27: // esc
				// If there is an inline edit in the cell, let it blur first,
				// a second escape will then blur keytable
				if ($(lastFocus.node).find('div.DTE').length) {
					return;
				}

				if (this.c.blurable && enable === true) {
					this._blur();
				}
				break;

			case 33: // page up (previous page)
			case 34: // page down (next page)
				if (navEnable && !scrolling) {
					e.preventDefault();

					this._keyAction(function () {
						dt.page(e.keyCode === 33 ? 'previous' : 'next').draw(false);
					});
				}
				break;

			case 35: // end (end of current page)
			case 36: // home (start of current page)
				if (navEnable) {
					e.preventDefault();

					this._keyAction(function () {
						var indexes = dt.cells({ page: 'current' }).indexes();
						var colIndexes = that._columns();

						that._focus(
							dt.cell(indexes[e.keyCode === 35 ? indexes.length - 1 : colIndexes[0]]),
							null,
							true,
							e
						);
					});
				}
				break;

			case 37: // left arrow
				if (navEnable) {
					this._keyAction(function () {
						that._shift(e, 'left');
					});
				}
				break;

			case 38: // up arrow
				if (navEnable) {
					this._keyAction(function () {
						that._shift(e, 'up');
					});
				}
				break;

			case 39: // right arrow
				if (navEnable) {
					this._keyAction(function () {
						that._shift(e, 'right');
					});
				}
				break;

			case 40: // down arrow
				if (navEnable) {
					this._keyAction(function () {
						that._shift(e, 'down');
					});
				}
				break;

			case 113: // F2 - Excel like hard edit
				if (this.c.editor) {
					this._editor(null, e, true);
					break;
				}
			// else fallthrough

			default:
				// Everything else - pass through only when fully enabled
				if (enable === true) {
					this._emitEvent('key', [dt, e.keyCode, this.s.lastFocus.cell, e]);
				}
				break;
		}
	},

	/**
	 * Whether we perform a key shift action immediately or not depends
	 * upon if Editor is being used. If it is, then we wait until it
	 * completes its action
	 * @param {*} action Function to trigger when ready
	 */
	_keyAction: function (action) {
		var editor = this.c.editor;

		if (editor && editor.mode()) {
			editor.submit(action);
		}
		else {
			action();
		}
	},

	/**
	 * Remove focus from all tables other than this one
	 */
	_removeOtherFocus: function () {
		var thisTable = this.s.dt.table().node();

		$.fn.dataTable.tables({ api: true }).iterator('table', function (settings) {
			if (this.table().node() !== thisTable) {
				this.cell.blur();
			}
		});
	},

	/**
	 * Scroll a container to make a cell visible in it. This can be used for
	 * both DataTables scrolling and native window scrolling.
	 *
	 * @param  {jQuery} container Scrolling container
	 * @param  {jQuery} scroller  Item being scrolled
	 * @param  {jQuery} cell      Cell in the scroller
	 * @param  {string} posOff    `position` or `offset` - which to use for the
	 *   calculation. `offset` for the document, otherwise `position`
	 * @private
	 */
	_scroll: function (container, scroller, cell, posOff) {
		var offset = cell[posOff]();
		var height = cell.outerHeight();
		var width = cell.outerWidth();

		var scrollTop = scroller.scrollTop();
		var scrollLeft = scroller.scrollLeft();
		var containerHeight = container.height();
		var containerWidth = container.width();

		// If Scroller is being used, the table can be `position: absolute` and that
		// needs to be taken account of in the offset. If no Scroller, this will be 0
		if (posOff === 'position') {
			offset.top += parseInt(cell.closest('table').css('top'), 10);
		}

		// Top correction (partially in view)
		if (offset.top < scrollTop && offset.top + height > scrollTop - 5) {
			scroller.scrollTop(offset.top);
		}

		// Left correction
		if (offset.left < scrollLeft) {
			scroller.scrollLeft(offset.left);
		}

		// Bottom correction plus in view correction. Note that the magic 5 is to allow
		// for the edge just passing the bottom of the view
		if (
			offset.top + height > scrollTop + containerHeight &&
			offset.top < scrollTop + containerHeight + 5 &&
			height < containerHeight
		) {
			scroller.scrollTop(offset.top + height - containerHeight);
		}

		// Right correction
		if (offset.left + width > scrollLeft + containerWidth && width < containerWidth) {
			scroller.scrollLeft(offset.left + width - containerWidth);
		}
	},

	/**
	 * Calculate a single offset movement in the table - up, down, left and
	 * right and then perform the focus if possible
	 *
	 * @param  {object}  e           Event object
	 * @param  {string}  direction   Movement direction
	 * @param  {boolean} keyBlurable `true` if the key press can result in the
	 *   table being blurred. This is so arrow keys won't blur the table, but
	 *   tab will.
	 * @private
	 */
	_shift: function (e, direction, keyBlurable) {
		var dt = this.s.dt;
		var pageInfo = dt.page.info();
		var rows = pageInfo.recordsDisplay;
		var columns = this._columns();
		var last = this.s.lastFocus;
		if (!last) {
			return;
		}

		var currentCell = last.cell;
		if (!currentCell) {
			return;
		}

		var currRow = dt
			.rows({ filter: 'applied', order: 'applied' })
			.indexes()
			.indexOf(currentCell.index().row);

		// When server-side processing, `rows().indexes()` only gives the rows
		// that are available at the client-side, so we need to normalise the
		// row's current position by the display start point
		if (pageInfo.serverSide) {
			currRow += pageInfo.start;
		}

		var currCol = dt.columns(columns).indexes().indexOf(currentCell.index().column);

		var row = currRow,
			column = columns[currCol]; // row is the display, column is an index

		// If the direction is rtl then the logic needs to be inverted from this point forwards
		if ($(dt.table().node()).css('direction') === 'rtl') {
			if (direction === 'right') {
				direction = 'left';
			}
			else if (direction === 'left') {
				direction = 'right';
			}
		}

		if (direction === 'right') {
			if (currCol >= columns.length - 1) {
				row++;
				column = columns[0];
			}
			else {
				column = columns[currCol + 1];
			}
		}
		else if (direction === 'left') {
			if (currCol === 0) {
				row--;
				column = columns[columns.length - 1];
			}
			else {
				column = columns[currCol - 1];
			}
		}
		else if (direction === 'up') {
			row--;
		}
		else if (direction === 'down') {
			row++;
		}

		if (row >= 0 && row < rows && $.inArray(column, columns) !== -1) {
			if (e) {
				e.preventDefault();
			}

			this._focus(row, column, true, e);
		}
		else if (!keyBlurable || !this.c.blurable) {
			// No new focus, but if the table isn't blurable, then don't loose
			// focus
			if (e) {
				e.preventDefault();
			}
		}
		else {
			this._blur();
		}
	},

	/**
	 * Create and insert a hidden input element that can receive focus on behalf
	 * of the table
	 *
	 * @private
	 */
	_tabInput: function () {
		var that = this;
		var dt = this.s.dt;
		var tabIndex = this.c.tabIndex !== null ? this.c.tabIndex : dt.settings()[0].iTabIndex;

		if (tabIndex == -1) {
			return;
		}

		// Only create the input element once on first class
		if (!this.s.tabInput) {
			var div = $('<div><input type="text" tabindex="' + tabIndex + '"/></div>').css({
				position: 'absolute',
				height: 1,
				width: 0,
				overflow: 'hidden'
			});

			div.children().on('focus', function (e) {
				var cell = dt.cell(':eq(0)', that._columns(), { page: 'current' });

				if (cell.any()) {
					that._focus(cell, null, true, e);
				}
			});

			this.s.tabInput = div;
		}

		// Insert the input element into the first cell in the table's body
		var cell = this.s.dt
			.cell(':eq(0)', '0:visible', { page: 'current', order: 'current' })
			.node();
		if (cell) {
			$(cell).prepend(this.s.tabInput);
		}
	},

	/**
	 * Update fixed columns if they are enabled and if the cell we are
	 * focusing is inside a fixed column
	 * @param  {integer} column Index of the column being changed
	 * @private
	 */
	_updateFixedColumns: function (column) {
		var dt = this.s.dt;
		var settings = dt.settings()[0];

		if (settings._oFixedColumns) {
			var leftCols = settings._oFixedColumns.s.iLeftColumns;
			var rightCols = settings.aoColumns.length - settings._oFixedColumns.s.iRightColumns;

			if (column < leftCols || column >= rightCols) {
				dt.fixedColumns().update();
			}
		}
	}
});

/**
 * KeyTable default settings for initialisation
 *
 * @namespace
 * @name KeyTable.defaults
 * @static
 */
KeyTable.defaults = {
	/**
	 * Can focus be removed from the table
	 * @type {Boolean}
	 */
	blurable: true,

	/**
	 * Class to give to the focused cell
	 * @type {String}
	 */
	className: 'focus',

	/**
	 * Enable or disable clipboard support
	 * @type {Boolean}
	 */
	clipboard: true,

	/**
	 * Orthogonal data that should be copied to clipboard
	 * @type {string}
	 */
	clipboardOrthogonal: 'display',

	/**
	 * Columns that can be focused. This is automatically merged with the
	 * visible columns as only visible columns can gain focus.
	 * @type {String}
	 */
	columns: '', // all

	/**
	 * Editor instance to automatically perform Excel like navigation
	 * @type {Editor}
	 */
	editor: null,

	/**
	 * Trigger editing immediately on focus
	 * @type {boolean}
	 */
	editOnFocus: false,

	/**
	 * Options to pass to Editor's inline method
	 * @type {function}
	 */
	editorOptions: null,

	/**
	 * Select a cell to automatically select on start up. `null` for no
	 * automatic selection
	 * @type {cell-selector}
	 */
	focus: null,

	/**
	 * Array of keys to listen for
	 * @type {null|array}
	 */
	keys: null,

	/**
	 * Tab index for where the table should sit in the document's tab flow
	 * @type {integer|null}
	 */
	tabIndex: null
};

KeyTable.version = '2.12.0';

$.fn.dataTable.KeyTable = KeyTable;
$.fn.DataTable.KeyTable = KeyTable;

DataTable.Api.register('cell.blur()', function () {
	return this.iterator('table', function (ctx) {
		if (ctx.keytable) {
			ctx.keytable.blur();
		}
	});
});

DataTable.Api.register('cell().focus()', function () {
	return this.iterator('cell', function (ctx, row, column) {
		if (ctx.keytable) {
			ctx.keytable.focus(row, column);
		}
	});
});

DataTable.Api.register('keys.disable()', function () {
	return this.iterator('table', function (ctx) {
		if (ctx.keytable) {
			ctx.keytable.enable(false);
		}
	});
});

DataTable.Api.register('keys.enable()', function (opts) {
	return this.iterator('table', function (ctx) {
		if (ctx.keytable) {
			ctx.keytable.enable(opts === undefined ? true : opts);
		}
	});
});

DataTable.Api.register('keys.enabled()', function (opts) {
	var ctx = this.context;

	if (ctx.length) {
		return ctx[0].keytable ? ctx[0].keytable.enabled() : false;
	}

	return false;
});

DataTable.Api.register('keys.move()', function (dir) {
	return this.iterator('table', function (ctx) {
		if (ctx.keytable) {
			ctx.keytable._shift(null, dir, false);
		}
	});
});

// Cell selector
DataTable.ext.selector.cell.push(function (settings, opts, cells) {
	var focused = opts.focused;
	var kt = settings.keytable;
	var out = [];

	if (!kt || focused === undefined) {
		return cells;
	}

	for (var i = 0, ien = cells.length; i < ien; i++) {
		if (
			(focused === true && kt.focused(cells[i])) ||
			(focused === false && !kt.focused(cells[i]))
		) {
			out.push(cells[i]);
		}
	}

	return out;
});

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on('preInit.dt.dtk', function (e, settings, json) {
	if (e.namespace !== 'dt') {
		return;
	}

	var init = settings.oInit.keys;
	var defaults = DataTable.defaults.keys;

	if (init || defaults) {
		var opts = $.extend({}, defaults, init);

		if (init !== false) {
			new KeyTable(settings, opts);
		}
	}
});


return DataTable;
}));


/*! Responsive 3.0.2
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



/**
 * @summary     Responsive
 * @description Responsive tables plug-in for DataTables
 * @version     3.0.2
 * @author      SpryMedia Ltd
 * @copyright   SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

/**
 * Responsive is a plug-in for the DataTables library that makes use of
 * DataTables' ability to change the visibility of columns, changing the
 * visibility of columns so the displayed columns fit into the table container.
 * The end result is that complex tables will be dynamically adjusted to fit
 * into the viewport, be it on a desktop, tablet or mobile browser.
 *
 * Responsive for DataTables has two modes of operation, which can used
 * individually or combined:
 *
 * * Class name based control - columns assigned class names that match the
 *   breakpoint logic can be shown / hidden as required for each breakpoint.
 * * Automatic control - columns are automatically hidden when there is no
 *   room left to display them. Columns removed from the right.
 *
 * In additional to column visibility control, Responsive also has built into
 * options to use DataTables' child row display to show / hide the information
 * from the table that has been hidden. There are also two modes of operation
 * for this child row display:
 *
 * * Inline - when the control element that the user can use to show / hide
 *   child rows is displayed inside the first column of the table.
 * * Column - where a whole column is dedicated to be the show / hide control.
 *
 * Initialisation of Responsive is performed by:
 *
 * * Adding the class `responsive` or `dt-responsive` to the table. In this case
 *   Responsive will automatically be initialised with the default configuration
 *   options when the DataTable is created.
 * * Using the `responsive` option in the DataTables configuration options. This
 *   can also be used to specify the configuration options, or simply set to
 *   `true` to use the defaults.
 *
 *  @class
 *  @param {object} settings DataTables settings object for the host table
 *  @param {object} [opts] Configuration options
 *  @requires jQuery 1.7+
 *  @requires DataTables 1.10.3+
 *
 *  @example
 *      $('#example').DataTable( {
 *        responsive: true
 *      } );
 *    } );
 */
var Responsive = function (settings, opts) {
	// Sanity check that we are using DataTables 1.10 or newer
	if (!DataTable.versionCheck || !DataTable.versionCheck('2')) {
		throw 'DataTables Responsive requires DataTables 2 or newer';
	}

	this.s = {
		childNodeStore: {},
		columns: [],
		current: [],
		dt: new DataTable.Api(settings)
	};

	// Check if responsive has already been initialised on this table
	if (this.s.dt.settings()[0].responsive) {
		return;
	}

	// details is an object, but for simplicity the user can give it as a string
	// or a boolean
	if (opts && typeof opts.details === 'string') {
		opts.details = { type: opts.details };
	}
	else if (opts && opts.details === false) {
		opts.details = { type: false };
	}
	else if (opts && opts.details === true) {
		opts.details = { type: 'inline' };
	}

	this.c = $.extend(
		true,
		{},
		Responsive.defaults,
		DataTable.defaults.responsive,
		opts
	);
	settings.responsive = this;
	this._constructor();
};

$.extend(Responsive.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Initialise the Responsive instance
	 *
	 * @private
	 */
	_constructor: function () {
		var that = this;
		var dt = this.s.dt;
		var oldWindowWidth = $(window).innerWidth();

		dt.settings()[0]._responsive = this;

		// Use DataTables' throttle function to avoid processor thrashing
		$(window).on(
			'orientationchange.dtr',
			DataTable.util.throttle(function () {
				// iOS has a bug whereby resize can fire when only scrolling
				// See: http://stackoverflow.com/questions/8898412
				var width = $(window).innerWidth();

				if (width !== oldWindowWidth) {
					that._resize();
					oldWindowWidth = width;
				}
			})
		);

		// Handle new rows being dynamically added - needed as responsive
		// updates all rows (shown or not) a responsive change, rather than
		// per draw.
		dt.on('row-created.dtr', function (e, tr, data, idx) {
			if ($.inArray(false, that.s.current) !== -1) {
				$('>td, >th', tr).each(function (i) {
					var idx = dt.column.index('toData', i);

					if (that.s.current[idx] === false) {
						$(this)
							.css('display', 'none')
							.addClass('dtr-hidden');
					}
				});
			}
		});

		// Destroy event handler
		dt.on('destroy.dtr', function () {
			dt.off('.dtr');
			$(dt.table().body()).off('.dtr');
			$(window).off('resize.dtr orientationchange.dtr');
			dt.cells('.dtr-control').nodes().to$().removeClass('dtr-control');
			$(dt.table().node()).removeClass('dtr-inline collapsed');

			// Restore the columns that we've hidden
			$.each(that.s.current, function (i, val) {
				if (val === false) {
					that._setColumnVis(i, true);
				}
			});
		});

		// Reorder the breakpoints array here in case they have been added out
		// of order
		this.c.breakpoints.sort(function (a, b) {
			return a.width < b.width ? 1 : a.width > b.width ? -1 : 0;
		});

		this._classLogic();
		this._resizeAuto();

		// Details handler
		var details = this.c.details;

		if (details.type !== false) {
			that._detailsInit();

			// DataTables will trigger this event on every column it shows and
			// hides individually
			dt.on('column-visibility.dtr', function () {
				// Use a small debounce to allow multiple columns to be set together
				if (that._timer) {
					clearTimeout(that._timer);
				}

				that._timer = setTimeout(function () {
					that._timer = null;

					that._classLogic();
					that._resizeAuto();
					that._resize(true);

					that._redrawChildren();
				}, 100);
			});

			// Redraw the details box on each draw which will happen if the data
			// has changed. This is used until DataTables implements a native
			// `updated` event for rows
			dt.on('draw.dtr', function () {
				that._redrawChildren();
			});

			$(dt.table().node()).addClass('dtr-' + details.type);
		}

		dt.on('column-reorder.dtr', function (e, settings, details) {
			that._classLogic();
			that._resizeAuto();
			that._resize(true);
		});

		// Change in column sizes means we need to calc
		dt.on('column-sizing.dtr', function () {
			that._resizeAuto();
			that._resize();
		});

		// DT2 let's us tell it if we are hiding columns
		dt.on('column-calc.dt', function (e, d) {
			var curr = that.s.current;

			for (var i = 0; i < curr.length; i++) {
				var idx = d.visible.indexOf(i);

				if (curr[i] === false && idx >= 0) {
					d.visible.splice(idx, 1);
				}
			}
		});

		// On Ajax reload we want to reopen any child rows which are displayed
		// by responsive
		dt.on('preXhr.dtr', function () {
			var rowIds = [];
			dt.rows().every(function () {
				if (this.child.isShown()) {
					rowIds.push(this.id(true));
				}
			});

			dt.one('draw.dtr', function () {
				that._resizeAuto();
				that._resize();

				dt.rows(rowIds).every(function () {
					that._detailsDisplay(this, false);
				});
			});
		});

		dt.on('draw.dtr', function () {
			that._controlClass();
		}).on('init.dtr', function (e, settings, details) {
			if (e.namespace !== 'dt') {
				return;
			}

			that._resizeAuto();
			that._resize();
		});

		// First pass - draw the table for the current viewport size
		this._resize();
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Insert a `col` tag into the correct location in a `colgroup`.
	 *
	 * @param {jQuery} colGroup The `colgroup` tag
	 * @param {jQuery} colEl The `col` tag
	 */
	_colGroupAttach: function (colGroup, colEls, idx) {
		var found = null;

		// No need to do anything if already attached
		if (colEls[idx].get(0).parentNode === colGroup[0]) {
			return;
		}

		// Find the first `col` after our own which is already attached
		for (var i = idx+1; i < colEls.length; i++) {
			if (colGroup[0] === colEls[i].get(0).parentNode) {
				found = i;
				break;
			}
		}

		if (found !== null) {
			// Insert before
			colEls[idx].insertBefore(colEls[found][0]);
		}
		else {
			// If wasn't found, insert at the end
			colGroup.append(colEls[idx]);
		}
	},

	/**
	 * Get and store nodes from a cell - use for node moving renderers
	 *
	 * @param {*} dt DT instance
	 * @param {*} row Row index
	 * @param {*} col Column index
	 */
	_childNodes: function (dt, row, col) {
		var name = row + '-' + col;

		if (this.s.childNodeStore[name]) {
			return this.s.childNodeStore[name];
		}

		// https://jsperf.com/childnodes-array-slice-vs-loop
		var nodes = [];
		var children = dt.cell(row, col).node().childNodes;
		for (var i = 0, ien = children.length; i < ien; i++) {
			nodes.push(children[i]);
		}

		this.s.childNodeStore[name] = nodes;

		return nodes;
	},

	/**
	 * Restore nodes from the cache to a table cell
	 *
	 * @param {*} dt DT instance
	 * @param {*} row Row index
	 * @param {*} col Column index
	 */
	_childNodesRestore: function (dt, row, col) {
		var name = row + '-' + col;

		if (!this.s.childNodeStore[name]) {
			return;
		}

		var node = dt.cell(row, col).node();
		var store = this.s.childNodeStore[name];
		if (store.length > 0) {
			var parent = store[0].parentNode;
			var parentChildren = parent.childNodes;
			var a = [];

			for (var i = 0, ien = parentChildren.length; i < ien; i++) {
				a.push(parentChildren[i]);
			}

			for (var j = 0, jen = a.length; j < jen; j++) {
				node.appendChild(a[j]);
			}
		}

		this.s.childNodeStore[name] = undefined;
	},

	/**
	 * Calculate the visibility for the columns in a table for a given
	 * breakpoint. The result is pre-determined based on the class logic if
	 * class names are used to control all columns, but the width of the table
	 * is also used if there are columns which are to be automatically shown
	 * and hidden.
	 *
	 * @param  {string} breakpoint Breakpoint name to use for the calculation
	 * @return {array} Array of boolean values initiating the visibility of each
	 *   column.
	 *  @private
	 */
	_columnsVisiblity: function (breakpoint) {
		var dt = this.s.dt;
		var columns = this.s.columns;
		var i, ien;

		// Create an array that defines the column ordering based first on the
		// column's priority, and secondly the column index. This allows the
		// columns to be removed from the right if the priority matches
		var order = columns
			.map(function (col, idx) {
				return {
					columnIdx: idx,
					priority: col.priority
				};
			})
			.sort(function (a, b) {
				if (a.priority !== b.priority) {
					return a.priority - b.priority;
				}
				return a.columnIdx - b.columnIdx;
			});

		// Class logic - determine which columns are in this breakpoint based
		// on the classes. If no class control (i.e. `auto`) then `-` is used
		// to indicate this to the rest of the function
		var display = $.map(columns, function (col, i) {
			if (dt.column(i).visible() === false) {
				return 'not-visible';
			}
			return col.auto && col.minWidth === null
				? false
				: col.auto === true
				? '-'
				: $.inArray(breakpoint, col.includeIn) !== -1;
		});

		// Auto column control - first pass: how much width is taken by the
		// ones that must be included from the non-auto columns
		var requiredWidth = 0;
		for (i = 0, ien = display.length; i < ien; i++) {
			if (display[i] === true) {
				requiredWidth += columns[i].minWidth;
			}
		}

		// Second pass, use up any remaining width for other columns. For
		// scrolling tables we need to subtract the width of the scrollbar. It
		// may not be requires which makes this sub-optimal, but it would
		// require another full redraw to make complete use of those extra few
		// pixels
		var scrolling = dt.settings()[0].oScroll;
		var bar = scrolling.sY || scrolling.sX ? scrolling.iBarWidth : 0;
		var widthAvailable = dt.table().container().offsetWidth - bar;
		var usedWidth = widthAvailable - requiredWidth;

		// Control column needs to always be included. This makes it sub-
		// optimal in terms of using the available with, but to stop layout
		// thrashing or overflow. Also we need to account for the control column
		// width first so we know how much width is available for the other
		// columns, since the control column might not be the first one shown
		for (i = 0, ien = display.length; i < ien; i++) {
			if (columns[i].control) {
				usedWidth -= columns[i].minWidth;
			}
		}

		// Allow columns to be shown (counting by priority and then right to
		// left) until we run out of room
		var empty = false;
		for (i = 0, ien = order.length; i < ien; i++) {
			var colIdx = order[i].columnIdx;

			if (
				display[colIdx] === '-' &&
				!columns[colIdx].control &&
				columns[colIdx].minWidth
			) {
				// Once we've found a column that won't fit we don't let any
				// others display either, or columns might disappear in the
				// middle of the table
				if (empty || usedWidth - columns[colIdx].minWidth < 0) {
					empty = true;
					display[colIdx] = false;
				}
				else {
					display[colIdx] = true;
				}

				usedWidth -= columns[colIdx].minWidth;
			}
		}

		// Determine if the 'control' column should be shown (if there is one).
		// This is the case when there is a hidden column (that is not the
		// control column). The two loops look inefficient here, but they are
		// trivial and will fly through. We need to know the outcome from the
		// first , before the action in the second can be taken
		var showControl = false;

		for (i = 0, ien = columns.length; i < ien; i++) {
			if (
				!columns[i].control &&
				!columns[i].never &&
				display[i] === false
			) {
				showControl = true;
				break;
			}
		}

		for (i = 0, ien = columns.length; i < ien; i++) {
			if (columns[i].control) {
				display[i] = showControl;
			}

			// Replace not visible string with false from the control column detection above
			if (display[i] === 'not-visible') {
				display[i] = false;
			}
		}

		// Finally we need to make sure that there is at least one column that
		// is visible
		if ($.inArray(true, display) === -1) {
			display[0] = true;
		}

		return display;
	},

	/**
	 * Create the internal `columns` array with information about the columns
	 * for the table. This includes determining which breakpoints the column
	 * will appear in, based upon class names in the column, which makes up the
	 * vast majority of this method.
	 *
	 * @private
	 */
	_classLogic: function () {
		var that = this;
		var breakpoints = this.c.breakpoints;
		var dt = this.s.dt;
		var columns = dt
			.columns()
			.eq(0)
			.map(function (i) {
				var column = this.column(i);
				var className = column.header().className;
				var priority = column.init().responsivePriority;
				var dataPriority = column
					.header()
					.getAttribute('data-priority');

				if (priority === undefined) {
					priority =
						dataPriority === undefined || dataPriority === null
							? 10000
							: dataPriority * 1;
				}

				return {
					className: className,
					includeIn: [],
					auto: false,
					control: false,
					never: className.match(/\b(dtr\-)?never\b/) ? true : false,
					priority: priority
				};
			});

		// Simply add a breakpoint to `includeIn` array, ensuring that there are
		// no duplicates
		var add = function (colIdx, name) {
			var includeIn = columns[colIdx].includeIn;

			if ($.inArray(name, includeIn) === -1) {
				includeIn.push(name);
			}
		};

		var column = function (colIdx, name, operator, matched) {
			var size, i, ien;

			if (!operator) {
				columns[colIdx].includeIn.push(name);
			}
			else if (operator === 'max-') {
				// Add this breakpoint and all smaller
				size = that._find(name).width;

				for (i = 0, ien = breakpoints.length; i < ien; i++) {
					if (breakpoints[i].width <= size) {
						add(colIdx, breakpoints[i].name);
					}
				}
			}
			else if (operator === 'min-') {
				// Add this breakpoint and all larger
				size = that._find(name).width;

				for (i = 0, ien = breakpoints.length; i < ien; i++) {
					if (breakpoints[i].width >= size) {
						add(colIdx, breakpoints[i].name);
					}
				}
			}
			else if (operator === 'not-') {
				// Add all but this breakpoint
				for (i = 0, ien = breakpoints.length; i < ien; i++) {
					if (breakpoints[i].name.indexOf(matched) === -1) {
						add(colIdx, breakpoints[i].name);
					}
				}
			}
		};

		// Loop over each column and determine if it has a responsive control
		// class
		columns.each(function (col, i) {
			var classNames = col.className.split(' ');
			var hasClass = false;

			// Split the class name up so multiple rules can be applied if needed
			for (var k = 0, ken = classNames.length; k < ken; k++) {
				var className = classNames[k].trim();

				if (className === 'all' || className === 'dtr-all') {
					// Include in all
					hasClass = true;
					col.includeIn = $.map(breakpoints, function (a) {
						return a.name;
					});
					return;
				}
				else if (
					className === 'none' ||
					className === 'dtr-none' ||
					col.never
				) {
					// Include in none (default) and no auto
					hasClass = true;
					return;
				}
				else if (
					className === 'control' ||
					className === 'dtr-control'
				) {
					// Special column that is only visible, when one of the other
					// columns is hidden. This is used for the details control
					hasClass = true;
					col.control = true;
					return;
				}

				$.each(breakpoints, function (j, breakpoint) {
					// Does this column have a class that matches this breakpoint?
					var brokenPoint = breakpoint.name.split('-');
					var re = new RegExp(
						'(min\\-|max\\-|not\\-)?(' +
							brokenPoint[0] +
							')(\\-[_a-zA-Z0-9])?'
					);
					var match = className.match(re);

					if (match) {
						hasClass = true;

						if (
							match[2] === brokenPoint[0] &&
							match[3] === '-' + brokenPoint[1]
						) {
							// Class name matches breakpoint name fully
							column(
								i,
								breakpoint.name,
								match[1],
								match[2] + match[3]
							);
						}
						else if (match[2] === brokenPoint[0] && !match[3]) {
							// Class name matched primary breakpoint name with no qualifier
							column(i, breakpoint.name, match[1], match[2]);
						}
					}
				});
			}

			// If there was no control class, then automatic sizing is used
			if (!hasClass) {
				col.auto = true;
			}
		});

		this.s.columns = columns;
	},

	/**
	 * Update the cells to show the correct control class / button
	 * @private
	 */
	_controlClass: function () {
		if (this.c.details.type === 'inline') {
			var dt = this.s.dt;
			var columnsVis = this.s.current;
			var firstVisible = $.inArray(true, columnsVis);

			// Remove from any cells which shouldn't have it
			dt.cells(
				null,
				function (idx) {
					return idx !== firstVisible;
				},
				{ page: 'current' }
			)
				.nodes()
				.to$()
				.filter('.dtr-control')
				.removeClass('dtr-control');

			dt.cells(null, firstVisible, { page: 'current' })
				.nodes()
				.to$()
				.addClass('dtr-control');
		}
	},

	/**
	 * Show the details for the child row
	 *
	 * @param  {DataTables.Api} row    API instance for the row
	 * @param  {boolean}        update Update flag
	 * @private
	 */
	_detailsDisplay: function (row, update) {
		var that = this;
		var dt = this.s.dt;
		var details = this.c.details;
		var event = function (res) {
			$(row.node()).toggleClass('dtr-expanded', res !== false);
			$(dt.table().node()).triggerHandler('responsive-display.dt', [
				dt,
				row,
				res,
				update
			]);
		};

		if (details && details.type !== false) {
			var renderer =
				typeof details.renderer === 'string'
					? Responsive.renderer[details.renderer]()
					: details.renderer;

			var res = details.display(
				row,
				update,
				function () {
					return renderer.call(
						that,
						dt,
						row[0][0],
						that._detailsObj(row[0])
					);
				},
				function () {
					event(false);
				}
			);

			if (typeof res === 'boolean') {
				event(res);
			}
		}
	},

	/**
	 * Initialisation for the details handler
	 *
	 * @private
	 */
	_detailsInit: function () {
		var that = this;
		var dt = this.s.dt;
		var details = this.c.details;

		// The inline type always uses the first child as the target
		if (details.type === 'inline') {
			details.target = 'td.dtr-control, th.dtr-control';
		}

		// Keyboard accessibility
		dt.on('draw.dtr', function () {
			that._tabIndexes();
		});
		that._tabIndexes(); // Initial draw has already happened

		$(dt.table().body()).on('keyup.dtr', 'td, th', function (e) {
			if (e.keyCode === 13 && $(this).data('dtr-keyboard')) {
				$(this).click();
			}
		});

		// type.target can be a string jQuery selector or a column index
		var target = details.target;
		var selector = typeof target === 'string' ? target : 'td, th';

		if (target !== undefined || target !== null) {
			// Click handler to show / hide the details rows when they are available
			$(dt.table().body()).on(
				'click.dtr mousedown.dtr mouseup.dtr',
				selector,
				function (e) {
					// If the table is not collapsed (i.e. there is no hidden columns)
					// then take no action
					if (!$(dt.table().node()).hasClass('collapsed')) {
						return;
					}

					// Check that the row is actually a DataTable's controlled node
					if (
						$.inArray(
							$(this).closest('tr').get(0),
							dt.rows().nodes().toArray()
						) === -1
					) {
						return;
					}

					// For column index, we determine if we should act or not in the
					// handler - otherwise it is already okay
					if (typeof target === 'number') {
						var targetIdx =
							target < 0
								? dt.columns().eq(0).length + target
								: target;

						if (dt.cell(this).index().column !== targetIdx) {
							return;
						}
					}

					// $().closest() includes itself in its check
					var row = dt.row($(this).closest('tr'));

					// Check event type to do an action
					if (e.type === 'click') {
						// The renderer is given as a function so the caller can execute it
						// only when they need (i.e. if hiding there is no point is running
						// the renderer)
						that._detailsDisplay(row, false);
					}
					else if (e.type === 'mousedown') {
						// For mouse users, prevent the focus ring from showing
						$(this).css('outline', 'none');
					}
					else if (e.type === 'mouseup') {
						// And then re-allow at the end of the click
						$(this).trigger('blur').css('outline', '');
					}
				}
			);
		}
	},

	/**
	 * Get the details to pass to a renderer for a row
	 * @param  {int} rowIdx Row index
	 * @private
	 */
	_detailsObj: function (rowIdx) {
		var that = this;
		var dt = this.s.dt;

		return $.map(this.s.columns, function (col, i) {
			// Never and control columns should not be passed to the renderer
			if (col.never || col.control) {
				return;
			}

			var dtCol = dt.settings()[0].aoColumns[i];

			return {
				className: dtCol.sClass,
				columnIndex: i,
				data: dt.cell(rowIdx, i).render(that.c.orthogonal),
				hidden: dt.column(i).visible() && !that.s.current[i],
				rowIndex: rowIdx,
				title: dt.column(i).title()
			};
		});
	},

	/**
	 * Find a breakpoint object from a name
	 *
	 * @param  {string} name Breakpoint name to find
	 * @return {object}      Breakpoint description object
	 * @private
	 */
	_find: function (name) {
		var breakpoints = this.c.breakpoints;

		for (var i = 0, ien = breakpoints.length; i < ien; i++) {
			if (breakpoints[i].name === name) {
				return breakpoints[i];
			}
		}
	},

	/**
	 * Re-create the contents of the child rows as the display has changed in
	 * some way.
	 *
	 * @private
	 */
	_redrawChildren: function () {
		var that = this;
		var dt = this.s.dt;

		dt.rows({ page: 'current' }).iterator('row', function (settings, idx) {
			that._detailsDisplay(dt.row(idx), true);
		});
	},

	/**
	 * Alter the table display for a resized viewport. This involves first
	 * determining what breakpoint the window currently is in, getting the
	 * column visibilities to apply and then setting them.
	 *
	 * @param  {boolean} forceRedraw Force a redraw
	 * @private
	 */
	_resize: function (forceRedraw) {
		var that = this;
		var dt = this.s.dt;
		var width = $(window).innerWidth();
		var breakpoints = this.c.breakpoints;
		var breakpoint = breakpoints[0].name;
		var columns = this.s.columns;
		var i, ien;
		var oldVis = this.s.current.slice();

		// Determine what breakpoint we are currently at
		for (i = breakpoints.length - 1; i >= 0; i--) {
			if (width <= breakpoints[i].width) {
				breakpoint = breakpoints[i].name;
				break;
			}
		}

		// Show the columns for that break point
		var columnsVis = this._columnsVisiblity(breakpoint);
		this.s.current = columnsVis;

		// Set the class before the column visibility is changed so event
		// listeners know what the state is. Need to determine if there are
		// any columns that are not visible but can be shown
		var collapsedClass = false;

		for (i = 0, ien = columns.length; i < ien; i++) {
			if (
				columnsVis[i] === false &&
				!columns[i].never &&
				!columns[i].control &&
				!dt.column(i).visible() === false
			) {
				collapsedClass = true;
				break;
			}
		}

		$(dt.table().node()).toggleClass('collapsed', collapsedClass);

		var changed = false;
		var visible = 0;
		var dtSettings = dt.settings()[0];
		var colGroup = $(dt.table().node()).children('colgroup');
		var colEls = dtSettings.aoColumns.map(function (col) {
			return col.colEl;
		});

		dt.columns()
			.eq(0)
			.each(function (colIdx, i) {
				//console.log(colIdx, i);
				// Do nothing on DataTables' hidden column - DT removes it from the table
				// so we need to slide back
				if (! dt.column(colIdx).visible()) {
					return;
				}

				if (columnsVis[i] === true) {
					visible++;
				}

				if (forceRedraw || columnsVis[i] !== oldVis[i]) {
					changed = true;
					that._setColumnVis(colIdx, columnsVis[i]);
				}

				// DataTables 2 uses `col` to define the width for a column
				// and this needs to run each time, as DataTables will change
				// the column width. We may need to reattach if we've removed
				// an element previously.
				if (! columnsVis[i]) {
					colEls[i].detach();
				}
				else {
					that._colGroupAttach(colGroup, colEls, i);
				}
			});

		if (changed) {
			dt.columns.adjust();

			this._redrawChildren();

			// Inform listeners of the change
			$(dt.table().node()).trigger('responsive-resize.dt', [
				dt,
				this._responsiveOnlyHidden()
			]);

			// If no records, update the "No records" display element
			if (dt.page.info().recordsDisplay === 0) {
				$('td', dt.table().body()).eq(0).attr('colspan', visible);
			}
		}

		that._controlClass();
	},

	/**
	 * Determine the width of each column in the table so the auto column hiding
	 * has that information to work with. This method is never going to be 100%
	 * perfect since column widths can change slightly per page, but without
	 * seriously compromising performance this is quite effective.
	 *
	 * @private
	 */
	_resizeAuto: function () {
		var dt = this.s.dt;
		var columns = this.s.columns;
		var that = this;
		var visibleColumns = dt
			.columns()
			.indexes()
			.filter(function (idx) {
				return dt.column(idx).visible();
			});

		// Are we allowed to do auto sizing?
		if (!this.c.auto) {
			return;
		}

		// Are there any columns that actually need auto-sizing, or do they all
		// have classes defined
		if (
			$.inArray(
				true,
				$.map(columns, function (c) {
					return c.auto;
				})
			) === -1
		) {
			return;
		}

		// Clone the table with the current data in it
		var clonedTable = dt.table().node().cloneNode(false);
		var clonedHeader = $(dt.table().header().cloneNode(false)).appendTo(
			clonedTable
		);
		var clonedFooter = $(dt.table().footer().cloneNode(false)).appendTo(
			clonedTable
		);
		var clonedBody = $(dt.table().body())
			.clone(false, false)
			.empty()
			.appendTo(clonedTable); // use jQuery because of IE8

		clonedTable.style.width = 'auto';

		// Header
		dt.table()
			.header.structure(visibleColumns)
			.forEach((row) => {
				var cells = row
					.filter(function (el) {
						return el ? true : false;
					})
					.map(function (el) {
						return $(el.cell)
							.clone(false)
							.css('display', 'table-cell')
							.css('width', 'auto')
							.css('min-width', 0);
					});

				$('<tr/>').append(cells).appendTo(clonedHeader);
			});

		// Always need an empty row that we can read widths from
		var emptyRow = $('<tr/>').appendTo(clonedBody);

		for (var i = 0; i < visibleColumns.count(); i++) {
			emptyRow.append('<td/>');
		}

		// Body rows
		dt.rows({ page: 'current' }).every(function (rowIdx) {
			var node = this.node();

			if (! node) {
				return;
			}

			// We clone the table's rows and cells to create the sizing table
			var tr = node.cloneNode(false);

			dt.cells(rowIdx, visibleColumns).every(function (rowIdx2, colIdx) {
				// If nodes have been moved out (listHiddenNodes), we need to
				// clone from the store
				var store = that.s.childNodeStore[rowIdx + '-' + colIdx];

				if (store) {
					$(this.node().cloneNode(false))
						.append($(store).clone())
						.appendTo(tr);
				}
				else {
					$(this.node()).clone(false).appendTo(tr);
				}
			});

			clonedBody.append(tr);
		});

		// Any cells which were hidden by Responsive in the host table, need to
		// be visible here for the calculations
		clonedBody.find('th, td').css('display', '');

		// Footer
		dt.table()
			.footer.structure(visibleColumns)
			.forEach((row) => {
				var cells = row
					.filter(function (el) {
						return el ? true : false;
					})
					.map(function (el) {
						return $(el.cell)
							.clone(false)
							.css('display', 'table-cell')
							.css('width', 'auto')
							.css('min-width', 0);
					});

				$('<tr/>').append(cells).appendTo(clonedFooter);
			});

		// In the inline case extra padding is applied to the first column to
		// give space for the show / hide icon. We need to use this in the
		// calculation
		if (this.c.details.type === 'inline') {
			$(clonedTable).addClass('dtr-inline collapsed');
		}

		// It is unsafe to insert elements with the same name into the DOM
		// multiple times. For example, cloning and inserting a checked radio
		// clears the chcecked state of the original radio.
		$(clonedTable).find('[name]').removeAttr('name');

		// A position absolute table would take the table out of the flow of
		// our container element, bypassing the height and width (Scroller)
		$(clonedTable).css('position', 'relative');

		var inserted = $('<div/>')
			.css({
				width: 1,
				height: 1,
				overflow: 'hidden',
				clear: 'both'
			})
			.append(clonedTable);

		inserted.insertBefore(dt.table().node());

		// The cloned table now contains the smallest that each column can be
		emptyRow.children().each(function (i) {
			var idx = dt.column.index('fromVisible', i);
			columns[idx].minWidth = this.offsetWidth || 0;
		});

		inserted.remove();
	},

	/**
	 * Get the state of the current hidden columns - controlled by Responsive only
	 */
	_responsiveOnlyHidden: function () {
		var dt = this.s.dt;

		return $.map(this.s.current, function (v, i) {
			// If the column is hidden by DataTables then it can't be hidden by
			// Responsive!
			if (dt.column(i).visible() === false) {
				return true;
			}
			return v;
		});
	},

	/**
	 * Set a column's visibility.
	 *
	 * We don't use DataTables' column visibility controls in order to ensure
	 * that column visibility can Responsive can no-exist. Since only IE8+ is
	 * supported (and all evergreen browsers of course) the control of the
	 * display attribute works well.
	 *
	 * @param {integer} col      Column index
	 * @param {boolean} showHide Show or hide (true or false)
	 * @private
	 */
	_setColumnVis: function (col, showHide) {
		var that = this;
		var dt = this.s.dt;
		var display = showHide ? '' : 'none'; // empty string will remove the attr

		this._setHeaderVis(col, showHide, dt.table().header.structure());
		this._setHeaderVis(col, showHide, dt.table().footer.structure());

		dt.column(col)
			.nodes()
			.to$()
			.css('display', display)
			.toggleClass('dtr-hidden', !showHide);

		// If the are child nodes stored, we might need to reinsert them
		if (!$.isEmptyObject(this.s.childNodeStore)) {
			dt.cells(null, col)
				.indexes()
				.each(function (idx) {
					that._childNodesRestore(dt, idx.row, idx.column);
				});
		}
	},

	/**
	 * Set the a column's visibility, taking into account multiple rows
	 * in a header / footer and colspan attributes
	 * @param {*} col
	 * @param {*} showHide
	 * @param {*} structure
	 */
	_setHeaderVis: function (col, showHide, structure) {
		var that = this;
		var display = showHide ? '' : 'none';

		structure.forEach(function (row) {
			if (row[col]) {
				$(row[col].cell)
					.css('display', display)
					.toggleClass('dtr-hidden', !showHide);
			}
			else {
				// In a colspan - need to rewind calc the new span since
				// display:none elements do not count as being spanned over
				var search = col;

				while (search >= 0) {
					if (row[search]) {
						row[search].cell.colSpan = that._colspan(row, search);
						break;
					}

					search--;
				}
			}
		});
	},

	/**
	 * How many columns should this cell span
	 *
	 * @param {*} row Header structure row
	 * @param {*} idx The column index of the cell to span
	 */
	_colspan: function (row, idx) {
		var colspan = 1;

		for (var col = idx + 1; col < row.length; col++) {
			if (row[col] === null && this.s.current[col]) {
				// colspan and not hidden by Responsive
				colspan++;
			}
			else if (row[col]) {
				// Got the next cell, jump out
				break;
			}
		}

		return colspan;
	},

	/**
	 * Update the cell tab indexes for keyboard accessibility. This is called on
	 * every table draw - that is potentially inefficient, but also the least
	 * complex option given that column visibility can change on the fly. Its a
	 * shame user-focus was removed from CSS 3 UI, as it would have solved this
	 * issue with a single CSS statement.
	 *
	 * @private
	 */
	_tabIndexes: function () {
		var dt = this.s.dt;
		var cells = dt.cells({ page: 'current' }).nodes().to$();
		var ctx = dt.settings()[0];
		var target = this.c.details.target;

		cells.filter('[data-dtr-keyboard]').removeData('[data-dtr-keyboard]');

		if (typeof target === 'number') {
			dt.cells(null, target, { page: 'current' })
				.nodes()
				.to$()
				.attr('tabIndex', ctx.iTabIndex)
				.data('dtr-keyboard', 1);
		}
		else {
			// This is a bit of a hack - we need to limit the selected nodes to just
			// those of this table
			if (target === 'td:first-child, th:first-child') {
				target = '>td:first-child, >th:first-child';
			}

			$(target, dt.rows({ page: 'current' }).nodes())
				.attr('tabIndex', ctx.iTabIndex)
				.data('dtr-keyboard', 1);
		}
	}
});

/**
 * List of default breakpoints. Each item in the array is an object with two
 * properties:
 *
 * * `name` - the breakpoint name.
 * * `width` - the breakpoint width
 *
 * @name Responsive.breakpoints
 * @static
 */
Responsive.breakpoints = [
	{ name: 'desktop', width: Infinity },
	{ name: 'tablet-l', width: 1024 },
	{ name: 'tablet-p', width: 768 },
	{ name: 'mobile-l', width: 480 },
	{ name: 'mobile-p', width: 320 }
];

/**
 * Display methods - functions which define how the hidden data should be shown
 * in the table.
 *
 * @namespace
 * @name Responsive.defaults
 * @static
 */
Responsive.display = {
	childRow: function (row, update, render) {
		var rowNode = $(row.node());

		if (update) {
			if (rowNode.hasClass('dtr-expanded')) {
				row.child(render(), 'child').show();

				return true;
			}
		}
		else {
			if (!rowNode.hasClass('dtr-expanded')) {
				var rendered = render();

				if (rendered === false) {
					return false;
				}

				row.child(rendered, 'child').show();
				return true;
			}
			else {
				row.child(false);

				return false;
			}
		}
	},

	childRowImmediate: function (row, update, render) {
		var rowNode = $(row.node());

		if (
			(!update && rowNode.hasClass('dtr-expanded')) ||
			!row.responsive.hasHidden()
		) {
			// User interaction and the row is show, or nothing to show
			row.child(false);

			return false;
		}
		else {
			// Display
			var rendered = render();

			if (rendered === false) {
				return false;
			}

			row.child(rendered, 'child').show();

			return true;
		}
	},

	// This is a wrapper so the modal options for Bootstrap and jQuery UI can
	// have options passed into them. This specific one doesn't need to be a
	// function but it is for consistency in the `modal` name
	modal: function (options) {
		return function (row, update, render, closeCallback) {
			var modal;
			var rendered = render();

			if (rendered === false) {
				return false;
			}

			if (!update) {
				// Show a modal
				var close = function () {
					modal.remove(); // will tidy events for us
					$(document).off('keypress.dtr');
					$(row.node()).removeClass('dtr-expanded');

					closeCallback();
				};

				modal = $('<div class="dtr-modal"/>')
					.append(
						$('<div class="dtr-modal-display"/>')
							.append(
								$('<div class="dtr-modal-content"/>')
									.data('dtr-row-idx', row.index())
									.append(rendered)
							)
							.append(
								$(
									'<div class="dtr-modal-close">&times;</div>'
								).click(function () {
									close();
								})
							)
					)
					.append(
						$('<div class="dtr-modal-background"/>').click(
							function () {
								close();
							}
						)
					)
					.appendTo('body');

				$(row.node()).addClass('dtr-expanded');

				$(document).on('keyup.dtr', function (e) {
					if (e.keyCode === 27) {
						e.stopPropagation();

						close();
					}
				});
			}
			else {
				modal = $('div.dtr-modal-content');

				if (modal.length && row.index() === modal.data('dtr-row-idx')) {
					modal.empty().append(rendered);
				}
				else {
					// Modal not shown, nothing to update
					return null;
				}
			}

			if (options && options.header) {
				$('div.dtr-modal-content').prepend(
					'<h2>' + options.header(row) + '</h2>'
				);
			}

			return true;
		};
	}
};

/**
 * Display methods - functions which define how the hidden data should be shown
 * in the table.
 *
 * @namespace
 * @name Responsive.defaults
 * @static
 */
Responsive.renderer = {
	listHiddenNodes: function () {
		return function (api, rowIdx, columns) {
			var that = this;
			var ul = $(
				'<ul data-dtr-index="' + rowIdx + '" class="dtr-details"/>'
			);
			var found = false;

			$.each(columns, function (i, col) {
				if (col.hidden) {
					var klass = col.className
						? 'class="' + col.className + '"'
						: '';

					$(
						'<li ' +
							klass +
							' data-dtr-index="' +
							col.columnIndex +
							'" data-dt-row="' +
							col.rowIndex +
							'" data-dt-column="' +
							col.columnIndex +
							'">' +
							'<span class="dtr-title">' +
							col.title +
							'</span> ' +
							'</li>'
					)
						.append(
							$('<span class="dtr-data"/>').append(
								that._childNodes(
									api,
									col.rowIndex,
									col.columnIndex
								)
							)
						) // api.cell( col.rowIndex, col.columnIndex ).node().childNodes ) )
						.appendTo(ul);

					found = true;
				}
			});

			return found ? ul : false;
		};
	},

	listHidden: function () {
		return function (api, rowIdx, columns) {
			var data = $.map(columns, function (col) {
				var klass = col.className
					? 'class="' + col.className + '"'
					: '';

				return col.hidden
					? '<li ' +
							klass +
							' data-dtr-index="' +
							col.columnIndex +
							'" data-dt-row="' +
							col.rowIndex +
							'" data-dt-column="' +
							col.columnIndex +
							'">' +
							'<span class="dtr-title">' +
							col.title +
							'</span> ' +
							'<span class="dtr-data">' +
							col.data +
							'</span>' +
							'</li>'
					: '';
			}).join('');

			return data
				? $(
						'<ul data-dtr-index="' +
							rowIdx +
							'" class="dtr-details"/>'
				).append(data)
				: false;
		};
	},

	tableAll: function (options) {
		options = $.extend(
			{
				tableClass: ''
			},
			options
		);

		return function (api, rowIdx, columns) {
			var data = $.map(columns, function (col) {
				var klass = col.className
					? 'class="' + col.className + '"'
					: '';

				return (
					'<tr ' +
					klass +
					' data-dt-row="' +
					col.rowIndex +
					'" data-dt-column="' +
					col.columnIndex +
					'">' +
					'<td>' +
					col.title +
					':' +
					'</td> ' +
					'<td>' +
					col.data +
					'</td>' +
					'</tr>'
				);
			}).join('');

			return $(
				'<table class="' +
					options.tableClass +
					' dtr-details" width="100%"/>'
			).append(data);
		};
	}
};

/**
 * Responsive default settings for initialisation
 *
 * @namespace
 * @name Responsive.defaults
 * @static
 */
Responsive.defaults = {
	/**
	 * List of breakpoints for the instance. Note that this means that each
	 * instance can have its own breakpoints. Additionally, the breakpoints
	 * cannot be changed once an instance has been creased.
	 *
	 * @type {Array}
	 * @default Takes the value of `Responsive.breakpoints`
	 */
	breakpoints: Responsive.breakpoints,

	/**
	 * Enable / disable auto hiding calculations. It can help to increase
	 * performance slightly if you disable this option, but all columns would
	 * need to have breakpoint classes assigned to them
	 *
	 * @type {Boolean}
	 * @default  `true`
	 */
	auto: true,

	/**
	 * Details control. If given as a string value, the `type` property of the
	 * default object is set to that value, and the defaults used for the rest
	 * of the object - this is for ease of implementation.
	 *
	 * The object consists of the following properties:
	 *
	 * * `display` - A function that is used to show and hide the hidden details
	 * * `renderer` - function that is called for display of the child row data.
	 *   The default function will show the data from the hidden columns
	 * * `target` - Used as the selector for what objects to attach the child
	 *   open / close to
	 * * `type` - `false` to disable the details display, `inline` or `column`
	 *   for the two control types
	 *
	 * @type {Object|string}
	 */
	details: {
		display: Responsive.display.childRow,

		renderer: Responsive.renderer.listHidden(),

		target: 0,

		type: 'inline'
	},

	/**
	 * Orthogonal data request option. This is used to define the data type
	 * requested when Responsive gets the data to show in the child row.
	 *
	 * @type {String}
	 */
	orthogonal: 'display'
};

/*
 * API
 */
var Api = $.fn.dataTable.Api;

// Doesn't do anything - work around for a bug in DT... Not documented
Api.register('responsive()', function () {
	return this;
});

Api.register('responsive.index()', function (li) {
	li = $(li);

	return {
		column: li.data('dtr-index'),
		row: li.parent().data('dtr-index')
	};
});

Api.register('responsive.rebuild()', function () {
	return this.iterator('table', function (ctx) {
		if (ctx._responsive) {
			ctx._responsive._classLogic();
		}
	});
});

Api.register('responsive.recalc()', function () {
	return this.iterator('table', function (ctx) {
		if (ctx._responsive) {
			ctx._responsive._resizeAuto();
			ctx._responsive._resize();
		}
	});
});

Api.register('responsive.hasHidden()', function () {
	var ctx = this.context[0];

	return ctx._responsive
		? $.inArray(false, ctx._responsive._responsiveOnlyHidden()) !== -1
		: false;
});

Api.registerPlural(
	'columns().responsiveHidden()',
	'column().responsiveHidden()',
	function () {
		return this.iterator(
			'column',
			function (settings, column) {
				return settings._responsive
					? settings._responsive._responsiveOnlyHidden()[column]
					: false;
			},
			1
		);
	}
);

/**
 * Version information
 *
 * @name Responsive.version
 * @static
 */
Responsive.version = '3.0.2';

$.fn.dataTable.Responsive = Responsive;
$.fn.DataTable.Responsive = Responsive;

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on('preInit.dt.dtr', function (e, settings, json) {
	if (e.namespace !== 'dt') {
		return;
	}

	if (
		$(settings.nTable).hasClass('responsive') ||
		$(settings.nTable).hasClass('dt-responsive') ||
		settings.oInit.responsive ||
		DataTable.defaults.responsive
	) {
		var init = settings.oInit.responsive;

		if (init !== false) {
			new Responsive(settings, $.isPlainObject(init) ? init : {});
		}
	}
});


return DataTable;
}));


/*! jQuery UI integration for DataTables' Responsive
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net-jqui', 'datatables.net-responsive'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net-jqui')(root, $);
			}

			if ( ! $.fn.dataTable.Responsive ) {
				require('datatables.net-responsive')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



var _display = DataTable.Responsive.display;
var _original = _display.modal;

_display.modal = function (options) {
	return function (row, update, render, closeCallback) {
		if (!$.fn.dialog) {
			return _original(row, update, render, closeCallback);
		}
		else {
			var rendered = render();

			if (rendered === false) {
				return false;
			}

			if (!update) {
				$('<div/>')
					.append(rendered)
					.appendTo('body')
					.dialog(
						$.extend(
							true,
							{
								close: closeCallback,
								title: options && options.header ? options.header(row) : '',
								width: 500
							},
							options.dialog
						)
					);
			}
			else {
				return false;
			}

			return true;
		}
	};
};


return DataTable;
}));


/*! SearchPanes 2.3.1
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;


(function () {
    'use strict';

    var $$5;
    var dataTable$2;
    function setJQuery$4(jq) {
        $$5 = jq;
        dataTable$2 = jq.fn.dataTable;
    }
    var SearchPane = /** @class */ (function () {
        /**
         * Creates the panes, sets up the search function
         *
         * @param paneSettings The settings for the searchPanes
         * @param opts The options for the default features
         * @param index the index of the column for this pane
         * @param panesContainer The overall container for SearchPanes that this pane will be attached to
         * @param panes The custom pane settings if this is a custom pane
         * @returns {object} the pane that has been created, including the table and the index of the pane
         */
        function SearchPane(paneSettings, opts, index, panesContainer, panes) {
            var _this = this;
            if (panes === void 0) { panes = null; }
            // Check that the required version of DataTables is included
            if (!dataTable$2 || !dataTable$2.versionCheck || !dataTable$2.versionCheck('1.10.0')) {
                throw new Error('SearchPane requires DataTables 1.10 or newer');
            }
            // Check that Select is included
            // eslint-disable-next-line no-extra-parens
            if (!dataTable$2.select) {
                throw new Error('SearchPane requires Select');
            }
            var table = new dataTable$2.Api(paneSettings);
            this.classes = $$5.extend(true, {}, SearchPane.classes);
            // Get options from user
            this.c = $$5.extend(true, {}, SearchPane.defaults, opts, panes);
            if (opts && opts.hideCount && opts.viewCount === undefined) {
                this.c.viewCount = !this.c.hideCount;
            }
            var rowLength = table.columns().eq(0).toArray().length;
            this.s = {
                colExists: index < rowLength,
                colOpts: undefined,
                customPaneSettings: panes,
                displayed: false,
                dt: table,
                dtPane: undefined,
                firstSet: true,
                index: index,
                indexes: [],
                listSet: false,
                name: undefined,
                rowData: {
                    arrayFilter: [],
                    arrayOriginal: [],
                    bins: {},
                    binsOriginal: {},
                    filterMap: new Map(),
                    totalOptions: 0
                },
                scrollTop: 0,
                searchFunction: undefined,
                selections: [],
                serverSelect: [],
                serverSelecting: false,
                tableLength: null,
                updating: false
            };
            this.s.colOpts = this.s.colExists ? this._getOptions() : this._getBonusOptions();
            this.dom = {
                buttonGroup: $$5('<div/>').addClass(this.classes.buttonGroup),
                clear: $$5('<button type="button">&#215;</button>')
                    .attr('disabled', 'true')
                    .addClass(this.classes.disabledButton)
                    .addClass(this.classes.paneButton)
                    .addClass(this.classes.clearButton)
                    .html(this.s.dt.i18n('searchPanes.clearPane', this.c.i18n.clearPane)),
                collapseButton: $$5('<button type="button"><span class="' + this.classes.caret + '">&#x5e;</span></button>')
                    .addClass(this.classes.paneButton)
                    .addClass(this.classes.collapseButton),
                container: $$5('<div/>')
                    .addClass(this.classes.container)
                    .addClass(this.s.colOpts.className)
                    .addClass(this.classes.layout +
                    (parseInt(this.c.layout.split('-')[1], 10) < 10 ?
                        this.c.layout :
                        this.c.layout.split('-')[0] + '-9'))
                    .addClass(this.s.customPaneSettings && this.s.customPaneSettings.className
                    ? this.s.customPaneSettings.className
                    : ''),
                countButton: $$5('<button type="button"><span></span></button>')
                    .addClass(this.classes.paneButton)
                    .addClass(this.classes.countButton),
                dtP: $$5('<table width="100%"><thead><tr><th></th><th></th></tr></thead></table>'),
                lower: $$5('<div/>').addClass(this.classes.subRow2).addClass(this.classes.narrowButton),
                nameButton: $$5('<button type="button"><span></span></button>')
                    .addClass(this.classes.paneButton)
                    .addClass(this.classes.nameButton),
                panesContainer: $$5(panesContainer),
                searchBox: $$5('<input/>').addClass(this.classes.paneInputButton).addClass(this.classes.search),
                searchButton: $$5('<button type="button"><span></span></button>')
                    .addClass(this.classes.searchIcon)
                    .addClass(this.classes.paneButton),
                searchCont: $$5('<div/>').addClass(this.classes.searchCont),
                searchLabelCont: $$5('<div/>').addClass(this.classes.searchLabelCont),
                topRow: $$5('<div/>').addClass(this.classes.topRow),
                upper: $$5('<div/>').addClass(this.classes.subRow1).addClass(this.classes.narrowSearch)
            };
            var title = '';
            if (this.s.colExists) {
                title = $$5(this.s.dt.column(this.s.index).header()).text();
                this.dom.dtP.find('th').eq(0).text(title);
            }
            else {
                title = this.s.customPaneSettings.header || 'Custom Pane';
                this.dom.dtP.find('th').eq(0).html(title);
            }
            // Set the value of name incase ordering is desired
            if (this.s.colOpts.name) {
                this.s.name = this.s.colOpts.name;
            }
            else if (this.s.customPaneSettings && this.s.customPaneSettings.name) {
                this.s.name = this.s.customPaneSettings.name;
            }
            else {
                this.s.name = title;
            }
            var tableNode = this.s.dt.table(0).node();
            // Custom search function for table
            this.s.searchFunction = function (settings, searchData, dataIndex) {
                // If no data has been selected then show all
                if (_this.s.selections.length === 0) {
                    return true;
                }
                if (settings.nTable !== tableNode) {
                    return true;
                }
                var filter = null;
                if (_this.s.colExists) {
                    // Get the current filtered data
                    filter = searchData[_this.s.index];
                    if (_this.s.colOpts.orthogonal.filter !== 'filter') {
                        // get the filter value from the map
                        filter = _this.s.rowData.filterMap.get(dataIndex);
                        if (filter instanceof $$5.fn.dataTable.Api) {
                            // eslint-disable-next-line no-extra-parens
                            filter = filter.toArray();
                        }
                    }
                }
                return _this._search(filter, dataIndex);
            };
            $$5.fn.dataTable.ext.search.push(this.s.searchFunction);
            // If the clear button for this pane is clicked clear the selections
            if (this.c.clear) {
                this.dom.clear.on('click.dtsp', function () {
                    var searches = _this.dom.container.find('.' + _this.classes.search.replace(/\s+/g, '.'));
                    searches.each(function () {
                        $$5(this).val('').trigger('input');
                    });
                    _this.clearPane();
                });
            }
            // Sometimes the top row of the panes containing the search box and ordering buttons appears
            //  weird if the width of the panes is lower than expected, this fixes the design.
            // Equally this may occur when the table is resized.
            this.s.dt.on('draw.dtsp', function () { return _this.adjustTopRow(); });
            this.s.dt.on('buttons-action.dtsp', function () { return _this.adjustTopRow(); });
            // When column-reorder is present and the columns are moved, it is necessary to
            //  reassign all of the panes indexes to the new index of the column.
            this.s.dt.on('column-reorder.dtsp', function (e, settings, details) {
                _this.s.index = details.mapping[_this.s.index];
            });
            return this;
        }
        /**
         * Adds a row to the panes table
         *
         * @param display the value to be displayed to the user
         * @param filter the value to be filtered on when searchpanes is implemented
         * @param shown the number of rows in the table that are currently visible matching this criteria
         * @param total the total number of rows in the table that match this criteria
         * @param sort the value to be sorted in the pane table
         * @param type the value of which the type is to be derived from
         */
        SearchPane.prototype.addRow = function (display, filter, sort, type, className, total, shown) {
            if (!total) {
                total = this.s.rowData.bins[filter] ?
                    this.s.rowData.bins[filter] :
                    0;
            }
            if (!shown) {
                shown = this._getShown(filter);
            }
            var index;
            for (var _i = 0, _a = this.s.indexes; _i < _a.length; _i++) {
                var entry = _a[_i];
                if (entry.filter === filter) {
                    index = entry.index;
                }
            }
            if (index === undefined) {
                index = this.s.indexes.length;
                this.s.indexes.push({ filter: filter, index: index });
            }
            return this.s.dtPane.row.add({
                className: className,
                display: display !== '' ?
                    display :
                    this.emptyMessage(),
                filter: filter,
                index: index,
                shown: shown,
                sort: sort,
                total: total,
                type: type
            });
        };
        /**
         * Adjusts the layout of the top row when the screen is resized
         */
        SearchPane.prototype.adjustTopRow = function () {
            var subContainers = this.dom.container.find('.' + this.classes.subRowsContainer.replace(/\s+/g, '.'));
            var subRow1 = this.dom.container.find('.' + this.classes.subRow1.replace(/\s+/g, '.'));
            var subRow2 = this.dom.container.find('.' + this.classes.subRow2.replace(/\s+/g, '.'));
            var topRow = this.dom.container.find('.' + this.classes.topRow.replace(/\s+/g, '.'));
            // If the width is 0 then it is safe to assume that the pane has not yet been displayed.
            //  Even if it has, if the width is 0 it won't make a difference if it has the narrow class or not
            if (($$5(subContainers[0]).width() < 252 || $$5(topRow[0]).width() < 252) && $$5(subContainers[0]).width() !== 0) {
                $$5(subContainers[0]).addClass(this.classes.narrow);
                $$5(subRow1[0]).addClass(this.classes.narrowSub).removeClass(this.classes.narrowSearch);
                $$5(subRow2[0]).addClass(this.classes.narrowSub).removeClass(this.classes.narrowButton);
            }
            else {
                $$5(subContainers[0]).removeClass(this.classes.narrow);
                $$5(subRow1[0]).removeClass(this.classes.narrowSub).addClass(this.classes.narrowSearch);
                $$5(subRow2[0]).removeClass(this.classes.narrowSub).addClass(this.classes.narrowButton);
            }
        };
        /**
         * In the case of a rebuild there is potential for new data to have been included or removed
         * so all of the rowData must be reset as a precaution.
         */
        SearchPane.prototype.clearData = function () {
            this.s.rowData = {
                arrayFilter: [],
                arrayOriginal: [],
                bins: {},
                binsOriginal: {},
                filterMap: new Map(),
                totalOptions: 0
            };
        };
        /**
         * Clear the selections in the pane
         */
        SearchPane.prototype.clearPane = function () {
            // Deselect all rows which are selected and update the table and filter count.
            this.s.dtPane.rows({ selected: true }).deselect();
            this.updateTable();
            return this;
        };
        /**
         * Collapses the pane so that only the header is displayed
         */
        SearchPane.prototype.collapse = function () {
            var _this = this;
            if (!this.s.displayed ||
                (
                // If collapsing is disabled globally, and not enabled specifically for this column
                !this.c.collapse && this.s.colOpts.collapse !== true ||
                    // OR, collapsing could be enabled globally and this column specifically
                    // is not to be collapsed.
                    // We can't just take !this.s.colOpts.collapse here as if it is undefined
                    // then the global should be used
                    this.s.colOpts.collapse === false)) {
                return;
            }
            $$5(this.s.dtPane.table().container()).addClass(this.classes.hidden);
            this.dom.topRow.addClass(this.classes.bordered);
            this.dom.nameButton.addClass(this.classes.disabledButton);
            this.dom.countButton.addClass(this.classes.disabledButton);
            this.dom.searchButton.addClass(this.classes.disabledButton);
            this.dom.collapseButton.addClass(this.classes.rotated);
            this.dom.topRow.one('click.dtsp', function () { return _this.show(); });
            this.dom.topRow.trigger('collapse.dtsps');
        };
        /**
         * Strips all of the SearchPanes elements from the document and turns all of the listeners for the buttons off
         */
        SearchPane.prototype.destroy = function () {
            if (this.s.dtPane) {
                this.s.dtPane.off('.dtsp');
            }
            this.s.dt.off('.dtsp');
            this.dom.clear.off('.dtsp');
            this.dom.nameButton.off('.dtsp');
            this.dom.countButton.off('.dtsp');
            this.dom.searchButton.off('.dtsp');
            this.dom.collapseButton.off('.dtsp');
            $$5(this.s.dt.table().node()).off('.dtsp');
            this.dom.container.detach();
            var searchIdx = $$5.fn.dataTable.ext.search.indexOf(this.s.searchFunction);
            while (searchIdx !== -1) {
                $$5.fn.dataTable.ext.search.splice(searchIdx, 1);
                searchIdx = $$5.fn.dataTable.ext.search.indexOf(this.s.searchFunction);
            }
            // If the datatables have been defined for the panes then also destroy these
            if (this.s.dtPane) {
                this.s.dtPane.destroy();
            }
            this.s.listSet = false;
        };
        /**
         * Getting the legacy message is a little complex due a legacy parameter
         */
        SearchPane.prototype.emptyMessage = function () {
            var def = this.c.i18n.emptyMessage;
            // Legacy parameter support
            if (this.c.emptyMessage) {
                def = this.c.emptyMessage;
            }
            // Override per column
            if (this.s.colOpts.emptyMessage !== false && this.s.colOpts.emptyMessage !== null) {
                def = this.s.colOpts.emptyMessage;
            }
            return this.s.dt.i18n('searchPanes.emptyMessage', def);
        };
        /**
         * Updates the number of filters that have been applied in the title
         */
        SearchPane.prototype.getPaneCount = function () {
            return this.s.dtPane ?
                this.s.dtPane.rows({ selected: true }).data().toArray().length :
                0;
        };
        /**
         * Rebuilds the panes from the start having deleted the old ones
         *
         * @param? dataIn data to be used in buildPane
         * @param? maintainSelection Whether the current selections are to be maintained over rebuild
         */
        SearchPane.prototype.rebuildPane = function (dataIn, maintainSelection) {
            if (dataIn === void 0) { dataIn = null; }
            if (maintainSelection === void 0) { maintainSelection = false; }
            this.clearData();
            var selectedRows = [];
            this.s.serverSelect = [];
            var prevEl = null;
            // When rebuilding strip all of the HTML Elements out of the container and start from scratch
            if (this.s.dtPane) {
                if (maintainSelection) {
                    if (!this.s.dt.page.info().serverSide) {
                        selectedRows = this.s.dtPane.rows({ selected: true }).data().toArray();
                    }
                    else {
                        this.s.serverSelect = this.s.dtPane.rows({ selected: true }).data().toArray();
                    }
                }
                this.s.dtPane.clear().destroy();
                prevEl = this.dom.container.prev();
                this.destroy();
                this.s.dtPane = undefined;
                $$5.fn.dataTable.ext.search.push(this.s.searchFunction);
            }
            this.dom.container.removeClass(this.classes.hidden);
            this.s.displayed = false;
            this._buildPane(!this.s.dt.page.info().serverSide ?
                selectedRows :
                this.s.serverSelect, dataIn, prevEl);
            return this;
        };
        /**
         * Resizes the pane based on the layout that is passed in
         *
         * @param layout the layout to be applied to this pane
         */
        SearchPane.prototype.resize = function (layout) {
            this.c.layout = layout;
            this.dom.container
                .removeClass()
                .addClass(this.classes.show)
                .addClass(this.classes.container)
                .addClass(this.s.colOpts.className)
                .addClass(this.classes.layout +
                (parseInt(layout.split('-')[1], 10) < 10 ?
                    layout :
                    layout.split('-')[0] + '-9'))
                .addClass(this.s.customPaneSettings !== null && this.s.customPaneSettings.className
                ? this.s.customPaneSettings.className
                : '');
            this.adjustTopRow();
        };
        /**
         * Sets the listeners for the pane.
         *
         * Having it in it's own function makes it easier to only set them once
         */
        SearchPane.prototype.setListeners = function () {
            var _this = this;
            if (!this.s.dtPane) {
                return;
            }
            // When an item is selected on the pane, add these to the array which holds selected items.
            // Custom search will perform.
            this.s.dtPane.off('select.dtsp').on('select.dtsp', function () {
                clearTimeout(_this.s.deselectTimeout);
                _this._updateSelection(!_this.s.updating);
                _this.dom.clear.removeClass(_this.classes.disabledButton).removeAttr('disabled');
            });
            // When an item is deselected on the pane, re add the currently selected items to the array
            // which holds selected items. Custom search will be performed.
            this.s.dtPane.off('deselect.dtsp').on('deselect.dtsp', function () {
                _this.s.deselectTimeout = setTimeout(function () {
                    _this._updateSelection(true);
                    if (_this.s.dtPane.rows({ selected: true }).data().toArray().length === 0) {
                        _this.dom.clear.addClass(_this.classes.disabledButton).attr('disabled', 'true');
                    }
                }, 50);
            });
            // If we attempty to turn off this event then it will ruin behaviour in other panes
            //  so need to make sure that it is only done once
            if (this.s.firstSet) {
                this.s.firstSet = false;
                // When saving the state store all of the selected rows for preselection next time around
                this.s.dt.on('stateSaveParams.dtsp', function (e, settings, data) {
                    // If the data being passed in is empty then state clear must have occured
                    // so clear the panes state as well
                    if ($$5.isEmptyObject(data)) {
                        _this.s.dtPane.state.clear();
                        return;
                    }
                    var bins;
                    var order;
                    var selected = [];
                    var collapsed;
                    var searchTerm;
                    var arrayFilter;
                    // Get all of the data needed for the state save from the pane
                    if (_this.s.dtPane) {
                        selected = _this.s.dtPane
                            .rows({ selected: true })
                            .data()
                            .map(function (item) { return item.filter !== null ? item.filter.toString() : null; })
                            .toArray();
                        searchTerm = _this.dom.searchBox.val();
                        order = _this.s.dtPane.order();
                        bins = _this.s.rowData.binsOriginal;
                        arrayFilter = _this.s.rowData.arrayOriginal;
                        collapsed = _this.dom.collapseButton.hasClass(_this.classes.rotated);
                    }
                    if (data.searchPanes === undefined) {
                        data.searchPanes = {};
                    }
                    if (data.searchPanes.panes === undefined) {
                        data.searchPanes.panes = [];
                    }
                    for (var i = 0; i < data.searchPanes.panes.length; i++) {
                        if (data.searchPanes.panes[i].id === _this.s.index) {
                            data.searchPanes.panes.splice(i, 1);
                            i--;
                        }
                    }
                    // Add the panes data to the state object
                    data.searchPanes.panes.push({
                        arrayFilter: arrayFilter,
                        bins: bins,
                        collapsed: collapsed,
                        id: _this.s.index,
                        order: order,
                        searchTerm: searchTerm,
                        selected: selected
                    });
                });
            }
            this.s.dtPane.off('user-select.dtsp').on('user-select.dtsp', function (e, _dt, type, cell, originalEvent) {
                originalEvent.stopPropagation();
            });
            this.s.dtPane.off('draw.dtsp').on('draw.dtsp', function () { return _this.adjustTopRow(); });
            // When the button to order by the name of the options is clicked then
            //  change the ordering to whatever it isn't currently
            this.dom.nameButton.off('click.dtsp').on('click.dtsp', function () {
                var currentOrder = _this.s.dtPane.order()[0][1];
                _this.s.dtPane.order([0, currentOrder === 'asc' ? 'desc' : 'asc']).draw();
                // This state save is required so that the ordering of the panes is maintained
                _this.s.dt.state.save();
            });
            // When the button to order by the number of entries in the column is clicked then
            //  change the ordering to whatever it isn't currently
            this.dom.countButton.off('click.dtsp').on('click.dtsp', function () {
                var currentOrder = _this.s.dtPane.order()[0][1];
                _this.s.dtPane.order([1, currentOrder === 'asc' ? 'desc' : 'asc']).draw();
                // This state save is required so that the ordering of the panes is maintained
                _this.s.dt.state.save();
            });
            // When the button to order by the number of entries in the column is clicked then
            //  change the ordering to whatever it isn't currently
            this.dom.collapseButton.off('click.dtsp').on('click.dtsp', function (e) {
                e.stopPropagation();
                var container = $$5(_this.s.dtPane.table().container());
                // Toggle the classes
                container.toggleClass(_this.classes.hidden);
                _this.dom.topRow.toggleClass(_this.classes.bordered);
                _this.dom.nameButton.toggleClass(_this.classes.disabledButton);
                _this.dom.countButton.toggleClass(_this.classes.disabledButton);
                _this.dom.searchButton.toggleClass(_this.classes.disabledButton);
                _this.dom.collapseButton.toggleClass(_this.classes.rotated);
                if (container.hasClass(_this.classes.hidden)) {
                    _this.dom.topRow.on('click.dtsp', function () { return _this.dom.collapseButton.click(); });
                }
                else {
                    _this.dom.topRow.off('click.dtsp');
                }
                _this.s.dt.state.save();
                _this.dom.topRow.trigger('collapse.dtsps');
            });
            // When the clear button is clicked reset the pane
            this.dom.clear.off('click.dtsp').on('click.dtsp', function () {
                var searches = _this.dom.container.find('.' + _this.classes.search.replace(/ /g, '.'));
                searches.each(function () {
                    // set the value of the search box to be an empty string and then search on that, effectively reseting
                    $$5(this).val('').trigger('input');
                });
                _this.clearPane();
            });
            // When the search button is clicked then draw focus to the search box
            this.dom.searchButton.off('click.dtsp').on('click.dtsp', function () { return _this.dom.searchBox.focus(); });
            // When a character is inputted into the searchbox search the pane for matching values.
            // Doing it this way means that no button has to be clicked to trigger a search, it is done asynchronously
            this.dom.searchBox.off('click.dtsp').on('input.dtsp', function () {
                var searchval = _this.dom.searchBox.val();
                _this.s.dtPane.search(searchval).draw();
                if (typeof searchval === 'string' &&
                    (searchval.length > 0 ||
                        searchval.length === 0 && _this.s.dtPane.rows({ selected: true }).data().toArray().length > 0)) {
                    _this.dom.clear.removeClass(_this.classes.disabledButton).removeAttr('disabled');
                }
                else {
                    _this.dom.clear.addClass(_this.classes.disabledButton).attr('disabled', 'true');
                }
                // This state save is required so that the searching on the panes is maintained
                _this.s.dt.state.save();
            });
            this.s.dtPane.select.style(this.s.colOpts.dtOpts && this.s.colOpts.dtOpts.select && this.s.colOpts.dtOpts.select.style
                ? this.s.colOpts.dtOpts.select.style
                : this.c.dtOpts && this.c.dtOpts.select && this.c.dtOpts.select.style
                    ? this.c.dtOpts.select.style
                    : 'os');
        };
        /**
         * Populates the SearchPane based off of the data that has been recieved from the server
         *
         * This method is overriden by SearchPaneST
         *
         * @param dataIn The data that has been sent from the server
         */
        SearchPane.prototype._serverPopulate = function (dataIn) {
            if (dataIn.tableLength) {
                this.s.tableLength = dataIn.tableLength;
                this.s.rowData.totalOptions = this.s.tableLength;
            }
            else if (this.s.tableLength === null || this.s.dt.rows()[0].length > this.s.tableLength) {
                this.s.tableLength = this.s.dt.rows()[0].length;
                this.s.rowData.totalOptions = this.s.tableLength;
            }
            var colTitle = this.s.dt.column(this.s.index).dataSrc();
            // If there is SP data for this column add it to the data array and bin
            if (dataIn.searchPanes.options[colTitle]) {
                for (var _i = 0, _a = dataIn.searchPanes.options[colTitle]; _i < _a.length; _i++) {
                    var dataPoint = _a[_i];
                    this.s.rowData.arrayFilter.push({
                        display: dataPoint.label,
                        filter: dataPoint.value,
                        sort: dataPoint.label,
                        type: dataPoint.label
                    });
                    this.s.rowData.bins[dataPoint.value] = dataPoint.total;
                }
            }
            var binLength = Object.keys(this.s.rowData.bins).length;
            var uniqueRatio = this._uniqueRatio(binLength, this.s.tableLength);
            // Don't show the pane if there isnt enough variance in the data, or there is only 1 entry for that pane
            if (this.s.displayed === false &&
                ((this.s.colOpts.show === undefined && this.s.colOpts.threshold === null ?
                    uniqueRatio > this.c.threshold :
                    uniqueRatio > this.s.colOpts.threshold) ||
                    this.s.colOpts.show !== true && binLength <= 1)) {
                this.dom.container.addClass(this.classes.hidden);
                this.s.displayed = false;
                return;
            }
            // Store the original data
            this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter;
            this.s.rowData.binsOriginal = this.s.rowData.bins;
            // Flag this pane as being displayed
            this.s.displayed = true;
        };
        /**
         * Expands the pane from the collapsed state
         */
        SearchPane.prototype.show = function () {
            if (!this.s.displayed) {
                return;
            }
            this.dom.topRow.removeClass(this.classes.bordered);
            this.dom.nameButton.removeClass(this.classes.disabledButton);
            this.dom.countButton.removeClass(this.classes.disabledButton);
            this.dom.searchButton.removeClass(this.classes.disabledButton);
            this.dom.collapseButton.removeClass(this.classes.rotated);
            $$5(this.s.dtPane.table().container()).removeClass(this.classes.hidden);
            this.dom.topRow.trigger('collapse.dtsps');
        };
        /**
         * Finds the ratio of the number of different options in the table to the number of rows
         *
         * @param bins the number of different options in the table
         * @param rowCount the total number of rows in the table
         * @returns {number} returns the ratio
         */
        SearchPane.prototype._uniqueRatio = function (bins, rowCount) {
            if (rowCount > 0 &&
                (this.s.rowData.totalOptions > 0 && !this.s.dt.page.info().serverSide ||
                    this.s.dt.page.info().serverSide && this.s.tableLength > 0)) {
                return bins / this.s.rowData.totalOptions;
            }
            return 1;
        };
        /**
         * Updates the panes if one of the options to do so has been set to true
         * rather than the filtered message when using viewTotal.
         */
        SearchPane.prototype.updateTable = function () {
            var selectedRows = this.s.dtPane.rows({ selected: true }).data().toArray().map(function (el) { return el.filter; });
            this.s.selections = selectedRows;
            this._searchExtras();
        };
        /**
         * Adds the custom options to the pane
         *
         * @returns {Array} Returns the array of rows which have been added to the pane
         */
        SearchPane.prototype._getComparisonRows = function () {
            // Find the appropriate options depending on whether this is a pane for a specific column or a custom pane
            var options = this.s.colOpts.options
                ? this.s.colOpts.options
                : this.s.customPaneSettings && this.s.customPaneSettings.options
                    ? this.s.customPaneSettings.options
                    : undefined;
            if (options === undefined) {
                return;
            }
            var allRows = this.s.dt.rows();
            var tableValsTotal = allRows.data().toArray();
            var rows = [];
            // Clear all of the other rows from the pane, only custom options are to be displayed when they are defined
            this.s.dtPane.clear();
            this.s.indexes = [];
            for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                var comp = options_1[_i];
                // Initialise the object which is to be placed in the row
                var insert = comp.label !== '' ?
                    comp.label :
                    this.emptyMessage();
                var comparisonObj = {
                    className: comp.className,
                    display: insert,
                    filter: typeof comp.value === 'function' ? comp.value : [],
                    sort: comp.order !== undefined
                        ? comp.order
                        : insert,
                    total: 0,
                    type: insert
                };
                // If a custom function is in place
                if (typeof comp.value === 'function') {
                    // Count the number of times the function evaluates to true for the original data in the Table
                    for (var i = 0; i < tableValsTotal.length; i++) {
                        if (comp.value.call(this.s.dt, tableValsTotal[i], allRows[0][i])) {
                            comparisonObj.total++;
                        }
                    }
                    // Update the comparisonObj
                    if (typeof comparisonObj.filter !== 'function') {
                        comparisonObj.filter.push(comp.filter);
                    }
                }
                rows.push(this.addRow(comparisonObj.display, comparisonObj.filter, comparisonObj.sort, comparisonObj.type, comparisonObj.className, comparisonObj.total));
            }
            return rows;
        };
        SearchPane.prototype._getMessage = function (row) {
            return this.s.dt.i18n('searchPanes.count', this.c.i18n.count).replace(/{total}/g, row.total);
        };
        /**
         * Overridden in SearchPaneViewTotal and SearchPaneCascade to get the number of times a specific value is shown
         *
         * Here it is blanked so that it takes no action
         *
         * @param filter The filter value
         * @returns undefined
         */
        SearchPane.prototype._getShown = function (filter) {
            return undefined;
        };
        /**
         * Get's the pane config appropriate to this class
         *
         * @returns The config needed to create a pane of this type
         */
        SearchPane.prototype._getPaneConfig = function () {
            var _this = this;
            // eslint-disable-next-line no-extra-parens
            var haveScroller = dataTable$2.Scroller;
            var langOpts = this.s.dt.settings()[0].oLanguage;
            langOpts.url = undefined;
            langOpts.sUrl = undefined;
            return {
                columnDefs: [
                    {
                        className: 'dtsp-nameColumn',
                        data: 'display',
                        render: function (data, type, row) {
                            if (type === 'sort') {
                                return row.sort;
                            }
                            else if (type === 'type') {
                                return row.type;
                            }
                            var message = _this._getMessage(row);
                            // We are displaying the count in the same columne as the name of the search option.
                            // This is so that there is not need to call columns.adjust()
                            //  which in turn speeds up the code
                            var pill = '<span class="' + _this.classes.pill + '">' + message + '</span>';
                            if (!_this.c.viewCount || !_this.s.colOpts.viewCount) {
                                pill = '';
                            }
                            if (type === 'filter') {
                                return typeof data === 'string' && data.match(/<[^>]*>/) !== null ?
                                    data.replace(/<[^>]*>/g, '') :
                                    data;
                            }
                            return '<div class="' + _this.classes.nameCont + '"><span title="' +
                                (typeof data === 'string' && data.match(/<[^>]*>/) !== null ?
                                    data.replace(/<[^>]*>/g, '') :
                                    data) +
                                '" class="' + _this.classes.name + '">' +
                                data + '</span>' +
                                pill + '</div>';
                        },
                        targets: 0,
                        // Accessing the private datatables property to set type based on the original table.
                        // This is null if not defined by the user, meaning that automatic type detection
                        //  would take place
                        type: this.s.dt.settings()[0].aoColumns[this.s.index] ?
                            this.s.dt.settings()[0].aoColumns[this.s.index]._sManualType :
                            null
                    },
                    {
                        className: 'dtsp-countColumn ' + this.classes.badgePill,
                        data: 'total',
                        searchable: false,
                        targets: 1,
                        visible: false
                    }
                ],
                deferRender: true,
                info: false,
                language: langOpts,
                paging: haveScroller ? true : false,
                scrollX: false,
                scrollY: '200px',
                scroller: haveScroller ? true : false,
                select: true,
                stateSave: this.s.dt.settings()[0].oFeatures.bStateSave ? true : false
            };
        };
        /**
         * This method allows for changes to the panes and table to be made when a selection or a deselection occurs
         */
        SearchPane.prototype._makeSelection = function () {
            this.updateTable();
            this.s.updating = true;
            this.s.dt.draw();
            this.s.updating = false;
        };
        /**
         * Populates an array with all of the data for the table
         *
         * @param rowIdx The current row index to be compared
         * @param arrayFilter The array that is to be populated with row Details
         * @param settings The DataTable settings object
         * @param bins The bins object that is to be populated with the row counts
         */
        SearchPane.prototype._populatePaneArray = function (rowIdx, arrayFilter, settings, bins) {
            if (bins === void 0) { bins = this.s.rowData.bins; }
            // Retrieve the rendered data from the cell using the fastData function
            // rather than the cell().render API method for optimisation
            var fastData = settings.fastData
                ? settings.fastData
                : function (row, col, orth) {
                    // Legacy DT1
                    return settings.oApi._fnGetCellData(settings, row, col, orth);
                };
            if (typeof this.s.colOpts.orthogonal === 'string') {
                var rendered = fastData(rowIdx, this.s.index, this.s.colOpts.orthogonal);
                this.s.rowData.filterMap.set(rowIdx, rendered);
                this._addOption(rendered, rendered, rendered, rendered, arrayFilter, bins);
                this.s.rowData.totalOptions++;
            }
            else {
                var filter = fastData(rowIdx, this.s.index, this.s.colOpts.orthogonal.search);
                // Null and empty string are to be considered the same value
                if (filter === null) {
                    filter = '';
                }
                if (typeof filter === 'string') {
                    filter = filter.replace(/<[^>]*>/g, '');
                }
                this.s.rowData.filterMap.set(rowIdx, filter);
                if (!bins[filter]) {
                    bins[filter] = 1;
                    this._addOption(filter, fastData(rowIdx, this.s.index, this.s.colOpts.orthogonal.display), fastData(rowIdx, this.s.index, this.s.colOpts.orthogonal.sort), fastData(rowIdx, this.s.index, this.s.colOpts.orthogonal.type), arrayFilter, bins);
                    this.s.rowData.totalOptions++;
                }
                else {
                    bins[filter]++;
                    this.s.rowData.totalOptions++;
                }
            }
        };
        /**
         * Reloads all of the previous selects into the panes
         *
         * @param loadedFilter The loaded filters from a previous state
         */
        SearchPane.prototype._reloadSelect = function (loadedFilter) {
            // If the state was not saved don't selected any
            if (loadedFilter === undefined) {
                return;
            }
            var idx;
            // For each pane, check that the loadedFilter list exists and is not null,
            // find the id of each search item and set it to be selected.
            for (var i = 0; i < loadedFilter.searchPanes.panes.length; i++) {
                if (loadedFilter.searchPanes.panes[i].id === this.s.index) {
                    idx = i;
                    break;
                }
            }
            if (idx) {
                var table = this.s.dtPane;
                var rows = table.rows({ order: 'index' }).data().map(function (item) { return item.filter !== null ?
                    item.filter.toString() :
                    null; }).toArray();
                for (var _i = 0, _a = loadedFilter.searchPanes.panes[idx].selected; _i < _a.length; _i++) {
                    var filter = _a[_i];
                    var id = -1;
                    if (filter !== null) {
                        id = rows.indexOf(filter.toString());
                    }
                    if (id > -1) {
                        this.s.serverSelecting = true;
                        table.row(id).select();
                        this.s.serverSelecting = false;
                    }
                }
            }
        };
        /**
         * Notes the rows that have been selected within this pane and stores them internally
         *
         * @param notUpdating Whether the panes are updating themselves or not
         */
        SearchPane.prototype._updateSelection = function (notUpdating) {
            var _this = this;
            var processing = function (state) {
                if (DataTable.versionCheck('2')) {
                    _this.s.dt.processing(state);
                }
                else {
                    // Legacy v1
                    var settings = _this.s.dt.settings()[0];
                    var oApi = settings.oApi;
                    oApi._fnProcessingDisplay(settings, false);
                }
            };
            var run = function () {
                _this.s.scrollTop = $$5(_this.s.dtPane.table().node()).parent()[0].scrollTop;
                if (_this.s.dt.page.info().serverSide && !_this.s.updating) {
                    if (!_this.s.serverSelecting) {
                        _this.s.serverSelect = _this.s.dtPane.rows({ selected: true }).data().toArray();
                        _this.s.dt.draw(false);
                    }
                }
                else if (notUpdating) {
                    _this._makeSelection();
                }
                processing(false);
            };
            processing(true);
            setTimeout(run, 1);
        };
        /**
         * Takes in potentially undetected rows and adds them to the array if they are not yet featured
         *
         * @param filter the filter value of the potential row
         * @param display the display value of the potential row
         * @param sort the sort value of the potential row
         * @param type the type value of the potential row
         * @param arrayFilter the array to be populated
         * @param bins the bins to be populated
         */
        SearchPane.prototype._addOption = function (filter, display, sort, type, arrayFilter, bins) {
            // If the filter is an array then take a note of this, and add the elements to the arrayFilter array
            if (Array.isArray(filter) || filter instanceof dataTable$2.Api) {
                // Convert to an array so that we can work with it
                if (filter instanceof dataTable$2.Api) {
                    filter = filter.toArray();
                    display = display.toArray();
                }
                if (filter.length === display.length) {
                    for (var i = 0; i < filter.length; i++) {
                        // If we haven't seen this row before add it
                        if (!bins[filter[i]]) {
                            bins[filter[i]] = 1;
                            arrayFilter.push({
                                display: display[i],
                                filter: filter[i],
                                sort: sort[i],
                                type: type[i]
                            });
                        }
                        // Otherwise just increment the count
                        else {
                            bins[filter[i]]++;
                        }
                        this.s.rowData.totalOptions++;
                    }
                    return;
                }
                throw new Error('display and filter not the same length');
            }
            // If the values were affected by othogonal data and are not an array then check if it is already present
            else if (typeof this.s.colOpts.orthogonal === 'string') {
                if (!bins[filter]) {
                    bins[filter] = 1;
                    arrayFilter.push({
                        display: display,
                        filter: filter,
                        sort: sort,
                        type: type
                    });
                    this.s.rowData.totalOptions++;
                }
                else {
                    bins[filter]++;
                    this.s.rowData.totalOptions++;
                }
            }
            // Otherwise we must just be adding an option
            else {
                arrayFilter.push({
                    display: display,
                    filter: filter,
                    sort: sort,
                    type: type
                });
            }
        };
        /**
         * Method to construct the actual pane.
         *
         * @param selectedRows previously selected Rows to be reselected
         * @param dataIn Data that should be used to populate this pane
         * @param prevEl Reference to the previous element, used to ensure insert is in the correct location
         * @returns boolean to indicate whether this pane was the last one to have a selection made
         */
        SearchPane.prototype._buildPane = function (selectedRows, dataIn, prevEl) {
            var _this = this;
            if (selectedRows === void 0) { selectedRows = []; }
            if (dataIn === void 0) { dataIn = null; }
            if (prevEl === void 0) { prevEl = null; }
            // Aliases
            this.s.selections = [];
            // Other Variables
            var loadedFilter = this.s.dt.state.loaded();
            var row;
            // If the listeners have not been set yet then using the latest state may result in funny errors
            if (this.s.listSet) {
                loadedFilter = this.s.dt.state();
            }
            // If it is not a custom pane in place
            if (this.s.colExists) {
                var idx = -1;
                if (loadedFilter && loadedFilter.searchPanes && loadedFilter.searchPanes.panes) {
                    for (var i = 0; i < loadedFilter.searchPanes.panes.length; i++) {
                        if (loadedFilter.searchPanes.panes[i].id === this.s.index) {
                            idx = i;
                            break;
                        }
                    }
                }
                // Perform checks that do not require populate pane to run
                if ((this.s.colOpts.show === false ||
                    this.s.colOpts.show !== undefined && this.s.colOpts.show !== true) &&
                    idx === -1) {
                    this.dom.container.addClass(this.classes.hidden);
                    this.s.displayed = false;
                    return false;
                }
                else if (this.s.colOpts.show === true || idx !== -1) {
                    this.s.displayed = true;
                }
                if (!this.s.dt.page.info().serverSide &&
                    (!dataIn ||
                        !dataIn.searchPanes ||
                        !dataIn.searchPanes.options)) {
                    // Only run populatePane if the data has not been collected yet
                    if (this.s.rowData.arrayFilter.length === 0) {
                        this.s.rowData.totalOptions = 0;
                        this._populatePane();
                        this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter;
                        this.s.rowData.binsOriginal = this.s.rowData.bins;
                    }
                    var binLength = Object.keys(this.s.rowData.binsOriginal).length;
                    var uniqueRatio = this._uniqueRatio(binLength, this.s.dt.rows()[0].length);
                    // Don't show the pane if there isn't enough variance in the data, or there is only 1 entry
                    //  for that pane
                    if (this.s.displayed === false &&
                        ((this.s.colOpts.show === undefined && this.s.colOpts.threshold === null ?
                            uniqueRatio > this.c.threshold :
                            uniqueRatio > this.s.colOpts.threshold) ||
                            this.s.colOpts.show !== true && binLength <= 1)) {
                        this.dom.container.addClass(this.classes.hidden);
                        this.s.displayed = false;
                        return;
                    }
                    this.dom.container.addClass(this.classes.show);
                    this.s.displayed = true;
                }
                else if (dataIn && dataIn.searchPanes && dataIn.searchPanes.options) {
                    this._serverPopulate(dataIn);
                }
            }
            else {
                this.s.displayed = true;
            }
            // If the variance is accceptable then display the search pane
            this._displayPane();
            if (!this.s.listSet) {
                // Here, when the state is loaded if the data object on the original table is empty,
                //  then a state.clear() must have occurred, so delete all of the panes tables state objects too.
                this.dom.dtP.on('stateLoadParams.dtsp', function (e, settings, data) {
                    if ($$5.isEmptyObject(_this.s.dt.state.loaded())) {
                        $$5.each(data, function (index) {
                            delete data[index];
                        });
                    }
                });
            }
            // Add the container to the document in its original location
            if (prevEl !== null && this.dom.panesContainer.has(prevEl).length > 0) {
                this.dom.container.insertAfter(prevEl);
            }
            else {
                this.dom.panesContainer.prepend(this.dom.container);
            }
            // Declare the datatable for the pane
            var errMode = $$5.fn.dataTable.ext.errMode;
            $$5.fn.dataTable.ext.errMode = 'none';
            // eslint-disable-next-line no-extra-parens
            // For async loading of a DataTable (e.g. language file)
            // we need to set the select style to make sure the event
            // handlers are added.
            this.dom.dtP.on('init.dt', function (e, s) {
                var dt = _this.dom.dtP.DataTable();
                var style = dt.select.style();
                dt.select.style(style);
            });
            this.s.dtPane = this.dom.dtP.DataTable($$5.extend(true, this._getPaneConfig(), this.c.dtOpts, this.s.colOpts ? this.s.colOpts.dtOpts : {}, this.s.colOpts.options || !this.s.colExists ?
                {
                    createdRow: function (row, data) {
                        $$5(row).addClass(data.className);
                    }
                } :
                undefined, this.s.customPaneSettings !== null && this.s.customPaneSettings.dtOpts ?
                this.s.customPaneSettings.dtOpts :
                {}, $$5.fn.dataTable.versionCheck('2')
                ? {
                    layout: {
                        bottomStart: null,
                        bottomEnd: null,
                        topStart: null,
                        topEnd: null
                    }
                }
                : { dom: 't' }));
            this.dom.dtP.addClass(this.classes.table);
            // Getting column titles is a little messy
            var headerText = 'Custom Pane';
            if (this.s.customPaneSettings && this.s.customPaneSettings.header) {
                headerText = this.s.customPaneSettings.header;
            }
            else if (this.s.colOpts.header) {
                headerText = this.s.colOpts.header;
            }
            else if (this.s.colExists) {
                headerText = $$5.fn.dataTable.versionCheck('2')
                    ? this.s.dt.column(this.s.index).title()
                    : this.s.dt.settings()[0].aoColumns[this.s.index].sTitle;
            }
            headerText = this._escapeHTML(headerText);
            this.dom.searchBox.attr('placeholder', headerText);
            $$5.fn.dataTable.ext.errMode = errMode;
            // If it is not a custom pane
            if (this.s.colExists) {
                // Add all of the search options to the pane
                for (var j = 0, jen = this.s.rowData.arrayFilter.length; j < jen; j++) {
                    if (this.s.dt.page.info().serverSide) {
                        row = this.addRow(this.s.rowData.arrayFilter[j].display, this.s.rowData.arrayFilter[j].filter, this.s.rowData.arrayFilter[j].sort, this.s.rowData.arrayFilter[j].type);
                        for (var _i = 0, _a = this.s.serverSelect; _i < _a.length; _i++) {
                            var option = _a[_i];
                            if (option.filter === this.s.rowData.arrayFilter[j].filter) {
                                this.s.serverSelecting = true;
                                row.select();
                                this.s.serverSelecting = false;
                            }
                        }
                    }
                    else if (!this.s.dt.page.info().serverSide && this.s.rowData.arrayFilter[j]) {
                        this.addRow(this.s.rowData.arrayFilter[j].display, this.s.rowData.arrayFilter[j].filter, this.s.rowData.arrayFilter[j].sort, this.s.rowData.arrayFilter[j].type);
                    }
                    else if (!this.s.dt.page.info().serverSide) {
                        // Just pass an empty string as the message will be calculated based on that in addRow()
                        this.addRow('', '', '', '');
                    }
                }
            }
            // If there are custom options set or it is a custom pane then get them
            if (this.s.colOpts.options ||
                this.s.customPaneSettings && this.s.customPaneSettings.options) {
                this._getComparisonRows();
            }
            // Display the pane
            this.s.dtPane.draw();
            this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop;
            this.adjustTopRow();
            this.setListeners();
            this.s.listSet = true;
            for (var _b = 0, selectedRows_1 = selectedRows; _b < selectedRows_1.length; _b++) {
                var selection = selectedRows_1[_b];
                if (selection) {
                    for (var _c = 0, _d = this.s.dtPane.rows().indexes().toArray(); _c < _d.length; _c++) {
                        row = _d[_c];
                        if (this.s.dtPane.row(row).data() &&
                            selection.filter === this.s.dtPane.row(row).data().filter) {
                            // If this is happening when serverSide processing is happening then
                            //  different behaviour is needed
                            if (this.s.dt.page.info().serverSide) {
                                this.s.serverSelecting = true;
                                this.s.dtPane.row(row).select();
                                this.s.serverSelecting = false;
                            }
                            else {
                                this.s.dtPane.row(row).select();
                            }
                        }
                    }
                }
            }
            //  If SSP and the table is ready, apply the search for the pane
            if (this.s.dt.page.info().serverSide) {
                this.s.dtPane.search(this.dom.searchBox.val()).draw();
            }
            if ((this.c.initCollapsed && this.s.colOpts.initCollapsed !== false ||
                this.s.colOpts.initCollapsed) &&
                (this.c.collapse && this.s.colOpts.collapse !== false ||
                    this.s.colOpts.collapse)) {
                // If the pane has not initialised yet then we need to wait for it to do so before collapsing
                // Otherwise the container that the class is added to does not exist
                if (this.s.dtPane.settings()[0]._bInitComplete) {
                    this.collapse();
                }
                else {
                    this.s.dtPane.one('init', function () { return _this.collapse(); });
                }
            }
            // Reload the selection, searchbox entry and ordering from the previous state
            // Need to check here if SSP that this is the first draw, otherwise it will infinite loop
            if (loadedFilter &&
                loadedFilter.searchPanes &&
                loadedFilter.searchPanes.panes &&
                (!dataIn ||
                    dataIn.draw === 1)) {
                this._reloadSelect(loadedFilter);
                for (var _e = 0, _f = loadedFilter.searchPanes.panes; _e < _f.length; _e++) {
                    var pane = _f[_e];
                    if (pane.id === this.s.index) {
                        // Save some time by only triggering an input if there is a value
                        if (pane.searchTerm && pane.searchTerm.length > 0) {
                            this.dom.searchBox.val(pane.searchTerm).trigger('input');
                        }
                        if (pane.order) {
                            this.s.dtPane.order(pane.order).draw();
                        }
                        // Is the pane to be hidden or shown?
                        if (pane.collapsed) {
                            this.collapse();
                        }
                        else {
                            this.show();
                        }
                    }
                }
            }
            return true;
        };
        /**
         * Appends all of the HTML elements to their relevant parent Elements
         */
        SearchPane.prototype._displayPane = function () {
            // Empty everything to start again
            this.dom.dtP.empty();
            this.dom.topRow.empty().addClass(this.classes.topRow);
            // If there are more than 3 columns defined then make there be a smaller gap between the panes
            if (parseInt(this.c.layout.split('-')[1], 10) > 3) {
                this.dom.container.addClass(this.classes.smallGap);
            }
            this.dom.topRow
                .addClass(this.classes.subRowsContainer)
                .append(this.dom.upper.append(this.dom.searchCont))
                .append(this.dom.lower.append(this.dom.buttonGroup));
            // If no selections have been made in the pane then disable the clear button
            if (this.c.dtOpts.searching === false ||
                this.s.colOpts.dtOpts && this.s.colOpts.dtOpts.searching === false ||
                (!this.c.controls || !this.s.colOpts.controls) ||
                this.s.customPaneSettings &&
                    this.s.customPaneSettings.dtOpts &&
                    this.s.customPaneSettings.dtOpts.searching !== undefined &&
                    !this.s.customPaneSettings.dtOpts.searching) {
                this.dom.searchBox
                    .removeClass(this.classes.paneInputButton)
                    .addClass(this.classes.disabledButton)
                    .attr('disabled', 'true');
            }
            this.dom.searchBox.appendTo(this.dom.searchCont);
            // Create the contents of the searchCont div. Worth noting that this function will change when using semantic ui
            this._searchContSetup();
            // If the clear button is allowed to show then display it
            if (this.c.clear && this.c.controls && this.s.colOpts.controls) {
                this.dom.clear.appendTo(this.dom.buttonGroup);
            }
            if (this.c.orderable && this.s.colOpts.orderable && this.c.controls && this.s.colOpts.controls) {
                this.dom.nameButton.appendTo(this.dom.buttonGroup);
            }
            // If the count column is hidden then don't display the ordering button for it
            if (this.c.viewCount &&
                this.s.colOpts.viewCount &&
                this.c.orderable &&
                this.s.colOpts.orderable &&
                this.c.controls &&
                this.s.colOpts.controls) {
                this.dom.countButton.appendTo(this.dom.buttonGroup);
            }
            if ((this.c.collapse && this.s.colOpts.collapse !== false ||
                this.s.colOpts.collapse) &&
                this.c.controls && this.s.colOpts.controls) {
                this.dom.collapseButton.appendTo(this.dom.buttonGroup);
            }
            this.dom.container.prepend(this.dom.topRow).append(this.dom.dtP).show();
        };
        /**
         * Escape html characters within a string
         *
         * @param txt the string to be escaped
         * @returns the escaped string
         */
        SearchPane.prototype._escapeHTML = function (txt) {
            return txt
                .toString()
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&');
        };
        /**
         * Gets the options for the row for the customPanes
         *
         * @returns {object} The options for the row extended to include the options from the user.
         */
        SearchPane.prototype._getBonusOptions = function () {
            // We need to reset the thresholds as if they have a value in colOpts then that value will be used
            var defaultMutator = {
                threshold: null
            };
            return $$5.extend(true, {}, SearchPane.defaults, defaultMutator, this.c ? this.c : {});
        };
        /**
         * Gets the options for the row for the customPanes
         *
         * @returns {object} The options for the row extended to include the options from the user.
         */
        SearchPane.prototype._getOptions = function () {
            var table = this.s.dt;
            // We need to reset the thresholds as if they have a value in colOpts then that value will be used
            var defaultMutator = {
                collapse: null,
                emptyMessage: false,
                initCollapsed: null,
                threshold: null
            };
            var columnOptions = table.settings()[0].aoColumns[this.s.index].searchPanes;
            var colOpts = $$5.extend(true, {}, SearchPane.defaults, defaultMutator, columnOptions);
            if (columnOptions && columnOptions.hideCount && columnOptions.viewCount === undefined) {
                colOpts.viewCount = !columnOptions.hideCount;
            }
            return colOpts;
        };
        /**
         * Fill the array with the values that are currently being displayed in the table
         */
        SearchPane.prototype._populatePane = function () {
            this.s.rowData.arrayFilter = [];
            this.s.rowData.bins = {};
            var settings = this.s.dt.context[0];
            if (!this.s.dt.page.info().serverSide) {
                for (var _i = 0, _a = this.s.dt.rows().indexes().toArray(); _i < _a.length; _i++) {
                    var index = _a[_i];
                    this._populatePaneArray(index, this.s.rowData.arrayFilter, settings);
                }
            }
        };
        /**
         * This method decides whether a row should contribute to the pane or not
         *
         * @param filter the value that the row is to be filtered on
         * @param dataIndex the row index
         */
        SearchPane.prototype._search = function (filter, dataIndex) {
            var colOpts = this.s.colOpts;
            var table = this.s.dt;
            // For each item selected in the pane, check if it is available in the cell
            for (var _i = 0, _a = this.s.selections; _i < _a.length; _i++) {
                var colSelect = _a[_i];
                if (typeof colSelect === 'string' && typeof filter === 'string') {
                    // The filter value will not have the &amp; in place but a &,
                    // so we need to do a replace to make sure that they will match
                    colSelect = this._escapeHTML(colSelect);
                }
                // if the filter is an array then is the column present in it
                if (Array.isArray(filter)) {
                    if (colOpts.combiner === 'and') {
                        if (!filter.includes(colSelect)) {
                            return false;
                        }
                    }
                    else if (filter.includes(colSelect)) {
                        return true;
                    }
                }
                // if the filter is a function then does it meet the criteria of that function or not
                else if (typeof colSelect === 'function') {
                    if (colSelect.call(table, table.row(dataIndex).data(), dataIndex)) {
                        if (colOpts.combiner === 'or') {
                            return true;
                        }
                    }
                    // If the combiner is an "and" then we need to check against all possible selections
                    // so if it fails here then the and is not met and return false
                    else if (colOpts.combiner === 'and') {
                        return false;
                    }
                }
                // otherwise if the two filter values are equal then return true
                else if (filter === colSelect ||
                    // Loose type checking incase number type in column comparing to a string
                    // eslint-disable-next-line eqeqeq
                    !(typeof filter === 'string' && filter.length === 0) && filter == colSelect ||
                    colSelect === null && typeof filter === 'string' && filter === '') {
                    return true;
                }
            }
            // If the combiner is an and then we need to check against all possible selections
            // so return true here if so because it would have returned false earlier if it had failed
            if (colOpts.combiner === 'and') {
                return true;
            }
            // Otherwise it hasn't matched with anything by this point so it must be false
            return false;
        };
        /**
         * Creates the contents of the searchCont div
         *
         * NOTE This is overridden when semantic ui styling in order to integrate the search button into the text box.
         */
        SearchPane.prototype._searchContSetup = function () {
            if (this.c.controls && this.s.colOpts.controls) {
                this.dom.searchButton.appendTo(this.dom.searchLabelCont);
            }
            if (!(this.c.dtOpts.searching === false ||
                this.s.colOpts.dtOpts.searching === false ||
                this.s.customPaneSettings &&
                    this.s.customPaneSettings.dtOpts &&
                    this.s.customPaneSettings.dtOpts.searching !== undefined &&
                    !this.s.customPaneSettings.dtOpts.searching)) {
                this.dom.searchLabelCont.appendTo(this.dom.searchCont);
            }
        };
        /**
         * Adds outline to the pane when a selection has been made
         */
        SearchPane.prototype._searchExtras = function () {
            var updating = this.s.updating;
            this.s.updating = true;
            var filters = this.s.dtPane.rows({ selected: true }).data().pluck('filter').toArray();
            var nullIndex = filters.indexOf(this.emptyMessage());
            var container = $$5(this.s.dtPane.table().container());
            // If null index is found then search for empty cells as a filter.
            if (nullIndex > -1) {
                filters[nullIndex] = '';
            }
            // If a filter has been applied then outline the respective pane, remove it when it no longer is.
            if (filters.length > 0) {
                container.addClass(this.classes.selected);
            }
            else if (filters.length === 0) {
                container.removeClass(this.classes.selected);
            }
            this.s.updating = updating;
        };
        SearchPane.version = '2.1.2';
        SearchPane.classes = {
            bordered: 'dtsp-bordered',
            buttonGroup: 'dtsp-buttonGroup',
            buttonSub: 'dtsp-buttonSub',
            caret: 'dtsp-caret',
            clear: 'dtsp-clear',
            clearAll: 'dtsp-clearAll',
            clearButton: 'clearButton',
            collapseAll: 'dtsp-collapseAll',
            collapseButton: 'dtsp-collapseButton',
            container: 'dtsp-searchPane',
            countButton: 'dtsp-countButton',
            disabledButton: 'dtsp-disabledButton',
            hidden: 'dtsp-hidden',
            hide: 'dtsp-hide',
            layout: 'dtsp-',
            name: 'dtsp-name',
            nameButton: 'dtsp-nameButton',
            nameCont: 'dtsp-nameCont',
            narrow: 'dtsp-narrow',
            paneButton: 'dtsp-paneButton',
            paneInputButton: 'dtsp-paneInputButton',
            pill: 'dtsp-pill',
            rotated: 'dtsp-rotated',
            search: 'dtsp-search',
            searchCont: 'dtsp-searchCont',
            searchIcon: 'dtsp-searchIcon',
            searchLabelCont: 'dtsp-searchButtonCont',
            selected: 'dtsp-selected',
            smallGap: 'dtsp-smallGap',
            subRow1: 'dtsp-subRow1',
            subRow2: 'dtsp-subRow2',
            subRowsContainer: 'dtsp-subRowsContainer',
            title: 'dtsp-title',
            topRow: 'dtsp-topRow'
        };
        // Define SearchPanes default options
        SearchPane.defaults = {
            clear: true,
            collapse: true,
            combiner: 'or',
            container: function (dt) {
                return dt.table().container();
            },
            controls: true,
            dtOpts: {},
            emptyMessage: null,
            hideCount: false,
            i18n: {
                clearPane: '&times;',
                count: '{total}',
                emptyMessage: '<em>No data</em>'
            },
            initCollapsed: false,
            layout: 'auto',
            name: undefined,
            orderable: true,
            orthogonal: {
                display: 'display',
                filter: 'filter',
                hideCount: false,
                search: 'filter',
                show: undefined,
                sort: 'sort',
                threshold: 0.6,
                type: 'type',
                viewCount: true
            },
            preSelect: [],
            threshold: 0.6,
            viewCount: true
        };
        return SearchPane;
    }());

    var __extends$4 = (window && window.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var SearchPaneST = /** @class */ (function (_super) {
        __extends$4(SearchPaneST, _super);
        function SearchPaneST(paneSettings, opts, index, panesContainer, panes) {
            return _super.call(this, paneSettings, opts, index, panesContainer, panes) || this;
        }
        /**
         * When server-side processing is enabled, SP will remove rows and then readd them,
         * resulting in Select's reference to the last selected cell being lost.
         * This function is provided to update that reference.
         *
         * @returns Function
         */
        SearchPaneST.prototype._emptyPane = function () {
            var dt = this.s.dtPane;
            if (DataTable.versionCheck('2')) {
                var last = dt.select.last();
                var selectedIndex_1;
                if (last && dt.row(last.row).any()) {
                    selectedIndex_1 = dt.row(last.row).data().index;
                }
                dt.rows().remove();
                return function () {
                    if (selectedIndex_1 !== undefined) {
                        var idx = dt.row(function (i, data) { return data.index === selectedIndex_1; }).index();
                        dt.select.last({ row: idx, column: 0 });
                    }
                };
            }
            dt.rows().remove();
            return function () { };
        };
        /**
         * Populates the SearchPane based off of the data that has been recieved from the server
         *
         * This method overrides SearchPane's _serverPopulate() method
         *
         * @param dataIn The data that has been sent from the server
         */
        SearchPaneST.prototype._serverPopulate = function (dataIn) {
            var selection, row, data;
            this.s.rowData.binsShown = {};
            this.s.rowData.arrayFilter = [];
            if (dataIn.tableLength !== undefined) {
                this.s.tableLength = dataIn.tableLength;
                this.s.rowData.totalOptions = this.s.tableLength;
            }
            else if (this.s.tableLength === null || this.s.dt.rows()[0].length > this.s.tableLength) {
                this.s.tableLength = this.s.dt.rows()[0].length;
                this.s.rowData.totalOptions = this.s.tableLength;
            }
            var colTitle = this.s.dt.column(this.s.index).dataSrc();
            // If there is SP data for this column add it to the data array and bin
            if (dataIn.searchPanes.options[colTitle] !== undefined) {
                for (var _i = 0, _a = dataIn.searchPanes.options[colTitle]; _i < _a.length; _i++) {
                    var dataPoint = _a[_i];
                    this.s.rowData.arrayFilter.push({
                        display: dataPoint.label,
                        filter: dataPoint.value,
                        shown: +dataPoint.count,
                        sort: dataPoint.label,
                        total: +dataPoint.total,
                        type: dataPoint.label
                    });
                    this.s.rowData.binsShown[dataPoint.value] = +dataPoint.count;
                    this.s.rowData.bins[dataPoint.value] = +dataPoint.total;
                }
            }
            var binLength = Object.keys(this.s.rowData.bins).length;
            var uniqueRatio = this._uniqueRatio(binLength, this.s.tableLength);
            // Don't show the pane if there isnt enough variance in the data, or there is only 1 entry for that pane
            if (!this.s.colOpts.show &&
                this.s.displayed === false &&
                ((this.s.colOpts.show === undefined && this.s.colOpts.threshold === null ?
                    uniqueRatio > this.c.threshold :
                    uniqueRatio > this.s.colOpts.threshold) ||
                    this.s.colOpts.show !== true && binLength <= 1)) {
                this.dom.container.addClass(this.classes.hidden);
                this.s.displayed = false;
                return;
            }
            // Store the original data
            this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter;
            this.s.rowData.binsOriginal = this.s.rowData.bins;
            // Flag this pane as being displayed
            this.s.displayed = true;
            // If the pane exists
            if (this.s.dtPane) {
                // Not the selections that have been made and remove all of the rows
                var selected = this.s.serverSelect;
                var reselect = this._emptyPane();
                // Add the rows that are to be shown into the pane
                for (var _b = 0, _c = this.s.rowData.arrayFilter; _b < _c.length; _b++) {
                    data = _c[_b];
                    if (this._shouldAddRow(data)) {
                        row = this.addRow(data.display, data.filter, data.sort, data.type);
                        // Select the row if it was selected before
                        for (var i = 0; i < selected.length; i++) {
                            selection = selected[i];
                            if (selection.filter === data.filter) {
                                // This flag stops another request being made to the server
                                this.s.serverSelecting = true;
                                row.select();
                                this.s.serverSelecting = false;
                                // Remove the selection from the to select list and add it to the selected list
                                selected.splice(i, 1);
                                this.s.selections.push(data.filter);
                                break;
                            }
                        }
                    }
                }
                // Remake any selections that are no longer present
                for (var _d = 0, selected_1 = selected; _d < selected_1.length; _d++) {
                    selection = selected_1[_d];
                    for (var _e = 0, _f = this.s.rowData.arrayOriginal; _e < _f.length; _e++) {
                        data = _f[_e];
                        if (data.filter === selection.filter) {
                            row = this.addRow(data.display, data.filter, data.sort, data.type);
                            this.s.serverSelecting = true;
                            row.select();
                            this.s.serverSelecting = false;
                            this.s.selections.push(data.filter);
                        }
                    }
                }
                // Store the selected rows
                this.s.serverSelect = this.s.dtPane.rows({ selected: true }).data().toArray();
                // Update the pane
                this.s.dtPane.draw();
                reselect();
            }
        };
        /**
         * This method updates the rows and their data within the SearchPanes
         *
         * SearchPaneCascade overrides this method
         */
        SearchPaneST.prototype.updateRows = function () {
            if (!this.s.dt.page.info().serverSide) {
                // Get the latest count values from the table
                this.s.rowData.binsShown = {};
                for (var _i = 0, _a = this.s.dt.rows({ search: 'applied' }).indexes().toArray(); _i < _a.length; _i++) {
                    var index = _a[_i];
                    this._updateShown(index, this.s.dt.settings()[0], this.s.rowData.binsShown);
                }
            }
            var _loop_1 = function (row) {
                row.shown = typeof this_1.s.rowData.binsShown[row.filter] === 'number' ?
                    this_1.s.rowData.binsShown[row.filter] :
                    0;
                this_1.s.dtPane
                    .row(function (idx, data) {
                    return data && (data.index === row.index);
                })
                    .data(row);
            };
            var this_1 = this;
            // Update the rows data to show the current counts
            for (var _b = 0, _c = this.s.dtPane.rows().data().toArray(); _b < _c.length; _b++) {
                var row = _c[_b];
                _loop_1(row);
            }
            // Show updates in the pane
            this.s.dtPane.draw();
            this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop;
        };
        /**
         * Remove functionality from makeSelection - needs to be more advanced when tracking selections
         */
        SearchPaneST.prototype._makeSelection = function () {
            return;
        };
        /**
         * Blank method to remove reloading of selected rows - needs to be more advanced when tracking selections
         */
        SearchPaneST.prototype._reloadSelect = function () {
            return;
        };
        /**
         * Decides if a row should be added when being added from the server
         *
         * Overridden by SearchPaneCascade
         *
         * @param data the row data
         * @returns boolean indicating if the row should be added or not
         */
        SearchPaneST.prototype._shouldAddRow = function (data) {
            return true;
        };
        /**
         * Updates the server selection list where appropriate
         */
        SearchPaneST.prototype._updateSelection = function () {
            if (this.s.dt.page.info().serverSide && !this.s.updating && !this.s.serverSelecting) {
                this.s.serverSelect = this.s.dtPane.rows({ selected: true }).data().toArray();
            }
        };
        /**
         * Used when binning the data for a column
         *
         * @param rowIdx The current row that is to be added to the bins
         * @param settings The datatables settings object
         * @param bins The bins object that is to be incremented
         */
        SearchPaneST.prototype._updateShown = function (rowIdx, settings, bins) {
            if (bins === void 0) { bins = this.s.rowData.binsShown; }
            var orth = typeof this.s.colOpts.orthogonal === 'string'
                ? this.s.colOpts.orthogonal
                : this.s.colOpts.orthogonal.search;
            var fastData = settings.fastData
                ? settings.fastData
                : function (row, col, orth) {
                    // Legacy DT1
                    return settings.oApi._fnGetCellData(settings, row, col, orth);
                };
            var filter = fastData(rowIdx, this.s.index, orth);
            var add = function (f) {
                if (!bins[f]) {
                    bins[f] = 1;
                }
                else {
                    bins[f]++;
                }
            };
            if (Array.isArray(filter)) {
                for (var _i = 0, filter_1 = filter; _i < filter_1.length; _i++) {
                    var f = filter_1[_i];
                    add(f);
                }
            }
            else {
                add(filter);
            }
        };
        return SearchPaneST;
    }(SearchPane));

    var __extends$3 = (window && window.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var $$4;
    function setJQuery$3(jq) {
        $$4 = jq;
    }
    var SearchPaneViewTotal = /** @class */ (function (_super) {
        __extends$3(SearchPaneViewTotal, _super);
        function SearchPaneViewTotal(paneSettings, opts, index, panesContainer, panes) {
            var _this = this;
            var override = {
                i18n: {
                    countFiltered: '{shown} ({total})'
                }
            };
            _this = _super.call(this, paneSettings, $$4.extend(override, opts), index, panesContainer, panes) || this;
            return _this;
        }
        /**
         * Gets the message that is to be used to indicate the count for each SearchPane row
         *
         * This method overrides _getMessage() in SearchPane and is overridden by SearchPaneCascadeViewTotal
         *
         * @param row The row object that is being processed
         * @returns string - the message that is to be shown for the count of each entry
         */
        SearchPaneViewTotal.prototype._getMessage = function (row) {
            var countMessage = this.s.dt.i18n('searchPanes.count', this.c.i18n.count);
            var filteredMessage = this.s.dt.i18n('searchPanes.countFiltered', this.c.i18n.countFiltered);
            return (this.s.filteringActive ? filteredMessage : countMessage)
                .replace(/{total}/g, row.total)
                .replace(/{shown}/g, row.shown);
        };
        /**
         * Overrides the blank method in SearchPane to return the number of times a given value is currently being displayed
         *
         * @param filter The filter value
         * @returns number - The number of times the value is shown
         */
        SearchPaneViewTotal.prototype._getShown = function (filter) {
            return this.s.rowData.binsShown && this.s.rowData.binsShown[filter] ?
                this.s.rowData.binsShown[filter] :
                0;
        };
        return SearchPaneViewTotal;
    }(SearchPaneST));

    var __extends$2 = (window && window.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var $$3;
    function setJQuery$2(jq) {
        $$3 = jq;
    }
    var SearchPaneCascade = /** @class */ (function (_super) {
        __extends$2(SearchPaneCascade, _super);
        function SearchPaneCascade(paneSettings, opts, index, panesContainer, panes) {
            var _this = this;
            var override = {
                i18n: {
                    count: '{shown}'
                }
            };
            _this = _super.call(this, paneSettings, $$3.extend(override, opts), index, panesContainer, panes) || this;
            return _this;
        }
        /**
         * This method updates the rows and their data within the SearchPanes
         *
         * This overrides the method in SearchPane
         */
        SearchPaneCascade.prototype.updateRows = function () {
            // Note the currently selected values in the pane and remove all of the rows
            var selected = this.s.dtPane.rows({ selected: true }).data().toArray();
            var selection;
            if (this.s.colOpts.options ||
                this.s.customPaneSettings && this.s.customPaneSettings.options) {
                // If there are custom options set or it is a custom pane then get them
                this._getComparisonRows();
                var rows = this.s.dtPane.rows().toArray()[0];
                for (var i = 0; i < rows.length; i++) {
                    var row = this.s.dtPane.row(rows[i]);
                    var rowData = row.data();
                    if (rowData === undefined) {
                        continue;
                    }
                    if (rowData.shown === 0) {
                        row.remove();
                        rows = this.s.dtPane.rows().toArray()[0];
                        i--;
                        continue;
                    }
                    for (var _i = 0, selected_1 = selected; _i < selected_1.length; _i++) {
                        selection = selected_1[_i];
                        if (rowData.filter === selection.filter) {
                            row.select();
                            selected.splice(i, 1);
                            this.s.selections.push(rowData.filter);
                            break;
                        }
                    }
                }
            }
            else {
                if (!this.s.dt.page.info().serverSide) {
                    // Get the latest count values from the table
                    this._activePopulatePane();
                    this.s.rowData.binsShown = {};
                    for (var _a = 0, _b = this.s.dt.rows({ search: 'applied' }).indexes().toArray(); _a < _b.length; _a++) {
                        var index = _b[_a];
                        this._updateShown(index, this.s.dt.settings()[0], this.s.rowData.binsShown);
                    }
                }
                this.s.dtPane.rows().remove();
                // Go over all of the rows that could be displayed
                for (var _c = 0, _d = this.s.rowData.arrayFilter; _c < _d.length; _c++) {
                    var data = _d[_c];
                    // Cascade - If there are no rows present in the table don't show the option
                    if (data.shown === 0) {
                        continue;
                    }
                    // Add the row to the pane
                    var newRow = this.addRow(data.display, data.filter, data.sort, data.type, undefined);
                    // Check if this row was selected
                    for (var j = 0; j < selected.length; j++) {
                        var selectedRow = selected[j];
                        if (selectedRow.filter === data.filter) {
                            newRow.select();
                            // Remove the row from the to find list and then add it to the selections list
                            selected.splice(j, 1);
                            this.s.selections.push(data.filter);
                            break;
                        }
                    }
                }
                // Add all of the rows that were previously selected but aren't any more
                for (var _e = 0, selected_2 = selected; _e < selected_2.length; _e++) {
                    selection = selected_2[_e];
                    for (var _f = 0, _g = this.s.rowData.arrayOriginal; _f < _g.length; _f++) {
                        var origData = _g[_f];
                        if (origData.filter === selection.filter) {
                            var addedRow = this.addRow(origData.display, origData.filter, origData.sort, origData.type, undefined);
                            addedRow.select();
                            this.s.selections.push(origData.filter);
                        }
                    }
                }
            }
            // Show updates in the pane
            this.s.dtPane.draw();
            this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop;
            // If client side updated the tables results
            if (!this.s.dt.page.info().serverSide) {
                this.s.dt.draw(false);
            }
        };
        /**
         * Fill the array with the values that are currently being displayed in the table
         */
        SearchPaneCascade.prototype._activePopulatePane = function () {
            this.s.rowData.arrayFilter = [];
            this.s.rowData.bins = {};
            var settings = this.s.dt.settings()[0];
            if (!this.s.dt.page.info().serverSide) {
                for (var _i = 0, _a = this.s.dt.rows({ search: 'applied' }).indexes().toArray(); _i < _a.length; _i++) {
                    var index = _a[_i];
                    this._populatePaneArray(index, this.s.rowData.arrayFilter, settings);
                }
            }
        };
        SearchPaneCascade.prototype._getComparisonRows = function () {
            // Find the appropriate options depending on whether this is a pane for a specific column or a custom pane
            var options = this.s.colOpts.options
                ? this.s.colOpts.options
                : this.s.customPaneSettings && this.s.customPaneSettings.options
                    ? this.s.customPaneSettings.options
                    : undefined;
            if (options === undefined) {
                return;
            }
            var allRows = this.s.dt.rows();
            var shownRows = this.s.dt.rows({ search: 'applied' });
            var tableValsTotal = allRows.data().toArray();
            var tableValsShown = shownRows.data().toArray();
            var rows = [];
            // Clear all of the other rows from the pane, only custom options are to be displayed when they are defined
            this.s.dtPane.clear();
            this.s.indexes = [];
            for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                var comp = options_1[_i];
                // Initialise the object which is to be placed in the row
                var insert = comp.label !== '' ?
                    comp.label :
                    this.emptyMessage();
                var comparisonObj = {
                    className: comp.className,
                    display: insert,
                    filter: typeof comp.value === 'function' ? comp.value : [],
                    shown: 0,
                    sort: insert,
                    total: 0,
                    type: insert
                };
                // If a custom function is in place
                if (typeof comp.value === 'function') {
                    // Count the number of times the function evaluates to true for the original data in the Table
                    for (var i = 0; i < tableValsTotal.length; i++) {
                        if (comp.value.call(this.s.dt, tableValsTotal[i], allRows[0][i])) {
                            comparisonObj.total++;
                        }
                    }
                    for (var j = 0; j < tableValsShown.length; j++) {
                        if (comp.value.call(this.s.dt, tableValsShown[j], shownRows[0][j])) {
                            comparisonObj.shown++;
                        }
                    }
                    // Update the comparisonObj
                    if (typeof comparisonObj.filter !== 'function') {
                        comparisonObj.filter.push(comp.filter);
                    }
                }
                rows.push(this.addRow(comparisonObj.display, comparisonObj.filter, comparisonObj.sort, comparisonObj.type, comparisonObj.className, comparisonObj.total, comparisonObj.shown));
            }
            return rows;
        };
        /**
         * Gets the message that is to be used to indicate the count for each SearchPane row
         *
         * This method overrides _getMessage() in SearchPane and is overridden by SearchPaneCascadeViewTotal
         *
         * @param row The row object that is being processed
         * @returns string - the message that is to be shown for the count of each entry
         */
        SearchPaneCascade.prototype._getMessage = function (row) {
            return this.s.dt.i18n('searchPanes.count', this.c.i18n.count)
                .replace(/{total}/g, row.total)
                .replace(/{shown}/g, row.shown);
        };
        /**
         * Overrides the blank method in SearchPane to return the number of times a given value is currently being displayed
         *
         * @param filter The filter value
         * @returns number - The number of times the value is shown
         */
        SearchPaneCascade.prototype._getShown = function (filter) {
            return this.s.rowData.binsShown && this.s.rowData.binsShown[filter] ?
                this.s.rowData.binsShown[filter] :
                0;
        };
        /**
         * Decides if a row should be added when being added from the server
         *
         * Overrides method in by SearchPaneST
         *
         * @param data the row data
         * @returns boolean indicating if the row should be added or not
         */
        SearchPaneCascade.prototype._shouldAddRow = function (data) {
            return data.shown > 0;
        };
        return SearchPaneCascade;
    }(SearchPaneST));

    var __extends$1 = (window && window.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var $$2;
    function setJQuery$1(jq) {
        $$2 = jq;
    }
    var SearchPaneCascadeViewTotal = /** @class */ (function (_super) {
        __extends$1(SearchPaneCascadeViewTotal, _super);
        function SearchPaneCascadeViewTotal(paneSettings, opts, index, panesContainer, panes) {
            var _this = this;
            var override = {
                i18n: {
                    count: '{total}',
                    countFiltered: '{shown} ({total})'
                }
            };
            _this = _super.call(this, paneSettings, $$2.extend(override, opts), index, panesContainer, panes) || this;
            return _this;
        }
        /**
         * Fill the array with the values that are currently being displayed in the table
         *
         * This method overrides _activePopulatePane() in SearchPaneCascade
         */
        SearchPaneCascadeViewTotal.prototype._activePopulatePane = function () {
            this.s.rowData.arrayFilter = [];
            this.s.rowData.binsShown = {};
            var settings = this.s.dt.settings()[0];
            if (!this.s.dt.page.info().serverSide) {
                for (var _i = 0, _a = this.s.dt.rows({ search: 'applied' }).indexes().toArray(); _i < _a.length; _i++) {
                    var index = _a[_i];
                    this._populatePaneArray(index, this.s.rowData.arrayFilter, settings, this.s.rowData.binsShown);
                }
            }
        };
        /**
         * Gets the message that is to be used to indicate the count for each SearchPane row
         *
         * This method overrides _getMessage() in SearchPaneCascade
         *
         * @param row The row object that is being processed
         * @returns string - the message that is to be shown for the count of each entry
         */
        SearchPaneCascadeViewTotal.prototype._getMessage = function (row) {
            var countMessage = this.s.dt.i18n('searchPanes.count', this.c.i18n.count);
            var filteredMessage = this.s.dt.i18n('searchPanes.countFiltered', this.c.i18n.countFiltered);
            return (this.s.filteringActive ? filteredMessage : countMessage)
                .replace(/{total}/g, row.total)
                .replace(/{shown}/g, row.shown);
        };
        return SearchPaneCascadeViewTotal;
    }(SearchPaneCascade));

    var $$1;
    var dataTable$1;
    function setJQuery(jq) {
        $$1 = jq;
        dataTable$1 = jq.fn.dataTable;
    }
    var SearchPanes = /** @class */ (function () {
        function SearchPanes(paneSettings, opts, fromPreInit, paneClass) {
            var _this = this;
            if (fromPreInit === void 0) { fromPreInit = false; }
            if (paneClass === void 0) { paneClass = SearchPane; }
            // Check that the required version of DataTables is included
            if (!dataTable$1 || !dataTable$1.versionCheck || !dataTable$1.versionCheck('1.10.0')) {
                throw new Error('SearchPane requires DataTables 1.10 or newer');
            }
            // Check that Select is included
            // eslint-disable-next-line no-extra-parens
            if (!dataTable$1.select) {
                throw new Error('SearchPane requires Select');
            }
            var table = new dataTable$1.Api(paneSettings);
            this.classes = $$1.extend(true, {}, SearchPanes.classes);
            // Get options from user
            this.c = $$1.extend(true, {}, SearchPanes.defaults, opts);
            // Add extra elements to DOM object including clear
            this.dom = {
                clearAll: $$1('<button type="button"/>')
                    .addClass(this.classes.clearAll)
                    .html(table.i18n('searchPanes.clearMessage', this.c.i18n.clearMessage)),
                collapseAll: $$1('<button type="button"/>')
                    .addClass(this.classes.collapseAll)
                    .html(table.i18n('searchPanes.collapseMessage', this.c.i18n.collapseMessage)),
                container: $$1('<div/>').addClass(this.classes.panes).html(table.i18n('searchPanes.loadMessage', this.c.i18n.loadMessage)),
                emptyMessage: $$1('<div/>').addClass(this.classes.emptyMessage),
                panes: $$1('<div/>').addClass(this.classes.container),
                showAll: $$1('<button type="button"/>')
                    .addClass(this.classes.showAll)
                    .addClass(this.classes.disabledButton)
                    .attr('disabled', 'true')
                    .html(table.i18n('searchPanes.showMessage', this.c.i18n.showMessage)),
                title: $$1('<div/>').addClass(this.classes.title),
                titleRow: $$1('<div/>').addClass(this.classes.titleRow)
            };
            this.s = {
                colOpts: [],
                dt: table,
                filterCount: 0,
                minPaneWidth: 260.0,
                page: 0,
                paging: false,
                pagingST: false,
                paneClass: paneClass,
                panes: [],
                selectionList: [],
                serverData: {},
                stateRead: false,
                updating: false
            };
            // Do not reinitialise if already initialised on table
            if (table.settings()[0]._searchPanes) {
                return;
            }
            // When the panes update, we check it the clear buttons needs to be updated
            $$1(document).on('draw.dt', function (e) {
                if (_this.dom.container.find(e.target).length) {
                    _this._updateFilterCount();
                }
            });
            this._getState();
            if (this.s.dt.page.info().serverSide) {
                var hostSettings = this.s.dt.settings()[0];
                // Listener to get the data into the server request before it is made
                this.s.dt.on('preXhr.dtsps', function (e, settings, data) {
                    if (hostSettings !== settings) {
                        return;
                    }
                    if (data.searchPanes === undefined) {
                        data.searchPanes = {};
                    }
                    if (data.searchPanes_null === undefined) {
                        data.searchPanes_null = {};
                    }
                    var src;
                    for (var _i = 0, _a = _this.s.selectionList; _i < _a.length; _i++) {
                        var selection = _a[_i];
                        src = _this.s.dt.column(selection.column).dataSrc();
                        if (data.searchPanes[src] === undefined) {
                            data.searchPanes[src] = {};
                        }
                        if (data.searchPanes_null[src] === undefined) {
                            data.searchPanes_null[src] = {};
                        }
                        for (var i = 0; i < selection.rows.length; i++) {
                            data.searchPanes[src][i] = selection.rows[i];
                            if (data.searchPanes[src][i] === null) {
                                data.searchPanes_null[src][i] = true;
                            }
                            else {
                                data.searchPanes_null[src][i] = false;
                            }
                        }
                    }
                    if (_this.s.selectionList.length > 0) {
                        data.searchPanesLast = src;
                    }
                    // Config options that will change how the querying is done
                    data.searchPanes_options = {
                        cascade: _this.c.cascadePanes,
                        viewCount: _this.c.viewCount,
                        viewTotal: _this.c.viewTotal
                    };
                });
            }
            this._setXHR();
            table.settings()[0]._searchPanes = this;
            if (this.s.dt.settings()[0]._bInitComplete || fromPreInit) {
                this._paneDeclare(table, paneSettings, opts);
            }
            else {
                table.one('preInit.dtsps', function () {
                    _this._paneDeclare(table, paneSettings, opts);
                });
            }
            return this;
        }
        /**
         * Clear the selections of all of the panes
         */
        SearchPanes.prototype.clearSelections = function () {
            var pane;
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                pane = _a[_i];
                if (pane.s.dtPane) {
                    pane.s.scrollTop = pane.s.dtPane.table().node().parentNode.scrollTop;
                }
            }
            // Load in all of the searchBoxes in the documents
            var searches = this.dom.container.find('.' + this.classes.search.replace(/\s+/g, '.'));
            // For each searchBox set the input text to be empty and then trigger
            // an input on them so that they no longer filter the panes
            searches.each(function () {
                $$1(this).val('').trigger('input');
            });
            // Clear the selectionList
            this.s.selectionList = [];
            var returnArray = [];
            for (var _b = 0, _c = this.s.panes; _b < _c.length; _b++) {
                pane = _c[_b];
                if (pane.s.dtPane) {
                    returnArray.push(pane.clearPane());
                }
            }
            return returnArray;
        };
        /**
         * returns the container node for the searchPanes
         */
        SearchPanes.prototype.getNode = function () {
            return this.dom.container;
        };
        /**
         * rebuilds all of the panes
         */
        SearchPanes.prototype.rebuild = function (targetIdx, maintainSelection) {
            if (targetIdx === void 0) { targetIdx = false; }
            if (maintainSelection === void 0) { maintainSelection = false; }
            this.dom.emptyMessage.detach();
            // As a rebuild from scratch is required, empty the searchpanes container.
            if (targetIdx === false) {
                this.dom.panes.empty();
            }
            // Rebuild each pane individually, if a specific pane has been selected then only rebuild that one
            var returnArray = [];
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (targetIdx === false || pane.s.index === targetIdx) {
                    pane.clearData();
                    pane.rebuildPane(this.s.dt.page.info().serverSide ?
                        this.s.serverData :
                        undefined, maintainSelection);
                    this.dom.panes.append(pane.dom.container);
                    returnArray.push(pane);
                }
            }
            this._updateSelection();
            // Attach panes, clear buttons, and title bar to the document
            this._updateFilterCount();
            this._attachPaneContainer();
            this._initSelectionListeners(false);
            // If the selections are to be maintained, then it is safe to assume that paging is also to be maintained
            // Otherwise, the paging should be reset
            this.s.dt.draw(!maintainSelection);
            // Resize the panes incase there has been a change
            this.resizePanes();
            // If a single pane has been rebuilt then return only that pane
            return returnArray.length === 1 ? returnArray[0] : returnArray;
        };
        /**
         * Resizes all of the panes
         */
        SearchPanes.prototype.resizePanes = function () {
            var pane;
            if (this.c.layout === 'auto') {
                var contWidth = $$1(this.s.dt.searchPanes.container()).width();
                var target = Math.floor(contWidth / this.s.minPaneWidth); // The neatest number of panes per row
                var highest_1 = 1;
                var highestmod_1 = 0;
                // Get the indexes of all of the displayed panes
                var dispIndex = [];
                for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                    pane = _a[_i];
                    if (pane.s.displayed) {
                        dispIndex.push(pane.s.index);
                    }
                }
                var displayCount = dispIndex.length;
                // If the neatest number is the number we have then use this.
                if (target === displayCount) {
                    highest_1 = target;
                }
                else {
                    // Go from the target down and find the value with the most panes left over, this will be the best fit
                    for (var ppr = target; ppr > 1; ppr--) {
                        var rem = displayCount % ppr;
                        if (rem === 0) {
                            highest_1 = ppr;
                            highestmod_1 = 0;
                            break;
                        }
                        // If there are more left over at this amount of panes per row (ppr)
                        // then it fits better so new values
                        else if (rem > highestmod_1) {
                            highest_1 = ppr;
                            highestmod_1 = rem;
                        }
                    }
                }
                // If there is a perfect fit then none are to be wider
                var widerIndexes_1 = highestmod_1 !== 0 ? dispIndex.slice(dispIndex.length - highestmod_1, dispIndex.length) : [];
                this.s.panes.forEach(function (pane) {
                    // Resize the pane with the new layout
                    if (pane.s.displayed) {
                        pane.resize('columns-' + (!widerIndexes_1.includes(pane.s.index) ? highest_1 : highestmod_1));
                    }
                });
            }
            else {
                for (var _b = 0, _c = this.s.panes; _b < _c.length; _b++) {
                    pane = _c[_b];
                    pane.adjustTopRow();
                }
            }
            return this;
        };
        /**
         * Holder method that is userd in SearchPanesST to set listeners that have an effect on other panes
         *
         * @param isPreselect boolean to indicate if the preselect array is to override the current selection list.
         */
        SearchPanes.prototype._initSelectionListeners = function (isPreselect) {
            return;
        };
        /**
         * Blank method that is overridden in SearchPanesST to retrieve the totals from the server data
         */
        SearchPanes.prototype._serverTotals = function () {
            return;
        };
        /**
         * Set's the xhr listener so that SP can extact appropriate data from the response
         */
        SearchPanes.prototype._setXHR = function () {
            var _this = this;
            var hostSettings = this.s.dt.settings()[0];
            var run = function (json) {
                if (json && json.searchPanes && json.searchPanes.options) {
                    _this.s.serverData = json;
                    _this.s.serverData.tableLength = json.recordsTotal;
                    _this._serverTotals();
                }
            };
            // We are using the xhr event to rebuild the panes if required due to viewTotal being enabled
            // If viewTotal is not enabled then we simply update the data from the server
            this.s.dt.on('xhr.dtsps', function (e, settings, json) {
                if (hostSettings === settings) {
                    run(json);
                }
            });
            // Account for the initial JSON fetch having already completed
            run(this.s.dt.ajax.json());
        };
        /**
         * Set's the function that is to be performed when a state is loaded
         *
         * Overridden by the method in SearchPanesST
         */
        SearchPanes.prototype._stateLoadListener = function () {
            var _this = this;
            var hostSettings = this.s.dt.settings()[0];
            this.s.dt.on('stateLoadParams.dtsps', function (e, settings, data) {
                if (data.searchPanes === undefined || settings !== hostSettings) {
                    return;
                }
                _this.clearSelections();
                // Set the selection list for the panes so that the correct
                // rows can be reselected and in the right order
                _this.s.selectionList =
                    data.searchPanes.selectionList ?
                        data.searchPanes.selectionList :
                        [];
                // Find the panes that match from the state and the actual instance
                if (data.searchPanes.panes) {
                    for (var _i = 0, _a = data.searchPanes.panes; _i < _a.length; _i++) {
                        var loadedPane = _a[_i];
                        for (var _b = 0, _c = _this.s.panes; _b < _c.length; _b++) {
                            var pane = _c[_b];
                            if (loadedPane.id === pane.s.index && pane.s.dtPane) {
                                // Set the value of the searchbox
                                pane.dom.searchBox.val(loadedPane.searchTerm);
                                // Set the value of the order
                                pane.s.dtPane.order(loadedPane.order);
                            }
                        }
                    }
                }
                _this._makeSelections(_this.s.selectionList);
            });
        };
        /**
         * Updates the selectionList when cascade is not in place
         *
         * Overridden in SearchPanesST
         */
        SearchPanes.prototype._updateSelection = function () {
            this.s.selectionList = [];
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (pane.s.dtPane) {
                    var rows = pane.s.dtPane.rows({ selected: true }).data().toArray().map(function (el) { return el.filter; });
                    if (rows.length) {
                        this.s.selectionList.push({
                            column: pane.s.index,
                            rows: rows
                        });
                    }
                }
            }
        };
        /**
         * Attach the panes, buttons and title to the document
         */
        SearchPanes.prototype._attach = function () {
            var _this = this;
            this.dom.titleRow
                .removeClass(this.classes.hide)
                .detach()
                .append(this.dom.title);
            // If the clear button is permitted attach it
            if (this.c.clear) {
                this.dom.clearAll
                    .appendTo(this.dom.titleRow)
                    .off('click.dtsps')
                    .on('click.dtsps', function () { return _this.clearSelections(); });
            }
            if (this.c.collapse) {
                this.dom.showAll.appendTo(this.dom.titleRow);
                this.dom.collapseAll.appendTo(this.dom.titleRow);
                this._setCollapseListener();
            }
            // Attach the container for each individual pane to the overall container
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                this.dom.panes.append(pane.dom.container);
            }
            // Attach everything to the document
            this.dom.container
                .text('')
                .removeClass(this.classes.hide)
                .append(this.dom.titleRow)
                .append(this.dom.panes);
            // WORKAROUND
            this.s.panes.forEach(function (pane) { return pane.setListeners(); });
            if ($$1('div.' + this.classes.container).length === 0) {
                this.dom.container.prependTo(this.s.dt);
            }
        };
        /**
         * If there are no panes to display then this method is called to either
         * display a message in their place or hide them completely.
         */
        SearchPanes.prototype._attachMessage = function () {
            // Create a message to display on the screen
            var message;
            try {
                message = this.s.dt.i18n('searchPanes.emptyPanes', this.c.i18n.emptyPanes);
            }
            catch (error) {
                message = null;
            }
            // If the message is an empty string then searchPanes.emptyPanes is undefined,
            // therefore the pane container should be removed from the display
            if (message === null) {
                this.dom.container.addClass(this.classes.hide);
                this.dom.titleRow.removeClass(this.classes.hide);
                return;
            }
            // Otherwise display the message
            this.dom.container.removeClass(this.classes.hide);
            this.dom.titleRow.addClass(this.classes.hide);
            this.dom.emptyMessage.html(message).appendTo(this.dom.container);
        };
        /**
         * Attaches the panes to the document and displays a message or hides if there are none
         */
        SearchPanes.prototype._attachPaneContainer = function () {
            // If a pane is to be displayed then attach the normal pane output
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (pane.s.displayed === true) {
                    this._attach();
                    return;
                }
            }
            // Otherwise attach the custom message or remove the container from the display
            this._attachMessage();
        };
        /**
         * Checks which panes are collapsed and then performs relevant actions to the collapse/show all buttons
         */
        SearchPanes.prototype._checkCollapse = function () {
            var disableClose = true;
            var disableShow = true;
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (pane.s.displayed) {
                    // If the pane is not collapsed
                    if (!pane.dom.collapseButton.hasClass(pane.classes.rotated)) {
                        // Enable the collapse all button
                        this.dom.collapseAll.removeClass(this.classes.disabledButton).removeAttr('disabled');
                        disableClose = false;
                    }
                    else {
                        // Otherwise enable the show all button
                        this.dom.showAll.removeClass(this.classes.disabledButton).removeAttr('disabled');
                        disableShow = false;
                    }
                }
            }
            // If this flag is still true, no panes are open so the close button should be disabled
            if (disableClose) {
                this.dom.collapseAll.addClass(this.classes.disabledButton).attr('disabled', 'true');
            }
            // If this flag is still true, no panes are closed so the show button should be disabled
            if (disableShow) {
                this.dom.showAll.addClass(this.classes.disabledButton).attr('disabled', 'true');
            }
        };
        /**
         * Attaches the message to the document but does not add any panes
         */
        SearchPanes.prototype._checkMessage = function () {
            // If a pane is to be displayed then attach the normal pane output
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (pane.s.displayed === true) {
                    // Ensure that the empty message is removed if a pane is displayed
                    this.dom.emptyMessage.detach();
                    this.dom.titleRow.removeClass(this.classes.hide);
                    return;
                }
            }
            // Otherwise attach the custom message or remove the container from the display
            this._attachMessage();
        };
        /**
         * Collapses all of the panes
         */
        SearchPanes.prototype._collapseAll = function () {
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                pane.collapse();
            }
        };
        /**
         * Finds a pane based upon the name of that pane
         *
         * @param name string representing the name of the pane
         * @returns SearchPane The pane which has that name
         */
        SearchPanes.prototype._findPane = function (name) {
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (name === pane.s.name) {
                    return pane;
                }
            }
        };
        /**
         * Gets the selection list from the previous state and stores it in the selectionList Property
         */
        SearchPanes.prototype._getState = function () {
            var loadedFilter = this.s.dt.state.loaded();
            if (loadedFilter && loadedFilter.searchPanes && loadedFilter.searchPanes.selectionList) {
                this.s.selectionList = loadedFilter.searchPanes.selectionList;
            }
        };
        SearchPanes.prototype._makeSelections = function (selectList) {
            for (var _i = 0, selectList_1 = selectList; _i < selectList_1.length; _i++) {
                var selection = selectList_1[_i];
                var pane = void 0;
                for (var _a = 0, _b = this.s.panes; _a < _b.length; _a++) {
                    var p = _b[_a];
                    if (p.s.index === selection.column) {
                        pane = p;
                        break;
                    }
                }
                if (pane && pane.s.dtPane) {
                    for (var j = 0; j < pane.s.dtPane.rows().data().toArray().length; j++) {
                        if (selection.rows.includes(typeof pane.s.dtPane.row(j).data().filter === 'function' ?
                            pane.s.dtPane.cell(j, 0).data() :
                            pane.s.dtPane.row(j).data().filter)) {
                            pane.s.dtPane.row(j).select();
                        }
                    }
                    pane.updateTable();
                }
            }
        };
        /**
         * Declares the instances of individual searchpanes dependant on the number of columns.
         * It is necessary to run this once preInit has completed otherwise no panes will be
         * created as the column count will be 0.
         *
         * @param table the DataTable api for the parent table
         * @param paneSettings the settings passed into the constructor
         * @param opts the options passed into the constructor
         */
        SearchPanes.prototype._paneDeclare = function (table, paneSettings, opts) {
            var _this = this;
            // Create Panes
            table
                .columns(this.c.columns.length > 0 ? this.c.columns : undefined)
                .eq(0)
                .each(function (idx) {
                _this.s.panes.push(new _this.s.paneClass(paneSettings, opts, idx, _this.dom.panes));
            });
            // If there is any extra custom panes defined then create panes for them too
            var colCount = table.columns().eq(0).toArray().length;
            for (var i = 0; i < this.c.panes.length; i++) {
                var id = colCount + i;
                this.s.panes.push(new this.s.paneClass(paneSettings, opts, id, this.dom.panes, this.c.panes[i]));
            }
            // If a custom ordering is being used
            if (this.c.order.length > 0) {
                // Make a new Array of panes based upon the order
                this.s.panes = this.c.order.map(function (name) { return _this._findPane(name); });
            }
            // If this internal property is true then the DataTable has been initialised already
            if (this.s.dt.settings()[0]._bInitComplete) {
                this._startup(table);
            }
            else {
                // Otherwise add the paneStartup function to the list of functions
                // that are to be run when the table is initialised. This will garauntee that the
                // panes are initialised before the init event and init Complete callback is fired
                if (dataTable$1.versionCheck('2')) {
                    this.s.dt.settings()[0].aoInitComplete.push(function () { return _this._startup(table); });
                }
                else {
                    this.s.dt.settings()[0].aoInitComplete.push({
                        fn: function () { return _this._startup(table); }
                    });
                }
            }
        };
        /**
         * Sets the listeners for the collapse and show all buttons
         * Also sets and performs checks on current panes to see if they are collapsed
         */
        SearchPanes.prototype._setCollapseListener = function () {
            var _this = this;
            this.dom.collapseAll
                .off('click.dtsps')
                .on('click.dtsps', function () {
                _this._collapseAll();
                _this.dom.collapseAll.addClass(_this.classes.disabledButton).attr('disabled', 'true');
                _this.dom.showAll.removeClass(_this.classes.disabledButton).removeAttr('disabled');
                _this.s.dt.state.save();
            });
            this.dom.showAll
                .off('click.dtsps')
                .on('click.dtsps', function () {
                _this._showAll();
                _this.dom.showAll.addClass(_this.classes.disabledButton).attr('disabled', 'true');
                _this.dom.collapseAll.removeClass(_this.classes.disabledButton).removeAttr('disabled');
                _this.s.dt.state.save();
            });
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                // We want to make the same check whenever there is a collapse/expand
                pane.dom.topRow.off('collapse.dtsps').on('collapse.dtsps', function () { return _this._checkCollapse(); });
            }
            this._checkCollapse();
        };
        /**
         * Shows all of the panes
         */
        SearchPanes.prototype._showAll = function () {
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                pane.show();
            }
        };
        /**
         * Initialises the tables previous/preset selections and initialises callbacks for events
         *
         * @param table the parent table for which the searchPanes are being created
         */
        SearchPanes.prototype._startup = function (table) {
            var _this = this;
            // Attach clear button and title bar to the document
            this._attach();
            this.dom.panes.empty();
            var hostSettings = this.s.dt.settings()[0];
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                pane.rebuildPane(Object.keys(this.s.serverData).length > 0 ? this.s.serverData : undefined);
                this.dom.panes.append(pane.dom.container);
            }
            // If the layout is set to auto then the panes need to be resized to their best fit
            if (this.c.layout === 'auto') {
                this.resizePanes();
            }
            var loadedFilter = this.s.dt.state.loaded();
            // Reset the paging if that has been saved in the state
            if (!this.s.stateRead && loadedFilter) {
                this.s.dt
                    .page(loadedFilter.start / this.s.dt.page.len())
                    .draw('page');
            }
            this.s.stateRead = true;
            this._checkMessage();
            // When a draw is called on the DataTable, update all of the panes incase the data in the DataTable has changed
            table.on('preDraw.dtsps', function () {
                // Check that the panes are not updating to avoid infinite loops
                // Also check that this draw is not due to paging
                if (!_this.s.updating && !_this.s.paging) {
                    _this._updateFilterCount();
                    _this._updateSelection();
                }
                // Paging flag reset - we only need to dodge the draw once
                _this.s.paging = false;
            });
            $$1(window).on('resize.dtsps', dataTable$1.util.throttle(function () { return _this.resizePanes(); }));
            // Whenever a state save occurs store the selection list in the state object
            this.s.dt.on('stateSaveParams.dtsps', function (e, settings, data) {
                if (settings !== hostSettings) {
                    return;
                }
                if (data.searchPanes === undefined) {
                    data.searchPanes = {};
                }
                data.searchPanes.selectionList = _this.s.selectionList;
            });
            this._stateLoadListener();
            // Listener for paging on main table
            table.off('page.dtsps page-nc.dtsps').on('page.dtsps page-nc.dtsps', function (e, s) {
                _this.s.paging = true;
                // This is an indicator to any selection tracking classes that paging has occured
                // It has to happen here so that we don't stack event listeners unnecessarily
                // The value is only ever set back to false in the SearchPanesST class
                // Equally it is never read in this class
                _this.s.pagingST = true;
                _this.s.page = _this.s.dt.page();
            });
            if (this.s.dt.page.info().serverSide) {
                table.off('preXhr.dtsps').on('preXhr.dtsps', function (e, settings, data) {
                    if (settings !== hostSettings) {
                        return;
                    }
                    if (!data.searchPanes) {
                        data.searchPanes = {};
                    }
                    if (!data.searchPanes_null) {
                        data.searchPanes_null = {};
                    }
                    // Count how many filters are being applied
                    var filterCount = 0;
                    for (var _i = 0, _a = _this.s.panes; _i < _a.length; _i++) {
                        var pane = _a[_i];
                        var src = _this.s.dt.column(pane.s.index).dataSrc();
                        if (!data.searchPanes[src]) {
                            data.searchPanes[src] = {};
                        }
                        if (!data.searchPanes_null[src]) {
                            data.searchPanes_null[src] = {};
                        }
                        if (pane.s.dtPane) {
                            var rowData = pane.s.dtPane.rows({ selected: true }).data().toArray();
                            for (var i = 0; i < rowData.length; i++) {
                                data.searchPanes[src][i] = rowData[i].filter;
                                if (!data.searchPanes[src][i]) {
                                    data.searchPanes_null[src][i] = true;
                                }
                                else {
                                    data.searchPanes_null[src][i] = false;
                                }
                                filterCount++;
                            }
                        }
                    }
                    // If there is a filter to be applied, then we need to read from the start of the result set
                    // and set the paging to 0. This matches the behaviour of client side processing
                    if (filterCount > 0) {
                        // If the number of filters has changed we need to read from the start of the
                        // result set and reset the paging
                        if (filterCount !== _this.s.filterCount) {
                            data.start = 0;
                            _this.s.page = 0;
                        }
                        // Otherwise it is a paging request and we need to read from whatever the paging has been set to
                        else {
                            data.start = _this.s.page * _this.s.dt.page.len();
                        }
                        _this.s.dt.page(_this.s.page);
                        _this.s.filterCount = filterCount;
                    }
                    if (_this.s.selectionList.length > 0) {
                        data.searchPanesLast = _this.s.dt
                            .column(_this.s.selectionList[_this.s.selectionList.length - 1].column)
                            .dataSrc();
                    }
                    // Config options that will change how the querying is done
                    data.searchPanes_options = {
                        cascade: _this.c.cascadePanes,
                        viewCount: _this.c.viewCount,
                        viewTotal: _this.c.viewTotal
                    };
                });
            }
            else {
                table.on('preXhr.dtsps', function () { return _this.s.panes.forEach(function (pane) { return pane.clearData(); }); });
            }
            // If the data is reloaded from the server then it is possible that it has changed completely,
            // so we need to rebuild the panes
            this.s.dt.on('xhr.dtsps', function (e, settings) {
                if (settings.nTable !== _this.s.dt.table().node()) {
                    return;
                }
                if (!_this.s.dt.page.info().serverSide) {
                    var processing_1 = false;
                    _this.s.dt.one('preDraw.dtsps', function () {
                        if (processing_1) {
                            return;
                        }
                        var page = _this.s.dt.page();
                        processing_1 = true;
                        _this.s.updating = true;
                        _this.dom.panes.empty();
                        for (var _i = 0, _a = _this.s.panes; _i < _a.length; _i++) {
                            var pane = _a[_i];
                            pane.clearData(); // Clears all of the bins and will mean that the data has to be re-read
                            // Pass a boolean to say whether this is the last choice made for maintaining selections
                            // when rebuilding
                            pane.rebuildPane(undefined, true);
                            _this.dom.panes.append(pane.dom.container);
                        }
                        if (!_this.s.dt.page.info().serverSide) {
                            _this.s.dt.draw();
                        }
                        _this.s.updating = false;
                        _this._updateSelection();
                        _this._checkMessage();
                        _this.s.dt.one('draw.dtsps', function () {
                            _this.s.updating = true;
                            _this.s.dt.page(page).draw(false);
                            _this.s.updating = false;
                        });
                    });
                }
            });
            // PreSelect any selections which have been defined using the preSelect option
            var selectList = this.c.preSelect;
            if (loadedFilter && loadedFilter.searchPanes && loadedFilter.searchPanes.selectionList) {
                selectList = loadedFilter.searchPanes.selectionList;
            }
            this._makeSelections(selectList);
            // Update the title bar to show how many filters have been selected
            this._updateFilterCount();
            // If the table is destroyed and restarted then clear the selections so that they do not persist.
            table.on('destroy.dtsps', function (e, settings) {
                if (settings !== hostSettings) {
                    return;
                }
                for (var _i = 0, _a = _this.s.panes; _i < _a.length; _i++) {
                    var pane = _a[_i];
                    pane.destroy();
                }
                table.off('.dtsps');
                _this.dom.showAll.off('.dtsps');
                _this.dom.clearAll.off('.dtsps');
                _this.dom.collapseAll.off('.dtsps');
                $$1(table.table().node()).off('.dtsps');
                _this.dom.container.detach();
                _this.clearSelections();
            });
            if (this.c.collapse) {
                this._setCollapseListener();
            }
            // When the clear All button has been pressed clear all of the selections in the panes
            if (this.c.clear) {
                this.dom.clearAll
                    .off('click.dtsps')
                    .on('click.dtsps', function () { return _this.clearSelections(); });
            }
            hostSettings._searchPanes = this;
            // This state save is required so that state is maintained over multiple refreshes if no actions are made
            this.s.dt.state.save();
        };
        /**
         * Updates the number of filters that have been applied in the title
         */
        SearchPanes.prototype._updateFilterCount = function () {
            var filterCount = 0;
            var tableSearch = 0;
            // Add the number of all of the filters throughout the panes
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (pane.s.dtPane) {
                    filterCount += pane.getPaneCount();
                    if (pane.s.dtPane.search()) {
                        tableSearch++;
                    }
                }
            }
            // Run the message through the internationalisation method to improve readability
            this.dom.title.html(this.s.dt.i18n('searchPanes.title', this.c.i18n.title, filterCount));
            if (this.c.filterChanged && typeof this.c.filterChanged === 'function') {
                this.c.filterChanged.call(this.s.dt, filterCount);
            }
            if (filterCount === 0 && tableSearch === 0) {
                this.dom.clearAll.addClass(this.classes.disabledButton).attr('disabled', 'true');
            }
            else {
                this.dom.clearAll.removeClass(this.classes.disabledButton).removeAttr('disabled');
            }
        };
        SearchPanes.version = '2.3.1';
        SearchPanes.classes = {
            clear: 'dtsp-clear',
            clearAll: 'dtsp-clearAll',
            collapseAll: 'dtsp-collapseAll',
            container: 'dtsp-searchPanes',
            disabledButton: 'dtsp-disabledButton',
            emptyMessage: 'dtsp-emptyMessage',
            hide: 'dtsp-hidden',
            panes: 'dtsp-panesContainer',
            search: 'dtsp-search',
            showAll: 'dtsp-showAll',
            title: 'dtsp-title',
            titleRow: 'dtsp-titleRow'
        };
        // Define SearchPanes default options
        SearchPanes.defaults = {
            cascadePanes: false,
            clear: true,
            collapse: true,
            columns: [],
            container: function (dt) {
                return dt.table().container();
            },
            filterChanged: undefined,
            i18n: {
                clearMessage: 'Clear All',
                clearPane: '&times;',
                collapse: {
                    0: 'SearchPanes',
                    _: 'SearchPanes (%d)'
                },
                collapseMessage: 'Collapse All',
                count: '{total}',
                emptyMessage: '<em>No data</em>',
                emptyPanes: 'No SearchPanes',
                loadMessage: 'Loading Search Panes...',
                showMessage: 'Show All',
                title: 'Filters Active - %d'
            },
            layout: 'auto',
            order: [],
            panes: [],
            preSelect: [],
            viewCount: true,
            viewTotal: false
        };
        return SearchPanes;
    }());

    var __extends = (window && window.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var SearchPanesST = /** @class */ (function (_super) {
        __extends(SearchPanesST, _super);
        function SearchPanesST(paneSettings, opts, fromPreInit) {
            if (fromPreInit === void 0) { fromPreInit = false; }
            var _this = this;
            var paneClass;
            if (opts.cascadePanes && opts.viewTotal) {
                paneClass = SearchPaneCascadeViewTotal;
            }
            else if (opts.cascadePanes) {
                paneClass = SearchPaneCascade;
            }
            else if (opts.viewTotal) {
                paneClass = SearchPaneViewTotal;
            }
            _this = _super.call(this, paneSettings, opts, fromPreInit, paneClass) || this;
            var dt = _this.s.dt;
            var loadedFilter = dt.state.loaded();
            var loadFn = function () { return _this._initSelectionListeners(true, loadedFilter && loadedFilter.searchPanes && loadedFilter.searchPanes.selectionList ?
                loadedFilter.searchPanes.selectionList :
                _this.c.preSelect); };
            if (dt.settings()[0]._bInitComplete) {
                loadFn();
            }
            else {
                dt.off('init.dtsps').on('init.dtsps', loadFn);
            }
            return _this;
        }
        /**
         * Ensures that the correct selection listeners are set for selection tracking
         *
         * @param preSelect Any values that are to be preselected
         */
        SearchPanesST.prototype._initSelectionListeners = function (isPreselect, preSelect) {
            if (isPreselect === void 0) { isPreselect = true; }
            if (preSelect === void 0) { preSelect = []; }
            if (isPreselect) {
                this.s.selectionList = preSelect;
            }
            // Set selection listeners for each pane
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (pane.s.displayed) {
                    pane.s.dtPane
                        .off('select.dtsp')
                        .on('select.dtsp', this._update(pane))
                        .off('deselect.dtsp')
                        .on('deselect.dtsp', this._updateTimeout(pane));
                }
            }
            // Update on every draw
            this.s.dt.off('draw.dtsps').on('draw.dtsps', this._update());
            // Also update right now as table has just initialised
            this._updateSelectionList();
        };
        /**
         * Retrieve the total values from the server data
         */
        SearchPanesST.prototype._serverTotals = function () {
            for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (pane.s.colOpts.show) {
                    var colTitle = this.s.dt.column(pane.s.index).dataSrc();
                    var blockVT = true;
                    // If any of the counts are not equal to the totals filtering must be active
                    if (this.s.serverData.searchPanes.options[colTitle]) {
                        for (var _b = 0, _c = this.s.serverData.searchPanes.options[colTitle]; _b < _c.length; _b++) {
                            var data = _c[_b];
                            if (data.total !== data.count) {
                                blockVT = false;
                                break;
                            }
                        }
                    }
                    // Set if filtering is present on the pane and populate the data arrays
                    pane.s.filteringActive = !blockVT;
                    pane._serverPopulate(this.s.serverData);
                }
            }
        };
        /**
         * Set's the function that is to be performed when a state is loaded
         *
         * Overrides the method in SearchPanes
         */
        SearchPanesST.prototype._stateLoadListener = function () {
            var _this = this;
            var stateLoadFunction = function (e, settings, data) {
                if (data.searchPanes === undefined) {
                    return;
                }
                // Set the selection list for the panes so that the correct
                // rows can be reselected and in the right order
                _this.s.selectionList =
                    data.searchPanes.selectionList ?
                        data.searchPanes.selectionList :
                        [];
                // Find the panes that match from the state and the actual instance
                if (data.searchPanes.panes) {
                    for (var _i = 0, _a = data.searchPanes.panes; _i < _a.length; _i++) {
                        var loadedPane = _a[_i];
                        for (var _b = 0, _c = _this.s.panes; _b < _c.length; _b++) {
                            var pane = _c[_b];
                            if (loadedPane.id === pane.s.index && pane.s.dtPane) {
                                // Set the value of the searchbox
                                pane.dom.searchBox.val(loadedPane.searchTerm);
                                // Set the value of the order
                                pane.s.dtPane.order(loadedPane.order);
                            }
                        }
                    }
                }
                _this._updateSelectionList();
            };
            this.s.dt.off('stateLoadParams.dtsps', stateLoadFunction).on('stateLoadParams.dtsps', stateLoadFunction);
        };
        /**
         * Remove the function's actions when using cascade
         *
         * Overrides the method in SearchPanes
         */
        SearchPanesST.prototype._updateSelection = function () {
            return;
        };
        /**
         * Returns a function that updates the selection list based on a specific pane
         * Also clears the timeout to stop the deselect from running
         *
         * @param pane the pane that is to have it's selections loaded
         */
        SearchPanesST.prototype._update = function (pane) {
            var _this = this;
            if (pane === void 0) { pane = undefined; }
            return function () {
                if (pane) {
                    clearTimeout(pane.s.deselectTimeout);
                }
                _this._updateSelectionList(pane);
            };
        };
        /**
         * Returns a function that updates the selection list based on a specific pane
         * Also sets a timeout incase a select is about to be made
         *
         * @param pane the pane that is to have it's selections loaded
         */
        SearchPanesST.prototype._updateTimeout = function (pane) {
            var _this = this;
            if (pane === void 0) { pane = undefined; }
            return function () { return pane ?
                pane.s.deselectTimeout = setTimeout(function () { return _this._updateSelectionList(pane); }, 50) :
                _this._updateSelectionList(); };
        };
        /**
         * Updates the selection list to include the latest selections for a given pane
         *
         * @param index The index of the pane that is to be updated
         * @param selected Which rows are selected within the pane
         */
        SearchPanesST.prototype._updateSelectionList = function (paneIn) {
            if (paneIn === void 0) { paneIn = undefined; }
            // Bail if any of these flags are set
            if (this.s.pagingST) {
                // Reset pagingST flag
                this.s.pagingST = false;
                return;
            }
            else if (this.s.updating || paneIn && paneIn.s.serverSelecting) {
                return;
            }
            if (paneIn !== undefined) {
                if (this.s.dt.page.info().serverSide) {
                    paneIn._updateSelection();
                }
                // Get filter values for all of the rows and the selections
                var rows = paneIn.s.dtPane.rows({ selected: true }).data().toArray().map(function (el) { return el.filter; });
                this.s.selectionList = this.s.selectionList.filter(function (selection) { return selection.column !== paneIn.s.index; });
                if (rows.length > 0) {
                    this.s.selectionList.push({
                        column: paneIn.s.index,
                        rows: rows
                    });
                    paneIn.dom.clear.removeClass(this.classes.disabledButton).removeAttr('disabled');
                }
                else {
                    paneIn.dom.clear.addClass(this.classes.disabledButton).attr('disabled', 'true');
                }
                if (this.s.dt.page.info().serverSide) {
                    this.s.dt.draw(false);
                }
            }
            this._remakeSelections();
            this._updateFilterCount();
        };
        /**
         * Remake the selections that were present before new data or calculations have occured
         */
        SearchPanesST.prototype._remakeSelections = function () {
            var currPane;
            var pane;
            this.s.updating = true;
            if (!this.s.dt.page.info().serverSide) {
                var tmpSL = this.s.selectionList;
                var anotherFilter = false;
                this.clearSelections();
                this.s.dt.draw(false);
                // When there are no selections present if the length of the data does not match the searched data
                // then another filter is present
                if (this.s.dt.rows().toArray()[0].length > this.s.dt.rows({ search: 'applied' }).toArray()[0].length) {
                    anotherFilter = true;
                }
                this.s.selectionList = tmpSL;
                // Update the rows in each pane
                for (var _i = 0, _a = this.s.panes; _i < _a.length; _i++) {
                    pane = _a[_i];
                    if (pane.s.displayed) {
                        pane.s.filteringActive = anotherFilter;
                        pane.updateRows();
                    }
                }
                for (var _b = 0, _c = this.s.selectionList; _b < _c.length; _b++) {
                    var selection = _c[_b];
                    pane = null;
                    for (var _d = 0, _e = this.s.panes; _d < _e.length; _d++) {
                        var paneCheck = _e[_d];
                        if (paneCheck.s.index === selection.column) {
                            pane = paneCheck;
                            break;
                        }
                    }
                    if (!pane.s.dtPane) {
                        continue;
                    }
                    var ids = pane.s.dtPane.rows().indexes().toArray();
                    // Select the rows that are present in the selection list
                    for (var i = 0; i < selection.rows.length; i++) {
                        var rowFound = false;
                        for (var _f = 0, ids_1 = ids; _f < ids_1.length; _f++) {
                            var id = ids_1[_f];
                            var currRow = pane.s.dtPane.row(id);
                            var data = currRow.data();
                            if (selection.rows[i] === data.filter) {
                                currRow.select();
                                rowFound = true;
                            }
                        }
                        if (!rowFound) {
                            selection.rows.splice(i, 1);
                            i--;
                        }
                    }
                    pane.s.selections = selection.rows;
                    // If there are no rows selected then don't bother continuing past here
                    // Will just increase processing time and skew the rows that are shown in the table
                    if (selection.rows.length === 0) {
                        continue;
                    }
                    // Update the table to display the current results
                    this.s.dt.draw();
                    var filteringActive = false;
                    var filterCount = 0;
                    var prevSelectedPanes = 0;
                    var selectedPanes = 0;
                    // Add the number of all of the filters throughout the panes
                    for (var _g = 0, _h = this.s.panes; _g < _h.length; _g++) {
                        currPane = _h[_g];
                        if (currPane.s.dtPane) {
                            filterCount += currPane.getPaneCount();
                            if (filterCount > prevSelectedPanes) {
                                selectedPanes++;
                                prevSelectedPanes = filterCount;
                            }
                        }
                    }
                    filteringActive = filterCount > 0;
                    for (var _j = 0, _k = this.s.panes; _j < _k.length; _j++) {
                        currPane = _k[_j];
                        if (currPane.s.displayed) {
                            // Set the filtering active flag
                            if (anotherFilter || pane.s.index !== currPane.s.index || !filteringActive) {
                                currPane.s.filteringActive = filteringActive || anotherFilter;
                            }
                            else if (selectedPanes === 1) {
                                currPane.s.filteringActive = false;
                            }
                            // Update the rows to show correct counts
                            if (currPane.s.index !== pane.s.index) {
                                currPane.updateRows();
                            }
                        }
                    }
                }
                // Update table to show final search results
                this.s.dt.draw(false);
            }
            else {
                // Identify the last pane to have a change in selection
                if (this.s.selectionList.length > 0) {
                    pane = this.s.panes[this.s.selectionList[this.s.selectionList.length - 1].column];
                }
                // Update the rows of all of the other panes
                for (var _l = 0, _m = this.s.panes; _l < _m.length; _l++) {
                    currPane = _m[_l];
                    if (currPane.s.displayed && (!pane || currPane.s.index !== pane.s.index)) {
                        currPane.updateRows();
                    }
                }
            }
            this.s.updating = false;
        };
        return SearchPanesST;
    }(SearchPanes));

    /*! SearchPanes 2.3.1
     * © SpryMedia Ltd - datatables.net/license
     */
    setJQuery$4($);
    setJQuery($);
    setJQuery$3($);
    setJQuery$2($);
    setJQuery$1($);
    var dataTable = $.fn.dataTable;
    // eslint-disable-next-line no-extra-parens
    dataTable.SearchPanes = SearchPanes;
    // eslint-disable-next-line no-extra-parens
    DataTable.SearchPanes = SearchPanes;
    // eslint-disable-next-line no-extra-parens
    dataTable.SearchPanesST = SearchPanesST;
    // eslint-disable-next-line no-extra-parens
    DataTable.SearchPanesST = SearchPanesST;
    // eslint-disable-next-line no-extra-parens
    dataTable.SearchPane = SearchPane;
    // eslint-disable-next-line no-extra-parens
    DataTable.SearchPane = SearchPane;
    // eslint-disable-next-line no-extra-parens
    dataTable.SearchPaneViewTotal = SearchPaneViewTotal;
    // eslint-disable-next-line no-extra-parens
    DataTable.SearchPaneViewTotal = SearchPaneViewTotal;
    // eslint-disable-next-line no-extra-parens
    dataTable.SearchPaneCascade = SearchPaneCascade;
    // eslint-disable-next-line no-extra-parens
    DataTable.SearchPaneCascade = SearchPaneCascade;
    // eslint-disable-next-line no-extra-parens
    dataTable.SearchPaneCascadeViewTotal = SearchPaneCascadeViewTotal;
    // eslint-disable-next-line no-extra-parens
    DataTable.SearchPaneCascadeViewTotal = SearchPaneCascadeViewTotal;
    // eslint-disable-next-line no-extra-parens
    var apiRegister = $.fn.dataTable.Api.register;
    apiRegister('searchPanes()', function () {
        return this;
    });
    apiRegister('searchPanes.clearSelections()', function () {
        return this.iterator('table', function (ctx) {
            if (ctx._searchPanes) {
                ctx._searchPanes.clearSelections();
            }
        });
    });
    apiRegister('searchPanes.rebuildPane()', function (targetIdx, maintainSelections) {
        return this.iterator('table', function (ctx) {
            if (ctx._searchPanes) {
                ctx._searchPanes.rebuild(targetIdx, maintainSelections);
            }
        });
    });
    apiRegister('searchPanes.resizePanes()', function () {
        var ctx = this.context[0];
        return ctx._searchPanes ?
            ctx._searchPanes.resizePanes() :
            null;
    });
    apiRegister('searchPanes.container()', function () {
        var ctx = this.context[0];
        return ctx._searchPanes
            ? ctx._searchPanes.getNode()
            : null;
    });
    DataTable.ext.buttons.searchPanesClear = {
        action: function (e, dt) {
            dt.searchPanes.clearSelections();
        },
        text: 'Clear Panes'
    };
    DataTable.ext.buttons.searchPanes = {
        action: function (e, dt, node, config) {
            var _this = this;
            var that = this;
            if (!config._panes) {
                // No SearchPanes on this button yet - initialise and show
                this.processing(true);
                setTimeout(function () {
                    _buttonSourced(dt, node, config);
                    _this.popover(config._panes.getNode(), {
                        align: 'container',
                        span: 'container'
                    });
                    config._panes.rebuild(undefined, true);
                    // Tables were hidden in the popover, need to be resized
                    $('table.dataTable', config._panes.getNode()).DataTable().columns.adjust();
                    that.processing(false);
                }, 10);
            }
            else {
                // Already got SP - show it
                this.popover(config._panes.getNode(), {
                    align: 'container',
                    span: 'container'
                });
                config._panes.rebuild(undefined, true);
            }
        },
        init: function (dt, node, config) {
            dt.button(node).text(config.text || dt.i18n('searchPanes.collapse', 'SearchPanes', 0));
            // For cases when we need to initialise the SearchPane immediately
            if (dt.init().stateSave || config.delayInit === false) {
                _buttonSourced(dt, node, config);
            }
        },
        config: {},
        text: '',
        delayInit: true
    };
    function _buttonSourced(dt, node, config) {
        var buttonOpts = $.extend({
            filterChanged: function (count) {
                dt.button(node).text(dt.i18n('searchPanes.collapse', dt.context[0].oLanguage.searchPanes !== undefined ?
                    dt.context[0].oLanguage.searchPanes.collapse :
                    dt.context[0]._searchPanes.c.i18n.collapse, count));
            }
        }, config.config);
        var panes = buttonOpts && (buttonOpts.cascadePanes || buttonOpts.viewTotal) ?
            new DataTable.SearchPanesST(dt, buttonOpts) :
            new DataTable.SearchPanes(dt, buttonOpts);
        dt.button(node).text(config.text || dt.i18n('searchPanes.collapse', panes.c.i18n.collapse, 0));
        config._panes = panes;
    }
    function _init(settings, options, fromPre) {
        if (options === void 0) { options = null; }
        if (fromPre === void 0) { fromPre = false; }
        var api = new dataTable.Api(settings);
        var opts = options
            ? options
            : api.init().searchPanes || dataTable.defaults.searchPanes;
        var searchPanes = opts && (opts.cascadePanes || opts.viewTotal) ?
            new SearchPanesST(api, opts, fromPre) :
            new SearchPanes(api, opts, fromPre);
        var node = searchPanes.getNode();
        return node;
    }
    // Attach a listener to the document which listens for DataTables initialisation
    // events so we can automatically initialise
    $(document).on('preInit.dt.dtsp', function (e, settings) {
        if (e.namespace !== 'dt') {
            return;
        }
        if (settings.oInit.searchPanes ||
            DataTable.defaults.searchPanes) {
            if (!settings._searchPanes) {
                _init(settings, null, true);
            }
        }
    });
    // DataTables `dom` feature option
    DataTable.ext.feature.push({
        cFeature: 'P',
        fnInit: _init
    });
    // DataTables 2 layout feature
    if (DataTable.feature) {
        DataTable.feature.register('searchPanes', _init);
    }

})();


return DataTable;
}));


/*! Bootstrap integration for DataTables' SearchPanes
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net-jqui', 'datatables.net-searchpanes'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net-jqui')(root, $);
			}

			if ( ! $.fn.dataTable.SearchPanes ) {
				require('datatables.net-searchpanes')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;


$.extend(true, DataTable.SearchPane.classes, {
    disabledButton: 'dtsp-paneInputButton dtsp-disabledButton',
    paneButton: 'dtsp-paneButton ui-button',
    topRow: 'dtsp-topRow ui-state-default'
});
$.extend(true, DataTable.SearchPanes.classes, {
    clearAll: 'dtsp-clearAll ui-button',
    collapseAll: 'dtsp-collapseAll ui-button',
    container: 'dtsp-searchPanes',
    panes: 'dtsp-panesContainer fg-toolbar ui-toolbar ui-widget-header',
    showAll: 'dtsp-showAll ui-button'
});


return DataTable;
}));


