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
		
		// Set prefix for all hooks and ids.
		$this->prefix = apply_filters('elastic_prefix','elastic_');
		$this->module_prefix = apply_filters( $this->prefix . 'module_prefix','module_');
		
		// Get theme and child theme data
		$this->theme_data = apply_filters($this->prefix . 'theme_data', get_theme_data(TEMPLATEPATH . '/style.css') );
		$this->child_data = apply_filters($this->prefix . 'child_data', get_theme_data(STYLESHEETPATH . '/style.css') );
		$this->has_child = ( STYLESHEETPATH !== TEMPLATEPATH );
		
		// Set paths
		$this->path['library'] = trailingslashit( TEMPLATEPATH ) . 'library';
		$this->path['classes'] = trailingslashit( $this->path['library'] ) . 'classes';
		$this->path['fallback-views'] = trailingslashit( $this->path['library'] ) . 'fallback-views';
		$this->path['theme-custom'] = trailingslashit( TEMPLATEPATH ) . 'theme';
		$this->path['child-custom'] = trailingslashit( STYLESHEETPATH ) . 'theme';
		
		// Load classes
		require_once( $this->path['classes'] . '/object.php');
		require_once( $this->path['classes'] . '/module.php');
		require_once( $this->path['classes'] . '/group.php');
		require_once( $this->path['classes'] . '/selection.php');
		require_once( $this->path['classes'] . '/sidebar.php');
		require_once( $this->path['classes'] . '/header.php');
		require_once( $this->path['classes'] . '/content.php');
		
		// Get layout
		require_once( $this->path['theme-custom'] . '/layout.php');
		$this->layout = $layout;
		
		// Load styles
		add_action('template_redirect', array(&$this, 'load_styles') );
		
		// Get context
		add_action('template_redirect', array(&$this, 'get_context') );
		//$this->context = $this->get_context();
		
		// Register sidebars for all pages (including admin)
		add_action('template_redirect', array(&$this, 'register_sidebars') );
	}

	function load_styles() {
		$uri = trailingslashit( get_template_directory_uri() );
		wp_enqueue_style( $this->prefix . 'structure', $uri . 'structure.css', false, '0.0.0.01');
		wp_enqueue_style( $this->prefix . 'style', $uri . 'style.css', false, '0.0.0.01');
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
	foreach(elastic_get('context') as $view) {
		if( isset($view))
			$value = apply_filters( elastic_format_hook($id, $view, $prefix), $value );
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
	foreach( array_reverse( elastic_get('context') ) as $view ) {
		if( isset($view)) {
			$hook = elastic_format_hook( $id, $view, $prefix );
			if( has_filter($hook) ) {
				return apply_filters($hook, $value);
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

?>