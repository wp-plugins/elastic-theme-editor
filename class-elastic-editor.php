<?php

class Elastic_Editor {
	function init() {
		// Dependencies
		Elastic_Editor::init_json();
		
		require_once(ABSPATH . 'wp-admin/includes/class-wp-upgrader.php');

		require_once('class-elastic-customizer.php');
		require_once('class-elastic-upgrader.php');
		
		// Actions
		add_action('admin_menu', array('Elastic_Editor', 'plugin_menu') );
		add_action('wp_ajax_process_theme', array('Elastic_Editor', 'process_theme') );
		add_action('wp_ajax_elastic_load_state', array('Elastic_Editor', 'elastic_load_state') );
		
	}
	
	function get_folder() {
		preg_match( "/[\/][^\/]*$/", dirname(__FILE__), $folder );
		return $folder[0];
	}
	
	function process_theme() {
		$settings = json_decode( stripslashes( $_POST["settings"] ) );
		
		$customizer = new Elastic_Customizer;
		$files = $customizer->run();
		
		$upgrader = new Elastic_Upgrader();
		$upgrader->run($settings->path, trailingslashit( dirname(__FILE__) ) . 'framework', $files, $settings->install);
	}
	
	function plugin_menu() {
		$page = add_theme_page('Elastic Theme Editor', 'Elastic Editor', 8, 'elastic-editor', array('Elastic_Editor', 'editor_view') );
		add_action( "admin_print_styles-$page", array('Elastic_Editor', 'init_styles') );
		add_action( "admin_print_scripts-$page", array('Elastic_Editor', 'init_scripts') );
	}

	function editor_view() {
		include('editor_view.php');
	}

	function init_styles() {
		$plugin = Elastic_Editor::get_folder();
		
		wp_enqueue_style('jquery-ui-all-styles',
			WP_PLUGIN_URL . $plugin . '/jquery/ui/css/custom-theme/jquery-ui-1.7.2.custom.css',
			'1.7.2',
			'screen'
			);

		wp_enqueue_style('elastic-styles',
			WP_PLUGIN_URL . $plugin . '/styles.css',
			'0.0.0.28',
			'screen'
			);

	}

	function init_scripts() {
		$plugin = Elastic_Editor::get_folder();
		
		wp_enqueue_script('jquery');
		wp_enqueue_script('json',
			WP_PLUGIN_URL . $plugin . '/json2.js',
			false,
			'2009-06-29');
		wp_enqueue_script('jquery-ui-all',
			WP_PLUGIN_URL . $plugin . '/jquery/ui/js/jquery-ui-1.7.2.custom.min.js',
			array('jquery'),
			'1.7.2');

		wp_enqueue_script('jquery-qtip',
			WP_PLUGIN_URL . $plugin . '/jquery/jquery.qtip-1.0.0-rc3.min.js',
			array('jquery'),
			'1.0.0-rc3');

		wp_enqueue_script('elastic-lib',
			WP_PLUGIN_URL . $plugin . '/lib.js',
			array('jquery', 'jquery-ui-all', 'jquery-qtip', 'json'),
			'0.0.0.28');

		// Load current theme state.	
		$state_path = trailingslashit( TEMPLATEPATH ) . 'state.php';
		if( file_exists( $state_path ) )
				$state = file_get_contents( $state_path );


		wp_localize_script('elastic-lib', 'input', array(
				'state' => ( isset($state) ) ? $state : false,
				'themes' => json_encode( Elastic_Editor::list_themes() )
			));

	}
	
	function init_json() {
		if ( ! class_exists('Services_JSON') ) require_once('JSON.php');
		
		// Future-friendly json_encode
		if( !function_exists('json_encode') ) {
			function json_encode($data) {
		        $json = new Services_JSON();
		        return( $json->encode($data) );
		    }
		}

		// Future-friendly json_decode
		if( !function_exists('json_decode') ) 
		{ 
			function json_decode($data, $output_mode=false) { 
				$param = $output_mode ? 16:null; 
				$json = new Services_JSON($param); 
				return( $json->decode($data) ); 
			} 
		}
	}
	
	function list_themes() {
		$themes = get_themes();
		$theme_list = array();
		
		foreach($themes as $theme) {
			$file = trailingslashit( $theme['Stylesheet Dir'] ) . 'state.php';
			$info = array(
				'name' => $theme['Name'],
				'path' => $theme['Stylesheet']
			);
			$info['compatible'] = ( array_search( $file, $theme['Template Files'] ) !== false ) ? true : false ;
			$theme_list[] = $info;
		}
		
		return $theme_list;
	}
	
	function elastic_load_state() {
		$name = $_POST["name"];
		$themes = get_themes();
		
		foreach($themes as $theme) {
			if ( $theme['Name'] === $name ) {
				echo file_get_contents( WP_CONTENT_DIR . trailingslashit( $theme['Stylesheet Dir'] ) . 'state.php' );
				break;
			}
		}
		die;
	}
}
?>