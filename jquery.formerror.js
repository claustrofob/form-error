/**!
 * jQuery plugin for form error highlighting
 */
(function ($) {

    function FormError(form) {
        this.form = form;

        if (form.data('isFormError.callFormError')) return;
        form.data('isFormError.callFormError', true);

        var _this = this;

        form.tooltip({
            "trigger": "manual",
            "placement": "bottom",
            "animation": false,
            "title": function(){
                return $(this).data('errors');
            },
            "selector": ':input'
        })
        //support of "sum-changed" event; @see jquery.money.js
        .on('change.callFormError sum-changed.callFormError', ':input', function(e){
            var $this = $(this);
            if (!$this.hasClass('error')) return;

            var el = _this.findInputByName($this.data('initiator'), $this);
            _this.unbindError(el);
        })
        .on('mouseenter.callFormError mouseleave.callFormError focusin.callFormError focusout.callFormError', ':input', function(e){
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
        .on('mouseenter.callFormError mouseleave.callFormError', 'label', function(e){
            var input = $(this).data('for.callFormError');
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

            showError: function(input) {
                var _this = this;
                if (input === undefined){
                    input = this.getErrorInputs();
                }

                return $(input).each(function(){
                    var e = $.Event('mouseenter');
                    e.currentTarget = this;

                    _this.form.data('tooltip').enter(e);
                });
            },

            hideError: function(input) {
                var _this = this;
                if (input === undefined){
                    input = this.getErrorInputs();
                }

                return $(input).each(function(){
                    var e = $.Event('mouseleave');
                    e.currentTarget = this;

                    _this.form.data('tooltip').leave(e);
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
                        label.data('for.callFormError', $this);
                        $this.hasClass('error') ? label.addClass('error') : label.removeClass('error');
                    }
                });
            },

            initErrors: function(errors){
                if (typeof errors == 'object'){
                    this.unbindError(this.getErrorInputs());

                    for (fieldName in errors){
                        var field = this.findInputByName(fieldName);
                        field.addClass('error')
                             .data('initiator', fieldName)
                             .data('errors', errors[fieldName]);
                    }
                }

                this.initLabel(this.getErrorInputs());
            },

            destroy: function(){
                this.unbindError(this.getErrorInputs());
                this.form.off('.callFormError');
                this.form.tooltip('destroy');
                this.form.removeData('isFormError.callFormError');
            }
    };

    var publicMethods = {
        "show": "showError",
        "hide": "hideError",
        "destroy": "destroy"
    };

    var defaults = {
        "errors": false
    };

    $.fn.formError = function() {
        var args = Array.prototype.slice.call(arguments);
        var options = args.shift();

        $(this).each(function() {
            var form = new FormError($(this));

            if (typeof options == 'string'){
                publicMethods[options] ? form[publicMethods[options]].apply(form, args) : 0;
            } else {
                options = $.extend(defaults, options);
                form.initErrors(options.errors);
            }
        });

        return this;
    };
})($);