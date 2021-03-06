jQuery(document).ready(function($){

    // make sure acf is loaded, it should be, but just in case
    if (typeof acf == 'undefined') { return; }

    $('.mc-acf-ft-select2').select2();
    
    var MC_ACF_Flexible_Template = acf.ajax.extend({

        events: {
            'click button.mc-open' : '_open_popup',
            'click button.acf-mc-ft-close' : '_close_popup',
            'click .acf-mc-ft-import' : '_import_template',
            'click .acf-mc-ft-save' : '_save_template',
        },

        _open_popup : function(e) {

            e.preventDefault();
            e.stopImmediatePropagation();
            // close other popups
            $('.popup').hide();
            // vars
            var popup = $( e.$el.next('.popup') );

            if(popup.length) {
                $(popup).show();
                $(popup).removeClass('-close');
                $(popup).addClass('-open');
            }
        },

        _close_popup : function(e) {

            e.preventDefault();
            e.stopImmediatePropagation();
            // vars

            var popup = $( e.$el.parent('.popup') );

            if(popup.length) {
                $(popup).hide();
                $(popup).removeClass('-open');
                $(popup).addClass('-close');
            }
        },
        // Import template
        _import_template : function(e) {
            e.preventDefault();

            var parentFlex = e.$el.closest('.acf-field-flexible-content');

            var parentValues = parentFlex.find('.values');

            var numberLayouts = parentValues.find('.layout').length;

            var error_div = parentFlex.find('.acf-mc-ft-import-error');
            var succes_div = parentFlex.find('.acf-mc-ft-import-success');

            $form = $('form#post');

            var template_select = parentFlex.find('.acf-templates-select');
            var selectedTemplate = $(template_select).val();

            var data = {
                action      : 'mc_acf_import_template',
                acf_templates   : selectedTemplate,
                number_layout : numberLayouts
            };

            data = acf.prepare_for_ajax(data);

            // set busy
            acf.validation.busy = 1;

            // lock form
            acf.validation.toggle( $form, 'lock' );

            $.post({
                url: acf.get('ajaxurl'),
                type: 'post',
                data: data,
                dataType: 'json',
                action: 'mc_acf_import_template',
                success: function( json ) {

                    if(true === json.success) {
                        
                        $(error_div).hide();
                        $(succes_div).text( json.data.message ).show();
                        var layoutsHtml =  $(json.data.layouts);
                        // loop on layouts
                        $.each(layoutsHtml, function(key, value) {
                            // create object for use it later
                            var newItem = $(value);
                            // append to parent
                            $( parentValues ).append( newItem );
                            // this action set the field and render correctly tabs, etc.
                            acf.do_action('append', newItem);
                            // add -collapsed class, if not all new layouts will be opened
                            $(newItem).addClass('-collapsed just-added bg-green');
                            // remove the empty div
                            $(parentFlex).find('.no-value-message').hide();
                        });

                        setTimeout(function(){
                            $(succes_div).text( '' ).hide();
                            // reset select
                            $(template_select).val(null).trigger('change');
                            // close other popups
                            $('.popup').hide();
                        }, 3000);

                    } else {
                        //console.log(json.data.message);
                        $(succes_div).hide();
                        $(error_div).text( json.data.message ).show();
                    }

                    // unlock so WP can publish form
                    acf.validation.busy = 0;
                    acf.validation.toggle( $form, 'unlock' );
                },
                error: function( json ) {
                    console.log(json);
                }
            });
        },

        // Save template
        _save_template : function(e) {
            e.preventDefault();

            var parentFlex = e.$el.closest('.acf-field-flexible-content');

            var parentGroupKey = parentFlex.attr( 'data-key' );

            var parentValues = parentFlex.find('.values');

            var template_name_input = parentFlex.find('.acf-mc-ft-template-name');
            var template_name = $(template_name_input).val();

            var template_terms_select = parentFlex.find('.acf-templates-terms-select');
            var template_terms = $(template_terms_select).val();

            var error_div = parentFlex.find('.acf-mc-ft-save-error');
            var succes_div = parentFlex.find('.acf-mc-ft-save-success');
            
            $form = $('form#post');

            acf.do_action('validation_begin');

            var data = acf.serialize(parentValues);
            
            // append AJAX action
            data.action = 'mc_acf_ft_save_template';
            data.mc_acf_template_name = template_name;

            if(parentGroupKey.length) {
                data.mc_acf_parent_key = parentGroupKey;
            }

            if(template_terms) {
                data.mc_acf_template_terms = template_terms;
            }

            data = acf.prepare_for_ajax(data);

            // set busy
            acf.validation.busy = 1;

            // lock form
            acf.validation.toggle( $form, 'lock' );

            $.post({
                url: acf.get('ajaxurl'),
                type: 'post',
                data: data,
                dataType: 'json',
                action: 'mc_acf_ft_save_template',
                success: function( json ) {
                    if(true === json.success) {
                        $(error_div).hide();
                        $(succes_div).text( json.data.message ).show();
                        setTimeout(function(){
                            $(succes_div).text( '' ).hide();
                            // reset inputs
                            $(template_name_input).val('');
                            $(template_terms_select).val(null).trigger('change');
                            // close other popups
                            $('.popup').hide();
                        }, 3000);
                    } else {
                        //console.log(json.data.message);
                        $(succes_div).hide();
                        $(error_div).text( json.data.message ).show();
                    }
                    // unlock so WP can publish form
                    acf.validation.busy = 0;
                    acf.validation.toggle( $form, 'unlock' );
                },
                error: function( json ) {
                    console.log('erreur');
                }
            });
        }
    });
});