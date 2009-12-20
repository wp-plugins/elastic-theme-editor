=== Elastic Theme Editor ===
Contributors: koopersmith
Tags: elastic, theme, editor, framework, elastictheme, wysiwyg, gsoc
Requires at least: 2.8
Tested up to: 3.0-alpha
Stable tag: 0.0.2.9

An interactive theme editor for the WordPress Admin.

== Description ==

Elastic is an interactive theme editor for the WordPress Admin.

**Elastic is still in development**: we try and keep Elastic as bug free as possible, but if you encounter any errors, let us know!

= Features =

* **Infinite theme arrangements:** Drag-and-drop makes themes easy to customize.
* **Custom fonts:** Preview your selections with the detailed typography editor.
* **Grid-based** for easy organization. **Custom grids** for flexibility.
* **Portable:** Share your themes with anyone! Elastic creates a standard WordPress theme.
* **Theme Framework:** For theme developers, the editor is just the beginning—Elastic themes are based on the powerful Elastic theme framework.
* *Many more coming soon!*

== Installation ==

= Install =

1. Unzip the `elastic.zip` file
1. Upload the folder to your `/wp-content/plugins/` directory
1. Activate the Elastic Theme Editor on the 'Plugins' page.
1. A subpage for Elastic will appear in the Themes menu.

= Use an Elastic theme =

1. Create a theme using the editor.
1. Your theme will appear on the 'Themes' page.
1. Activate your theme!

== Frequently Asked Questions ==

= How do I use a theme? =
Using an Elastic theme is just like using any other theme:

1. Create a theme using the editor.
1. Your theme will appear on the 'Themes' page.
1. Activate your theme!

= How do I remove a theme? =

* On the 'Themes' page, click the 'Delete' link next to your theme.

= How do I adapt my theme to the Elastic framework? =

* Tutorial coming soon!

= Can I use the Elastic editor with my theme? =

* An API to include and edit your theme inside the editor is in the works.

= I'm having trouble saving a theme! Help! =

* Some web hosts restrict the current method we're using to save themes. We're working on a new method that avoids those problems.

= I'm having trouble running Elastic on a Windows server! =

* This is a known bug, and is being worked on. Feel free to report any configuration info as well.

== Changelog ==
= 0.0.2.9 =
* Small fixes to version compatibility
* Fixed JavaScript loading error

= 0.0.2.8 =
* WordPress 2.9 and 3.0-alpha compatible
* Minor API changes

= 0.0.2.7 =
* Typography panel now accurately depicts typography in theme
* Default theme now em-based
* Hooks API made more robust
* PHP warnings from framework removed
* Workflow changes to editor
* Added default CSS reset (based on tripoli)

= 0.0.2.6 =
* Typography still renders incorrectly. Will be fixed in next release.
* New framework file structure implemented. Designed to be developer friendly—tutorial coming soon!
* Modules improved: added hooks API.
* Bug fixes: widget admin.

= 0.0.2.5 =
* PHP4 bugs fixed.
* Load theme bug fixed.
* Positioning bug fixed.
* Framework in transition to new file structure.

= 0.0.2.4 =
* Typography loads from saved themes.

= 0.0.2.3 =
* Typography panel saves to theme. Theme not optimized for em and % font-sizes.

= 0.0.2.2 =
* Added typography panel. It's not positioned correctly in the workflow yet, and does not output to a theme.
* Improved button logic.

= 0.0.2.1 =
* Fixed bug where the javascript for the editor wouldn't load.

= 0.0.2 =
* Framework and editor both operational