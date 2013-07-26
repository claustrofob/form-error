/**!
 * jQuery plugin for form error highlighting
 */
(function ($) {

    function FormError(form) {
        if (form.data('formError')) {
            return form.data('formError');
        }

        form.data('formError', this);
        this.form = form;
        this.position = $.fn.formError.position;

        var _this = this;

        form.on('change.formError sum-changed.formError', ':input', function(e){
            var $this = $(this);
            if (!$this.hasClass('error')) return;

            var el = _this.findInputByName($this.data('initiator'), $this);
            _this.unbindError(el);
        })
        .on('mouseenter.formError mouseleave.formError focusin.formError focusout.formError', ':input', function(e){
            var $this = $(this);
            if (!$this.hasClass('error')) return;

            switch (e.type){
                case 'mouseenter':
                case 'focusin':
                    _this.showError(this);
                    break;

                case 'mouseleave':
                case 'focusout':
                    _this.hideError(this);
                    break;
            }
        })
        .on('mouseenter.formError mouseleave.formError', 'label', function(e){
            var input = $(this).data('for.formError');
            if (!input || !input.hasClass('error')) return;

            switch (e.type){
                case 'mouseenter':
                    _this.showError(input);
                    break;

                case 'mouseleave':
                    _this.hideError(input);
                    break;
            }
        });
    };

    FormError.prototype = {
            getErrorInputs: function(){
                return this.form.find(':input.error');
            },

            getTooltip: function (input){
                var input = $(input);
                var obj = input.data('tooltip');
                if (!obj){
                    var _this = this;
                    input.tooltip({
                        "trigger": "manual",
                        "placement": function(tip, el){
                            var $el = $(el);
                            return $el.data('error-position') ? $el.data('error-position') : _this.position;
                        },
                        "animation": false,
                        "title": function(){
                            var message = $(this).data('errors');

                            if (typeof message != 'object'){
                                message = [message];
                            }

                            var html = document.createElement('div');
                            for (var i in message){
                                var li = document.createElement('div');
                                li.innerText = message[i];
                                html.appendChild(li);
                            }

                            return html;
                        },
                        "html": true
                    });

                    obj = input.data('tooltip');
                    obj.setMessage = function(message){
                        this.$element.data('errors', message);
                    };
                }

                return obj;
            },

            /**
             * @param input - jQuery object | field name | undefined
             * if no params passed show errors on all fields
             */
            showError: function(input, persist) {
                var _this = this;
                if (!input){
                    input = this.getErrorInputs();
                } else if (typeof input == 'string'){
                    //input name
                    input = this.findInputByName(input);
                }

                return $(input).each(function(){
                    if (persist !== undefined){
                        $(this).data('error-persist', persist);
                    }
                   _this.getTooltip(this).show();
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
                } else if (typeof input == 'string'){
                    //input name
                    input = this.findInputByName(input);
                }

                return $(input).each(function(){
                    if (!$(this).data('error-persist')){
                        _this.getTooltip(this).hide();
                    }
                });
            },

            setError: function(input, message){
                var _this = this;
                if (typeof input == 'string'){
                    var fieldName = input;
                    input = this.findInputByName(fieldName);
                    input.data('initiator', fieldName);
                }

                return $(input).each(function(){
                    $(this).addClass('error');

                    var messageType = typeof message;
                    if (messageType == 'string' || messageType == 'object'){
                        _this.getTooltip(this).setMessage(message);
                    }
                    _this.initLabel(this);
                });
            },

            unbindError: function(input) {
                var _this = this;
                input.removeClass('error').removeData('initiator');
                input.removeData('error-persist');
                input.each(function(){
                    _this.getTooltip(this).destroy();
                });

                this.initLabel(input);
            },

            findInputByName: function(initiator, field) {
                var el = $(field);

                if (initiator){
                    el = this.form.find(':input[name^="'+initiator+'["]');
                    if (!el.size()){
                        el = this.form.find(':input[name="'+initiator+'"]');
                    }
                }

                //if field is hidden try to find visible input in the same container
                if (el.attr('type') == 'hidden'){
                    var vField = el.parent().find(':input[type!=hidden]').first();
                    if (vField.length) el = vField;
                }

                return el;
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
                        label = $this.closest('label');
                    }

                    if (label.length){
                        label.data('for.formError', $this);
                        $this.hasClass('error') ? label.addClass('error') : label.removeClass('error');
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
                    this.setError(this.getErrorInputs());
                }
            },

            destroy: function(){
                this.unbindError(this.getErrorInputs());
                this.form.off('.formError').removeData('formError');
            },

            setPosition: function(position){
                this.position = position;
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

})(jQuery);