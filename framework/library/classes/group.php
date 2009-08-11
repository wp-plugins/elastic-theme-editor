<?php
/**
 * Groups contain multiple modules, and render only those modules.
 * Their views cannot be set.
 * 
 * TODO: add children manipulation functions
 *
 * @package default
 * @author Daryl Koopersmith
 */
class Group extends Module {
	var $children;
	
	function __construct($id, $children = null) {
		parent::__construct( $id );
		$this->children = $children;
		
		parent::set_view( '', array($this,'_view') );
	}
	
	/**
	 * The only group view: run all of its children.
	 *
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function _view() {
		foreach($this->children as $child) {
			$child->run();
		}
	}
	
	/**
	 * Override set_view. Groups have only one view.
	 *
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function set_view() {}
	
	
	/**
	 * Override remove_view. Groups have only one view.
	 *
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function remove_view() {}
}

?>