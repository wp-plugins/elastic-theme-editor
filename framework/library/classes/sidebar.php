<?php

class Sidebar extends Module {
	function __construct($name, $type = NULL) {
		parent::__construct($name, $type);
		
		add_action( $this->format_hook('_register_sidebars', 'admin'), array(&$this, '_admin_register_sidebars') );
		add_action( $this->format_hook('_register_sidebars', ''), array(&$this, '_admin_register_sidebars') );
	}
	
	/**
	 * Private. Prevents id conflicts on the Widgets Admin page by adding a prefix to each sidebar id.
	 *
	 * @param string $settings
	 * @return void
	 * @author Daryl Koopersmith
	 */
	function _admin_register_sidebars( $settings ) {
		$settings['id'] = elastic_get('prefix') . $settings['id'];
		return $settings;
	}
}

?>