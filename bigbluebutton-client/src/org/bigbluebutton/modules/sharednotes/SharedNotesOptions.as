package org.bigbluebutton.modules.sharednotes {
	import org.bigbluebutton.core.Options;

	public class SharedNotesOptions extends Options {

		[Bindable]
		public var refreshDelay:int = 500;

		[Bindable]
		public var enableMultipleNotes:Boolean = false;

		[Bindable]
		public var toolbarVisibleByDefault:Boolean = false;

		[Bindable]
		public var showToolbarButton:Boolean = false;

		[Bindable]
		public var fontSize:int = 10;

		public function SharedNotesOptions() {
			name = "SharedNotesModule";
		}
	}
}
