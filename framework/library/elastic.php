<?php
class Elastic {
	var $layout;
	var $context;
	var $prefix;
	var $module_prefix;
	var $theme_data;
	var $child_data;
	var $has_child;
	var $module_types = array( 'header', 'content', 'sidebar' );
	var $path = array();
	
	function init() {
		$this->has_child = ( STYLESHEETPATH !== TEMPLATEPATH );
		
		// Set paths
		$this->path['root'] = '';
		$this->path['library'] = 'library';
		$this->path['classes'] = trailingslashit( $this->path['library'] ) . 'classes';
		$this->path['lib-css'] = trailingslashit( $this->path['library'] ) . 'css';
		$this->path['fallback-views'] = trailingslashit( $this->path['library'] ) . 'fallback-views';
		$this->path['custom'] = 'custom';
		
		// Load user's functions.php
		$functions = TEMPLATEPATH . '/custom/functions.php';
		if( file_exists( $functions ) )
			include $functions;

		// Load child's functions.php			
		$functions = STYLESHEETPATH . '/custom/functions.php';
		if( $this->has_child && file_exists( $functions ) )
			include $functions;
		
		// Set prefix for all hooks and ids.
		$this->prefix = apply_filters('elastic_prefix','elastic_');
		$this->module_prefix = apply_filters( $this->prefix . 'module_prefix','module_');
		
		// Get theme and child theme data
		$this->theme_data = apply_filters($this->prefix . 'theme_data', get_theme_data(TEMPLATEPATH . '/style.css') );
		$this->child_data = apply_filters($this->prefix . 'child_data', get_theme_data(STYLESHEETPATH . '/style.css') );
		
		// Load classes
		require_once( elastic_get_path('classes') . '/object.php');
		require_once( elastic_get_path('classes') . '/module.php');
		require_once( elastic_get_path('classes') . '/group.php');
		require_once( elastic_get_path('classes') . '/selection.php');
		require_once( elastic_get_path('classes') . '/sidebar.php');
		require_once( elastic_get_path('classes') . '/header.php');
		require_once( elastic_get_path('classes') . '/content.php');
		
		// Get layout
		require_once( elastic_get_path('custom', (elastic_get('has_child')) ? 'child' : 'theme' ) . '/layout.php');
		$this->layout = $layout;
		
		// Load styles
		add_action('template_redirect', array(&$this, 'load_styles') );
		
		// Get context (once it's set)
		add_action('template_redirect', array(&$this, 'get_context') );
		// Get context now, for admin pages
		$this->context = $this->get_context();
		
		// Register sidebars
		if( is_admin() ) // Sidebars must be registered during admin_init, which is before template_redirect
			add_action('init', array(&$this, 'register_sidebars') );
		else // Sidebars are registered on template_redirect to ensure context has loaded
			add_action('template_redirect', array(&$this, 'register_sidebars') );
	}

	function load_styles() {
		global $wp_styles;
		
		wp_enqueue_style( $this->prefix . 'tripoli', elastic_get_path('lib-css', 'uri') . '/tripoli.css', false, '0.0.2.7');
		wp_enqueue_style( $this->prefix . 'tripoli-ie', elastic_get_path('lib-css', 'uri') . '/tripoli.ie.css', false, '0.0.2.7');
		$wp_styles->add_data( $this->prefix . 'tripoli-ie', 'conditional', 'gte IE 5');
		
		wp_enqueue_style( $this->prefix . 'style', elastic_get_path('custom', 'uri') . '/style.css', false, '0.0.2.7');
		if( elastic_get('has_child') )
			wp_enqueue_style( $this->prefix . 'style', elastic_get_path('custom', 'child', 'uri') . '/style.css', false, '0.0.2.7');
	}
	
	function register_sidebars() {
		$sidebars = elastic_get('layout');
		$sidebars = $sidebars->get_modules_by_type('sidebar');
		
		if( ! $sidebars )
			return;
		
		foreach( $sidebars as $sidebar ) {
			$settings = $sidebar->apply_atomic( '_register_sidebars', array(
				'name'          => $sidebar->id,
				'id'            => $sidebar->id,
				'before_widget' => '<li id="%1$s" class="widget-container %2$s">',
				'after_widget'  => "</li>",
				'before_title'  => '<h3 class="widget-title">',
				'after_title'   => '</h3>',
				), elastic_get('module_prefix') );
			register_sidebar( $settings );
		}
	}
	
	/**
	 * Retrieve the context of the current template.
	 * Credit: Chris Jean & Ptah Dunbar
	 *
	 * @return array $context
	 */
	function get_context() {
		global $wp_query;

		$context = array( 'global' => '', 'abstract' => null, 'general' => null, 'specific' => null );
		
		if( is_admin() ) {
			$context['global'] = 'admin';
			return $this->context = $context;
		}
		
		$id = $wp_query->get_queried_object_id();

		if ( is_front_page() )
			$context['general'] = 'home';
		else if ( is_singular() ) {
			$context['abstract'] = 'singular';

			if ( is_attachment() ) {
				$context['general'] = 'attachment';
				$context['specific'] = 'attachment-'. $id;
			}
			else if ( is_single() ) {
				$context['general'] = 'single';
				$context['specific'] = 'single-'. $id;
			}
			else if ( is_page() ) {
				$context['general'] = 'page';
				$context['specific'] = 'page-'. $id;
			}
		}
		else if ( is_archive() ) {
			$context['abstract'] = 'archive';

			if ( is_category() ) {
				$context['general'] = 'category';
				$context['specific'] = 'category-'. $id;
			}
			else if ( is_tag() ) {
				$context['general'] = 'tag';
				$context['specific'] = 'tag-'. $id;
			}
			else if ( is_date() ) {
				$context['general'] = 'date';

				if ( is_month() )
					$context['specific'] = 'month-'. $id;
				else if ( is_year() )
					$context['specific'] = 'year-'. $id;
				else if ( is_day() )
					$context['specific'] = 'day-'. $id;
				else if ( is_time() )
					$context['specific'] = 'time-' . $id;
			}
			else if ( is_author() ) {
				$context['general'] = 'author';
				$context['specific'] = 'author-'. $id;
			}
			else if ( is_tax() ) {
				$context['general'] = 'tax';
				$context['specific'] = 'tax-'. $id;
			}
		}
		else if ( is_search() )
			$context['general'] = 'search';
		else if ( is_404() )
			$context['general'] = 'error404';


		return $this->context = $context;
	}
}

