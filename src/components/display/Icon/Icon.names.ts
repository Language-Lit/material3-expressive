// Icon names for Material Symbols
// This is a subset of commonly used icons - the full list can be extended as needed
export const iconNames = [
  "add", "add_circle", "arrow_back", "arrow_forward", "check", "check_circle",
  "close", "delete", "edit", "favorite", "favorite_border", "home", "info",
  "menu", "more_horiz", "more_vert", "notifications", "person", "search",
  "settings", "share", "star", "star_border", "visibility", "visibility_off",
  "account_circle", "arrow_drop_down", "arrow_drop_up", "bookmark", "bookmark_border",
  "calendar_today", "chat", "content_copy", "download", "expand_less", "expand_more",
  "filter_list", "folder", "help", "history", "language", "link", "lock", "logout",
  "mail", "open_in_new", "pause", "play_arrow", "print", "refresh", "save", "send",
  "shopping_cart", "sort", "thumb_up", "upload", "warning", "zoom_in", "zoom_out",
  // Navigation icons
  "chevron_left", "chevron_right", "first_page", "last_page", "navigate_before", "navigate_next",
  // Action icons
  "done", "clear", "cancel", "add_box", "remove", "remove_circle",
  // Content icons
  "content_paste", "create", "drafts", "flag", "forward", "inbox", "menu_book", "reply", "report",
  // Communication icons
  "call", "chat_bubble", "comment", "email", "forum", "message", "phone", "textsms",
  // Media icons
  "album", "audiotrack", "image", "mic", "movie", "music_note", "photo", "videocam", "volume_up", "volume_off",
  // Device icons
  "battery_full", "bluetooth", "brightness_high", "gps_fixed", "signal_wifi_4_bar", "storage",
  // Editor icons
  "attach_file", "format_bold", "format_italic", "format_list_bulleted", "format_list_numbered",
  "format_quote", "format_underlined", "insert_link", "mode_edit", "title",
  // File icons
  "cloud", "cloud_download", "cloud_upload", "file_download", "file_upload", "folder_open",
  // Hardware icons
  "cast", "computer", "desktop_mac", "headset", "keyboard", "laptop", "mouse", "phone_android", "tablet", "tv", "watch",
  // Social icons
  "group", "group_add", "people", "person_add", "public", "school", "share_location",
  // Toggle icons
  "check_box", "check_box_outline_blank", "indeterminate_check_box", "radio_button_checked", "radio_button_unchecked",
  "star_half", "toggle_off", "toggle_on",
  // Maps icons
  "directions", "local_cafe", "local_dining", "local_hospital", "map", "my_location", "navigation", "place", "restaurant",
  // Misc icons
  "access_time", "build", "code", "dashboard", "exercise", "extension", "fingerprint", "grade", "label", "lightbulb",
  "schedule", "speed", "style", "timeline", "trending_up", "verified", "work",
] as const

export type IconName = (typeof iconNames)[number]
