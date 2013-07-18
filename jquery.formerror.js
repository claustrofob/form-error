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
        this.tooltip = new Tooltip(form);

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

            /**
             * @param input - jQuery object | field name | undefined
             * if no params passed show errors on all fields
             */
            showError: function(input) {
                var _this = this;
                if (input === undefined){
                    input = this.getErrorInputs();
                } else if (typeof input == 'string'){
                    //input name
                    input = this.findInputByName(input);
                }

                return $(input).each(function(){
                   _this.tooltip.show(this);
                });
            },

            /**
             * @param input - jQuery object | field name | undefined
             * if no params passed hide errors on all fields
             */
            hideError: function(input) {
                var _this = this;
                if (input === undefined){
                    input = this.getErrorInputs();
                } else if (typeof input == 'string'){
                    //input name
                    input = this.findInputByName(input);
                }

                return $(input).each(function(){
                    _this.tooltip.hide(this);
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
                    _this.tooltip.setMessage(this, message);
                    _this.initLabel(this);
                });
            },

            unbindError: function(input) {
                input.removeClass('error').removeData('initiator');
                this.initLabel(input);
                this.hideError(input);
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
                return $(input).each(function(){
                    var $this = $(this);
                    var id = $this.attr('id');
                    var label  = $();

                    if (id){
                        label = $('label[for='+id+']');
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
                this.unbindError(this.getErrorInputs());

                if (typeof errors == 'object'){
                    for (fieldName in errors){
                        this.setError(fieldName, errors[fieldName]);
                    }
                }
            },

            destroy: function(){
                this.unbindError(this.getErrorInputs());
                this.form.off('.formError').removeData('formError');
                this.tooltip.destroy();
            },

            setPosition: function(position){
                this.tooltip.setPosition(position);
            }
    };

    function Tooltip(form) {
        this.form = form;
        this.position = $.fn.formError.position;
    };

    Tooltip.prototype = {
        create: function (el){
            var el = $(el);
            var _this = this;

            el.tooltip({
                "trigger": "manual",
                "placement": function(tip, el){
                    var $el = $(el);
                    return $el.data('error-position') ? $el.data('error-position') : _this.position;
                },
                "animation": false,
                "title": function(){
                    return $(this).data('errors');
                }
            });
        },

        get: function(el){
            var el = $(el);
            if (!el.data('tooltip')) this.create(el);
            return el.data('tooltip');
        },

        setMessage: function(el, message){
            $(el).data('errors', message);
        },

        setPosition: function(position){
            this.position = position;
        },

        show: function(el){
            this.get(el).show();
        },

        hide: function(el){
            this.get(el).hide();
        },

        destroy: function(){

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