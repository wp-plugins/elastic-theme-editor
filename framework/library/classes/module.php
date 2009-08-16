<?php
/**
 * Module
 * 
 * @package Elastic Framework
 * @author Daryl Koopersmith
 **/

class Module extends Object {
	var $id;
	var $type;
	
	/**
	 * Constructs a new Module.
	 *
	 * @param string $id The id of the module. Must be a unique string. 
	 * @param string $type Optional. Default, the module's class (lowercase). The type of the module.
	 * @author Daryl Koopersmith
	 */
	function __construct( $id = NULL, $type = NULL ) {
		if( ! isset($id) )
			return;
			
		if( ! isset($type) )
			$type = strtolower( get_class( $this ) );
			
		$this->id = $id;
		$this->type = $type;
		
		$this->load_default_views();
		
		add_filter( $this->format_hook( '_html_before', 'admin' ), array(&$this, '_blank') );
		add_filter( $this->format_hook( '_html_after', 'admin' ), array(&$this, '_blank') );
	}
	
	/**
	 * Calls the hooks and generates the output.
	 *
	 * @author Daryl Koopersmith
	 */
	function run() {
		$view = $this->do_view();
		$prefix = elastic_get('module_prefix');
		
		// If view is empty, do not show module.
		if ( ! empty( $view ) ) {
			$this->do_atomic( '_before', $prefix );
			echo $this->apply_atomic( '_html_before', $this->_html_before(), $prefix );
			echo $this->apply_atomic( '', $view, $prefix );
			echo $this->apply_atomic( '_html_after', $this->_html_after(), $prefix );
			$this->do_atomic( '_after', $prefix );
		}
	}
	
	/**
	 * 
	 * 		H  O  O  K  S     A  P  I
	 *
	 */
	
	/**
	 * Formats a hook for this module.
	 *
	 * @param string $view 
	 * @param string $suffix 
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function format_hook( $suffix = "", $view = "" ) {
		return elastic_module_format_hook( $this->id . $suffix, $view );
	}
	
	function do_atomic( $suffix = '' ) {
		elastic_do_atomic( $this->id . $suffix, elastic_get('module_prefix') );
	}
	function do_atomic_specific( $suffix = '' ) {
		elastic_do_atomic_specific( $this->id . $suffix, elastic_get('module_prefix') );
	}
	function apply_atomic( $suffix = '', $value ) {
		return elastic_apply_atomic( $this->id . $suffix, $value, elastic_get('module_prefix') );
	}
	function apply_atomic_specific( $suffix = '', $value ) {
		return elastic_apply_atomic_specific( $this->id . $suffix, $value, elastic_get('module_prefix') );
	}
	
	
	/**
	 * 
	 * 		V  I  E  W  S     A  P  I
	 *
	 */
	
	/**
	 * Binds a callback to a view. At any time, only one callback will be bound to a view.
	 * If the callback is false, the module will not be rendered for the given view.
	 *
	 * @param string $view 
	 * @param string $callback
	 * @param boolean $file Optional. Default false. If true, $callback is a file path, and will be included.
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function set_view( $view, $callback, $file = false ) {
		$this->remove_view( $view );
		
		$hook = $this->_format_view_hook( $view );
		if( $callback === false ) {
			$callback = array(&$this, '_blank');
		} else if ( $file ) {
			$this->_views[$view] = $callback;
			$callback = array(&$this, '_load_file_view');
		}
		
		add_action( $hook, $callback, 10, 2 );
	}
	
	function has_view( $view ) {
		return has_action( $this->_format_view_hook( $view ) );
	}

	/**
	 * Removes any view associated with a provided context.
	 *
	 * @param string $view 
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function remove_view( $view ) {
		if( $this->has_view( $view ) )
			remove_all_actions( $this->_format_view_hook( $view ) );
	}
	
	
	/**
	 * Returns the output of the most contextually-specific set view.
	 *
	 * @return string
	 * @author Daryl Koopersmith
	 */
	function do_view() {
		ob_start();
		$this->do_atomic_specific( $this->_format_view_hook(), elastic_get('module_prefix'), $this );
		return ob_get_clean();
	}

