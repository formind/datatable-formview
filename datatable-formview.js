/*
YUI 3.14.1 (build 63049cb)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/
/*
formind 1.0.1 (build 1.0.01)
Copyright 2014 formind.
Licensed under the MIT License.
*/

YUI.add('datatable-formview', function (Y, NAME) {


var Lang         = Y.Lang,
    isArray      = Lang.isArray,
    isNumber     = Lang.isNumber,
    isString     = Lang.isString,
	isFunction   = Lang.isFunction,
	isObject     = Lang.isObject,
    fromTemplate = Lang.sub,
    htmlEscape   = Y.Escape.html,
    toArray      = Y.Array,
    bind         = Y.bind,
    YObject      = Y.Object,
    valueRegExp  = /\{value\}/g,
    keys 		  = Y.Object.keys,
    INVALID 	  = Y.Attribute.INVALID_VALUE;




/**
View class responsible for rendering a vertical, horizontal `<table>` from provided data.

Use : "requires": ["datatable-formview"]

	layout_type: 'form' or 'table'
	//
	var dataview = new Y.DataTable({columnset 		: cols,
									recordset 		: rec,
									layout_type 	: 'form',
									srcNode 		: sNode
									});

									
									
DataTable 
@class FormView
@namespace DataTable
@extends Widget, DataTable.Base
@since 1.0.1
**/

Y.DataTable.FormView = Y.Base.create('datatable', Y.Widget, [Y.DataTable.Base], {
	 
	BOUNDING_BOX 	: "boundingBox",
	TRUE 		  	: true,
    FALSE 		  	: false,
    SRC_NODE	  	: 'srcNode',
    TBODY_TEMPLATE	: '<tbody class="{className}"></tbody>',
	CELL_TEMPLATE	: '<td {headers} class="{className}">{content}</td>',

    ROW_TEMPLATE 	: '<tr id="{rowId}" data-yui3-record="{clientId}" class="{rowClass}">{content}</tr>',
    //if formatter is definied, example : input type : checkbox
    DL_CELL_LABEL_TEMPLATE: '<td STYLE="width:100px;height:35px;" class="yui3-datatableformview-label">{labeltext} </td> ', 
    //if not formatter is definied
    DL_LABEL_STYLE  : "",
    DL_ROW_STYLE    : "",
    DL_INPUT_TYPE	: "TEXT",
    DL_TEMP_ROW_ID  : "",
    DL_CELL_TEMPLATE: '<td {temp_label_style} class="yui3-datatableformview-label">{labeltext}</td>' +
    						 '<td><input type="{temp_input_type}" {temp_row_style} id="{temp_row_id}" value="{content}" class="{className}" /><\/td>',
	DL_CELL_TEXTAREA  	: new Y.Array(),
	
    /**
    The HTML template used to create the caption Node if the `caption`
    attribute is set.

    @property CAPTION_TEMPLATE
    @type {HTML}
    @default '<caption class="{className}"/>'
    @since 3.6.0
    **/
    CAPTION_TEMPLATE: '<caption class="{className}"/>',

    /**
    The HTML template used to create the table Node.

    @property TABLE_TEMPLATE
    @type {HTML}
    @default '<table cellspacing="0" class="{className}"/>'
    @since 3.6.0
    **/
    TABLE_TEMPLATE  : '<table cellspacing="0" class="{className}"/>',


	_getRecord: function (seed) {
        var modelList = this.data,//this.get('modelList'),
            tbody     = this.tbodyNode,
            row       = null,
            record;
		  if (typeof this.tbodyNode === 'undefined'){
				tbody = this.body.tbodyNode;
			} else {
				tbody = this.tbodyNode;
			}
        if (tbody) {
            if (isString(seed)) {
                seed = tbody.one('#' + seed);
            }

            if (Y.instanceOf(seed, Y.Node)) {
                row = seed.ancestor(function (node) {
                    return node.get('parentNode').compareTo(tbody);
                }, true);

                record = row &&
                    modelList.getByClientId(row.getData('yui3-record'));
            }
        }

        return record || null;
    },
    /**
    Relays call to the `bodyView`'s `getRecord` method if it has one.

    @method getRecord
    @param {String|Node} seed Node or identifier for a row or child element
    @return {Model}
    @since 3.6.0
    */
    
    getRecord: function () {
    	//this.body.tbodyNode = this.tbodyNode;
        return this.body && this.body.getRecord &&
            this.body.getRecord.apply(this.body, arguments);
    },
    
	/**
    

    @method getChanges
    @param none
    @return {array}
    @since 1.0.1
    */
	getChanges: function()	{
		/*if (!this.validate()){
			return false;
		}
		*/
		var columns = this.get('columns'),
            i, len = columns.length;
		var changes = [];
		var change  = {};
		var bclass='.yui3-datatable-cell';
		var colvisible ;
		var rows;
		
		if (typeof this.tbodyNode === 'undefined'){
			rows = this.body.tbodyNode.get('children');
		} else {
			rows = this.tbodyNode.get('children');
		}
		
		if (this.get('layout_type') == 'form' ) {
			var field_count = rows._nodes.length;
			var jb, ishave, field_id;
			for (var j=0; j<field_count; j++){
				var list = rows.item(j).all(bclass);
				var field = list.item(0);
				change	 = {};
				jb = 0, ishave = false;
				field_id = field.get("id");
				while ( jb<len && !ishave ){
					if (columns[jb].key == field_id ){
						change.key = columns[jb].key;
						change.col_value = Lang.trim(field.get('value'));
						changes.push(change);
						ishave = true;
					}
					jb++;
				}
			}
		} else {
			
			var list = rows.item(0).all('model_1');
			var field= list.item(0);
			
			change	 = {};
			change.key = columns[0].key;
			change.col_value = field.getData("id");
		}
		return changes;
	},

    //-----------------------------------------------------------------------//
    // Protected and private methods
    //-----------------------------------------------------------------------//
    /**
    Updates the table's `summary` attribute.

    @method _afterSummaryChange
    @param {EventHandle} e The change event
    @protected
    @since 3.6.0
    **/
    _afterSummaryChange: function (e) {
        this._uiSetSummary(e.newVal);
    },

    /**
    Updates the table's `<caption>`.

    @method _afterCaptionChange
    @param {EventHandle} e The change event
    @protected
    @since 3.6.0
    **/
    _afterCaptionChange: function (e) {
        this._uiSetCaption(e.newVal);
    },

    /**
    Updates the table's width.

    @method _afterWidthChange
    @param {EventHandle} e The change event
    @protected
    @since 3.6.0
    **/
    _afterWidthChange: function (e) {
        this._uiSetWidth(e.newVal);
    },

    /**
    Attaches event subscriptions to relay attribute changes to the child Views.

    @method _bindUI
    @protected
    @since 3.6.0
    **/
    _bindUI: function () {
        var relay;

        if (!this._eventHandles) {
            relay = Y.bind('_relayAttrChange', this);

            this._eventHandles = this.after({
                columnsChange  : relay,
                modelListChange: relay,
                summaryChange  : Y.bind('_afterSummaryChange', this),
                captionChange  : Y.bind('_afterCaptionChange', this),
                widthChange    : Y.bind('_afterWidthChange', this)
            });
        }
    },

    /**
    Creates the `<table>`.

    @method _createTable
    @return {Node} The `<table>` node
    @protected
    @since 3.5.0
    **/
    _createTable: function () {
        return Y.Node.create(fromTemplate(this.TABLE_TEMPLATE, {
            className: this.getClassName('table')
        })).empty();
    },
    
	//////////////////////////////////////
	 /** create vertical dataformview
	 
	 **/
	_getRowId: function (clientId) {
        return this._idMap[clientId] || (this._idMap[clientId] = Y.guid());
    },
	
	_createTBodyNode: function () {
        return Y.Node.create(fromTemplate(this.TBODY_TEMPLATE, {
            className: this.getClassName('data')
        }));
    },
	
	_createRowTemplate: function (columns) {
        var html         = '',
            cellTemplate = this.DL_CELL_TEMPLATE,
            F = Y.DataTable.BodyView.Formatters,
            i, len, col, key, token, headers, tokenValues, formatter, colvisible;

		  this._rowTemplate = "";
        for (i = 0, len = columns.length; i < len; ++i) {
            col     = columns[i];
            key     = col.key;
            token   = col._id || key;
            colvisible = (col.visible || "true") == "false" ? false : true;
            formatter = col.formatter;
            // Only include headers if there are more than one
            headers = (col._headers || []).length > 1 ?
                        'headers="' + col._headers.join(' ') + '"' : '';
			
			
            tokenValues = {
                content  : '{' + token + '}',
                headers  : headers,
                labeltext: (col.label || key ) + " :",
                temp_label_style : (col.label_style || this.DL_LABEL_STYLE),
                temp_row_style   : (col.row_style || this.DL_ROW_STYLE),
                temp_input_type  : (col.input_type || this.DL_INPUT_TYPE),
                temp_row_id	   : key,
                className: this.getClassName('col', token) + ' ' +
                           (col.className || '') + ' ' +
                           this.getClassName('cell') + ' {' + token + '-className} '
            };
            
            var cextra = col.textarea || [];
            if (formatter) {
                if (Lang.isFunction(formatter)) {
                    col._formatterFn = formatter;
                } else if (formatter in F) {
                    col._formatterFn = F[formatter].call(this.host || this, col);
                } else {
                    tokenValues.content = formatter.replace(valueRegExp, tokenValues.content);
                }
            }

            if (col.nodeFormatter) {
                // Defer all node decoration to the formatter
                tokenValues.content = '';
            }
            
            if ((col.cellTemplate || []).length > 1){
            	var tmp = cellTemplate + col.cellTemplate ;
            	html = fromTemplate(tmp, tokenValues);
         	} else {
         		if (cextra.length > 1 ){
         			var tmp_cell = this.DL_CELL_TEXTAREA[0] + this.DL_CELL_TEXTAREA[1] + this.DL_CELL_TEXTAREA[2];
         			tokenValues.temp_textarea = cextra;
         			html = fromTemplate(tmp_cell, tokenValues);
	         	} else {
	         		html = fromTemplate(col.cellTemplate || cellTemplate, tokenValues);
	         	}
         	}
         	
            if (colvisible ) {
		      	this._rowTemplate += fromTemplate(this.ROW_TEMPLATE, { content: html});
			}
		}

    },
	
    _createRowHTML: function (model, index, columns) {
        var data     = model.toJSON(),
            clientId = model.get('clientId'),
            values   = {
                rowId   : this._getRowId(clientId),
                clientId: clientId,
                rowClass: (index % 2) ? this.CLASS_ODD : this.CLASS_EVEN
            },
            host = this.host || this,
            i, len, col, token, value, formatterData
            ret_html = "";

        for (i = 0, len = columns.length; i < len; ++i) {
            col   = columns[i];
            value = data[col.key];
            token = col._id || col.key;
            

            values[token + '-className'] = '';

            if (col._formatterFn) {
                formatterData = {
                    value    : value,
                    data     : data,
                    column   : col,
                    record   : model,
                    className: '',
                    rowClass : '',
                    rowIndex : index
                };

                // Formatters can either return a value
                value = col._formatterFn.call(host, formatterData);

                // or update the value property of the data obj passed
                if (value === undefined) {
                    value = formatterData.value;
                }

                values[token + '-className'] = formatterData.className;
                values.rowClass += ' ' + formatterData.rowClass;
            }

            if (value === undefined || value === null || value === '') {
                value = col.emptyCellValue || '';
            }

            values[token] = col.allowHTML ? value : htmlEscape(value);

            values.rowClass = values.rowClass.replace(/\s+/g, ' ');
            
        }
         
		ret_html = fromTemplate(this._rowTemplate, values);
		 
		  
        return ret_html;
    },
    
    _createDataHTML: function (columns) {
        var data = this.data, //this.get('modelList'),
            html = '';

        if (data) {
            data.each(function (model, index) {
                html += this._createRowHTML(model, index, columns);
            }, this);
        }
		//Y.log(html);
        return html;
    },
    
    _applyNodeFormatters: function (tbody, columns) {
        var host = this.host,
            data = this.data,//this.get('modelList'),
            formatters = [],
            linerQuery = '.' + this.getClassName('liner'),
            rows, i, len;

        // Only iterate the ModelList again if there are nodeFormatters
        for (i = 0, len = columns.length; i < len; ++i) {
            if (columns[i].nodeFormatter) {
                formatters.push(i);
            }
        }

        if (data && formatters.length) {
            rows = tbody.get('childNodes');

            data.each(function (record, index) {
                var formatterData = {
                        data      : record.toJSON(),
                        record    : record,
                        rowIndex  : index
                    },
                    row = rows.item(index),
                    i, len, col, key, cells, cell, keep;


                if (row) {
                    cells = row.get('childNodes');
                    for (i = 0, len = formatters.length; i < len; ++i) {
                        cell = cells.item(formatters[i]);

                        if (cell) {
                            col = formatterData.column = columns[formatters[i]];
                            key = col.key || col.id;

                            formatterData.value = record.get(key);
                            formatterData.td    = cell;
                            formatterData.cell  = cell.one(linerQuery) || cell;

                            keep = col.nodeFormatter.call(host,formatterData);

                            if (keep === false) {
                                // Remove from the Node cache to reduce
                                // memory footprint.  This also purges events,
                                // which you shouldn't be scoping to a cell
                                // anyway.  You've been warned.  Incidentally,
                                // you should always return false. Just sayin.
                                cell.destroy(true);
                            }
                        }
                    }
                }
            });
        }
    },
    
    _afterRenderCleanup: function () {
        var columns = this.get('columns'),
            i, len = columns.length;

        for (i = 0;i < len; i+=1) {
            delete columns[i]._formatterFn;
        }

    },
	
	_renderBodyForm: function (){
	 	  var //table   = this.get('container'),
 	  	    table	  = this.tableNode,
            //data    = this.get('modelList'),
            data    = this.data,
            columns = this.get('columns'),
            tbody   = this.tbodyNode ||
                      (this.tbodyNode = this._createTBodyNode());
            
            this.tbodyNode = tbody;
            
		
		this._idMap={};
		this.CLASS_ODD  = this.getClassName('odd');
        this.CLASS_EVEN = this.getClassName('even');
        // Needed for mutation
        this._createRowTemplate(columns);

        if (data) {
            tbody.setHTML(this._createDataHTML(columns));

            this._applyNodeFormatters(tbody, columns);
        }

        if (tbody.get('parentNode') !== table) {
            table.appendChild(tbody);
        }

        this._afterRenderCleanup();
        return tbody;
    },
	 
	 //////////////////////////////////////
    /**
    Calls `render()` on the `bodyView` class instance.

    @method _defRenderBodyFn
    @param {EventFacade} e The renderBody event
    @protected
    @since 3.5.0
    **/
    _defRenderBodyFn: function (e) {
    	
    	if (this.get('layout_type') == 'form' ) {
	    	var ltbodyNode ;
	    	if (!this.tableNode) {
	            this.tableNode = this._createTable();
	      }
	      ltbodyNode = this._renderBodyForm();
    	} else {
    		//e.view.__proto__.CELL_TEMPLATE = this.CELL_EDIT_TEMPLATE;
    		e.view.render();
    		
      }
    },

    /**
    Calls `render()` on the `footerView` class instance.

    @method _defRenderFooterFn
    @param {EventFacade} e The renderFooter event
    @protected
    @since 3.5.0
    **/
    _defRenderFooterFn: function (e) {
        e.view.render();
    },

    /**
    Calls `render()` on the `headerView` class instance.

    @method _defRenderHeaderFn
    @param {EventFacade} e The renderHeader event
    @protected
    @since 3.5.0
    **/
    _defRenderHeaderFn: function (e) {
    	  if (this.get('layout_type') == 'form' ) {
    	  } else {
    	  		e.view.render();
    	  } 
        
    },

    /**
    Renders the `<table>` and, if there are associated Views, the `<thead>`,
    `<tfoot>`, and `<tbody>` (empty until `syncUI`).

    Assigns the generated table nodes to the `tableNode`, `_theadNode`,
    `_tfootNode`, and `_tbodyNode` properties.  Assigns the instantiated Views
    to the `head`, `foot`, and `body` properties.


    @method _defRenderTableFn
    @param {EventFacade} e The renderTable event
    @protected
    @since 3.5.0
    **/
    _defRenderTableFn: function (e) {
    	//Y.log('start _defRenderTableFn ');
        var container = this.get('container'),
            attrs = this.getAttrs();

        if (!this.tableNode) {
            this.tableNode = this._createTable();
        }

        attrs.host  = this.get('host') || this;
        attrs.table = this;
        attrs.container = this.tableNode;
		attrs.modelList = this.data; //hz

        this._uiSetCaption(this.get('caption'));
        this._uiSetSummary(this.get('summary'));
        this._uiSetWidth(this.get('width'));


        if (this.head || e.headerView) {
            if (!this.head) {
                this.head = new e.headerView(Y.merge(attrs, e.headerConfig));
            }

            this.fire('renderHeader', { view: this.head });
        }

        if (this.foot || e.footerView) {
            if (!this.foot) {
                this.foot = new e.footerView(Y.merge(attrs, e.footerConfig));
            }

            this.fire('renderFooter', { view: this.foot });
        }

        attrs.columns = this.displayColumns;

        if (this.body || e.bodyView) {
            if (!this.body) {
            	 
                this.body = new e.bodyView(Y.merge(attrs, e.bodyConfig));
            }
			   
            this.fire('renderBody', { view: this.body });
        }
		  
        if (!container.contains(this.tableNode)) {
            container.append(this.tableNode);
        }
        
        
        

        this._bindUI();
    },

    /**
    Cleans up state, destroys child views, etc.

    @method destructor
    @protected
    **/
    destructor: function () {
        if (this.head && this.head.destroy) {
            this.head.destroy();
        }
        delete this.head;

        if (this.foot && this.foot.destroy) {
            this.foot.destroy();
        }
        delete this.foot;

        if (this.body && this.body.destroy) {
            this.body.destroy();
        }
        delete this.body;

        if (this._eventHandles) {
            this._eventHandles.detach();
            delete this._eventHandles;
        }

        if (this.tableNode) {
            this.tableNode.remove().destroy(true);
        }
    },

    /**
    Processes the full column array, distilling the columns down to those that
    correspond to cell data columns.

    @method _extractDisplayColumns
    @protected
    **/
    _extractDisplayColumns: function () {
        var columns = this.get('columns'),
            displayColumns = [];

        function process(cols) {
            var i, len, col;

            for (i = 0, len = cols.length; i < len; ++i) {
                col = cols[i];

                if (isArray(col.children)) {
                    process(col.children);
                } else {
                    displayColumns.push(col);
                }
            }
        }

        if (columns) {
            process(columns);
        }

        /**
        Array of the columns that correspond to those with value cells in the
        data rows. Excludes colspan header columns (configured with `children`).

        @property displayColumns
        @type {Object[]}
        @since 3.6.0
        **/
        this.displayColumns = displayColumns;
    },

    /**
    Publishes core events.

    @method _initEvents
    @protected
    @since 3.5.0
    **/
    _initEvents: function () {
        this.publish({
            // Y.bind used to allow late binding for method override support
            renderTable : { defaultFn: Y.bind('_defRenderTableFn', this) },
            renderHeader: { defaultFn: Y.bind('_defRenderHeaderFn', this) },
            renderBody  : { defaultFn: Y.bind('_defRenderBodyFn', this) },
            renderFooter: { defaultFn: Y.bind('_defRenderFooterFn', this) }
        });
    },

    /**
    Constructor logic.

    @method intializer
    @param {Object} config Configuration object passed to the constructor
    @protected
    @since 3.6.0
    **/
    initializer: function (config) {
        this.host = config.host;
        
    	  this.DL_CELL_TEXTAREA[0] = '<td {temp_label_style} class="yui3-datatableformview-label">{labeltext}</td>';
    	  this.DL_CELL_TEXTAREA[1] = '<td>'; // example : <textarea id="findstr" rows="30" cols="50">blabla</textarea> 
    	  this.DL_CELL_TEXTAREA[2] = '<textarea {temp_textarea} {temp_row_style} id="{temp_row_id}" class="{className}">{content}</textarea><\/td>';
    	  
		  

        this._initEvents();

        this._extractDisplayColumns();

        this.after('columnsChange', this._extractDisplayColumns, this);
        
    },

    /**
    Relays attribute changes to the child Views.

    @method _relayAttrChange
    @param {EventHandle} e The change event
    @protected
    @since 3.6.0
    **/
    _relayAttrChange: function (e) {
        var attr = e.attrName,
            val  = e.newVal;

        if (this.head) {
            this.head.set(attr, val);
        }

        if (this.foot) {
            this.foot.set(attr, val);
        }

        if (this.body) {
            if (attr === 'columns') {
                val = this.displayColumns;
            }

            this.body.set(attr, val);
        }
    },

    /**
    Creates the UI in the configured `container`.

    @method render
    @return {TableView}
    @chainable
    **/
    render: function () {
    	
    	
		if (this.get('container')) {
      
            this.fire('renderTable', {
                headerView  : this.get('headerView'),
                headerConfig: this.get('headerConfig'),

                bodyView    : this.get('bodyView'),
                bodyConfig  : this.get('bodyConfig'),

                footerView  : this.get('footerView'),
                footerConfig: this.get('footerConfig')
            });
        }

        return this;
    },

    /**
    Creates, removes, or updates the table's `<caption>` element per the input
    value.  Empty values result in the caption being removed.

    @method _uiSetCaption
    @param {HTML} htmlContent The content to populate the table caption
    @protected
    @since 3.5.0
    **/
    _uiSetCaption: function (htmlContent) {
        var table   = this.tableNode,
            caption = this.captionNode;

        if (htmlContent) {
            if (!caption) {
                this.captionNode = caption = Y.Node.create(
                    fromTemplate(this.CAPTION_TEMPLATE, {
                        className: this.getClassName('caption')
                    }));

                table.prepend(this.captionNode);
            }

            caption.setHTML(htmlContent);

        } else if (caption) {
            caption.remove(true);

            delete this.captionNode;
        }
    },

    /**
    Updates the table's `summary` attribute with the input value.

    @method _uiSetSummary
    @protected
    @since 3.5.0
    **/
    _uiSetSummary: function (summary) {
        if (summary) {
            this.tableNode.setAttribute('summary', summary);
        } else {
            this.tableNode.removeAttribute('summary');
        }
    },

    /**
    Sets the `boundingBox` and table width per the input value.

    @method _uiSetWidth
    @param {Number|String} width The width to make the table
    @protected
    @since 3.5.0
    **/
    _uiSetWidth: function (width) {
        var table = this.tableNode;

        // Table width needs to account for borders
        table.setStyle('width', !width ? '' :
            (this.get('container').get('offsetWidth') -
             (parseInt(table.getComputedStyle('borderLeftWidth'), 10)||0) -
             (parseInt(table.getComputedStyle('borderLeftWidth'), 10)||0)) +
             'px');

        table.setStyle('width', width);
    },
    
    _defaultCB : function(node) {
        return this.get(this.SRC_NODE) || null;
    },
    
    _setCB: function(node) {
        return (this.CONTENT_TEMPLATE === null) ? this.get(this.BOUNDING_BOX) : this._setBox(null, node, this.CONTENT_TEMPLATE, false);
    },

    /**
    Ensures that the input is a View class or at least has a `render` method.

    @method _validateView
    @param {View|Function} val The View class
    @return {Boolean}
    @protected
    **/
    _validateView: function (val) {
        return isFunction(val) && val.prototype.render;
    }
}, {
    ATTRS: {
    	
	container : {
		    valueFn:"_defaultCB",
		    setter: "_setCB",
		    writeOnce: this.TRUE
	},
	columns: {
            validator: isArray
        },
		width: {
            value: '',
            validator: Y.Lang.isString
        },
	headerView: {
            value: Y.DataTable.HeaderView,
            validator: '_validateView'
        },
		bodyView: {
            value: Y.DataTable.BodyView,
            validator: '_validateView'
        },
    	layout_type: {
            value: 'form',
            validator: Lang.isString
        }
      
        
    }
});


// The DataTable API docs are above DataTable.Base docs.
Y.DataTable = Y.mix(
    Y.Base.create('datatable', Y.DataTable.FormView, []), // Create the class
    Y.DataTable); // Migrate static and namespaced classes

}, '1.0.1', {"requires": [	"datatable-base", 
							"datatable-core", 
							"datatable-head", 
							"datatable-body", 
							"view", 
							"widget", 
							"attribute", 
							"classnamemanager"]
							});
