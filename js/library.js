/**
 * library.js
 * INDEX
 * - responsive_menu(options[object])
 * - rt_lightbox(options[object])
 * - fake_preloader(options[object])
 * - attach_css(href)
 * - style_onscroll(el_id[string], after[int], class_to[string], class_from[string])
 * - reelBox()
 * - scroll_to(taget_id[string], overflow[int])
 * - accordion_boxes()
 * 
 * HELPERS
 * - get_style(element[HTMLobject], property[string])
 * - post_request()
 * - get_position(elem[HTMLobject], pos[string])
 */


/**
 * Enables a menu to hide under a drawer icon or MENU command
 * when in mobile view
 * @param  {object} options button_id: Menu button to hide/show
 *                          the menu_id
 *                          menu_id: Menu container to hide/show
 *                          animation:
 *                          fade|slide|fade slide|appear(Default)
 *                          menu_heigth: (int)
 * @return {[type]} void
 */
function responsive_menu( options ) {
	
	// Set defaults and get objects
	var toggle = document.getElementById( options.button_id ),
        menu = document.getElementById( options.menu_id ),
        anim = ( ! options.animation ) ? '' : options.animation,
        switched = null,
        menu_height = options.menu_height + 'px';
    
    set_transition();
    
	// Add Event listener
	toggle.addEventListener( 'click', function(){
		animate( get_nav_state(), anim );
        
	}, false );
	
	window.addEventListener( 'resize', function() {
        set_transition();
		reset_nav_onresize( get_toggle_state(), get_nav_state() );
	}, false );
    
    //Set transition for animations if needed
    function set_transition() {
        if ( anim == 'slide' || anim == 'fade' || anim == 'fade-slide' ) {
            if ( get_toggle_state() == 'block' || get_toggle_state() == 'inline-block' ) {
                menu.style.cssText = 'transition: all .7s ease-in-out; -webkit-transition: all .7s ease-in-out; -moz-transition: all .7s ease-in-out;';
            }
        }
    }
	
	// Get display state of UL holding nav items
	function get_nav_state() {
        if ( menu.style.display == '' ) {
            return window.getComputedStyle( menu ).getPropertyValue( 'display' );
        } else {
            return menu.style.display;
        }
	}
	
	// Get display state of toggle switch
	function get_toggle_state() {
		return window.getComputedStyle( toggle ).getPropertyValue( 'display' );
	}
	
	// Set animation for navigation menu on mobile
	function animate( state, type ) {
        var original_state;
		switch ( type ) {
            case 'fade' :
                if ( state != 'none' )
                {
                    //Hide menu
                    menu.style.opacity = '0';
                    window.setTimeout( function(){
                        menu.style.display = 'none';
                    }, 700 );
                    
                } else {
                    //Show menu
                    menu.style.opacity = '0';
                    menu.style.display = 'block';
                    window.setTimeout( function(){
                        menu.style.opacity = '1';
                    }, 100 );
                }
            break;
            case 'slide' :
                //Menu must have a height set up in your CSS sheet
                if ( state != 'none' )
                {
                    //Hide Menu
                    menu.style.height = '0';
                    window.setTimeout( function(){
                        menu.style.display = 'none';
                    }, 700 );
                    
                } else {
                    //Show Menu
                    menu.style.height = '0';
                    menu.style.display = 'block';
                    window.setTimeout( function(){
                        menu.style.height = menu_height;
                    }, 100 );
                }
                
            break;
            case 'fade-slide' :
                if ( state != 'none' ) {
                    menu.style.opacity = '0';
                    menu.style.height = '0';
                    window.setTimeout( function() {
                        menu.style.display = 'none';
                    }, 700 );
                } else {
                    menu.style.opacity = '0';
                    menu.style.display = 'block';
                    window.setTimeOut ( function() {
                        menu.style.opacity = '1';
                        menu.style.height = menu_height;
                    }, 100 );
                }
            break;
            case 'appear':
            default:
                if ( state != 'none' ) {
					menu.style.display = 'none';
				} else {
					menu.style.display = 'block';
				}
            break;
			// Needs more animation stuff
		}
	}
	
	// Reset Nav menu when resizing
	function reset_nav_onresize( toggle_state, nav_state ) {
		if ( toggle_state == 'none' && nav_state == 'none' ) {
			switched = 1;
			menu.style.display = 'block';
            if ( anim == 'slide' ) {
                menu.style.removeProperty( 'height' );
            }
		} else if ( toggle_state == 'block' && switched == 1 ) {
			switched = 0;
			menu.style.display = 'none';
		} else if ( toggle_state == 'none' && switched == 0 ) {
            switched = 1;
			menu.style.display = 'block';
            if ( anim == 'slide' ) {
                menu.style.removeProperty( 'height' );
            }
        }
	}
}

