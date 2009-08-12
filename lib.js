// Resolve noConflict Mode
(function($) {
	
// Make sure console is defined
if(!window.console)
	window.console = {log: function(){}};

// All global variables declared here

var g = {
	version			: "0.0.2.4",
	ui				: {
		index			: 0,
		array			: null,
		cycle			: {
			init_nspc		: {
				name			: null,
				id				: 1,
				length			: 0,
				selector		: function(){ return $(this).siblings(); }
			},
			default_nspc	: {
				name			: 'e',
				selector		: function(){ return $(this).siblings('.e'); }
			},
			bpOutput_nspc	: {
				name			: 'container',
				selector		: function(){
					if ($(this).attr('id') == 'output')
						return $(this);
						
					var e = $('.e').filter(function(){
						return !$(this).data('location').rendered;
					});
					return $(this).siblings().add(e);
				}
			}
			
		},
		types			: ['header','content','sidebar','footer']
		/*types			: [
			{
				name	: 'header',
				limit	: 1
			}, {
				name	: 'content',
				limit	: 0
			}, {
				name	: 'sidebar',
				limit	: 0
			}, {
				name	: 'footer',
				limit	: 1
			}
		]*/
	},
	ir				: {
		selected		: [],
		old_labels			: [],
		labels			: {
			a		: [],
			add		: function( name ) {
				if( name !== '')
					g.ir.labels.a.push( nameToId( name ) );
			},
			has		: function( name ) {
				return g.ir.labels._has( name );
			},
			remove	: function( name ) {
				var index = g.ir.labels._has( name, true );
				
				if ( index !== false )
					g.ir.labels.a.splice( index, 1 );
			},
			_has	: function( id, get_index ) {
				get_index = get_index || false;
				id = nameToId( id );

				var index = $.inArray( id, g.ir.labels.a );

				if ( -1 === index )
					return false;
				else
					return (get_index) ? index : true;
			}
		},
		tabs			: {},
		fn				: {
			disableCanvas	: function() {
				$('#dialog-overlay').dialog('open'); // Disable canvas
			},
			enableCanvas	: function() {
				$('#dialog-overlay').dialog('close'); // Enable canvas
			},
			canvasLoadBegin	: function() {
				console.log('canvasLoadBegin');
				g.ir.fn.disableCanvas();
				g.ir.fn.loadingShow();
			},
			canvasLoadEnd	: function() {
				console.log('canvasLoadEnd');
				g.ir.fn.loadingHide();
				g.ir.fn.enableCanvas();
			},
			loadingShow		: function() {
				var load = $('#inspector-loading').show().children('div');
				
				load.css( 'margin-top', load.height() * -1 );
				
				var dist = ( $('#inspector').height() / 2 ) - ( load.height() / 2 );
				
				load.hide().css('margin-top', dist +'px').fadeIn(200);
			},
			loadingHide		: function() {
				$('#inspector-loading').fadeOut(400);
			},
			getTabAnchor	: function( id, tabsId ) {
				tabsId = tabsId || '#tabs-inspector';
				return $( tabsId + ' > ul:first > li > a[href="'+ id +'"]');
			},
			bindTabSelect	: function( id, callback, tabsId ) {
				tabsId = tabsId || '#tabs-inspector';
				g.ir.fn.getTabAnchor( id, tabsId ).bind( $( tabsId ).tabs('option', 'event') + '.tabs', callback );
			},
			hideTab			: function( id, tabsId ) {
				tabsId = tabsId || '#tabs-inspector';
				
				if( typeof g.ir.tabs[tabsId] === 'undefined')
					g.ir.tabs[tabsId] = { hide : [], show : [] };
				
				g.ir.tabs[tabsId].hide.push( id );
			},
			showTab			: function( id, tabsId ) {
				tabsId = tabsId || '#tabs-inspector';

				if( typeof g.ir.tabs[tabsId] === 'undefined')
					g.ir.tabs[tabsId] = { hide : [], show : [] };

				g.ir.tabs[tabsId].show.push( id );
			},
			updateTabs		: function( tabsId ) {
				tabsId = tabsId || '#tabs-inspector';
				
				if( typeof g.ir.tabs[tabsId] === 'undefined')
					return;
					
				console.log('tabs', g.ir.tabs[tabsId] );
					
				// Show tabs
				$.each( g.ir.tabs[tabsId].show, function(){
					g.ir.fn.getTabAnchor( this, tabsId ).parent().filter('.hide').removeClass('hide');
				});
					
				// Hide tabs
				var selected = false;
				$.each( g.ir.tabs[tabsId].hide, function(){
					selected = g.ir.fn.getTabAnchor( this, tabsId ).parent().addClass('hide').is('.ui-tabs-selected') || selected;
				});
				
				if( selected ) {
					// If the tab we're hiding is selected, select the first visible tab.
					var show = $(tabsId + ' > ul:first').children(':not(.hide)').eq(0).children('a').attr('href');
					
					if( typeof show !== 'undefined') {  // If there is at least one tab, show it.
						$( tabsId ).tabs('select', show);
					} else {							// There are no tabs. This is bad, but hide whatever is showing.
						$(tabsId + ' > ul:first').children('.ui-tabs-selected').each(function(){
							$(tabsId).children('div[id="'+ $(this).children('a').attr('href').slice(1) +'"]').addClass('ui-tabs-hide');
						}).removeClass('.ui-tabs-selected');
					}
				}
				
				// Clear arrays
				g.ir.tabs[tabsId] = { hide : [], show : [] };
			}
			
		},
		current_panel	: { x : null, y : null },
	},
	bp				: {
		column_count	: 24,
		column_width	: 30,
		gutter_width	: 10,
		page_width		: 950,
		input_padding	: 5,
		input_border	: 1,
		// Variables added for editor support
		row_count		: 13,
		row_height		: 40,
		gutter_height	: 10,
		page_height		: 640
	},
	theme			: {
		name		: 'Elastic',
		title		: 'Elastic',
		path		: 'elastic',
		install		: true,
		uri			: 'http://koopersmith.wordpress.com/',
		description	: 'A theme generated by the elastic framework.',
		version		: '0.0.2.1',
		author		: 'Daryl Koopersmith',
		author_uri	: 'http://koopersmith.wordpress.com/',
		tags		: 'elastic'
	},
	canvas				: {
		typo		: {
			'Body Text'	: {
				selector	: 'p',
				css			: {
					'font-family'	: 'Georgia, serif',
					'font-size'		: '1em',
					'color'			: '#000000'
				}
			},
			'Blog Title'		: {
				selector	: '#blog-title span',
				css			: {
					'font-family'	: 'Arial, sans-serif',
					'font-size'		: '3em',
					'font-weight'	: 'bold',
					'color'			: '#000000'
				}
			},
			'Blog Description'	: {
				selector	: 'h1',
				css			: {
					'font-family'	: 'Georgia, serif',
					'font-size'		: '1.4em',
					'font-style'	: 'italic',
					'color'			: '#666666'
				}
			},
			'Post Title'		: {
				selector	: 'h2',
				css			: {
					'font-family'	: 'Arial, sans-serif',
					'font-size'		: '2.4em',
					'font-weight'	: 'bold',
					'color'			: '#000000'
				}
			},
			'Section Title'		: {
				selector	: 'h3',
				css			: {
					'font-family'	: 'Georgia, serif',
					'font-size'		: '1.8em',
					'font-style'	: 'italic',
					'color'			: '#666666'
				}
			},
			'Subsection Title'	: {
				selector	: 'h4',
				css			: {
					'font-family'	: 'Georgia, serif',
					'font-size'		: '1.2em',
					'font-variant'	: 'small-caps',
					'color'			: '#666666'
				}
			},
			'Links'	: {
				selector	: 'a',
				css			: {
					'font-family'	: 'Georgia, serif',
					'font-size'		: '1.2em',
					'font-variant'	: 'small-caps',
					'color'			: '#666666'
				}
			},
			'Lists'	: {
				selector	: 'h4',
				css			: {
					'font-family'	: 'Georgia, serif',
					'font-size'		: '1em',
					'color'			: '#666666'
				}
			},
			'Block Quote'	: {
				selector	: 'h4',
				css			: {
					'font-family'	: 'Georgia, serif',
					'font-size'		: '1em',
					'font-style'	: 'italic',
					'color'			: '#666666'
				}
			},
			'Code'	: {
				selector	: 'h4',
				css			: {
					'font-family'	: '"Courier New", serif',
					'font-size'		: '1em',
					'color'			: '#000000'
				}
			},
		}
	}
}



// Methods that extend jQuery declared here

$.fn.extend({

	// wait from the jQuery cookbook:  http://docs.jquery.com/Cookbook/wait 
	wait		: function(time, type) {
		time = time || 1000;
		type = type || "fx";
		return this.queue(type, function() {
			var self = this;
			setTimeout(function() {
				$(self).dequeue();
			}, time);
		});
	},
	gridWidth	: function() {
		return widthToCol(this.eq(0).width());
	},
	gridHeight	: function() {
		return heightToRow(this.eq(0).height());
	},
	gridTop		: function() {
		return pxToRow(this.eq(0).css('top').slice(0,-2));
	},
	gridLeft	: function() {
		return pxToCol(this.eq(0).css('left').slice(0,-2));
	},
	
	fixResizeWidth	: function() {
		return this.each(function(){
			var loc = $(this).data('location');
			
			var maxWidth = widthToCol($(this).resizable('option','maxWidth'));
			var maxFound = false;
			
			for ( var j = loc.left + loc.width; j < g.ui.array[0].length; j++) {
				for ( var i = loc.top; i < loc.top + loc.height; i++) {
					if ( g.ui.array[i][j] ) {
						maxWidth = j - loc.left;
						maxFound = true;
						break;
					}
				}
				if (maxFound) {
					$(this).resizable('option','maxWidth', colToWidth(maxWidth));
					break;
				}
			}
			
			// Reset to page_width
			if (!maxFound)
				$(this).resizable('option','maxWidth',g.bp.page_width);
				
		});
	},
	fixResizeHeight	: function() {
		return this.each(function(){
			var loc = $(this).data('location');
			
			var maxHeight = heightToRow($(this).resizable('option','maxHeight'));
			var maxFound = false;
			
			for ( var i = loc.top + loc.height; i < g.ui.array.length; i++) {
				for ( var j = loc.left; j < loc.left + loc.width; j++) {
					if ( g.ui.array[i][j] ) {
						maxHeight = i - loc.top;
						maxFound = true;
						break;
					}
				}
				if (maxFound) {
					$(this).resizable('option','maxHeight', rowToHeight(maxHeight));
					break;
				}
			}
			
			// Reset to page_height
			if (!maxFound)
				$(this).resizable('option','maxHeight',g.bp.page_height);
				
		});
	},
	
	// fillGrid and unfillGrid can be grouped since they use the same structure
	//		see the commented navigateMultiArray
	fillGrid		: function() {
		return this.each(function(){
			var loc = $(this).data('location');
			
			for (var i = loc.top - loc.mtop; i < loc.top + loc.height; i++) {
				for (var j = loc.left - loc.mleft; j < loc.left + loc.width + loc.mright; j++) {
					g.ui.array[i][j] = $(this);
				}
			}
		});
	},
	unfillGrid		: function() {
		return this.each(function(){
			var loc = $(this).data('location');
			
			for (var i = loc.top - loc.mtop; i < loc.top + loc.height; i++) {
				for (var j = loc.left - loc.mleft; j < loc.left + loc.width + loc.mright; j++) {
					g.ui.array[i][j] = '';
				}
			}
		});
	},
	removable		: function() {
		return this.each(function(){
			var self = $(this);
			$(this).append('<div class="ui-removable ui-icon ui-icon-close"></div>')
				.children('.ui-removable')
				.css({'z-index' : 1001})
				.click(function(){
					var cycleId = self.data('cycle');
						
					self.removeCycles()
						.unfillGrid()
						.remove();
						
					$('#tb-canvas-settings').click();
				});
		});
	},
	label			: function() {
		return this.each(function(){
			var self = $(this);
			$(this).dblclick(function(){
				$(this).append('<div class="ui-dialog"><form action=""><select id="contentType"><option value="header">Header</option><option value="content">Main Content</option><option value="footer">Footer</option><option value="sidebar">Sidebar</option></select></form></div>').children('.ui-dialog').dialog({
					title : 'Type of Content',
					modal : true,
					buttons: {
						"Ok": function() {
							var o = self.data('location');
							var type = o.type;
							self.removeClass('type-'+type);
							
							type = $('#contentType').val();
							o.type = type;
							self.addClass('type-'+type);
							$(this).dialog("close");
						}
					},
					open: function(){
						$('#contentType').children('option[value='+ self.data('location').type +']').attr('selected', 'selected');
					},
					close: function(){
						$(this).remove();
					}
				});
			});
		});
	},
	containerHeight		: function() {
		var height = 0;
		console.log('container height');
		$(this).eq(0).children().each(function(){
			console.log('Child element', this, 'location', $(this).data('location'));
			height += $(this).data('location').height;
		});
		return height;
	},
	bpOutput		: function(items) {
		function bottom(n) { return n.top + n.height; }
		function right(n) { return n.left + n.width; }
		function left(n) { return n.left; }
	
		$.fn.extend({
			bpContinue : function(p,items) {
				return this.each(function(){
					$(this).bpAddChild(p).children('div:last').bpOutput(items);
				});
			},
			bpAddChild : function(p) {
				return this.each(function(){
					var last,
						item = $(this),
						// Extend o and p to make sure that #editor data isn't linked to #output data.
						o  = $(this).data('location'),
						oE = $.extend({},o),
						pE = $.extend({},p);
					
					console.log('adding',pE,'to',oE);
					
					
					if (oE.left + oE.width == pE.left + pE.width)
						last = ' last';
					else
						last = '';
						
					if(!o.container) {
						//o.container = true;
						console.log('making container');
						
						
						// Unlink this.data('location') from o
						$(this).data('location', $.extend({},o,{ container : true, type : 'group' }) );
						// Link o to the new child
						$(this).bpAddChild(o);
						// Reset o to this.data('location')
						o = $(this).data('location');
					}
					
					$(this).append('<div></div>')
						.children('div:last')
						.addClass('out span-'+pE.width+last)
						.data('location',pE);
					
					// Calculate the height of the container
					//    We can save directly to o, since at this point,
					//		this must be a container, and o will only be associated with this.
					o.height = bottom(pE) - o.top;
					
					var nspc = g.ui.cycle.bpOutput_nspc;
					$(this).findCycles(nspc);
					if(cycleGetNspc(nspc).length) {
						console.log('FOUND A CYCLE!   look at output:',$('#output').html());
						$(this).removeCycles(nspc);
						
						// Check if o was originally a container.
						if (!oE.container)
							$(this).children().remove();
						else
							$(this).children('div:last').remove();
						
						// Revert this.data('location') back to the original values
						$(this).data('location',oE);
						
						//console.log('o.container',o.container,'oE.container',oE.container);
						console.log('o',o,'$(this)',$(this).data('location'));
						p.rendered = false;
						console.log('removed stuff. output again:',$('#output').html());
					}	
					console.log('ADDED CHILD \t\t\t OUTPUT: ',$('#output').html());
				});
			}
		});
		
		/*
			TOP ROW
			
			topRow(o)
				returns the list of elements in area 'o' that do NOT have elements on top of them.
				
			
			There's a way to do this without using the grid.
				*  Check all elements for the 'top' attribute (in a given region)
				*  Select all elements inside the region with the lowest 'top' possible
					*  For each element, make sure it isn't wider than the area where it has
						the lowest top (this means that it has an element on top of it).
					*  Also, check if the element is completely inside the given region
		
		*/
		
		// This could be pulled into the $.fn.extend that comes before this.
		$.fn.topRow = function (top) {
			function topRowCore(o) {
				//console.log('topRowCore starting... o :',o);
				var items = [], space = [], prevSpace = false;
			
				function addSpace(width) {
					if (prevSpace) {
						space[space.length - 1].width += width;
					} else {
						space.push({
							width: width,
							left: j,
							// Add 1 to top since it will be input to topRow
							top: o.top + 1
						});
						prevSpace = true;
					}
				}
			
				for (var j = o.left; j < o.left + o.width; j++) {
					var item = g.ui.array[o.top][j];
				
					if (item) {
						var p = item.data('location');
					
					
						// if the item is larger than the area you're scanning, break
						// this statement is used in the invalid block as well--consolidate to fn?
						if (p.left < o.left || p.left + p.width > o.left + o.width)
							break;
					
						if (p.rendered) {
							addSpace(p.width);
						} else {
							console.log('topRow item found: ', item, 'location', p, 'this location', o);
							items.push( item );
							prevSpace = false;
						}
						j += p.width - 1;
					} else {
						addSpace(1);
					}
				}
			
				if ( ++o.top < g.ui.array.length ) {
					for (var i = 0; i < space.length; i++) {
						items = items.concat(topRowCore(space[i]));
					}
				}
				return items;
			}
		
			function compareBottom(a,b) {
				// sort by descending bottom order
				var c = a.data('location');
				var d = b.data('location');
				return bottom(d) - bottom(c);
			}
		
			function compareLeft(a,b) {
				// sort by ascending left order
				var c = a.data('location');
				var d = b.data('location');
				return c.left - d.left;
			}
			
			var o = $.extend({},$(this).data('location'));
			o.top = top || o.top;
			
			// CALCULATE INVALID
			var invalid = g.ui.array.length;
			var c = $(this);
			while (c.attr('id')!='output') {
				console.log('c',c,'c.parent.attr("id")',c.parent().attr('id'));
				var q = c.data('location');
				for (var i = o.top; i < g.ui.array.length; i++) {
					for (var j = q.left; j < q.left + q.width; j++) {
						var item = g.ui.array[i][j];
						if (item) {
							var p = item.data('location');
							if (p.left < q.left || p.left + p.width > q.left + q.width) {
								invalid = Math.min(i, invalid);
								break;
							}
						}
					}
				}
				c = c.parent();
			}
			
			console.log('INVALID HEIGHT',invalid);
		
			// RUN CORE
			var items = topRowCore(o);
		
			// REMOVE INVALID ELEMENTS
			// 		Sorts items by bottom, and removes all elements with bottom > invalid
			//		Continuously updates invalid
			if (invalid) {
				items.sort(compareBottom);
				var i = 0;
				console.log('items length', items.length);
				while( i < items.length && bottom(items[i].data('location')) > invalid) {
					console.log('found invalid item', items[i], 'invalid', invalid);
					invalid = Math.min(invalid, items[i].data('location').top);
					i++;
				}
				//
				//		IMPORTANT!!! WHEN YOU ADD/REMOVE THIS CONSOLE.LOG, UNCOMMENT THE FOLLOWING.
				//
				//console.log('removing items from array', items.splice(0,i));
				items.splice(0,i);			
			}
		
		
			// SORT ITEMS BY LEFT
			items.sort(compareLeft);
			return items;
		}
		
		
		
		// START BPOUTPUT
		//   Check for cycles
		if (cycleGetNspc().length > 0) {
			console.log('Please remove all cycles before generating output.');
			return;
		}
		
		return this.each(function(){
			var o = $.extend({},$(this).data('location'),{obj: $(this)});
			console.log('starting bpOutput',o);
			
			
			// If items is an array, items is the pre-calculated topRow
			// If items is a number, it is the row to start topRow at.
			if (!$.isArray(items)) {
				items = $(this).topRow(items);
			}
			
			
			console.log('topRow length', items.length);
			console.log('topRow',items);
			
			if (items.length) {
				var self = $(this);
				var tallest;
				
				$.each(items, function(){
					var p = this.data('location');
					if (!tallest || bottom(p) > bottom(tallest[0].data('location')))
						tallest = [this];
					else if (bottom(p) == bottom(tallest[0].data('location')))
						tallest.push(this);
				});
						
				for ( var j = 0; j < tallest.length; j++) {
					for( var i = 0; i < items.length; i++) {
						if (items[i] == tallest[j]) {
							// Extend p to avoid mixing #output and #editor data.
							//    o is already extended.
							
							var prevRight = o.left, p = tallest[j].data('location'), pE = $.extend({}, p);
							
							// Align items with the right side of the previous item
							if (tallest[j-1]) {
								prevRight = right(tallest[j-1].data('location'));
							}
							
							// Pass items left of tallest to container
							var containerWidth = pE.left - prevRight;
							if(containerWidth) {
								self.bpContinue({
									left : prevRight,
									width : containerWidth,
									top : pE.top,
									height : 0,
									container : true,
									type : 'group'
								}, items.splice(0,i));
							}
							// Delete tallest
							p.rendered = true;
							
							self.bpContinue(p);
							
							console.log('p.rendered',p.rendered);
							items.splice(0,1);
							
							// If last tallest, make right container
							if(!tallest[j+1] && right(pE) < right(o)) {
								self.bpContinue({
									left : right(pE),
									width : right(o) - right(pE),
									top : pE.top,
									height : 0,
									container : true,
									type : 'group'
								}, items);
							}
						}
					}
				}
				
				console.log('bottom tallest', bottom(tallest[0].data('location')), 'tallest', tallest[0]);
				$(this).bpOutput(bottom(tallest[0].data('location')));
				

					// Set margin-top
					//p.mtop = p.top - o.top;
									
					// Create containers, but delete them and substitute with margins if empty			
					//self.bpContinue(p);


			
			}
			
			//
			//
			//
			//  DEAL WITH EMPTY
			//
			//
			$(this).filter(function(){
				if($(this).is(':empty') && o.container)
					console.log('REMOVING EMPTY CONTAINER\t\tOUTPUT:',$('#output').html());
				return $(this).is(':empty') && o.container;
			}).remove();
			
			
			console.log('BPOUTPUT COMPLETE', this,'\t\tOUTPUT:',$('#output').html());
			
			//
			//
			//
			//	ADD CHECK FOR ONE-ITEM CONTAINERS
			//
			//
			
			
			
			
			// Check sides
			/*function checkSideHelper(j) {
				for (var i = p.top - p.mtop; i < height(p); i++) {
					if(g.ui.array[i][j])
						return true;
				}
				return false;
			}
			
			for (var j = 0; j < p.left; j++) {
				if(checkSideHelper(p.left - j))
					break;
			}*/

			
			// get item at top, left
			/*var item = findItem(o);
			if (!item)
				return;
				
			var p = item.data('location');
			*/
			// If an item goes outside the area that we're scanning, stop!
			/*if (p.left < o.left || p.left + p.width > o.left + o.width)
				return;
			
			
			tallest = max(tallest, p.height);
			*/
			
			
			// If there is whitespace...
			
			//
			//
			//
			//  NOTE: ACCOUNT FOR THE TALLEST DIV FIRST
			//			KEEP TABS ON THE CURRENT LEFT POSITION
			//			WHEN CALCULATING WHITESPACE, KNOW WHERE THE NEAREST LEFT ELEMENT IS
			//			THIS DOES NOT ACCURATELY DETECT WHITESPACE
			//
			//
			//
			/*if (p.left > o.left) {
				var space = p.left - o.left;
				
				// create new div with space
				$(this).bpContinue({});
				$(this).append('<div class="span-'+space+'"></div>')
					.children('div:last')
					.data('location',{
						width : space,
						top : p.top,
						left : o.left
					}).bpOutput();
				
			}*/
			
			
			
			
		});
	},
	findCycles			: function(nspc) {
		nspc = cycleGetNspc(nspc, true);
		$.fn.selector = nspc.selector;
		
		//console.log('NAMESPACE',nspc.name);
		
		function t(a) { return a.top * 2; }
		function l(a) { return a.left * 2; }
		function b(a) { return (a.top + a.height)*2 - 1; }
		function r(a) { return (a.left + a.width)*2 - 1; }
		function lr(a,c) { return (l(a) < r(c)) && (l(c) < r(a)); };
		function tb(a,c) { return (t(a) < b(c)) && (t(c) < b(a)); };
		
		function findCycle(items, primary) {
			var o = $.map(items, function(a) {return a.data('location'); });
			
			//add a blank element to the start of the array for number convention
			o.unshift('');
			
			
			// there are 6 tests total. for each primary element,
			// associate the three tests that AREN'T the primary tests
			var t12,t13,t14,t23,t24,t34,tests, cycle = true;
			
			
			t12 = tb(o[1],o[2]);
			t13 = lr(o[1],o[3]);
			t14 = lr(o[1],o[4]);
			t23 = lr(o[2],o[3]);
			t24 = tb(o[2],o[4]);
			t34 = tb(o[3],o[4]);
			
			
			if ('e1' == primary) {
				tests = [t23, t24, t34];
			} else { // 'e2' == primary
				tests = [t13, t14, t34];
			}
			
			for (var i = 0; i < tests.length; i++)
				cycle = cycle && tests[i];
			
			if (cycle) {
				console.log('CYCLE FOUND', 'primary', primary, 'items', items);
				return items;
			} else
				return false;
		}
		
		function arrayToCycle (a) {
			var items = [], cycles = [];
			
			$.extend({
				cycleEach : function(arr, callback) {
					$.each(arr, function() {
						// make sure that an item isn't repeated
						for(var i = 0; i < items.length; i++) {
							if (items[i].attr('id') == $(this).attr('id'))
								return true;
						}
						items.push($(this));
						callback();
						items.pop($(this));
					});
				}
			});
			
			
			$.cycleEach(a[0], function() {
				$.cycleEach(a[1], function() {
					$.cycleEach(a[2], function() {
						$.cycleEach(a[3], function() {
							var c = findCycle(items, a[4]);
							// must clone/extend c, since c is a reference to items
							if (c) cycles.push($.extend({},c));
						});
					});
				});
			});
			return cycles;
		}
		
		return this.each(function(){
			$(this).removeCycles(nspc);
			
			var o = $(this).data('location');
			var top = [], left = [], cycles = [];
			
			$(this).selector().not(this).each(function(){
				var p = $(this).data('location');
				if ( tb(o,p) ) top.push($(this));
				if ( lr(o,p) ) left.push($(this));
			});
			
			//console.log('arrays', 'top', top, 'left', left);
			
			var potentialCycles = [
				[$(this), top, left, left, 'e1'],
				[top, $(this), left, top, 'e2']
			];

			$.each(potentialCycles, function() {
				$.merge(cycles, arrayToCycle(this));
			});
			
			//console.log(cycles.length,'cycles found', cycles);
			
			$.each(cycles, function() {
				$.each(this, function() {
					this.addClass('cycle cycle-'+ nspc.name + nspc.id);
					var cycleId = this.data('cycle');
					if (cycleId) {
						cycleId.push( nspc.name + nspc.id);
						this.data('cycle',cycleId);
					} else {
						this.data('cycle',[ nspc.name + nspc.id]);
					}
				});				
				nspc[nspc.name + nspc.id] = this;
				nspc.length++;
				nspc.id++;
			});
			
			//console.log('cycle check complete');
		});
	},
	removeCycles		: function(nspc) {
		nspc = cycleGetNspc(nspc);
		return this.each(function(){
			var cycleId = $(this).data('cycle');
			if(cycleId && nspc) {
				// make sure to extend cycleId, since we will be modifying it inside
				$.each($.extend({},cycleId), function(){
					var cId = this;
					$('.cycle-'+this).each(function(){
						var c = $(this).data('cycle');
						if (c.length > 1) {
							for(var i = 0; i < c.length; i++) {
								if (c[i] == cId) {
									c.splice(i,1);
								}
							}
						} else {
							$(this).removeData('cycle')
								.removeClass('cycle');
						}
					}).removeClass('cycle-'+this);
					nspc[this] = '';
					nspc.length--;
					
					//console.log('length',nspc.length, 'this', this);
				});
			}
		});
	},
	inspectable			: function(options) {
		var defaults = {
			event : 'click'
		}
		
		var settings = $.extend( true, {}, defaults, options );
		
		return this.each(function(){
			$(this).bind(settings.event, function() {
				// Replace everything in the selected array with this.
				irUpdate( $(this) );
			});		
		});
	},
	buttonDown			: function() {
		return this.each(function(){
			if( ! $(this).is('.el-button') )
				return true;
				
			$(this).parents('.el-buttonset-single:first').find(".el-button.ui-state-active").buttonOff();
			if( $(this).is('.ui-state-active.el-button-toggleable, .el-buttonset-multi .ui-state-active') ){ $(this).buttonOff(); }
			else { $(this).buttonOn(); }
		});
	},
	buttonUp			: function() {
		return this.each(function(){
			if( ! $(this).is('.el-button') )
				return true;
				
			if(! $(this).is('.el-button-toggleable, .el-buttonset-single .el-button, .el-buttonset-multi .el-button') ){
				$(this).buttonOff();
			}
		});
	},
	buttonOn			: function() {
		return this.each(function(){
			if( ! $(this).is('.el-button') )
				return true;
			
			$(this).addClass('ui-state-active');
			$(this).trigger('buttonOn');
		});
	},
	buttonOff			: function() {
		return this.each(function(){
			if( ! $(this).is('.el-button') || ! $(this).is('.ui-state-active')  )
				return true;

			$(this).removeClass('ui-state-active');
			$(this).trigger('buttonOff');
		});
	}

});

function cycleGetNspc(nspc, set) {
	set = set || false;
	nspc = nspc || g.ui.cycle.default_nspc;
	if (typeof nspc == 'string')
		nspc = { name : nspc };
	
	if(!g.ui.cycle[nspc.name]) {
		if (set)
			g.ui.cycle[nspc.name] = $.extend({}, g.ui.cycle.init_nspc, nspc);
		else
			return false;
	}
	return g.ui.cycle[nspc.name];
}

/*function navigateMultiArray (a, b, c, d, f) {
	for (var i = a; i < b; i++) {
		for (var j = c; j < d; j++) {
			f(i,j);
		}
	}
}*/


$(document).ready(function() {
	console.log('document ready');
	
	parseInput();
	initDialogs();
	initInspector();
	initResizable();
	initUI();
	initBlueprint();
});

function parseInput() {
	// Replace encoded quotes
	$.each(input, function(key, val){
		input[key] = val.replace(/&quot;/g,'"');
	});
	
	input.themes = JSON.parse(input.themes);
}

function initDialogs() {
	
	loadDialogInspector();
	loadDialogOverlay();
	//loadDialogInstructions();
	//loadGenerateOutput();
	
	
	
	function loadDialogInspector() {
		$('#dialog-inspector').dialog({
			autoOpen : true,
			title : 'Elastic Editor',
			modal : false,
			width : 400,
			closeOnEscape : false,
			resizable : false,
			minHeight : false,
			zIndex: 10000,
			open: function() {
				var ir = $(this).parent();
					
				ir.css({ 'top' : ir.height() * -1 }).wait(500).queue(function(){
					var dist = ( $(window).height() / 2 ) - ( ir.height() / 2 );
					
					$(this).fadeTo(0, 0).css({'top': (dist - 25) })
						.animate({ top : dist+'px', opacity : 1 }, 500, function(){
							$('#tabs-inspector').trigger('tabsshow');
						})
						.dequeue();
				})
					//
			}
		})
		.parent().fadeTo(0, 1).hover(
			function(){ $(this).fadeTo(150, 1); },
			function(){
				var dialog = $(this);
				if ( ! ( dialog.hasClass('ui-dialog-dragging') || dialog.hasClass('ui-dialog-resizing') ) )
					dialog.fadeTo(200, 1);
			}
		).attr('id','inspector')
		.append('<div id="inspector-loading"><div class="ui-corner-all">Working...</div></div>');
		
		$('#inspector-loading').hide();
		
		// Hide dialog tab navigation. Tabs are controlled by outside elements.
		$('#tabs-inspector').tabs().children('.ui-tabs-nav').hide()
			.end().bind('tabsshow', function( event, ui ){ // Animate tab resizing 
				if( typeof ui !== 'undefined' ) {
					g.ir.current_panel.x = $(ui.panel);
					if( $(ui.panel).parent().attr('id') === 'tabs-inspector' )
						g.ir.current_panel.y = $(ui.panel);
				}
				
				var x = g.ir.current_panel.x,
					y = g.ir.current_panel.y;
			
				if( y && y.is(':visible') )
					$('#tabs-inspector').animate({ height : y.outerHeight() }, 200);
				
			
				if( x && x.is(':visible') ) {
					if( x.attr('id') === 'ir-module' ) // Check if x is the module panel
						x = x.children('div:visible'); // Get the module panel's active tab
				
					var dist, ins = $('#inspector');
				
					if( x.hasClass('ir-custom-width') ) {
						var offsetLeft = x.offset().left - ins.offset().left -
								(( ins.css('border-left-width').slice(0,-2) * 1 ) + ( ins.css('padding-left').slice(0,-2) * 1 ));
						dist = x.outerWidth() + (offsetLeft * 2); // Guess that the padding is symmetrical: multiply offset x2
					}else
						dist = $('#dialog-inspector').dialog('option', 'width');

					ins.animate({ width : dist }, 200);
				}
			});
		
		$('#ir-module').tabs();
	}
	
	function loadDialogOverlay() {
		$('#dialog-overlay').dialog({
			autoOpen : false,
			closeOnEscape : false,
			draggable : false,
			modal : true,
			resizable : false,
			zIndex : 99999,
			open : function() {
				$('body').addClass('dialog-overlay-active'); // CSS makes overlay transparent
			},
			close : function() {
				$('body').removeClass('dialog-overlay-active');
			}
		}).parent().addClass('hide'); // Hides dialog--we only care about the overlay
	}
	
	function loadDialogInstructions() {
		$('#dialog-instructions').dialog({
			autoOpen : false,
			title : 'Instructions',
			modal : false,
			width : 500
		});
		$('#tb-instructions').click(function(){
			$('#dialog-instructions').dialog('open');
		});
	}
	
	function loadDialogChangeGrid() {
		$('#dialog-changegrid').keyup(function(){
			var cc = $('#column_count').val() * 1,
				cw = $('#column_width').val() * 1,
				gw = $('#gutter_width').val() * 1,
				pw = cc * ( cw + gw );
			$('#page_width').val( pw );
		});
		$('#dialog-changegrid').dialog({
			title : 'Choose Your Grid',
			modal : true,
			buttons: {
				"Ok": function() {
					var cc = $('#column_count').val() * 1,
						cw = $('#column_width').val() * 1,
						gw = $('#gutter_width').val() * 1;

					if(cc == 0 && cw == 0 && gw == 0)
						fixBlueprintCSS(24, 30, 10);
					else
						fixBlueprintCSS(cc, cw, gw);

					$(this).dialog("close");
				},
				"Default": function() {
					$('#column_count').val(24);
					$('#column_width').val(30);
					$('#gutter_width').val(10);
					$('#dialog-changegrid').keyup();
				}
			}
		});
	}
	
	
	function loadGenerateOutput() {
		$('#dialog-generateoutput').dialog({
			autoOpen : false,
			title : 'WARNING',
			modal : true,
			buttons: {
				"Ok": function() {
					generateOutputButton();
					$(this).dialog("close");
					if ($('#generate-output-warn-again').is(':checked'))
						$(this).remove();
				},
				"Cancel": function() {
					$(this).dialog("close");
				}
			}
		});
		
		$('#tb-generate-output').click(function(){
			console.log('generating output...');

			if( cycleGetNspc().length > 0 ) {
				$(this).html('Get rid of the <strong>red</strong> and try again!');
			} else if ( ! $('.e').length ) {
				$(this).html('<strong>Add something</strong> and try again!');
			} else {
				generateOutputDialog();
			}

			$(this).wait(2000).queue(function(){
				$(this).html('Customize <em>Elastic</em>');
				$(this).dequeue();
			});
		});
	}
	
	function generateOutputDialog() {
		//if($('#dialog-generate-output').is('div'))
		//	$('#dialog-generate-output').dialog('open');
		//else
			generateOutputButton();
	};
	
	function generateOutputButton() {
		var go = $('#tb-generate-output');
		go.html('Updating <em>Elastic</em>...');
		generateOutput();
		go.html('<em>Elastic</em> Updated!');
		go.wait(2000).queue(function(){
			$(this).html('Customize <em>Elastic</em>');
			$(this).dequeue();
		});
	}
}

/* ---------------------------------------------------


		I  N  S  P  E  C  T  O  R     F  U  N  C  T  I  O  N  S

	ADD COLUMN
		* Check if point is taken
		* Adds column at point
	
	
--------------------------------------------------- */

function initInspector() {
	$('#editor').data('location', g.canvas);
	// Select canvas by default
	g.ir.selected = [ $('#editor') ];
	
	irLoad();
	irSave();
	irNew();
	irInstructions();
	irCanvasSettings();
	irLabelForm();
	irTypography();
}

function irUpdate( selected, tabId ) {
	tabId = tabId || '#ir-module';
	
	$('#inspector').trigger('ir-before-update');
	// Set selected
	g.ir.selected = ( $.isArray(selected) ) ? selected : [ selected ];
	$('#inspector').trigger('ir-update');
	// Select tab
	$('#tabs-inspector').tabs('select', tabId );
	
	if ( '#ir-module' === tabId ) // Update ir-module tabs
		g.ir.fn.updateTabs( tabId );
}

function irLoad() {
	var select = $('#ir-load-select'),
		options = '';
	
	$.each(input.themes, function(){
		if ( this.compatible )
			options += '<option value="' + this.name + '">' + this.name + '</option>';
	});
	
	select.html(options);
	$('#ir-load-button-load').click(function(){
		g.ir.fn.canvasLoadBegin();
		var name = select.val();
		$.post('admin-ajax.php', {
			action : 'elastic_load_state',
			name : name
		}, function(data) {
			data = JSON.parse(data);
			loadState( data );
			
			$.each(input.themes, function(){
				if( name === this.name ) {
					g.theme = $.extend( {}, g.theme, this );
					return false;
				}
			});
			
			g.ir.fn.canvasLoadEnd();
		});
	});
	
	$('#ir-load-button-new').click(function(){
		$('#tabs-inspector').tabs('select','#ir-new');
	});
}

function irSave() {
	var save = $('#ir-save-input'),
		paths = [];
	
	$.each(input.themes, function(){
		paths.push( this.path );
	});
	
	console.log('paths',paths);
	
	g.ir.fn.bindTabSelect( '#ir-save', function(){
		save.val( g.theme.name );
	});
	
	save.qtip( qTipSettings('name-taken') )
		.keyup(function(){
			var name = $(this).val();
			
			if( nameExists( name ) ) { // Let the user know if the name is taken
				$(this).qtip('show');
			} else {
				$(this).qtip('hide');
			}
		});
	
	$('#ir-save-button').click(function(){
		g.ir.fn.canvasLoadBegin();
		
		var name = save.val(),
			options = {},
			path;
		
		if ( name === g.theme.name ) {
			path = g.theme.path;
		} else {
			name = resolveDuplicates( name, nameExists );
			path = nameToPath( name );
		}
		
		options.name = sanitizeName( name ).replace(/[/][^/]+$/g, ''); // Sanitize name and remove path suffix
		options.path = path;
		generateOutput( options, g.ir.fn.canvasLoadEnd );
	});
	
	$('#tb-save').click(function(){
		$('#tabs-inspector').tabs('select','#ir-save');
	});
	
	function nameExists( name ) { return ( $.inArray( nameToPath( name ), paths ) !== -1 ) }
	
	function nameToPath( name ) {
		var path = name.replace(/[ _]/g, '-')
			.replace(/[^a-zA-Z0-9\-/]/g,'')
			.replace(/^[\-/\d]+/g, '') // remove leading hyphens, slashes, and digits
			.toLowerCase();
		
		
		var match = path.match(/.[/][^/]+$/); // check for a path suffix
		if( match )
			path = match.toString().slice(2).toString();
			
		path = path.replace(/[/]/g, '-'); // replace remaining slashes

		console.log('name',name, 'path',path);
		
		return path;
	}
}

function irNew() {
	$('#ir-new-form table').keyup(function(){
		var a = irNewGrid();
		
		console.log('a',a);
		
		$('#ir-new-pw').val( a.pw() );
	});
	
	$('#ir-new-select').change(function(){
		var grid = $(this).val().split(',');
		$('#ir-new-cc').val( grid[0] );
		$('#ir-new-cw').val( grid[1] );
		$('#ir-new-gw').val( grid[2] );
		$('#ir-new-form table').keyup();
	});
	
	$('#ir-new-button').click(function(){
		var a = irNewGrid();

		if(a.cc == 0 && a.cw == 0 && a.gw == 0)
			fixBlueprintCSS(24, 30, 10);
		else
			fixBlueprintCSS(a.cc, a.cw, a.gw);
	});
	
	function irNewGrid() {
		return {
			cc : $('#ir-new-cc').val() * 1,
			cw : $('#ir-new-cw').val() * 1,
			gw : $('#ir-new-gw').val() * 1,
			pw : function() { return this.cc * ( this.cw + this.gw ) - this.gw }
		}
	}
}

function irInstructions() {
	$("#tb-instructions").click(function(){
		$('#tabs-inspector').tabs('select','#ir-instructions');
		
		// Center the inspector
		var ir = $('#inspector'),
			dy = ( $(window).height() / 2 ) - ( ir.height() / 2 ),
			dx = ( $(window).width() / 2 ) - ( ir.width() / 2 );
			
		ir.animate({ top : dy+'px', left : dx+'px' });
	});
}

function irCanvasSettings() {
	$('#tb-canvas-settings').click(function(){
		irUpdate( $('#editor') );
	});
}

function irLabelForm() {
	var form = {
			name : $('#mod-label-name'),
			type : $('#mod-label-type'),
			id   : $('#mod-label-id'),
			name_span : $('#mod-label-name-span')
		},
		labels = g.ir.labels,
		defaultName = 'Sidebar 1';
	
	$('#inspector').bind('ir-before-update', function(){
		if( getSelectedObj().attr('id') === $('#editor').attr('id') || typeof getSelectedLoc() === 'undefined' )
			return;
		
		if ( ! isLimited( getSelectedLoc().type ) ) { // Check if type is named
			form.name.triggerHandler('focus'); // Trigger focus/blur in case input is still selected
			form.name.triggerHandler('blur');
		}
	});
	
	$('#inspector').bind('ir-update', function() {
		if( getSelectedObj().attr('id') === $('#editor').attr('id') ) {
			g.ir.fn.hideTab( '#mod-label', '#ir-module' );
			return;
		}
		
		g.ir.fn.showTab( '#mod-label', '#ir-module' );
		
		var o = getSelectedLoc();
		
		form.type.children('option[value='+ o.type +']')
			.attr('selected', 'selected');
			
		updateName();
	});
	
	form.type.change(function(){
		var item = getSelectedObj(),
			o = getSelectedLoc();
			
		item.removeClass('type-'+o.type);
		o.type = form.type.val();
		item.addClass('type-'+o.type);
		
		updateName();
	});
	
	form.name.focus( function () {
		var o = getSelectedLoc();
		
		if (o.name) {
			labels.remove( o.name ); // Unset name while user is typing
		}
	})
	.blur( function() {
		var o = getSelectedLoc(),
			name = sanitizeName( $(this).val() );
		
		$(this).qtip('hide'); // Hide tooltip. Name fixed below.
		
		
		name = resolveDuplicates( name, labels.has );
		
		o.name = name;
		labels.add( o.name );
		form.name.val( o.name );
	})
	.qtip( qTipSettings('name-taken') )
	.keyup(function(){
		var o = getSelectedLoc(),
			name = $(this).val();
		
		updateIdInput( name );
		
		if( labels.has( name ) ) { // Let the user know if the name is taken
			$(this).qtip('show');
		} else {
			$(this).qtip('hide');
		}
	});
	
	function updateIdInput( id ) {
		var o = getSelectedLoc();
		
		id = nameToId( id );
		form.id.val('#'+id);
	}
	
	function updateName() {
		var o = getSelectedLoc();
		
		// TODO: Change this once type limits are introduced
		if ( ! isLimited(o.type) ) { // Check if type can be named
			var name = o.name,
				blur = false;
			
			if( ! o.name || isLimited( o.name ) ) { // If name is undefined or the name of an unnamed type.
				name = defaultName;
				blur = true;
			}
			
			form.name_span.show();
			form.name.val(name);
			
			if( blur ) {
				form.name.triggerHandler('blur');
			}
			form.name.triggerHandler('focus'); // Trigger focus if input is already selected
		} else {
			form.name_span.hide();
			o.name = o.type;
			form.name.val(o.name);
		}	
		
		updateIdInput( o.name );
	}
	
	function isLimited( type ) {
		var limited = ["content", "header", "footer"],
			index = $.inArray( type, limited );
		return ( -1 !== index );
	}
	
	function getSelectedObj() {
		return g.ir.selected[0];
	}
	
	function getSelectedLoc() {
		return g.ir.selected[0].data('location');
	}
}

function irTypography() {
	// Hide font-input
	$('#mod-typo-font-input').hide().removeClass('hide');
	
	var cur, obj = {}, reset = {},
		preview = $('#mod-typo-preview textarea'),
		togText = { select : $('#mod-typo-font-toggle').text(), input : $('#mod-typo-font-toggle').val() };
	
	var defs = {
		'font-select'	: {
			id	: 'mod-typo-font-select',
			css : 'font-family',
			def : ''
		},
		'font-input'	: {
			id	: 'mod-typo-font-input',
			css : 'font-family',
			def : '',
			vld	: 'font-input'
		},
		'size'	: {
			id	: 'mod-typo-size',
			css : 'font-size',
			def : '1em',
			vld	: 'css-unit'
		},
		'color'		: [
			{
				id	: 'mod-typo-color-text',
				css : 'color',
				def : '#000000',
				vld	: 'hex'
			},{
				id	: 'mod-typo-color-background',
				css : 'background-color',
				def : '#FFFFFF',
				vld	: 'hex'
			}
		],
		'biu'		: [
			{
				id	: 'mod-typo-b',
				css : 'font-weight',
				def : 'normal',
				set : 'bold'
			},{
				id	: 'mod-typo-i',
				css : 'font-style',
				def : 'normal',
				set : 'italic'
			},{
				id	: 'mod-typo-u',
				css : 'text-decoration',
				def : 'none',
				set : 'underline'
			}
		],
		'caps'		: [
			{
				id	: 'mod-typo-caps-small',
				css : 'font-variant',
				def : 'normal',
				set : 'small-caps'
			},{
				id	: 'mod-typo-caps-all',
				css : 'text-transform',
				def : 'none',
				set : 'uppercase'
			}
		],
		'align'	: [
			{
				id	: 'mod-typo-align-left',
				css : 'text-align',
				def : 'inherit',
				set : 'left'
			},{
				id	: 'mod-typo-align-center',
				css : 'text-align',
				def : 'inherit',
				set : 'center'
			},{
				id	: 'mod-typo-align-right',
				css : 'text-align',
				def : 'inherit',
				set : 'right'
			},{
				id	: 'mod-typo-align-justify',
				css : 'text-align',
				def : 'inherit',
				set : 'justify'
			}
		],
		'spacing'	: [
			{
				id	: 'mod-typo-spacing-line',
				css : 'line-height',
				def : 'normal',
				vld	: 'css-unit'
			},{
				id	: 'mod-typo-spacing-letter',
				css : 'letter-spacing',
				def : 'normal',
				vld	: 'css-unit'
			},{
				id	: 'mod-typo-spacing-word',
				css : 'word-spacing',
				def : 'normal',
				vld	: 'css-unit'
			}
		]
	}
	
	var fonts = [
		{
			name	: 'Arial',
			stack	: 'Arial, sans-serif'
		},{
			name	: 'Arial Black',
			stack	: '"Arial Black", Arial, sans-serif'
		},
		{
			name	: 'Comic Sans MS',
			stack	: '"Comic Sans MS", sans-serif'
		},
		{
			name	: 'Courier New',
			stack	: '"Courier New", serif'
		},
		{
			name	: 'Georgia',
			stack	: 'Georgia, serif'
		},
		{
			name	: 'Impact',
			stack	: 'Impact, sans-serif'
		},
		{
			name	: 'Times New Roman',
			stack	: '"Times New Roman", serif'
		},
		{
			name	: 'Trebuchet MS',
			stack	: '"Trebuchet MS", sans-serif'
		},
		{
			name	: 'Verdana',
			stack	: 'Verdana, sans-serif'
		}
	];
	
	var defaultText = {
		'Quick Brown Fox'		: 'The quick brown fox jumped over a lazy dog.',
		'Lorem Ipsum'			: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
		'Uppercase Alphabet'	: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		'Lowercase Alphabet'	: 'abcdefghijklmnopqrstuvwxyz'
	}
	
	// Create options for font-select
	var fontSelect = '';
	$.each(fonts, function(){
		fontSelect += '<option value=\''+ this.stack +'\'>'+ this.name +'</option>\n';
	});
	
	// Fill and style font-select
	cur = defs['font-select'];
	$('#' + cur.id).html( fontSelect ).children().each(function(){
		$(this).css( cur.css, $(this).attr('value') );
	}).end().change(function(){
		updateCss( cur.css, $(this).val() ); // Update font
	});
	
	// Toggle font select box and font input box
	$('#mod-typo-font-toggle').click(function(){
		var fSel = $('#' + defs['font-select'].id),
			fIn = $('#' + defs['font-input'].id);
			
		//if ( fIn.is(':visible') ) {
		if ( togText.input === $(this).text() ) {
			var val = obj[ defs['font-input'].css ].split(', ')[0].replace(/"/g, '');
			
			fSel.children().each(function(){
				if( $(this).text().toLowerCase() === val.toLowerCase() )
					fSel.val( $(this).val() );
			});
			
			$(this).text( togText.select );

			fSel.change();
		} else {
			fIn.val( obj[ defs['font-input'].css ] );
			$(this).text( togText.input );
			fIn.change();
		}
		
		fIn.toggle();
		fSel.toggle();
	});
	
	// Input rules: size, spacing, font-input, color
	$.each( defs['spacing'].concat( defs['font-input'], defs['size'], defs['color'] ), function() {
		var self = this;
		
		$('#' + self.id).keyup(function(e){
			var s = sanitizers( $(this).val(), self.vld ),
				v = validators( s, self.vld, self.css ),
				isDef = ($(this).val() === '');

			$(this).val( s );
			
			if( isDef && 'font-input' !== self.vld )
				updateCss( self.css, self.def, true );
			else
				updateCss( self.css, v );
			
		}).change(function(){
			var v = sanitizers( $(this).val(), self.vld );
			v = validators( v, self.vld, self.css );

			if( $(this).val() === '' && 'font-input' !== self.vld )
				updateCss( self.css, self.def, true );
			else
				updateCss( self.css, v );
			$(this).val( ( obj[ self.css ] ) ? sanitizers( obj[ self.css ], self.vld ) : '' );
		});
	});
	
	// Toolbar functions
	$.each( defs['biu'].concat( defs['caps'], defs['align'] ), function() {
		var self = this;
		$('#' + self.id).bind('buttonOn', function(){
			updateCss( self.css, self.set );
		}).bind('buttonOff', function(){
			updateCss( self.css, self.def, true );
		});	
	});
	
	// Reset button
	$('#mod-typo-reset').click(function(){
		obj = $.extend({}, reset);
		updateTypoControls();
	});
	
	// Default text select
	var defaultTextSelect = '';
	$.each( defaultText, function(i, val) {
		defaultTextSelect += '<option value="'+ i +'">'+ i +'</option>';
	});
	$('#mod-typo-preview-options select').append( defaultTextSelect ).change(function(){
		preview.filter('textarea').text( defaultText[ $(this).val() ] );
		$(this).children().eq(0).attr('selected','selected');
	});
	
	// UL scrolling buttons
	$('button.mod-typo-samples-scroll').bind('buttonOn', function(){
		var ul = $('#mod-typo-samples ul'),
			up = $(this).children().hasClass('ui-icon-carat-1-n'),
			to = (up) ? 0 : (-1 * ( ul.height() - $('#mod-typo-samples').height() ) ),
			diff = Math.abs( to - (ul.css('top').slice(0,-2) * 1) );
		
		ul.animate({ top : to }, (diff * 5), 'linear' );
	}).bind('buttonOff', function(){
		$('#mod-typo-samples ul').stop();
	});
		
	// Update the typo panel on inspector update
	$('#inspector').bind('ir-update', function(){
		updateTypoSamples();
	});
	
	function updateTypoSamples() {
		var selected = g.ir.selected[0];
		if( typeof selected.data('location') === 'undefined' || typeof selected.data('location').typo === 'undefined' ) {
			g.ir.fn.hideTab( '#mod-typo', '#ir-module' );
			return;
		}
		
		g.ir.fn.showTab( '#mod-typo', '#ir-module' );
		samples = selected.data('location').typo;
		
		// Populate sample ul
		var samplelist = '';
		$.each( samples, function( i, val ){
			samplelist += '<li><div class="mod-typo-sample-preview">Elastic</div><div class="mod-typo-sample-name">'+i+'</div></li>';
		});

		// Style list items & create click event
		$('#mod-typo-samples ul').html( samplelist ).children().each( function(){
			$(this).children('.mod-typo-sample-preview').css( samples[ $(this).children('.mod-typo-sample-name').text() ].css );
		}).click(function(){
			var sample = $(this).find('.mod-typo-sample-name').text();

			obj = samples[ sample ].css;
			reset = $.extend({},obj);
			preview = $(this).children('.mod-typo-sample-preview').add('#mod-typo-preview textarea');
			$('#mod-typo-title span').text( sample + ':');
			updateTypoControls();
		});

		// Select first item
		$('#mod-typo-samples ul').children().eq(0).click();
	}
	
	function updateTypoControls() {
		// Disable inspector
		g.ir.fn.loadingShow();
		
		// Update font		
		var f = {
			sel		: $('#' + defs['font-select'].id),
			inp		: $('#' + defs['font-input'].id),
			tog		: $('#mod-typo-font-toggle'),
			preset	: false,
			stack	: obj[defs['font-input'].css]
		}
		
		f.selOpen = ( togText.select === f.tog.text() );
		
		// Check for preset stack
		f.sel.children().each(function(){
			if( $(this).val() === f.stack )
				f.preset = true;
		});
		
		if( f.preset && f.selOpen ) { 			// It's a preset, select's already showing
			f.sel.val( f.stack ).change();
		} else if ( f.preset ) { 				// It's a preset, show the select box
			f.tog.click(); // Sets value
		} else if ( f.selOpen ) { 				// Not a preset, show the input
			f.tog.click(); // Sets value
		} else { 								// Not a preset, input's already showing
			f.inp.val( f.stack ).change();
		}
		
		
		// Update values: size, color, spacing
		$.each( defs['color'].concat( defs['size'], defs['spacing'] ), function() {
			$('#' + this.id).val( (obj[ this.css ]) ? obj[ this.css ] : '' ).change();
		});
		
		// Update toolbar
		$.each( defs['biu'].concat( defs['caps'], defs['align'] ), function() {
			if ( obj[ this.css ] && obj[ this.css ] === this.set )
				$('#' + this.id).buttonOn();
			else
				$('#' + this.id).buttonOff();
		});
	
		// Enable inspector
		g.ir.fn.loadingHide();
	}
	
	function updateCss( property, value, isDef ) {
		isDef = isDef || false;
		if( '' !== value ) {
			if( isDef ) {
				delete obj[ property ]; // It's a default--delete the css data
			} else {
				obj[ property ] = value; // Update the css data
			}
			preview.css( property, value ); // Update the preview
		}
	}

}

/* ---------------------------------------------------


		U  I     F  U  N  C  T  I  O  N  S

	ADD COLUMN
		* Check if point is taken
		* Adds column at point
	
	
--------------------------------------------------- */ 

function initUI() {
	// Create multi-demensional array
	g.ui.array = multiArray( g.bp.row_count, g.bp.column_count );
	
	// Init button logic
	buttonLogic();

	// Add elements when the editor is clicked
	$('#editor').mousedown(function(e){
		var target = $(e.target);
		if(e.target == this || target.hasClass('grid_column') || target.attr('id') == 'dynamic_grid') {
			var offset = $('#editor').offset();
			var xFloat = pxToCol(e.pageX - offset.left);
			var yFloat = pxToRow(e.pageY - offset.top);
			var col = Math.floor(xFloat);
			var row = Math.floor(yFloat);
			//console.log('xFloat '+xFloat+' x '+ row +'    yFloat '+yFloat+'  y '+ col);
			uiAddColumn(row, col);
		}
	});
}


function uiAddColumn(i, j) {
	var o, defaults = {
		height : 1,
		width  : 1,
		mtop   : 0,
		mleft  : 0,
		mright : 0,
		container : false,
		type : 'sidebar'
	};
	
	
	// Either take a location object, or top/left coords
	if( typeof i == 'object' ) {
		o = $.extend({}, defaults, i);
	} else {
		o = $.extend({}, defaults, { top : i, left : j } );
	}
	
	if(!g.ui.array[o.top][o.left]) {
		g.ui.index++;
		$('#editor').append('<div id="e'+g.ui.index+'" class="e resizable">'+g.ui.index+'</div>');
		
		
		var item = $('#e'+g.ui.index);
		// Specify top/left and make resizable. Use classes
		item.data('location', o)
			.addClass('top-'+ o.top +' left-'+ o.left +' span-'+ o.width +' height-'+ o.height +' type-'+ o.type +' ui-corner-all')
			.fillGrid()
			.resizable(getResizableDefaults())
			.draggable(getDraggableDefaults())
			.droppable(getDroppableDefaults())
			.removable()
			.inspectable().click();
		
		
		//item.children('.ui-resizable-se').trigger('mousedown');
	}
}
/* ---------------------------------------------------
	BUTTON LOGIC
		jQuery UI button logic
		Credit: http://www.filamentgroup.com/lab/styling_buttons_and_toolbars_with_the_jquery_ui_css_framework/
--------------------------------------------------- */
function buttonLogic() {
	// Fix buttons in firefox
	$('head').append('<style type="text/css">button::-moz-focus-inner { border: 0; padding: 0; }</style>');
	
	// Button logic
	$(".el-button:not(.ui-state-disabled)")
	.hover(
		function(){
			$(this).addClass("ui-state-hover");
		},
		function(){
			$(this).removeClass("ui-state-hover").buttonUp();
		}
	)
	.mousedown(function(){
		$(this).buttonDown();
	})
	.mouseup(function(){
		$(this).buttonUp();
	});
}
/* ---------------------------------------------------
	TOOLTIPS
		jQuery qTip plugin
--------------------------------------------------- */

function qTipSettings( name ) {
	var options, defaults = {
		show: false,
		hide: false,
		api: {
			onShow: function() {
				$( this.elements.tooltip ).css({ zIndex : 20000 });
			}
		}
	}
	
	if ( 'name-taken' === name ) {
		options = {
			content: { text: 'Name taken.' },
			position: {
				corner : {
         			target: 'rightMiddle',
	         		tooltip: 'leftMiddle'
				}
			},
			style: {
				name: 'red',
				tip: {
					corner: 'leftMiddle',
					size: {
						x: 5,
						y: 5
					}
				},
				border: {
					width: 1,
					radius: 3
				}
			}
		};
	} else if ('loading' === name) {
		options = {
			content: { text: 'Working...' },
			position: { corner : 'center' },
			style: {
				name: 'dark',
				border: {
					width: 4,
					radius: 6
				}
			}
		}
	}
	
	return $.extend( true, {}, defaults, options );
}

function qTipModuleDefaults( item ) {
	return {
		//content: { text: '<div id="'+ item.attr('id') +'-qtip">'+ o.type +'</div>' },
		
		// Add autocomplete off to prevent internal firefox bug: http://blog.taragana.com/index.php/archive/solving-permission-denied-to-get-property-htmldivelementnodetype-when-calling-method-nsidomeventlistenerhandleevent-nsresult-0x8057001e-ns_error_xpc_js_threw_string-location-data-no/
		content: { text: '<div><form class="qtip-label" autocomplete="off"><select autocomplete="off"><option value="header">header</option><option value="content">content</option><option value="footer">footer</option><option value="sidebar">sidebar</option></select><input type="text" size="11" autocomplete="off"></input></form><div>'},
		position: {
			corner : {
     			target: 'rightMiddle',
         		tooltip: 'leftMiddle'
			}
		},
		show: {
			when: { event: 'click' },
			delay: 10,
			effect: { length: 100 }
		},
		hide: {
			when: { event: 'unfocus'},
			delay: 50,
			effect: { length: 200 },
			fixed: true // Make it fixed so it can be hovered over
		},
		style: {
			name: 'dark',
			border: {
				width: 4,
				radius: 2
			},
			tip: {
				corner: 'leftMiddle',
				size: {
					x: 5,
					y: 5
				}
			}
		},
		api: {
			onRender: function() {
				var o = item.data('location'),
					api = item.qtip('api');
				api.elements.content.find('option[value='+ o.type +']').attr('selected', 'selected').end().find('input').val((o.name)?o.name:'name');
				api.elements.content.find('select').change(function(){
					item.removeClass('type-'+o.type);
					o.type = api.elements.content.find('select').val();
					item.addClass('type-'+o.type);
					
				}).end().find('input').focus( function () {
					if (o.name) {
						var arr = g.label[o.type];
						arr.splice( $.inArray(o.name, arr), 1 );
					}
				}).keyup(function(){
					var input = api.elements.content.find('input'),
						name = input.val();
					console.log('name',name,'array',g.label[o.type],'type',o.type,'g.label',g.label);
					if( -1 !== $.inArray(name, g.label[o.type]) ) {
						input.qtip('show');
					} else {
						input.qtip('hide');
					}
				}).qtip({
					content: { text: 'Name taken.' },
					position: {
						corner : {
		         			target: 'rightMiddle',
			         		tooltip: 'leftMiddle'
						}
					},
					show: {
						when : {
							event : false
						}
					},
					style: {
						name: 'red',
						tip: {
							corner: 'leftMiddle',
							size: {
								x: 5,
								y: 5
							}
						},
						border: {
							width: 1,
							radius: 3
						}
					}
				});
				/*api.elements.wrapper.click(function(){
					//console.log('log');
					if ( ! api.elements.content.is(':has(input)')) {
						//api.updateContent('<div class="qtip-label"><select><option value="header">header</option><option value="content">content</option><option value="footer">footer</option><option value="sidebar">sidebar</option></select><input type="text" size="11"></input></div>');
						api.elements.content.find('option[value='+ o.type +']').attr('selected', 'selected').end().find('input').val((o.name)?o.name:'name');
					}
				});*/
			},
			onHide: function() {
				var o = item.data('location'),
					api = item.qtip('api'),
					input = api.elements.content.find('input'),
					name = input.val();
					
				input.qtip('hide');
				if ( name !== 'name' && -1 === $.inArray(name, g.label[o.type]) ) {
					o.name = name;
					if( name !== '')
						g.label[o.type].push(name);
				} else {
					input.val((o.name)?o.name:'name');
				}
			}
		}
	}
}

/* ---------------------------------------------------
	RESIZABLE
		Makes columns resizable
--------------------------------------------------- */ 


function initResizable() {
	$(".resizable").resizable(getResizableDefaults());
}

// Maybe just override defaults? $.extend($.fn.resizable.defaults, newDefaults);
function getResizableDefaults() {
	return {
		containment: $('#editor'),
		grid: [colUnit(), rowUnit()],
		maxWidth: g.bp.page_width,
		maxHeight: g.bp.page_height,
		handles: 'e, s, se',
		start: function() {
			var loc = $(this).data('location');
			
			$(this).fixResizeWidth().fixResizeHeight().unfillGrid();
			
			
			// These must be last lines--height and width are removed
			$(this).removeClass('span-'+loc.width)
				.removeClass('height-'+loc.height);
		},
		resize: function() {
			var loc = $(this).data('location');
			//console.log('resize triggered');
			
			// GRID BASED RESIZE
				// Only trigger resize function if the element is actually resized
				// Originally, this is triggered with any mouse movement
			var newWidth = $(this).gridWidth();
			var oldWidth = loc.width;
			var newHeight = $(this).gridHeight();
			var oldHeight = loc.height;

				
			// Width-based
			if(newWidth != oldWidth) {
				// Update value -- must be first line
				loc.width = newWidth;
				
				$(this).fixResizeHeight();
			}
			
			// Height-based
			if(newHeight != oldHeight) {
				// Update value -- must be first line
				loc.height = newHeight;
				
				$(this).fixResizeWidth();
			}
			
			
			// Inverse resize functionality
			
		},
		stop: function() {
			var loc = $(this).data('location');
			
			$(this).addClass('span-'+loc.width+' height-'+loc.height);
			
			// Remove inline properties
			$(this).css({top: '', left : '', width : '', height : ''});
			
			$(this).fillGrid();
			$(this).findCycles();
		}
	}
}

/* ---------------------------------------------------
	DRAGGABLE
		Makes columns draggable
--------------------------------------------------- */ 

function getDraggableDefaults() {
	return {
		containment: $('#editor'),
		//cursor: 'crosshair',
		grid: [colUnit(), rowUnit()],
		revert: 'valid',
		revertDuration: 150,
		start: function() {
			var loc = $(this).data('location');
			
			$(this).data('temp',{
				origLeft : loc.left,
				origTop  : loc.top,
				drop     : false
			});
			
			$(this).unfillGrid();
			
			// These must be last lines--height and width are removed
			$(this).removeClass('left-'+loc.left)
				.removeClass('top-'+loc.top);
			
			//$(this).css({'left': $(this).css('left'), 'top' : $(this).css('top') });
		},
		drag: function() {
			var loc = $(this).data('location');
			var temp = $(this).data('temp');
			//$(this).css({'left': '0px'});
			//console.log('drag triggered', $(this).css('left'));
			
			// GRID BASED DRAG
				// Only trigger drag function if the element has moved
				// Originally, this is triggered with any mouse movement
			var newLeft = $(this).gridLeft();
			var oldLeft = loc.left;
			var newTop = $(this).gridTop();
			var oldTop = loc.top;		

				
			// Width-based
			if(newLeft != oldLeft) {
				loc.left = newLeft;
				
			}
			
			// Height-based
			if(newTop != oldTop) {
				loc.top = newTop;
				
			}
			
		},
		stop: function() {
			var loc = $(this).data('location');
			var temp = $(this).data('temp');
			
			//console.log('on droppable',temp.drop);
			
			if(temp.drop) {
				// wait -- try not to cut off the revert animation
				$(this).wait($(this).draggable('option','revertDuration')+100, 'wait');
				
				// Add left and top classes
				// reset original position (revert doesn't always leave the div in the right place)
				loc.left = temp.origLeft;
				loc.top = temp.origTop;
			} else {
				// Sometimes drag doesn't trigger, so let's update the left/top to be sure
				//			Bug--drag doesn't trigger if user moves element box one grid space very quickly
				loc.left = $(this).gridLeft();
				loc.top = $(this).gridTop();
			}
			// Add left and top classes			
			$(this).addClass('left-'+loc.left+' top-'+loc.top);
			
			// Remove inline properties & temp data
			$(this).css({top: '', left : '', width : '', height : ''})
				.removeData('temp');
			
			$(this).fillGrid();
			$(this).findCycles();
		}
	}
}

/* ---------------------------------------------------
	DROPPABLE
		Makes columns droppable
--------------------------------------------------- */ 

function getDroppableDefaults() {
	return {
		tolerance: 'touch',
		drop: function(event, ui) {
			var data = ui.draggable.data('temp')
			if ( data )
				data.drop = true;
		}
	};
}

/* ---------------------------------------------------


		G  E  N  E  R  A  T  E     O  U  T  P  U  T



	GENERATE OUTPUT
		Use the array to convert divs to a relative layout.
		
					
--------------------------------------------------- */

function generateOutput( options, callback ) {
	var settings = $.extend( true, {}, g.theme, options );
	
	callback = callback || function(){};
	
	
	$('#outputWrapper').remove();
	$('body').append('<div id="outputWrapper"><div id="output" class="container"></div></div>');
	$('.e').filter(function(){ return $(this).data('location').rendered; }).css({ background : 'blue'});
	cycleGetNspc(g.ui.cycle.bpOutput_nspc, true);
	$('#output').data('location',{
		width : g.ui.array[0].length,
		top : 0,
		left : 0,
		height : 0,
		container : true,
		type : 'group'
	}).addClass('out').bpOutput();
	
	console.log('OUTPUT GENERATED.');
	
	// Check for items missed
	var missed = $('.e').filter(function(){
		return !$(this).data('location').rendered;
	});
	
	
	console.log('Items missed: ', missed);
	
	// Reset rendered
	$('.e').each( function() {
		$(this).data('location').rendered = false;
	});
	
	
	// Add ids & classes to output
	var count = {};
	var css = '';
	
	$('.out').each(function(){
		// If a div has children, it's a group!
		// $.extend( $(this).filter(':parent').data('location') , { type : 'group'});
		
		var type = $(this).data('location').type;
		var name = $(this).data('location').name;
			
		if (!name || 'group' === type ) {
			if( ! count[type] )
				count[type] = 1;
			name = 'group-' + count[type];
			
			$.extend( $(this).data('location') , { name : name });
			
			count[type]++;
		}
		
		name = nameToId( name );
		
		$(this).addClass(type);
		
		$(this).addClass('module');
		$(this).attr('id', name);
		
		css += '#'+ name + ' {';
		css += 'width : '+$(this).width()+'px;'
		css += 'margin-right : '+$(this).css('margin-right')+';';
		css += '}\n';
		
	});
	
	$('.out').removeClass('out');
	
	console.log('OUTPUT FORMATTED: ',$('#outputWrapper').html());
	
	var layout = outputToJSON();
	console.log('JSON OUTPUT: ',layout);
	
	$.post('admin-ajax.php', {
		action : 'process_theme',
		settings : JSON.stringify( settings ),
		structure : css,
		layout : JSON.stringify( layout ),
		state : JSON.stringify( saveState() ),
		style : generateStyleCss()
	}, function(){
		callback();
	});
	

}

function generateStyleCss() {
	var css  = [],
		typo = $('#editor').data('location').typo;
		
	css.push('\n\n/* GENERATED BY THE ELASTIC THEME EDITOR */\n');
	css.push('/* TYPOGRAPHY */\n');
	
	for( var i in typo ) {
		css.push( cssObjToString( typo[i].selector, typo[i].css ) );
	}
	
	css.push('\n\n');
	return css.join('');
}

function cssObjToString( selector, css ) {
	var str = [];
	str.push( '\n' + selector + ' {\n' );
	for( var i in css ) {
		str.push('\t' + i + ': ' + css[i] + ';\n');
	}
	str.push( '}\n' );
	return str.join('');
}

function outputToJSON() {
	var json = {};
	outputRecurse( $('#outputWrapper > div'), json );
	return json;
	
	// outputRecurse(jQuery, JSON)
	function outputRecurse(obj, ptr) {
		var o = obj.data('location');
		
		// Might be a problem if name is being passed by reference. Probably not, since ptr won't be changed.
		if(o.name)
			ptr.name = nameToId( o.name );
		if(o.type)
			ptr.type = o.type;

		if (obj.is(':parent')) {
			ptr.children = [];
			var arr = ptr.children;
			
			obj.children().each(function(){
				arr.push({});
				outputRecurse($(this), arr[ arr.length - 1 ] );
			});
		}
	}
}

function saveState() {
	var json = {};
	json.layout = [];
	json.bp = $.extend({}, g.bp);
	json.canvas = $.extend({}, $('#editor').data('location'));
	json.version = g.version;
	
	$('.e').each(function(){
		json.layout.push($(this).data('location'));
	});
	
	return json;
}


function loadState( state ) { // Expects an object
	$.extend(g.bp, state.bp);
	
	if( typeof state.canvas !== 'undefined' ) {
		var e = $('#editor').data('location');
		var s = state.canvas;
		
		$('#editor').data('location',
			$.extend( {},
				state.canvas,
				( typeof s.typo !== 'undefined' ) ? e.typo : {} // For themes without type definitions
			)
		);	
	}
	
	fixBlueprintCSS(g.bp.column_count, g.bp.column_width, g.bp.gutter_width);
	
	for (var i = 0; i < state.layout.length; i++) {
		uiAddColumn(state.layout[i]);
	}
}



/* ---------------------------------------------------


		B  L  U  E  P  R  I  N  T



	FIX BLUEPRINT CSS
		Dynamically recalculates the grids.css portion of blueprint.
		
					
--------------------------------------------------- */ 

function initBlueprint() {
	
	
	// Add the style block
	$('head').append('<style id="fix_blueprint" type="text/css"></style>')
	
	// Add the background grid div
	$('#editor').prepend('<div id="dynamic_grid" class="container"></div>');
	
	// Generate the default CSS & background grid
	fixBlueprintCSS(g.bp.column_count, g.bp.column_width, g.bp.gutter_width);
	
	/*$('#submit').click(function(){
		fixBlueprintCSS($('#column_count').val(), $('#column_width').val(), $('#gutter_width').val());
		return false;
	});*/
}

function fixBlueprintCSS(cc, cw, gw) {
	console.log('Fixing blueprint...');
	// cc and cw cannot be 0
	if (cc == 0)
		cc = 1;
	if (cw == 0)
		cw = 1;

	// Recalculate global variables
	g.bp.column_count = cc*1;
	g.bp.column_width = cw*1;
	g.bp.gutter_width = gw*1;
	g.bp.page_width = (g.bp.column_count - 1) * (g.bp.column_width + g.bp.gutter_width) + g.bp.column_width;
	
	// Log variables
	console.log('column_count '+g.bp.column_count);
	console.log('column_width '+g.bp.column_width);
	console.log('gutter_width '+g.bp.gutter_width);
	console.log('page_width '+g.bp.page_width);
	
	
	
	//
	// STYLES THAT REQUIRE ITERATION
	//
	
	
	var spacing;
	var css = '';
	for (var i = 1; i <= g.bp.column_count; i++) {
		
		
		// spacing -- width of an n-wide span, commonly used calculation
		spacing = ((i) * (g.bp.column_width + g.bp.gutter_width));
		
		
		// span float&gutter, pull, push, input&textarea
		css+= 'div.span-'+i+'{float:left; margin-right:'+ g.bp.gutter_width + 'px;}\t';
		css+= '.pull-'+i+'{margin-left: -' + spacing + 'px;}\t';
		css+= '.push-'+i+'{margin : 0 -' + spacing + 'px 1.5em ' + spacing + 'px;}   \t';
		css+= 'input.span-'+i+', textarea.span-'+i+'{width :'+ ((g.bp.column_width + g.bp.gutter_width) * (i - 1) + g.bp.column_width - 2*(g.bp.input_padding + g.bp.input_border))+'px!important;}   \t';
		
		
		// non width-based calculations: pull, push
		css+= '.pull-'+i+'{float:left; position:relative;}   \t';
		css+= '.push-'+i+'{float:right; position:relative;} \t';
		
		// input_border/padding based calculations
		css+= 'input.span-'+i+', textarea.span-'+i+'{border-left-width:'+ g.bp.input_border +'px!important; border-right-width:'+ g.bp.input_border +'px!important; padding-left:'+ g.bp.input_padding +'px!important; padding-right:'+ g.bp.input_padding +'px!important;}\t';
		
		// check if last column
		if (i == g.bp.column_count) {
			// last column special cases
			
			// span with built in last class, container (page_width)
			css+= '.span-'+i+', div.span-'+i+'{width :'+ g.bp.page_width +'px; margin:0;}\t';
			css+= '.container{width :'+ g.bp.page_width +'px;}\t\t\t\t\t';
		} else {
			// generate for all but last column
			
			// span width, append, prepend
			css+= '.span-'+i+'{width :'+ (spacing - g.bp.gutter_width) + 'px;}\t\t';
			css+= '.append-'+i+'{padding-right :'+ spacing + 'px;}  \t';
			css+= '.prepend-'+i+'{padding-left :'+ spacing + 'px;}  \t';
		}
		
		// ADD CUSTOM EDITOR CLASSES
		css+= '.left-'+(i - 1)+'{left :'+ ((i - 1) * colUnit()) + 'px;}\t';
		css+= '.top-'+(i - 1)+'{top :'+ ((i - 1) * rowUnit()) + 'px;}\t';
		css+= '.height-'+i+'{height :'+ (i * rowUnit() - g.bp.gutter_height) +'px} \t';
		
		// ADD CUSTOM RELATIVE CLASSES
		css+= '.mleft-'+(i - 1)+'{margin-left :'+ ((i - 1) * colUnit()) + 'px;}\t';
		css+= '.mright-'+(i - 1)+'{margin-right :'+ ((i - 1) * colUnit()) + 'px;}   \t';
		css+= '.mtop-'+(i - 1)+'{margin-top :'+ ((i - 1) * rowUnit()) + 'px;}\t';
		css+= '\n';
		}
	
	
	//
	// STYLES THAT DON'T REQUIRE ITERATION
	//
	
	// Column
	css+= '.column{float:left; margin-right :'+ g.bp.gutter_width + 'px;}\n';
	
	
	
	// Borders
	css+= 'div.border{ padding-right:'+ (g.bp.gutter_width * 0.5 - 1) +'px; margin-right:'+ (g.bp.gutter_width * 0.5) +'px; border-right: 1px solid #eee;}\n';

	css+= 'div.colborder{ padding-right:'+ (g.bp.column_width + 2*g.bp.gutter_width - 1)/2 +'px; margin-right:'+ (g.bp.column_width + 2 * g.bp.gutter_width)/2 +'px; border-right: 1px solid #eee;}\n';
	
	
	// Last
	css+= '.last, div.last {margin-right:0;}';
	

	//
	// Fix resizable grid
	//		At some point, may account for namespaces
	//
	fixResizableGrid();
	
	//
	// Fix blueprint background grid
	//
	fixBlueprintGrid();
	
	$('#fix_blueprint').html(css);
}

function fixResizableGrid() {
	// Resets the grid that all '.resizable' snap to
	$('.resizable').resizable('option', 'grid', [colUnit(), rowUnit()])
		.draggable('option', 'grid', [colUnit(), rowUnit()]);
}

function fixBlueprintGrid() {
	var html = '';
	for(var i = 0; i < g.bp.column_count; i++) {
		html+='<div class="span-1 grid_column"></div>';
	}
	$('#dynamic_grid').html(html);
	$('.grid_column').filter(':last').addClass('last ui-corner-right')
		.end().filter(':first').addClass('ui-corner-left');
}


/* ---------------------------------------------------


		H  E  L  P  E  R  S
		
					
--------------------------------------------------- */ 

function multiArray(rows, cols) {
	var a = new Array(rows);
	for (var i = 0; i < rows; i++) {
		a[i] = new Array (cols);
		for (var j = 0; j < cols; j++) {
			a[i][j] = '';
		}
	}
	return a;
}

function colUnit() {
	return g.bp.column_width + g.bp.gutter_width;
}

function rowUnit() {
	return g.bp.row_height + g.bp.gutter_height;
}

function pxToCol(n) {
	return n / colUnit();
}

function pxToRow(n) {
	return n / rowUnit();
}

function colToPx(n) {
	return n * colUnit();
}

function rowToPx(n) {
	return n * rowUnit();
}

function widthToCol(n) {
	return pxToCol(n + g.bp.gutter_width);
}

function heightToRow(n) {
	return pxToRow(n + g.bp.gutter_height);
}

function colToWidth(n) {
	return colToPx(n) - g.bp.gutter_width;
}

function rowToHeight(n) {
	return rowToPx(n) - g.bp.gutter_height;
}

function nameToId( name ) {
	var id = name.toString().replace(/[ _/]/g, '-')
		.replace(/[^a-zA-Z0-9\-]/g,'')
		.toLowerCase();

	return id;
}

function sanitizeName( name ) {
	return name.replace(/[<>&'"]/g, '');
}

function resolveDuplicates( name, check ) {
	while ( check( name ) ) { 	// If name is taken, add a number to the end.
		suffix = name.match(/\d+$/g);
		if( suffix ) {	// If that number is taken, increase it and try again.
			suffix = parseInt(suffix, 10) + 1;
			name = name.replace(/\d+$/g, suffix );
		} else {
			name += ' 1';
		}
	}
	return name;
}

function sanitizers( text, name ) {
	text = text.toString();
	
	if( 'font-input' === name ) {
		return text.replace(/[^a-zA-Z0-9,'" -]/g, '').replace(/'/g,'"').replace(/ {2,}/g, ' ');
	} else if ( 'css-unit' === name ) {
		return text.replace(/[^a-zA-Z0-9.%-]/g, '');
	} else if ( 'hex' === name ) {
		var m = text.replace(/[^a-fA-F0-9]/g, '').match(/^.{0,6}/g);
		return ( null !== m ) ? m[0] : '';
	} else {
		return text;
	}
}

function validators( text, name, data ) { // Expects sanitized text.
	if( 'font-input' === name ) {
		var space = new RegExp(" ");
			m = text.replace(/"/g, '').match(/[a-zA-Z0-9-]+( [a-zA-Z0-9-]+)*/g); // Strip quotes and re-insert them where necessary.
		
		if( null === m )
			return '';
		
		for( var i = 0; i < m.length; i++ ) {
			m[i] = ( space.test( m[i] ) ) ? '"' + m[i] + '"' : m[i];
		}
		
		return m.join(', ');
	} else if ( 'css-unit' === name ) {
		var m = text.match(/^(-?\d*(\.\d*)?\d)(%|in|cm|mm|em|ex|pt|pc|px)?/g); // Format unit: -0.00px
		
		if ( null === m ) {
			m = text.match(/[a-zA-Z-]+/g);
			return ( null !== m ) ? validators( m[0], 'css-string', data ) : ''; // Format string:  'normal'
		} else {
			return m[0];
		}
	} else if ( 'hex' === name ) {
		// Formatted in sanitizer
		return '#' + text; // Add hex
	} else if ( 'css-string' === name ) { // Check a css property for valid string values
		var key = {
			'font-size' 		: ['inherit', 'smaller', 'larger', 'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'],
			'letter-spacing'	: ['inherit', 'normal'],
			'line-height'		: ['inherit', 'normal'],
			'word-spacing'		: ['inherit', 'normal']
		}
		
		return ( -1 !== $.inArray( text, key[ data ] ) ) ? text : '';
	} else {
		return text;
	}
}
//Complete closure
})(jQuery)