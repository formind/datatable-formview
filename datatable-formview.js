YUI.add('datatable-formview', function (Y, NAME) {
/*
1.0.1
Copyright 2014 formind. All rights reserved.
Licensed under the BSD License.
*/


/**
View class responsible for rendering the `<tbody>` section of a table.
Editable datatable as form

@module datatable
@submodule datatable-formview
**/
var Lang             = Y.Lang,
    isArray          = Lang.isArray,
    isNumber         = Lang.isNumber,
    isString         = Lang.isString,
    fromTemplate     = Lang.sub,
    htmlEscape       = Y.Escape.html,
    toArray          = Y.Array,
    bind             = Y.bind,
    YObject          = Y.Object,
    valueRegExp      = /\{value\}/g,
    EV_CONTENT_UPDATE = 'contentUpdate';

/**
@class FormView
@extends Y.DataTable.BodyView
@since 1.0.1
**/


Y.FormView = Y.Base.create('formview', Y.DataTable.BodyView, [], {

    // -- Instance properties -------------------------------------------------

	DL_CELL_LABEL_TEMPLATE	: '<td class="yui3-datatable-label">{labeltext} </td> ', 
    //if not formatter is definied
    DL_LABEL_STYLE  		: "",
    DL_ROW_STYLE    		: "",
    DL_INPUT_TYPE			: "TEXT",
    DL_TEMP_ROW_ID  		: "",
    DL_CELL_TEMPLATE		: '<td {temp_label_style} class="yui3-datatable-label">{labeltext}</td>' +
							  '<td><input type="{temp_input_type}" {temp_row_style} id="{temp_row_id}" value="{content}" class="{className}" /><\/td>',
	DL_CELL_TEXTAREA  		: new Y.Array(),

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
	
		return changes;
	},
	
	_createRowTemplate: function (columns) {
        var html         = '',
            cellTemplate = this.DL_CELL_TEMPLATE,
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
            if (!formatter && col.formatter) {
                tokenValues.content = col.formatter.replace(valueRegExp, tokenValues.content);
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
    
	
    /**
    Destroys the instance.

    @method destructor
    @protected
    @since 3.5.0
    **/
    destructor: function () {
        (new Y.EventHandle(YObject.values(this._eventHandles))).detach();
    },


    /**
    Initializes the instance. Reads the following configuration properties in
    addition to the instance attributes:

      * `columns` - (REQUIRED) The initial column information
      * `host`    - The object to serve as source of truth for column info and
                    for generating class names

    @method initializer
    @param {Object} config Configuration data
    @protected
    @since 3.5.0
    **/
    initializer: function (config) {
		  Y.log('FormView initializer !', 'info');
        		
		  this.DL_CELL_TEXTAREA[0] = '<td {temp_label_style} class="yui3-datatable-formview-label">{labeltext}</td>';
    	this.DL_CELL_TEXTAREA[1] = '<td>'; // example : <textarea id="findstr" rows="30" cols="50">blabla</textarea> 
    	this.DL_CELL_TEXTAREA[2] = '<textarea {temp_textarea} {temp_row_style} id="{temp_row_id}" class="{className}">{content}</textarea><\/td>';
		
    },
	
	
	render: function () {
		  Y.log('FormView render ', 'info');
      var table   = this.get('container'),
          data    = this.get('modelList'),
          displayCols = this.get('columns'),
          tbody   = this.tbodyNode ||
                      (this.tbodyNode = this._createTBodyNode());

        // Needed for mutation
      this._createRowTemplate(displayCols);

      if (data) {
          tbody.setHTML(this._createDataHTML(displayCols));
          this._applyNodeFormatters(tbody, displayCols);
      }

      if (tbody.get('parentNode') !== table) {
          table.appendChild(tbody);
      }
      this.bindUI();

      return this;
    }
	

},{
	NAME 		: {value : "FormView"}
	
});

	

}, '1.0.1', {"requires": ["datatable-body", "classnamemanager"]});