/**
 * Shows an image in a lightbox with its amplified version and adds
 * navigation to it.
 * @author Johnny Calderon
 * @param   {object}   options Array passing all he option parameters
 *                             id
 *                             appent_to_id
 *                             strip_regex
 *                             replace_str
 *                             close_class
 *                             target_folder
 *                             fit_image
 *                             custom_css
 *                             hide_nav
 * @returns {[[Type]]} [[Description]]
 */
function rt_lightbox( options ) {
	
	// Define variables and default values
    var w_h, // Window innerHeight
	    w_w, // Window innerWidth
	    top_p, // Top Scroll position
	    id = options.id,
	    body_id = options.append_to_id,
	    strip_name = options.strip_regex || /-thumb/,
	    replace_name = options.replace_str || '',
	    close_bt_class = options.close_class || 'lightbox-close',
	    target_folder = options.target_folder || false,
        custom_css = options.custom_css || false,
        hide_nav = options.hide_nav || false,
        doc_body;
	this.images;

	// Attach style sheet depending on theme
    if ( ! custom_css )
    {
        attach_css( 'css/rt-lightbox.css' );
    }
    else if ( typeof custom_css == 'string' )
    {
        attach_css( custom_css );
    }
        

	this.init = function() {
			
		/* Set variables and arrays */
		var all_images = new Array(),
            next_id = new Array(),
            prev_id = new Array();
		
	    // Create main elements for the lightbox
		doc_body = document.getElementById(body_id);    		// body
		var next_bt = document.createElement( 'div' ),			// Lightbox Next button
		    prev_bt = next_bt.cloneNode(),			            // Lightbox Previous button
		    box_bg = next_bt.cloneNode(),           			// Lightbox screen Background
		    box_frame = next_bt.cloneNode(),            		// Lightbox frame
		    bottom_div = next_bt.cloneNode(),           		// Lightbox bottom content wrapper
		    close_bt = document.createElement( 'a' ),			// Lightbox close button
		    screen = document.createElement('figure');		// Lightbox image wrapper
		
		// Set elements attributes
		doc_body.height = '100%';
		
		box_bg.id = 'lightbox-bg';
		box_frame.id = 'lightbox-frame';
		screen.id = 'lightbox-screen';
		bottom_div.id = 'lightbox-bottom';
		
		close_bt.className = close_bt_class;
		next_bt.className = 'next-button';
		prev_bt.className = 'prev-button';
		
		close_bt.innerHTML = 'X';
        
        if ( hide_nav === true )
        {
            next_bt.style.display = 'none';
            prev_bt.style.display = 'none';
        }
		
		// Put together the whole lightbox thing
		bottom_div.appendChild( close_bt );
		box_frame.appendChild( prev_bt );
		box_frame.appendChild( screen );
		box_frame.appendChild( next_bt );
		box_frame.appendChild( bottom_div );
        box_bg.appendChild( box_frame );
		
		
		// grab all images from container
		images = document.getElementById( id ).getElementsByTagName( 'img' );
		
		// Loop through img HTMLobject array and attach listeners, id to objects
		// and setup current, previous and next components
		for ( var i = 0; i < images.length; i++ ) {
			
			// Save current, next and previous image into their own array
			all_images[i] = strip_imgname( images[i].getAttribute('src'), target_folder );
			
			next_id[i] = ( i+1 > images.length-1 ) ? 0 : i+1;
			prev_id[i] = ( i-1 < 0 ) ? images.length-1 : i-1;
			
			// set id for thumbnails
			images[i].id = 'thumb-' + i;
			
			// Add event Listeners
			images[i].addEventListener( 'click', function(){
				
				set_lightbox( box_bg );
				update_lightbox( this.id, all_images, next_id, prev_id );
				
			}, false )
		}
		
		// Add event Listeners
		next_bt.addEventListener( 'click', function() {
			set_lightbox( box_bg );
			update_lightbox( this.id, all_images, next_id, prev_id );
		}, false );
		
		prev_bt.addEventListener( 'click', function() {
			set_lightbox( box_bg );
			update_lightbox( this.id, all_images, next_id, prev_id );
		}, false );
		
		close_bt.addEventListener( 'click', function() {
			close_lightbox( doc_body, box_bg );
		}, false );
	}
	
	/**
	 * [set_lightbox description]
	 * @param {[type]} light_box [description]
	 */
	function set_lightbox( light_box ){
		
		// Check if main element holders exist to avoid duplicates
		// and position the lightbox XY centered
		if( ! document.getElementById('lightbox-bg') ) {
			//var doc_body = document.getElementById( 'body' );

			doc_body.appendChild( light_box );

			// set some transition changes for a smooth intro
			light_box.style.opacity = 0;

			window.setTimeout( function() {
				light_box.style.opacity = 1;
			}, 200 );

		}
		
		var lb_scr = document.getElementById( 'lightbox-screen' );
		lb_scr.innerHTML = '<img class="loading-image" src="images/rt-lightbox/loading.gif" />';
	}
	
	/**
	 * Update lightbox elements: Main image, next button, and previous button
	 * @param  {int} query_id      Pass the id of the image to be called
	 * @param  {array} images_lb   All the images available in the gallery
	 * @param  {array} next_lb_id  Array containing id's next to the current id
	 * @param  {array} prev_lb_id  Array containing id's previous to the current id
	 */
	function update_lightbox( query_id, images_lb, next_lb_id, prev_lb_id ) {
		
	    var img_src,
            img_obj = new Image(),
            lb_id = query_id.replace( 'thumb-', '' ),
            lb_next = document.getElementsByClassName( 'next-button' ),
            lb_prev = document.getElementsByClassName( 'prev-button' ),
            lb_screen = document.getElementById( 'lightbox-screen' ),
            img_class = 'lb-img';
		
		lb_next[0].id = 'thumb-' + next_lb_id[lb_id];
		lb_prev[0].id = 'thumb-' + prev_lb_id[lb_id];
        
		//img_obj.src = img_src;
		img_obj.src = images_lb[lb_id];
		img_obj.style.opacity = 0;
        //Set position classname for image
        if ( img_obj.height >= img_obj.width ) {
            img_class += ' v-img';
        }
        img_obj.className = img_class;
		
		img_obj.onload = function() {
			lb_screen.innerHTML = '';
			lb_screen.appendChild( img_obj );
			window.setTimeout( function() {
				img_obj.style.opacity = 1;
			}, 100 );
		}
	}
	
	/**
	 * Close lightbox
	 * 
	 * @param parent object This is the Body tag of the site
	 * @param elem object This is the whole container for the lightbox created in set_lightbox
	 */	
	function close_lightbox( parent, elem ) {
		elem.style.opacity = 0;
		window.setTimeout( function() {
			parent.removeChild( elem );
		}, 400 );
	}
	
	// Helper function
	function strip_imgname( str, folder ) {
	    var output_name = (folder != false) ? str.replace(strip_name, replace_name).replace( /images\/[a-zA-Z0-9-_]+\//, 'images/' + folder + '/' ) : str.replace(strip_name, replace_name);
		return output_name;
	}
}

/**
 * Simple fakes a preloading screen before loading an element or page.
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function fake_preloader( options ) {

	// Default options
	var loading_anim = ( ! options.loading_anim || options.loading_anim == '' ) ? 'splash-dots' : 'splash-' + options.loading_anim;
	var transition = ( ! options.transition || options.transition == '' ) ? 'fade' : options.transition;
	var splash_size = ( ! options.screen_size || options.screen_size == '' ) ? 'window' : options.screen_size;

	// Custom Style Sheet
	var style_sheet = ( ! options.css_sheet || options.css_sheet == '' ) ? 'css/fake-loader.css' : options.css_sheet;

	// Custom content of splash screen
	var splash_msg = ( ! options.msg || options.msg == '' ) ? '<div id="splash-msg"><p>Please Wait...</p></div>' : '<div id="splash-msg"><p>' + options.msg + '</p></div>';
	var splash_img = ( ! options.img_url || options.img_url == '' ) ? '' : '<figure id="splash-logo"><img src="' + options.img_url + '" /></figure>';

	// Object to be loaded, and check loading success to proceed with splash removal.
	var splash_object = options.to_load.split(':');
	var trigger; // placeholder

	// Splash Screen Template
	var splash_template = '<div class="splash-content ' + splash_size + '">';
		splash_template += splash_img;
		splasg_template += splash_msg;
		splash_template += '<figure id="loading-anim" class="';
		splash_template += loading-anim;
		splash_template += '">';
		splash_template += '<div></div><div></div><div></div><div></div>';
		splash_template += '</figure></div>';

	// Splash screen main container and Body Tag
	var body = document.getElementsByClassName('body')[0];
	var splash = document.createElement( 'div' );

	// Set ids, class and styles for the main container.
	splash.id = 'wait-for-it';
	splash.className = 'splash-container';
	splash.style.transition = 'all .5s ease-in';
	splash.innerHTML = splash_template;

	// Append splash screen to body;
	body.appendChild( splash );

	// Attach custom style sheet, if not supplied will load the default style sheet
	attach_css( style_sheet );

	// Check object type
	switch ( splash_object[0] ) {
		case 'img':
			trigger = new Image();
			trigger.src = splash_object[1];
		break;
		case 'id':
			trigger = document.getElementById( splash_object[1] );
		break;
		case 'doc':
			trigger = window;
		break;
	}

	// Attach the onload event to check for element loading success
	trigger.onload = function() {

		if ( disolve( body, splash, transition ) ) {
		}
	}

	/**
	 * Plays a quick transition and remove the children element from its parent.
	 * @param  {HTMLObject} parent Parent should be an html object
	 * @param  {HTMLObject} child  Children to be removed from parent
	 * @param  {string} 	anim   Animation to play before removing the splash screen
	 * @return {bool}        	   Returns true if the child is remove, false if it fails
	 */
	function disolve ( parent, child, anim ) {

		var output;

		switch ( anim ) {
			case 'fade':
				child.style.opacity = '0';
			break;
			case 'slide-up':
				child.style.top = '-100%';
			break;
			case 'zoom-out':
				child.style.width = '0%';
				child.style.height = '0%';
			break;
		}

		window.setTimeout( function() {

			if ( parent.removeChild( child ) ) {
				output = true;
			} else {
				output = false;
			}
		}, 600 );
	}

}

