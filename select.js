if (Function.prototype.bind !== 'function') {

    Function.prototype.bind = (function (slice){

        // (C) WebReflection - Mit Style License
        function bind(context) {

            var self = this; // "trapped" function reference

            // only if there is more than an argument
            // we are interested into more complex operations
            // this will speed up common bind creation
            // avoiding useless slices over arguments
            if (1 < arguments.length) {
                // extra arguments to send by default
                var $arguments = slice.call(arguments, 1);
                return function () {
                    return self.apply(
                        context,
                        arguments.length ?
                            // concat arguments with those received
                            $arguments.concat(slice.call(arguments)) :
                            // send just arguments, no concat, no slice
                            $arguments
                    );
                };
            }
            // optimized callback
            return function () {
                // speed up when function is called without arguments
                return arguments.length ? self.apply(context, arguments) : self.call(context);
            };
        }

        // the named function
        return bind;

    }(Array.prototype.slice));
}

if (typeof Array.prototype.forEach !== 'function') { 
    Array.prototype.forEach = function(func, scope) { 
	    scope = scope || this; 
		for (var i = 0, l = this.length; i < l; i++){
            func.call(scope, this[i], i, this); 
		}
	};
}

if(typeof Array.prototype.filter !== 'function'){
	Array.prototype.filter = function(iterator, context) {
		var results = [];
		this.forEach(function(value, index, list) {
		  if (iterator.call(context, value, index, list)) results[results.length] = value;
		});
		return results;
	  };
}