// Make elastic object
$elastic = new Elastic();
$elastic->init();

function elastic_get($var) {
    global $elastic;
    
    if( isset($elastic->$var) ) {
        return $elastic->$var;
    }
    return false;
}

function elastic_set($var, $value) {
	global $elastic;
	
	$elastic->$var = $value;
}

function elastic_get_path( $name, $arg1 = 'theme', $arg2 = 'abs' ) {
	$path = elastic_get('path');
	
	if( ! isset($path[ $name ]) )
		return false;
	
	$uri = ( 'uri' === $arg1 || 'uri' === $arg2 );
	$child = ( 'child' === $arg1 || 'child' === $arg2 );
	
	if( $uri )
		return trailingslashit( ($child) ? get_stylesheet_directory_uri() : get_template_directory_uri() ) . $path[ $name ];
	else
		return trailingslashit( ($child) ? STYLESHEETPATH : TEMPLATEPATH ) . $path[ $name ];
}

/**
 * Calls do_action at all context levels.
 * Actions are run in the order: global, abstract, general, specific.
 * Actions are not run for null contexts.
 * 
 * @param string $id The id of the hook.
 * @return void
 * @author Daryl Koopersmith
 */
function elastic_do_atomic( $id, $prefix = NULL ) {
	foreach(elastic_get('context') as $view) {
		if( isset($view)) {
			$args = func_get_args();
			array_splice( $args, 0, 2, $view );
			do_action_ref_array( elastic_format_hook($id, $view, $prefix), $args );
		}
	}
}

/**
 * Calls do_action at the most specific atomic level with a registered action.
 *
 * @param string $id The id of the hook.
 * @return void
 * @author Daryl Koopersmith
 */
function elastic_do_atomic_specific( $id, $prefix = NULL ) {
	foreach( array_reverse( elastic_get('context') ) as $view ) {
		if( isset($view)) {
			$hook = elastic_format_hook( $id, $view, $prefix );
			if( has_action($hook) ) {
				$args = func_get_args();
				array_splice( $args, 0, 2, $view );
				do_action_ref_array( $hook, $args );
				break;
			}
		}
	}
}

/**
 * Calls apply_filters at all context levels.
 * Filters are applied in the order: global, abstract, general, specific.
 * Filters are not applied to null contexts.
 * 
 * $value is updated every time apply_filters is run.
 * (i.e. apply_filters at the 'specific' level receives any changes made at the 'global' level).
 * 
 * @param string $id The id of the hook.
 * @param mixed $value The value to be filtered.
 * @return void
 * @author Daryl Koopersmith
 */
function elastic_apply_atomic( $id, $value, $prefix = NULL ) {
	$preset_args = 3;
	
	foreach(elastic_get('context') as $view) {
		if( isset($view)) {
			$output_args = array( elastic_format_hook($id, $view, $prefix), $value );
			if( func_num_args() > $preset_args ) {
				$args = func_get_args();
				array_splice( $args, 0, $preset_args, $output_args );
				$value = call_user_func_array('apply_filters', $args);
			} else {
				$value = apply_filters( $output_args[0], $output_args[1] );
			}
		}
	}
	return $value;
}

/**
 * Calls apply_action at the most specific atomic level with a registered action.
 *
 * @param string $id The id of the hook.
 * @param mixed $value The value to be filtered.
 * @return void
 * @author Daryl Koopersmith
 */
function elastic_apply_atomic_specific( $id, $value, $prefix = NULL ) {
	$preset_args = 3;
	
	foreach( array_reverse( elastic_get('context') ) as $view ) {
		if( isset($view)) {
			$hook = elastic_format_hook( $id, $view, $prefix );
			if( has_filter($hook) ) {
				$output_args = array( $hook, $value );
				if( func_num_args() > $preset_args ) {
					$args = func_get_args();
					array_splice( $args, 0, $preset_args, $output_args );
					return call_user_func_array('apply_filters', $args);
				} else {
					return apply_filters( $output_args[0], $output_args[1] );
				}
			}
		}
	}
}

/**
 * Returns a formatted hook title.
 *
 * @param string $id
 * @param string $view
 * @param string $prefix Optional. Default elastic prefix.
 * @return string Formatted hook title
 * @author Daryl Koopersmith
 */
function elastic_format_hook( $id, $view = "", $prefix = NULL ) {
	if( ! isset($prefix) )
		$prefix = elastic_get('prefix');
	// If $view is empty (i.e. context['global']), don't add an extra underscore
	return $prefix . (( ! empty($view) ) ? $view . "_" : "" ) . $id;
}

/**
 * Returns a formatted hook title with the module prefix.
 *
 * @param string $id
 * @param string $view
 * @return string Formatted hook title
 * @author Daryl Koopersmith
 */
function elastic_module_format_hook( $id, $view = "" ) {
	return elastic_format_hook( $id, $view, elastic_get('module_prefix') );
}

?>