/**
 * Attach a stylesheet to the Head section of an HTML document
 * @param  {string} href  Path of the stylesheet
 * @return {bool}      	  Returns true if stylesheet is attached successfully, 
 *                        false if it fails.
 */
function attach_css( href ) {

	var sheet;
	if ( ! href || href == '' ) {
		console.error( 'you MUST pass a path to your CSS file.' );
		return;
	} else {
		sheet = document.createElement( 'link' );
	}

	sheet.setAttribute( 'rel', 'stylesheet' );
	sheet.href = href;

	if ( document.getElementsByTagName('head')[0].appendChild( sheet ) ) {
		return true;
	} else {
		console.error( 'No Stylesheet appended' );
		return false;
	}
}


function style_onscroll(el_id, after, class_to, class_from) {
    var exist_scroll = window.onscroll,
        target = document.getElementById(el_id),
        class_from = (class_from) ? class_from : ' ',
        
        // Get current class/es from element
        existing_class = (target.className) ? target.className : '',
        
        // if class_to matches one in the current class/es it'll be replaced with class_from
        fixed_classfrom = (existing_class.match(class_to)) ? existing_class.replace(class_to, class_from) : (existing_class.replace(class_from, '')) + ' ' + class_from,
        
        fixed_classto = (existing_class.match(class_from)) ? existing_class.replace(class_from, class_to) : existing_class + ' ' + class_to;

    //Apply style if page is loaded beyond the scroll target.
    if (parseInt(window.pageYOffset) > after) {
        target.className = fixed_classto;
    }

    if (typeof window.onscroll != 'function') {
        window.onscroll = function () {
            if (parseInt(window.pageYOffset) > after) {
                target.className = fixed_classto;
            } else {
                target.className = fixed_classfrom;
            }
        }
    } else {
        window.onscroll = function () {
            exist_scroll();
            if (parseInt(window.pageYOffset) > after) {
                target.className = fixed_classto;
            } else {
                target.className = fixed_classfrom;
            }
        }
    }

}

