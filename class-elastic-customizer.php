<?php

class Elastic_Customizer {
	/**
	 * Customizes files for the elastic theme
	 *
	 * @return void
	 * @author Daryl Koopersmith
	 * 
	 */
	function run() {
		$layout = json_decode( stripslashes( $_POST["layout"] ) , true);
		$structure = $_POST["structure"];
		$state = stripslashes( $_POST["state"] );
		$settings = json_decode( stripslashes( $_POST["settings"] ) );

		$files = array(
			"layout.php" => $this->generate_layout( $layout ),
			"style.css" => $this->generate_style( $settings ),
			"structure.css" => $structure,
			"state.php" => $state
			);


		return $files;
	}
	
	/**
	 * Dynamically generates the contents of style.css
	 *
	 * @param string $settings Theme settings
	 * @return string A valid css file
	 * @author Daryl Koopersmith
	 */
	function generate_style( $settings ) {
		$out = "/*\nTheme Name: ";
		$out.= $settings->name;
		$out.= "\nTheme URI: ";
		$out.= $settings->uri;
		$out.= "\nDescription: ";
		$out.= $settings->description;
		$out.= "\nVersion: ";
		$out.= $settings->version;
		$out.= "\nAuthor: ";
		$out.= $settings->author;
		$out.= "\nAuthor URI: ";
		$out.= $settings->author_uri;
		$out.= "\nTags: ";
		$out.= $settings->tags;
		$out.= "\n*/\n\n";
		
		ob_start();
		include("framework_style.css");
		$out.= ob_get_clean();
		
		return $out;
	}
	
	/**
	 * Dynamically generates the contents of layout.php
	 *
	 * @param string $html 
	 * @return string A valid php file
	 * @author Daryl Koopersmith
	 */
	function generate_layout( $json ) {
		$out = '<?php' . "\n";
		$out.= '$layout = ';
		$out.= $this->generate_layout_recursive( $json, 0 );
		$out.= ';' . "\n" . '?>';
		return $out;
	}
	
	function generate_layout_recursive( $json, $depth ) {
		$type = strtolower( $json['type'] );
		
		// TODO: Add footers
		// temporarily convert footers to sidebars
		if( 'footer' === $type )
			$type = 'sidebar';
		
		// New class
		$out = 'new ' . ucfirst( $type ) . '(';
		// Arguments
		if ( 'sidebar' === $type )
			$out.= '"' . $json['name'] . '"';
		else if ( 'group' === $type )
			$out.= '"' . $json['name'] . '"';
		
		if( isset( $json['children'] ) ) {
			// Start children argument, open array
			$out.= ", array(";
			foreach( $json['children'] as $child ) {
				$out.= $this->generate_layout_tabs( $depth + 1 );
				$out.= $this->generate_layout_recursive( $child, $depth + 1 );
				$out.= ",";
			}
			$out.= $this->generate_layout_tabs( $depth );
			// Close array
			$out.= ')';
		}
		// End arguments
		$out.= ')';
		
		return $out;
	}
	
	function generate_layout_tabs( $depth ) {
		$out = "\n";
		for( $i = 0; $i < $depth; $i++ )
			$out.= "\t";
		return $out;
	}
}

?>