	/**
	 * Loads and sets views from a folder.
	 * File for global view is named index.php
	 *
	 * @param string $folder Absolute path to folder
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function load_views_folder( $folder ) {
		$path = trailingslashit( $folder ) . $this->type;

		foreach( glob( $path . '/*.php') as $file ) {
			$view = basename( $file, '.php');
			$view = ( 'index' === $view ) ? '' : $view; // Global view is named index.php. Can't have a file named '.php'

			$this->set_view( $view, $file, true );
		}
	}

	/**
	 * Loads and sets default views
	 *
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function load_default_views() {
		$this->load_views_folder( elastic_get_path('fallback-views') );
		$this->load_views_folder( elastic_get_path('custom') );
		if ( elastic_get('has_child') )
			$this->load_views_folder( elastic_get_path('custom', 'child') );
	}
	
	/**
	 * Private. Formats the internal view hook.
	 *
	 * @param string $view Optional. If set, returns a formatted hook. If null, returns the formatted id.
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function _format_view_hook( $view = NULL ) {
		$suffix = '_view';
		
		if( ! isset($view) )
			return $suffix;
		else
			return $this->format_hook( $suffix, $view );
	}
	
	/**
	 * Private. Used in set_view to load files.
	 *
	 * @param string $view 
	 * @param string $module 
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function _load_file_view( $view, $module ) {
		include $this->_views[$view];
	}
	

	
	/**
	 * Private. Returns the html in which the module is wrapped.
	 * TODO: add a hook to modify the html.
	 *
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function _html_before() {
		return "<div id='{$this->id}' class='{$this->type}'>";
	}
	
	function _html_after() {
		return "</div>";
	}
	
	/**
	 * Private. Blank function to be used in conjunction with both filters and actions.
	 *
	 * @param string $arg 
	 * @return string Returns the empty string only if $arg is set.
	 * @author Daryl Koopersmith
	 */
	function _blank( $arg = NULL ) {
		if ( isset($arg) )
			return '';
	}
	
	
	/**
	 * 
	 * 		S  E  A  R  C  H     A  P  I
	 *
	 */
	
	/**
	 * Function that provides a framework for searching all modules based on a slug and a callback.
	 *
	 * @param string $slug The value to retrieve.
	 * @param callback $condition A function that compares the $slug and each Module.
	 * @param string $return Optional. Default 'array'. If 'single', returns the first matched module. If 'selection', returns the matches in a new Selection.
	 * @return mixed Return type based on $return value. An array of matched modules. If no matches found, false.
	 * @author Daryl Koopersmith
	 */
	function get_modules($slug, $condition, $return = 'array') {
		$matches = array();
		
		$stack = array($this);
		while( ! empty($stack) ) {
			$ptr = array_shift( $stack );
			
			if( call_user_func_array( $condition, array( $slug, $ptr ) ) ) {
				$matches[] = $ptr;
				if( 'single' === $return )
					break;
			}
			
			if ( isset($ptr->children) )
				$stack = array_merge($stack, $ptr->children);
				
		}
		
		if( ! empty( $matches ) ) {
			if ( 'single' === $return )
				return $matches[0];
			else if ( 'selection' === $return )
			 	return new Selection( $matches );
			else
				return $matches;
		} else {
			return false;
		}
	}
	
	/**
	 * Get a module by id.
	 *
	 * @param string $id 
	 * @return Module
	 * @author Daryl Koopersmith
	 */
	function get_module($id) {
		return $this->get_modules($id, array($this, '_get_module'), 'single');
	}
	
	/**
	 * Private. Callback for get_module (modules by id).
	 *
	 * @param string $id 
	 * @param string $ptr 
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function _get_module( $id, $ptr ) {
		return ( $id === $ptr->$id );
	}
	
	/**
	 * Get a module by type.
	 *
	 * @param string $type
	 * @param boolean $selection Optional. Default false. If true, return matches in a new Selection.
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function get_modules_by_type( $type, $selection = false ) {
		return $this->get_modules( $type, array($this, '_get_modules_by_type'), ( $selection ) ? 'selection' : 'array' );
	}
	
	/**
	 * Private. Callback for get_module_by_type
	 *
	 * @param string $type 
	 * @param string $ptr 
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function _get_modules_by_type( $type, $ptr ) {
		return ( $type === $ptr->type );
	}
}

?>