/**
 * Creates a slideshow
 *
 */
function reelBox() {
    var roller = document.createElement('div');
    var container,
        children,
        screen_measure,
        roller_measure,
        direction,
        catch_style,
        reel_rail,
        reel_indicator,
        reel_indicator_measure,
        animate_bg,
        animate_elems,
        comming_elems,
        going_elems;

    roller.className = 'reel-roller';

    this.init = function (options) {
        // Set options variables
        container = document.getElementById(options.id);
        children = container.getElementsByClassName(options.childrenClass);
        direction = (options.direction && options.direction != '') ? options.direction : 'vertical';
        animate_bg = (options.animate_background && options.animate_background != '') ? options.animate_background : true;
        animate_elems = (options.animate_elements && options.animate_elements != '') ? options.animate_elements : true;

        container.className = container.getAttribute('class') + ' reel-container';

        var cont_html = container.innerHTML;
        if (direction == 'vertical') {
            catch_style = 'top';
            screen_measure = parseInt(get_style(container, 'height'));
            roller_measure = screen_measure * children.length;
            roller.style.height = roller_measure + 'px';
        } else if (direction == 'horizontal') {
            catch_style = 'left';
            screen_measure = parseInt(get_style(container, 'width'));
            roller_measure = screen_measure * children.length;
            roller.style.width = roller_measure + 'px';
        }
        roller.innerHTML = cont_html;
        container.innerHTML = '';
        container.appendChild(roller);
        animate_background(children[0].getAttribute('data-bg'));
        indicator();
        controls();
        animate_to_state( document.getElementById(children[0].getAttribute('id')).getElementsByClassName('reel-animate-el'), ['left:80px !important;', 'left:50px !important;'] );
    }

    function controls() {
        var prev_bt = document.createElement('div');
        prev_bt.className = 'reel-control';
        var next_bt = prev_bt.cloneNode();
        var first_bt = prev_bt.cloneNode();
        var last_bt = prev_bt.cloneNode();
        var control_cont = prev_bt.cloneNode();

        control_cont.className = 'reel-control-wrapper';

        prev_bt.id = 'prev-ctrl';
        next_bt.id = 'next-ctrl';
        first_bt.id = 'first-ctrl';
        last_bt.id = 'last-ctrl';

        control_cont.appendChild(first_bt);
        control_cont.appendChild(prev_bt);
        control_cont.appendChild(next_bt);
        control_cont.appendChild(last_bt);
        container.appendChild(control_cont);

        prev_bt.addEventListener('click', function () {
            move_slide('prev');
        }, false);

        next_bt.addEventListener('click', function () {
            move_slide('next');
        }, false);

        first_bt.addEventListener('click', function () {
            move_slide('first');
        }, false);

        last_bt.addEventListener('click', function () {
            move_slide('last');
        }, false);
    }

    function indicator() {
        reel_rail = document.createElement('div');
        reel_indicator = reel_rail.cloneNode();

        if (direction = 'vertical') {
            reel_rail.className = 'v-reel-rail';
            reel_indicator.className = 'v-reel-indicator';
            reel_indicator_measure = parseInt(get_style(container, 'height')) / children.length;
            reel_indicator.style.height = reel_indicator_measure + 'px';
        } else if (direction == 'horizontal') {
            reel_rail.className = 'reel-rail';
            reel_indicator.className = 'reel-indicator';
            reel_indicator.style.width = (parseInt(get_style(container, 'width')) / children.length) + 'px';
        }

        reel_rail.appendChild(reel_indicator);
        container.appendChild(reel_rail);
    }

    //Exchange backgrounds with fade-in-out effect
    function animate_background(new_img) {
        var background_container;
        var background_image;
        var coming_img = new Image();
        if (animate_bg == true) {
            if (!container.getElementsByClassName('animated-background')[0]) {
                background_container = document.createElement('div');
                background_container.className = 'animated-background';
                background_image = new Image();
                background_image.src = new_img;
                background_image.className = 'reel-background-img';
                background_image.style.opacity = 0;
                background_image.onload = function () {
                    background_container.appendChild(background_image);
                    container.insertBefore(background_container, roller);
                    window.setTimeout(function () {
                        background_image.style.opacity = 1;
                    }, 100);
                }
            } else {
                background_container = container.getElementsByClassName('animated-background')[0];
                background_image = container.getElementsByClassName('reel-background-img')[0];
                coming_img.src = new_img;
                coming_img.style.opacity = 0;
                coming_img.onload = function () {
                    background_container.appendChild(coming_img);
                    coming_img.className = 'reel-background-img';
                    window.setTimeout(function () {
                        background_image.style.opacity = 0;
                        coming_img.style.opacity = 1;
                        //If animate_elems is set to true, it will animate elements together with background.
                        animate_to_state(comming_elems, ['left:80px !important;', 'left:50px !important;']);
                        animate_to_state(going_elems, ['left:130% !important;','left:-50% !important;']);
                    }, 100);
                    window.setTimeout(function () {
                        background_container.removeChild(background_image);
                    }, 600);
                }
            }
        }
    }

    //Animate elements to a selected style
    function animate_to_state(elems, style_array, interval) {
        inter = (interval && interval != '') ? interval : 300;
        if ( animate_elems == true ) {
            for (var i = 0; i < elems.length; i++) {
                if (i == 0) {
                    elems[i].style.cssText = style_array[i];
                } else {
                    elems[i].style.cssText = style_array[i];
                }
            }
        }
    }

    //Change slides
    function move_slide(dir) {
        var actual_pos = parseInt(get_style(roller, catch_style));
        var indi_actual_pos = parseInt(get_style(reel_indicator, catch_style));
        var new_position,
            indi_new_pos,
            comming_img;

        switch (dir) {
            case 'first':
                new_position = 0;
                indi_new_pos = 0;
                break;
            case 'last':
                new_position = (roller_measure - screen_measure) * -1;
                indi_new_pos = screen_measure - reel_indicator_measure;
                break;
            case 'next':
                if (actual_pos != ((roller_measure - screen_measure) * -1)) {
                    new_position = actual_pos - screen_measure;
                    indi_new_pos = indi_actual_pos + reel_indicator_measure;
                } else {
                    new_position = actual_pos;
                    indi_new_pos = indi_actual_pos;
                }
                break;
            case 'prev':
                if (actual_pos != 0) {
                    new_position = actual_pos + screen_measure;
                    indi_new_pos = indi_actual_pos - reel_indicator_measure;
                } else {
                    new_position = actual_pos;
                    indi_new_pos = indi_actual_pos;
                }
                break;
        }

        for (var i = 0; i < children.length; i++) {
            if (direction == 'vertical') {
                if (new_position == (children[i].offsetTop * -1)) {
                    coming_bg = children[i].getAttribute('data-bg');
                    comming_elems = document.getElementById(children[i].getAttribute('id')).getElementsByClassName('reel-animate-el');
                }

                if (actual_pos == (children[i].offsetTop * -1)) {
                    going_elems = document.getElementById(children[i].getAttribute('id')).getElementsByClassName('reel-animate-el');
                }
            } else if (direction == 'horizontal') {
                if (new_position == (children[i].offsetLeft * -1)) {
                    coming_bg = children[i].getAttribute('data-bg');
                    comming_elems = document.getElementById(children[i].getAttribute('id')).getElementsByClassName('reel-animate-el');
                }

                if (actual_pos == (children[i].offsetLeft * -1)) {
                    going_elems = document.getElementById(children[i].getAttribute('id')).getElementsByClassName('reel-animate-el');
                }
            }
        }

        //If buttons are clicked again and there's no slide beyong don't play animation
        if (actual_pos != new_position) {
            // If animate_bg is true, background will be animated
            animate_background(coming_bg);
        }

        if (direction == 'vertical') {
            roller.style.top = new_position + 'px';
            reel_indicator.style.top = indi_new_pos + 'px';
        } else if (direction == 'horizontal') {
            roller.style.left = new_position + 'px';
            reel_indicator.style.left = indi_new_pos + 'px';
        }
    }
}

