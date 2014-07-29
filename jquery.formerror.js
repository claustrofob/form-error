/**!
 * jQuery plugin for form error highlighting
 */
(function ($) {

    /**
     * error handler must implement 3 methods: show, hide, destroy
     */
    var DefaultErrorHandler = (function(){

        function getTitle(handler){
            var message = handler.input.data('errors') || '';

            if (typeof message != 'object'){
                message = [message];
            }

            var html = document.createElement('div');
            for (var i in message){
                if (!message[i].length) continue;

                var li = document.createElement('div');
                li.innerHTML = message[i];
                html.appendChild(li);
            }

            return html;
        }

        function createTooltip(handler){
            handler.target.tooltip({
                "trigger": "manual",
                "placement": function(tip, el){
                    return handler.input.data('error-position') ? handler.input.data('error-position') : handler.position;
                },
                "animation": false,
                "title": function(){
                    return getTitle(handler);
                },
                "html": true,
                container: 'body'
            });
        }

        function getTooltip(handler){
            var obj = handler.target.data('bs.tooltip');
            if (!obj){
                createTooltip(handler);
                obj = handler.target.data('bs.tooltip');            }

            return obj;
        }

        function ErrorHandler(target, input, position) {
            this.target = $(target);
            this.input = $(input);
            this.position = position;
        }

        ErrorHandler.prototype = {

            target: null,
            input: null,
            position: null,

            show: function(){
                getTooltip(this).show();
            },

            hide: function(){
                getTooltip(this).hide();
            },

            destroy: function(){
                getTooltip(this).destroy();
            }
        };

        return ErrorHandler;

    })();

    function FormError(form) {
        if (form.data('formError')) {
            return form.data('formError');
        }

        form.data('formError', this);
        this.form = form;
        this.position = $.fn.formError.position;
        this.errorHandler = $.fn.formError.errorHandler;
        this.errorBoxSelector = $.fn.formError.errorBoxSelector;
        this.errorTargetSelector = $.fn.formError.errorTargetSelector;

        var _this = this;

        form.on('input.formError propertychange.formError change.formError update.formError', ':input', function(e){
            var $this = $(this);
            if (!$this.hasClass('has-error')) return;

            var el = _this.findInput($this, true);
            _this.unbindError(el);
        })
        .on('mouseenter.formError mouseleave.formError focusin.formError focusout.formError', ':input, label, .error-hover', function(e){

            var $this = $(this);
            var input = $this.is('label') ? $this.data('for.formError') : $this;

            if (input && !input.hasClass('has-error')){
                input = input.closest(_this.errorBoxSelector).find(':input.has-error');
            }

            if (!input || !input.hasClass('has-error')){
                return;
            }

            switch (e.type){
                case 'mouseenter':
                case 'focusin':
                    _this.showError(input);
                    break;

                case 'mouseleave':
                case 'focusout':
                    _this.hideError(input);
                    break;
            }
        });
    };

    FormError.prototype = {
            getErrorInputs: function(){
                return this.form.find(':input.has-error');
            },

            getErrorTarget: function(input){
                var input= $(input);

                var target = input.closest(this.errorTargetSelector);
                if (!target.length) target = input.closest(':visible');

                return target;
            },

            getErrorHandler: function(input){
                var input= $(input);

                var target = this.getErrorTarget(input);

                var handler = target.data('formerror.handler');
                if (!handler) {
                    handler = new this.errorHandler(target, input, this.position);
                    target.data('formerror.handler');
                }

                return handler;
            },

            /**
             * @param input - jQuery object | field name | undefined
             * if no params passed show errors on all fields
             */
            showError: function(input, persist) {
                var _this = this;

                if (!input){
                    input = this.getErrorInputs();
                } else {
                    input = this.findInput(input);
                }

                return input.each(function(){
                    if (persist !== undefined){
                        $(this).data('error-persist', persist);
                    }
                   _this.getErrorHandler(this).show();
                });
            },

            /**
             * @param input - jQuery object | field name | undefined
             * if no params passed hide errors on all fields
             */
            hideError: function(input) {
                var _this = this;

                if (!input){
                    input = this.getErrorInputs();
                } else {
                    input = this.findInput(input);
                }

                return input.each(function(){
                    if (!$(this).data('error-persist')){
                        _this.getErrorHandler(this).hide();
                    }
                });
            },

            setError: function(input, message){
                var _this = this;
                if (!input){
                    input = this.getErrorInputs();
                } else {
                    input = this.findInput(input);
                }

                return input.each(function(){
                    var $this = $(this);

                    $this.addClass('has-error').closest(_this.errorBoxSelector).addClass('has-error');

                    var messageType = typeof message;
                    if (messageType == 'string' || messageType == 'object'){
                        $this.data('errors', message);
                    }
                    _this.initLabel(this);
                });
            },

            unbindError: function(input) {
                var _this = this;
                input.removeClass('has-error').closest(this.errorBoxSelector).removeClass('has-error');
                input.removeData('error-persist');
                input.each(function(){
                    _this.getErrorHandler(this).destroy();
                    _this.getErrorTarget(this).removeData('formerror.handler');
                });

                this.initLabel(input);
            },

            findInput: function(input, findAll) {
                var name = null;

                if (typeof input == 'string'){
                    name = input;
                } else if (findAll){
                    input = $(input);
                    if (input.data('group')) name = input.data('group');
                    else if (input.attr('name')) name = input.attr('name');
                }

                if (name !== null){
                    input = this.form.find(':input[name^="'+name+'["]');
                    if (!input.size()){
                        input = this.form.find(':input[name="'+name+'"]');
                    }
                    if (!input.size()){
                        input = this.form.find(':input[data-group="'+name+'"]');
                    }
                }

                return $(input);
            },

            initLabel: function(input) {
                var _this = this;
                return $(input).each(function(){
                    var $this = $(this);
                    var id = $this.attr('id');
                    var label  = $();

                    if (id){
                        label = _this.form.find('label[for='+id+']');
                    }

                    if (!label.length){
                        label = $this.parents('label').last();
                    }

                    if (label.length){
                        label.data('for.formError', $this);
                        $this.hasClass('has-error') ? label.addClass('has-error') : label.removeClass('has-error');
                    }
                });
            },

            initErrors: function(errors){
                if (typeof errors == 'object'){
                    this.unbindError(this.getErrorInputs());

                    for (fieldName in errors){
                        this.setError(fieldName, errors[fieldName]);
                    }
                } else {
                    this.setError();
                }
            },

            destroy: function(){
                this.unbindError(this.getErrorInputs());
                this.form.off('.formError').removeData('formError');
            },

            setPosition: function(position, input){
                if (!input){
                    this.position = position;
                } else {
                    input = this.findInput(input);
                    input.data('error-position', position);
                }
            }
    };

    var publicMethods = {
        "show": "showError",
        "hide": "hideError",
        "error": "setError",
        "destroy": "destroy",
        "position": "setPosition"
    };

    $.fn.formError = function() {
        var args = Array.prototype.slice.call(arguments);
        var options = args.shift();

        $(this).each(function() {
            var form = new FormError($(this));

            if (typeof options == 'string'){
                publicMethods[options] ? form[publicMethods[options]].apply(form, args) : 0;
            } else {
                form.initErrors(options);
            }
        });

        return this;
    };

    $.fn.formError.position = "bottom";
    $.fn.formError.errorHandler = DefaultErrorHandler;
    $.fn.formError.errorBoxSelector = '.form-group';
    $.fn.formError.errorTargetSelector = '.error-target';

})(jQuery);
