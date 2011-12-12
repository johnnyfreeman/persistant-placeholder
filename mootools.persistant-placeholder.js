var persistantPlaceholder = new Class({

    // Options and Events are classes provided by MooTools
    // used if your plugin has custom options and custom events
    Implements: Options,

    // Set the default options
    // ------------------------
    // These can be overwritten by passing an object
    // literal with the options, like so:
    // 
    //     $('my_field').persistantPlaceholder({
    //         onRestore: function()
    //         {
    //             // do something when placeholder is restored
    //         },
    //         className: 'my-placeholder'
    //     });
    options: {
        labelSelector: 'label',

        // options are 'sibling (default) or parent'
        labelRelation: 'sibling',

        position: {
            relativeTo: this.field,
            position: 'upperLeft',
            edge: 'upperLeft'
        }
    },

    // the field is stored here and can 
    // be accessed thusly: this.field
    field: null,
    label: null,
    placeholder: null,

    // Class constructor gets run upon instantiation
    initialize: function(field, options)
    {
        this.init(field, options);
    },

    // this lives outside the constructor so that it can 
    // be overwritten in a class extending this one and so that 
    // the jquery and mootools versions share the same api
    init: function(field, options)
    {
        // setOptions is a method provided by the Options mixin
        // it merges the options passed in with the defaults
        this.setOptions(options);

        // save the element to the element 
        // property for future referance
        this.field = field;

        // get the fields label
        switch(this.options.labelRelation)
        {
            case 'sibling':
                this.label = this.field.getSiblings(this.options.labelSelector).pick(); // gets first sibling it finds
                break;

            case 'parent':
                this.label = this.field.getParents(this.options.labelSelector).pick(); // gets first ancestor it finds
                break;
        };

        // if a label has been found, hide it
        if (this.label !== null)
        {
            // if the field has a label, strip it away
            if (this.label.get('text').length)
            {
                this.placeholder = this.label.get('text');
            };

            this.label.hide();
        };


        // if the field has a placeholder, strip it away
        if (this.field.getProperty('placeholder') !== null && this.field.getProperty('placeholder').length)
        {
            this.placeholder = this.field.getProperty('placeholder');
            this.field.removeProperty('placeholder');
        };
        
        // get field id or generate one
        var id = this.field.getProperty('id') || String.uniqueID();
        this.field.setProperty('id', id);

        // create, inject, and position new placeholder 
        this.label = new Element('label', {
            'class': 'placeholder_label',
            'for': id,
            html: this.placeholder
        })
        .inject(this.field.getParent())
        .position({
            relativeTo: this.field,
            position: 'upperLeft',
            edge: 'upperLeft'
        });

        // add blur and focus events to the field and 
        // overwrite (bind) 'this' with the placeHolder object
        this.field.addEvents({
            blur: this.blurHandler.bind(this),
            focus: this.focusHandler.bind(this),
            keypress: this.keypressHandler.bind(this),
            keyup: this.keyupHandler.bind(this)
        });

        this.blurHandler();
    },

    // fires before key stroke
    keypressHandler: function(event)
    {
        // remove placeholder if field value is empty

        if (!this.field.getProperty('value').length)
        {
            this.label.hide();
        };
    },

    // fires after key stroke
    keyupHandler: function(event)
    {
        // check if field text is empty
        // if so, restore placeholder and make sure it's dim

        if (!this.field.getProperty('value').length)
        {
            this.label.show();
            this.dimLabel();
        };
    },
    
    blurHandler: function(event)
    {
        // undim text
        this.undimLabel();

        // check if field text is empty
        // if so, restore placeholder
        if (!this.field.getProperty('value').length)
        {
            this.label.show();
        }
        else
        {
            this.label.hide();
        };
    },
    
    focusHandler: function(event)
    {
        this.dimLabel();
    },

    dimLabel: function()
    {
        this.label.addClass('dim');
    },

    undimLabel: function()
    {
        this.label.removeClass('dim');
    }
});

// Extend the Elements object so that the persistantPlaceholder method
// will instatiate the persistantPlaceholder object. Basically, it 
// enables you to chain this plugin on an array of Element 
// objects like so: 
// 
//      $$('.my_textboxes').persistantPlaceholder();
// 
Elements.implement({
    persistantPlaceholder: function(options){
        return this.each(function(element) {
            return new persistantPlaceholder(element, options);
        });
    }
});

// Extend the Element object so that the persistantPlaceholder method
// will instatiate the persistantPlaceholder object. Basically, it 
// enables you to chain this plugin directly on an Element 
// objects like so: 
// 
//      $('my_field').persistantPlaceholder();
// 
Element.implement({
    persistantPlaceholder: function(options){
        return new persistantPlaceholder(this, options);
    }
});