/**
 *
 *
 */
function scroll_to(target_id, overflow) {
    var target = document.getElementById( target_id ),
        overflow = ( ! overflow ) ? 0 : overflow,
        target_pos = get_position( target, 'top' ) - overflow,
        initial_pos = window.pageYOffset,
        velocity = 1,
        scroll_space = 40,
        scroll_interval;

    if ( initial_pos < target_pos ) {
        // Scroll down
        scroll_interval = window.setInterval( function() {
            if ( window.pageYOffset < target_pos ) {
                window.scrollBy( 0, scroll_space );
            } else {
                clearInterval( scroll_interval );
                scroll_interval = null;
            }
        }, velocity );
    } else if ( initial_pos > ( initial_pos + target_pos ) ) {
        //Scroll up
        scroll_interval = window.setInterval( function() {
            if ( window.pageYOffset > ( initial_pos + target_pos ) ) {
                window.scrollBy( 0, - scroll_space );
            } else {
                clearInterval( scroll_interval );
                scroll_interval = null;
            }
        }, velocity );
    }

}

/**
 * Accordion boxes with custom styles
 * @author Johnny Calderon
 * @param {Array}  elements   Array containing the html elements
 * @param {string} from_style Initial css style
 * @param {string} to_style   Style rule to change the elements
 */