(function(){
    var context = this;
    var $ = typeof('KISSY') !== 'undefined' ? KISSY.Node : context.$;
    function extend(target, src){
        for(var key in src) {
            if(src.hasOwnProperty(key)) {
                target[key] = src[key];
            }
        }
    }
    function CheckboxSelect (root, selectAllNode, options) {
        if(typeof selectAllNode === 'string'){
            selectAllNode = document.getElementById(selectAllNode);
        }
        if(typeof root === 'string'){
            root = document.getElementById(root);
        }
        this.lastSelectedIndex = 0; 
        this.selecteClassName = 'item-selected';
        this.root = root;
        this.selectAllNode = selectAllNode;
        extend(this, options);
        this.initialize();
    }

    CheckboxSelect.$ = $;
	CheckboxSelect.prototype = {
        getCheckboxes: function (elm){
            elm = elm || this.root;
            return elm ? elm.getElementsByTagName('input') : [];
        },
        listen: function(e){
            var target = e.target;
            if(target === this.selectAllNode){
                this.checkboxSelectAll(target);
            }else if(target.type === 'checkbox'){
                this.handleSelectCheckBox(target, e);
            }
        },
        initialize: function(){
            var self = this;
            $(this.root).on('click', this.listen.bind(this)); 
        },
        addCheckedClassName: function (checkbox){
            if(checkbox === this.selectAllNode){return;}
        	$(checkbox.parentNode.parentNode).addClass(this.selectedClassName);
        },
        restoreClassName: function (checkbox){
        	$(checkbox.parentNode.parentNode).removeClass(this.selectedClassName);
        },
        getAll: function(){
            return this.getList(this.root); 
        },
        getList: function (elm){
            var inputs = elm.getElementsByTagName('input'),
            arr = [];
            try{
                arr = Array.prototype.slice.call(inputs, 0);
            }catch(e){
                for(var i = 0, l = inputs.length; i < l; i++){
                    arr.push(inputs[i]);
                }
            }
            return arr.filter(function(item){
                    return item.type === 'checkbox';
            });
        },
        getSelected: function (type, elm){
            elm = elm || this.root;
            var inputs = this.getList(elm),
                input, item,
                matched = [];
            for(var i = 0, l = inputs.length; i < l; i++){
                item = null;
                input = inputs[i];
                if(input.checked){
                    switch(type){
                        case 'value':
                            item = input.value;
                            break;
                        case 'checkbox':
                            item = input;
                            break;
                        default:
                            if(typeof type === 'function'){
                                item = type(input);
                            }else{
                                item = {id: input.value, checkbox: input, row: input.parentNode.parentNode};
                            }
                    }
                    matched[matched.length] = item;
                }
            }
            return matched;
        },
        loop: function(fn, pNode){
            var nodelist = this.getCheckboxes(pNode), checkbox;
            for(var i=0, l=nodelist.length; i<l; i++){
                checkbox = nodelist[i];
                if(!checkbox.getAttribute('disabled')){
                    typeof fn === 'function' && fn(checkbox);
                }
            }
        },
        restoreSelectAllNode: function (){
            if(this.selectAllNode){this.selectAllNode.checked = false;}
        },
        doSelect: function (checkbox){
            checkbox.checked = true;
            this.addCheckedClassName(checkbox);
        },
        undoSelect: function (checkbox){
            checkbox.checked = false;
            this.restoreClassName(checkbox);
        },
        select: function (item, index){
            if(index > 0){
                this.addCheckedClassName(item);
            }
        },
        unSelect: function (item){
            this.restoreClassName(item);
            this.restoreSelectAllNode();
        },
        selectAll: function (pNode){
            this.loop(this.doSelect.bind(this), pNode);	
        },
        unSelectAll: function (pNode){
            this.loop(this.undoSelect.bind(this), pNode);	
            this.restoreSelectAllNode();
        },
        toggleSelectAll: function (selected, pNode){
            return selected ? this.unSelectAll(pNode) : this.selectAll(pNode);
        },
        selectByStatus: function (fn){
            var self = this;
            this.loop(function(checkbox){
                var isValid = fn(checkbox);
                if(isValid){
                    self.doSelect(checkbox);
                }else{
                    self.undoSelect(checkbox);
                }
            });	
        },
        checkboxSelect: function (checkbox) {
            if(!checkbox || checkbox.type !== 'checkbox'){return;}
            if(checkbox.checked) {
                this.select(checkbox, 1);
            } else {
                this.unSelect(checkbox, 1);
            }
        },
        checkboxSelectAll: function (checkbox, pNode) {
            if(!checkbox || checkbox.type !== 'checkbox'){return;}
            if(checkbox.checked) {
                this.selectAll(pNode);
            } else {
                this.unSelectAll(pNode);
            }
        },
        handleSelectCheckBox: function (elm, event){
            if(!elm || elm.nodeType !== 1){return;}
            this.checkboxSelect(elm);
            var pNode = this.root;
            var inputs = this.getAll(), l = inputs.length;
            while(l--){
                if(inputs[l] === elm){
                    break;
                }
            }
            if(event.shiftKey && typeof this.lastSelectedIndex !== 'undefined'){
                var rows = pNode.getElementsByTagName('tr'), swap;
                if(l < this.lastSelectedIndex){
                    swap = l;
                    l = this.lastSelectedIndex;
                    this.lastSelectedIndex = swap;
                }
                for(var i = this.lastSelectedIndex; i <= l; i++){
                    var checkbox = inputs[i];
                    if(inputs[this.lastSelectedIndex].checked){
                        checkbox.checked = true;
                        this.addCheckedClassName(checkbox);
                    }else{
                        checkbox.checked = false;
                        this.restoreClassName(checkbox);
                    }
                }
            }
            this.lastSelectedIndex = l;
        }
    };
    window.CheckboxSelect = CheckboxSelect;
})();

window.onload = function(){
    var root = document.getElementById('J_select'),
        $ = CheckboxSelect.$;
    var select = new CheckboxSelect(root, 'selectAllInput', { selectedClassName: 'item_focus'});
    CheckboxSelect.$(root).on('click', function(e){
        var target = $(e.target);
        switch(true){
        case target.hasClass('un_select_all'):
                select.unSelectAll();           
                break;
        case target.hasClass('s_select_unread'):
                select.selectByStatus(function(item){
                        return item.getAttribute('unread') === '1' ;
                });
                break;
        case target.hasClass('s_select_read'):
                select.selectByStatus(function(item){
                        return item.getAttribute('unread') === '0' ;
                });
                break;
        case target.hasClass('s_select_all'):
                select.selectAll();
                break;
        case target.hasClass('list-title'):
            var node = document.getElementById(target.attr('data-target'));
            if(target.attr('selected') !== '1'){
                select.selectAll(node);
            }else{
                select.unSelectAll(node);           
            }
            break;
        }
    })
};