function accordion_boxes( elements, from_style, to_style ) {
    var els = document.getElementsByClassName( elements );
    var syms = els;
    
    for ( var i = 0; i < els.length; i++ ) {
        if ( ! els[i].hasAttribute( 'data-state' ) ) {
            els[i].setAttribute( 'data-state', 'close' );
        }
        
        els[i].addEventListener( 'click', function() {
            if ( this.getAttribute( 'data-state' ) == 'open' ){
                this.style.cssText = from_style;
                this.setAttribute( 'data-state', 'close' );
            } else if ( this.getAttribute( 'data-state' ) == 'close' ) {
                for ( var x = 0; x < syms.length; x++ ) {
                    syms[x].style.cssText = from_style;
                    syms[x].setAttribute( 'data-state', 'close' );
                }
                this.style.cssText = to_style;
                this.setAttribute( 'data-state', 'open' );
            }
        }, false );
    }
}

//HELPER FUNCTIONS

/**
 * Returns the computed style of an element
 * @author Johnny Calderon
 * @param   {object}  element  html element to get the style from
 * @param   {string}  property Style to get the value from
 * @returns {boolean} Returns style value on success or false if fails
 */
function get_style(element, property) {
    var output = false;
    if (typeof element == 'object') {
        output = window.getComputedStyle(element).getPropertyValue(property);
    }
    return output;
}

/**
 * Performs a ajax request using POST method, and returns the requested results or messages
 * @author Johnny Calderon
 * @param {object} form        The form from where the data is being sent
 * @param {string} post_path   Path of the file requested
 * @param {string} cont_id     ID of the container that will hold 
 *                             the response
 * @param {object} event       event object
 * @param {string} success_msg optional message on success
 * @param {string} fail_msg    optional message on fail
 */
function post_request( form, post_path, cont_id, event, success_msg, fail_msg ) {
    event.preventDefault();
    var rs_cont = document.getElementById(cont_id),
        fields = form.elements,
        scs_msg = success_msg || 'Your message has been sent, Thank you!',
        fl_msg = fail_msg || 'Sorry, message could not be sent, try again later.',
        data = '';
    
    for (var i = 0; i < fields.length; i++ ) {
        data += fields[i].getAttribute('name') + '=' + encodeURIComponent(fields[i].value) + '&';
    }
    
    data = data.replace(/&$/, '');
    
    var XHR = new XMLHttpRequest();
    XHR.onreadystatechange = function () {
        if (XHR.readyState == 4) {
            if ( scs_msg === true ) {
                rs_cont.innerHTML = '<p class="loading-msg">' + XHR.responseText + '</p>';
            } else {
                rs_cont.innerHTML = '<p class="loading-msg">' + scs_msg + '</p>';
            }
        } else if (XHR.status == 404) {
            rs_cont.innerHTML = '<p class="warning-msg">' + fl_msg + '</p>';
        }
    }
    XHR.open('POST', post_path, true);
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    XHR.send(data);
}

/**
 * Get position of element using getBoundindClientRect
 * @author Johnny Calderon
 * @param   {object} elem Element to get the position from
 * @param   {string} pos  Position parameter: top, bottom, left, right
 * @returns {mixed}  False if fails, object of positions if no 'pos'
 *                   is passed, the value of the position passed.
 */
function get_position ( elem, pos ) {
    if ( ! elem ) {
        return;
    }
    var output = false,
        bounding = elem.getBoundingClientRect();
    
    switch ( pos ) {
        case 'top':
            output = bounding.top;
            break;
        case 'bottom':
            output = bounding.bottom;
            break;
        case 'right':
            output = bounding.right;
            break;
        case 'left':
            output = bounding.left;
            break;
        default:
            output = bounding;
            break;
    }
    
    return output;
}