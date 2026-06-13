// xp-paint/src/app.js (FULL, with targeted integrations)

window.jspaint_parent_origin = null;
window.current_file_name = "untitled.png"; // Default, will be updated
window.jspaint_main_canvas_element = null; // Will be the main canvas object
let currentFilePathFromParent = null; // Stores VFS path when loaded from parent

window.addEventListener("message", function (event) {
  if (
    window.jspaint_parent_origin &&
    event.origin !== window.jspaint_parent_origin
  ) {
    if (
      !(
        window.location.protocol === "file:" &&
        event.origin === "null" &&
        window.jspaint_parent_origin === "null"
      )
    ) {
      console.warn(
        "XP Paint: Blocked message from origin:",
        event.origin,
        "vs parent:",
        window.jspaint_parent_origin
      );
      return;
    }
  }

  const data = event.data;
  if (!data || !data.xpPaintAction) return;

  console.log("XP Paint iframe received from parent:", data);

  switch (data.xpPaintAction) {
    case "init":
      window.jspaint_parent_origin = data.parentOrigin;
      console.log(
        "XP Paint initialized by parent from origin:",
        window.jspaint_parent_origin
      );
      break;

    case "loadImageData":
      if (data.dataUrl) {
        currentFilePathFromParent = data.vfsPath;
        const img = new Image();
        img.onload = function () {
          file_new(true); // true to skip "are you sure" (from functions.js)
          my_canvas_width = img.naturalWidth;
          my_canvas_height = img.naturalHeight;
          window.jspaint_main_canvas_element.width = my_canvas_width; // Use the global var
          window.jspaint_main_canvas_element.height = my_canvas_height;
          ctx.disable_image_smoothing();
          ctx.clearRect(
            0,
            0,
            window.jspaint_main_canvas_element.width,
            window.jspaint_main_canvas_element.height
          );
          ctx.drawImage(img, 0, 0);

          window.current_file_name = data.fileName || "untitled.png"; // Update global
          document_file_path = null;
          saved = true;
          update_title();

          undos.length = 0;
          redos.length = 0;
          current_history_node = root_history_node = make_history_node({
            name: "Load Document",
            icon: get_help_folder_icon("p_open.png"),
          });
          current_history_node.image_data = ctx.getImageData(
            0,
            0,
            window.jspaint_main_canvas_element.width,
            window.jspaint_main_canvas_element.height
          );
          $G.triggerHandler("history-update");

          if (window.jspaint_parent_origin) {
            parent.postMessage(
              { xpPaintAction: "dirtyStateChanged", isDirty: false },
              window.jspaint_parent_origin
            );
            parent.postMessage(
              {
                xpPaintAction: "documentNameChanged",
                fileName: window.current_file_name,
                vfsPath: currentFilePathFromParent,
              },
              window.jspaint_parent_origin
            );
          }
          $canvas_area.trigger("resize");
        };
        img.onerror = function () {
          show_error_message(
            "XP Paint: Error loading image data received from parent."
          );
        };
        img.src = data.dataUrl;
      }
      break;

    case "newImage":
      file_new(true);
      currentFilePathFromParent = null;
      window.current_file_name = "untitled.png"; // Update global
      if (window.jspaint_parent_origin) {
        parent.postMessage(
          { xpPaintAction: "dirtyStateChanged", isDirty: false },
          window.jspaint_parent_origin
        );
        parent.postMessage(
          {
            xpPaintAction: "documentNameChanged",
            fileName: window.current_file_name,
            vfsPath: null,
          },
          window.jspaint_parent_origin
        );
      }
      break;

    case "vfsSaveSuccess":
      window.current_file_name = data.fileName; // Update global
      currentFilePathFromParent = data.vfsPath;
      saved = true;
      update_title();
      if (window.jspaint_parent_origin) {
        parent.postMessage(
          { xpPaintAction: "dirtyStateChanged", isDirty: false },
          window.jspaint_parent_origin
        );
      }
      break;

    case "vfsSaveError":
      console.warn("XP Paint: Parent reported VFS save error.");
      break;
    case "vfsSaveCancelled":
      console.log("XP Paint: Parent reported VFS save was cancelled by user.");
      break;

    case "triggerSaveThenNew":
      if (menus && menus["&File"]) {
        // menus should be window.menus
        const saveAction = menus["&File"].find(
          (item) => item.item === "&Save"
        )?.action;
        if (saveAction) saveAction();
        else
          console.error(
            "XP Paint: Could not find Save action for triggerSaveThenNew"
          );
      }
      break;
    case "triggerSaveThenOpen":
      if (menus && menus["&File"]) {
        // menus should be window.menus
        const saveAction = menus["&File"].find(
          (item) => item.item === "&Save"
        )?.action;
        if (saveAction) saveAction();
        else
          console.error(
            "XP Paint: Could not find Save action for triggerSaveThenOpen"
          );
      }
      break;
    case "triggerSaveThenExit":
      if (
        window.jspaint_main_canvas_element &&
        window.jspaint_parent_origin &&
        typeof window.current_file_name !== "undefined"
      ) {
        const imageDataUrlForExit =
          window.jspaint_main_canvas_element.toDataURL("image/png");
        const currentFileNameForExit =
          window.current_file_name || "untitled.png";
        parent.postMessage(
          {
            xpPaintAction: "requestSave",
            imageDataUrl: imageDataUrlForExit,
            fileName: currentFileNameForExit,
            exitAfterSave: true,
          },
          window.jspaint_parent_origin
        );
      } else {
        console.error(
          "XP Paint: Could not prepare save data for triggerSaveThenExit"
        );
        if (window.jspaint_parent_origin)
          parent.postMessage(
            { xpPaintAction: "forceExitNoSave" },
            window.jspaint_parent_origin
          );
      }
      break;
  }
});

const default_magnification = 1;
const default_tool = get_tool_by_name("Pencil");

const default_canvas_width = 800;
const default_canvas_height = 600;
let my_canvas_width = default_canvas_width;
let my_canvas_height = default_canvas_height;

let aliasing = true;
let transparency = false;
let monochrome = false;

let magnification = default_magnification;
let return_to_magnification = 4;

const canvas = make_canvas(); // This is the original line from your app.js
window.jspaint_main_canvas_element = canvas; // Make it accessible globally for menus.js
canvas.classList.add("main-canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true }); // Added hint

const default_palette = [
  "#000000",
  "#787878",
  "#790300",
  "#757A01",
  "#007902",
  "#007778",
  "#0A0078",
  "#7B0077",
  "#767A38",
  "#003637",
  "#286FFE",
  "#083178",
  "#4C00FE",
  "#783B00",
  "#FFFFFF",
  "#BBBBBB",
  "#FF0E00",
  "#FAFF08",
  "#00FF0B",
  "#00FEFF",
  "#3400FE",
  "#FF00FE",
  "#FBFF7A",
  "#00FF7B",
  "#76FEFF",
  "#8270FE",
  "#FF0677",
  "#FF7D36",
];
let palette = default_palette;
let polychrome_palette = palette;
let monochrome_palette = make_monochrome_palette();

window.default_brush_shape = "circle";
window.default_brush_size = 4;
window.default_eraser_size = 8;
window.default_airbrush_size = 9;
window.default_pencil_size = 1;
window.default_stroke_size = 1;
window.brush_shape = default_brush_shape;
window.brush_size = default_brush_size;
window.eraser_size = default_eraser_size;
window.airbrush_size = default_airbrush_size;
window.pencil_size = default_pencil_size;
window.stroke_size = default_stroke_size;
let tool_transparent_mode = false;

let stroke_color;
let fill_color;
let stroke_color_k = "foreground";
let fill_color_k = "background";

let selected_tool = default_tool;
let selected_tools = [selected_tool];
let return_to_tools = [selected_tool];
window.colors = {
  foreground: "",
  background: "",
  ternary: "",
};

let selection;
let textbox;
let helper_layer;
let show_grid = false;
let text_tool_font = {
  family: '"Arial"',
  size: 12,
  line_scale: 20 / 12,
  bold: false,
  italic: false,
  underline: false,
  vertical: false,
  color: "",
  background: "",
};

let root_history_node = make_history_node({
  name: "App Not Loaded Properly - Please send a bug report.",
});
let current_history_node = root_history_node;
let history_node_to_cancel_to = null;
let undos = [];
let redos = [];

// let file_name; // Replaced by window.current_file_name
let document_file_path;
let saved = true;

let pointer;
let pointer_start;
let pointer_previous;
let pointer_active = false;
let pointer_type, pointer_buttons;
let reverse;
let ctrl;
let button;
let pointer_over_canvas = false;
let update_helper_layer_on_pointermove_active = false;
let pointers = [];

const update_from_url_params = () => {
  if (location.hash.match(/eye-gaze-mode/i)) {
    if (!$("body").hasClass("eye-gaze-mode")) {
      $("body").addClass("eye-gaze-mode");
      $G.triggerHandler("eye-gaze-mode-toggled");
      $G.triggerHandler("theme-load");
    }
  } else {
    if ($("body").hasClass("eye-gaze-mode")) {
      $("body").removeClass("eye-gaze-mode");
      $G.triggerHandler("eye-gaze-mode-toggled");
      $G.triggerHandler("theme-load");
    }
  }
  if (location.hash.match(/vertical-color-box-mode|eye-gaze-mode/i)) {
    if (!$("body").hasClass("vertical-color-box-mode")) {
      $("body").addClass("vertical-color-box-mode");
      $G.triggerHandler("vertical-color-box-mode-toggled");
      $G.triggerHandler("theme-load");
    }
  } else {
    if ($("body").hasClass("vertical-color-box-mode")) {
      $("body").removeClass("vertical-color-box-mode");
      $G.triggerHandler("vertical-color-box-mode-toggled");
      $G.triggerHandler("theme-load");
    }
  }
  if (location.hash.match(/speech-recognition-mode/i)) {
    window.enable_speech_recognition && enable_speech_recognition();
  } else {
    window.disable_speech_recognition && disable_speech_recognition();
  }
};
update_from_url_params();
$G.on("hashchange popstate change-url-params", update_from_url_params);

if (location.search.match(/eye-gaze-mode/)) {
  change_url_param("eye-gaze-mode", true, { replace_history_state: true });
  update_from_url_params();
}
if (location.search.match(/vertical-colors?-box/)) {
  change_url_param("vertical-color-box", true, { replace_history_state: true });
  update_from_url_params();
}

const $app = $(E("div")).addClass("jspaint").appendTo("body");
const $V = $(E("div")).addClass("vertical").appendTo($app);
const $H = $(E("div")).addClass("horizontal").appendTo($V);
const $canvas_area = $(E("div")).addClass("canvas-area").appendTo($H);

const $canvas = $(window.jspaint_main_canvas_element).appendTo($canvas_area); // Use the global canvas
$canvas.attr("touch-action", "none");
let canvas_bounding_client_rect =
  window.jspaint_main_canvas_element.getBoundingClientRect();
const getRect = () => ({
  left: 0,
  top: 0,
  width: window.jspaint_main_canvas_element.width,
  height: window.jspaint_main_canvas_element.height,
  right: window.jspaint_main_canvas_element.width,
  bottom: window.jspaint_main_canvas_element.height,
});
const $canvas_handles = $Handles($canvas_area, getRect, {
  outset: 4,
  get_offset_left: () => parseFloat($canvas_area.css("padding-left")) + 1,
  get_offset_top: () => parseFloat($canvas_area.css("padding-top")) + 1,
  size_only: true,
});
$canvas_handles.hide = () => {
  $canvas_handles.css({ opacity: 0, pointerEvents: "none" });
};
$canvas_handles.show = () => {
  $canvas_handles.css({ opacity: "", pointerEvents: "" });
};

const $top = $(E("div")).addClass("component-area").prependTo($V);
const $bottom = $(E("div")).addClass("component-area").appendTo($V);
const $left = $(E("div")).addClass("component-area").prependTo($H);
const $right = $(E("div")).addClass("component-area").appendTo($H);
const $status_area = $(E("div")).addClass("status-area").appendTo($V);
const $status_text = $(E("div")).addClass("status-text").appendTo($status_area);
const $status_position = $(E("div"))
  .addClass("status-coordinates")
  .appendTo($status_area);
const $status_size = $(E("div"))
  .addClass("status-coordinates")
  .appendTo($status_area);

const $news_indicator_html_original = `
	<a class='news-indicator' href='#project-news'>
		<img src='images/winter/present.png' width='24' height='22' alt=''/>
		<span class='not-the-icon'>
			<strong>New!</strong> Holiday theme, multitouch panning, and revamped history
		</span>
	</a>
`;
if (Date.now() < Date.parse("Jan 5 2020 23:42:42 GMT-0500")) {
  const $news_indicator = $($news_indicator_html_original);
  $news_indicator.on("click auxclick", (event) => {
    event.preventDefault();
    show_news();
  });
  $status_area.append($news_indicator);
}

$status_text.default = () => {
  $status_text.text("For Help, click Help Topics on the Help menu.");
};
$status_text.default();

let menu_bar_outside_frame_original = false;
if (frameElement) {
  try {
    if (parent.$MenuBar) {
      // This part of logic is for jspaint-embedding-jspaint, likely not relevant for your shell.
      // $MenuBar = parent.$MenuBar;
      // menu_bar_outside_frame_original = true;
    }
  } catch (e) {}
}
const $menu_bar = $MenuBar(window.menus || {}); // window.menus should be defined by menus.js
if (menu_bar_outside_frame_original) {
  // $menu_bar.insertBefore(frameElement); // Not for your shell
} else {
  $menu_bar.prependTo($V);
}

$menu_bar.on("info", (_event, info) => {
  $status_text.text(info);
});
$menu_bar.on("default-info", () => {
  $status_text.default();
});

let $toolbox = $ToolBox(tools);
let $colorbox = $ColorBox($("body").hasClass("vertical-color-box-mode"));

$G.on("vertical-color-box-mode-toggled", () => {
  $colorbox.destroy();
  $colorbox = $ColorBox($("body").hasClass("vertical-color-box-mode"));
  prevent_selection($colorbox);
});
$G.on("eye-gaze-mode-toggled", () => {
  $colorbox.destroy();
  $colorbox = $ColorBox($("body").hasClass("vertical-color-box-mode"));
  prevent_selection($colorbox);
  $toolbox.destroy();
  $toolbox = $ToolBox(tools);
  prevent_selection($toolbox);
});

$canvas_area.on(
  "user-resized",
  (_event, _x, _y, unclamped_width, unclamped_height) => {
    resize_canvas_and_save_dimensions(unclamped_width, unclamped_height);
  }
);

$G.on("resize", () => {
  update_canvas_rect();
  update_disable_aa();
});
$canvas_area.on("scroll", () => {
  update_canvas_rect();
});
$canvas_area.on("resize", () => {
  update_magnified_canvas_size();
});

$("body")
  .on("dragover dragenter", (e) => {
    const dt = e.originalEvent.dataTransfer;
    const has_files = Array.from(dt.types).includes("Files");
    if (has_files) e.preventDefault();
  })
  .on("drop", (e) => {
    if (e.isDefaultPrevented()) return;
    const dt = e.originalEvent.dataTransfer;
    const has_files = Array.from(dt.types).includes("Files");
    if (has_files) {
      e.preventDefault();
      if (dt && dt.files && dt.files.length) {
        // open_from_FileList(dt.files, "dropped"); // This would try to open natively
        console.log(
          "XP Paint: File drop intercepted in iframe. Parent should handle VFS open if desired."
        );
      }
    }
  });

$G.on("keydown", (e) => {
  if (e.isDefaultPrevented()) {
    return;
  }
  if (e.keyCode === 27) {
    if (textbox && textbox.$editor.is(e.target)) {
      deselect();
    }
  }

  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  ) {
    return;
  }
  if (selection) {
    const nudge_selection = (delta_x, delta_y) => {
      selection.x += delta_x;
      selection.y += delta_y;
      selection.position();
    };
    switch (e.keyCode) {
      case 37:
        nudge_selection(-1, 0);
        e.preventDefault();
        break;
      case 39:
        nudge_selection(+1, 0);
        e.preventDefault();
        break;
      case 40:
        nudge_selection(0, +1);
        e.preventDefault();
        break;
      case 38:
        nudge_selection(0, -1);
        e.preventDefault();
        break;
    }
  }
  if (e.keyCode === 27) {
    if (selection) {
      deselect();
    } else {
      cancel();
    }
    if (window.stopSimulatingGestures) window.stopSimulatingGestures();
    if (window.trace_and_sketch_stop) window.trace_and_sketch_stop();
  } else if (e.keyCode === 13) {
    if (selection) {
      deselect();
    }
  } else if (e.keyCode === 115) {
    redo();
  } else if (e.keyCode === 46) {
    delete_selection();
  } else if (e.keyCode === 107 || e.keyCode === 109) {
    const plus = e.keyCode === 107;
    const minus = e.keyCode === 109;
    const delta = plus - minus;
    if (selection) {
      selection.scale(2 ** delta);
    } else {
      if (selected_tool.name === "Brush") {
        brush_size = Math.max(1, Math.min(brush_size + delta, 500));
      } else if (selected_tool.name === "Eraser/Color Eraser") {
        eraser_size = Math.max(1, Math.min(eraser_size + delta, 500));
      } else if (selected_tool.name === "Airbrush") {
        airbrush_size = Math.max(1, Math.min(airbrush_size + delta, 500));
      } else if (selected_tool.name === "Pencil") {
        pencil_size = Math.max(1, Math.min(pencil_size + delta, 50));
      } else if (
        selected_tool.name.match(/Line|Curve|Rectangle|Ellipse|Polygon/)
      ) {
        stroke_size = Math.max(1, Math.min(stroke_size + delta, 500));
      }
      $G.trigger("option-changed");
      if (button !== undefined && pointer) {
        selected_tools.forEach((tool_item) => {
          tool_go(tool_item);
        });
      }
      update_helper_layer();
    }
    e.preventDefault();
    return;
  } else if (e.ctrlKey || e.metaKey) {
    const key = String.fromCharCode(e.keyCode).toUpperCase();
    if (textbox) {
      switch (key) {
        case "A":
        case "Z":
        case "Y":
        case "I":
        case "B":
        case "U":
          return;
      }
    }
    switch (e.keyCode) {
      case 188:
      case 219:
        rotate(-TAU / 4);
        $canvas_area.trigger("resize");
        break;
      case 190:
      case 221:
        rotate(+TAU / 4);
        $canvas_area.trigger("resize");
        break;
    }
    // Use window.menus for Ctrl key shortcuts to ensure integrated actions are called
    switch (key) {
      case "Z":
        e.shiftKey
          ? window.menus["&Edit"]
              .find((item) => item.item === "&Repeat")
              ?.action()
          : window.menus["&Edit"]
              .find((item) => item.item === "&Undo")
              ?.action();
        break;
      case "Y":
        window.menus["&Edit"].find((item) => item.item === "&Repeat")?.action();
        break;
      case "F":
        view_bitmap();
        break;
      case "O":
        window.menus["&File"].find((item) => item.item === "&Open")?.action();
        break;
      case "N":
        e.shiftKey
          ? clear()
          : window.menus["&File"]
              .find((item) => item.item === "&New")
              ?.action();
        break;
      case "S":
        e.shiftKey
          ? window.menus["&File"]
              .find((item) => item.item === "Save &As")
              ?.action()
          : window.menus["&File"]
              .find((item) => item.item === "&Save")
              ?.action();
        break;
      case "A":
        select_all();
        break;
      case "I":
        image_invert_colors();
        break;
      case "E":
        image_attributes();
        break;
      default:
        return;
    }
    e.preventDefault();
  }
});
$G.on("cut copy paste", (e) => {
  if (e.isDefaultPrevented()) {
    return;
  }
  if (
    document.activeElement instanceof HTMLInputElement ||
    document.activeElement instanceof HTMLTextAreaElement ||
    !window.getSelection().isCollapsed
  ) {
    return;
  }
  e.preventDefault();
  const cd = e.originalEvent.clipboardData || window.clipboardData;
  if (!cd) {
    return;
  }
  if (e.type === "copy" || e.type === "cut") {
    if (selection && selection.canvas) {
      const do_sync_clipboard_copy_or_cut = () => {
        const data_url = selection.canvas.toDataURL();
        cd.setData("text/x-data-uri; type=image/png", data_url);
        cd.setData("text/uri-list", data_url);
        cd.setData("URL", data_url);
        if (e.type === "cut") {
          delete_selection({
            name: "Cut",
            icon: get_help_folder_icon("p_cut.png"),
          });
        }
      };
      if (!navigator.clipboard || !navigator.clipboard.write) {
        return do_sync_clipboard_copy_or_cut();
      }
      try {
        if (e.type === "cut") {
          edit_cut();
        } else {
          edit_copy();
        }
      } catch (err) {
        do_sync_clipboard_copy_or_cut();
      }
    }
  } else if (e.type === "paste") {
    for (const item of cd.items) {
      if (item.type.match(/^text\/(?:x-data-uri|uri-list|plain)|URL$/)) {
        item.getAsString((text) => {
          const uris = get_URIs(text);
          if (uris.length > 0) {
            load_image_from_URI(uris[0], (error, img) => {
              if (error) {
                return show_resource_load_error_message(error);
              }
              paste(img);
            });
          } else {
            show_error_message(
              "The information on the Clipboard can't be inserted into Paint."
            );
          }
        });
        break;
      } else if (item.type.match(/^image\//)) {
        paste_image_from_file(item.getAsFile());
        break;
      }
    }
  }
});

reset_file();
reset_colors();
reset_canvas_and_history();
set_magnification(default_magnification);

storage.get(
  { width: default_canvas_width, height: default_canvas_height },
  (err, stored_values) => {
    if (err) {
      return;
    }
    my_canvas_width = stored_values.width;
    my_canvas_height = stored_values.height;
    make_or_update_undoable(
      {
        match: (history_node) => history_node.name === "New Document",
        name: "Resize New Document Canvas",
        icon: get_help_folder_icon("p_stretch_both.png"),
      },
      () => {
        window.jspaint_main_canvas_element.width = Math.max(1, my_canvas_width); // Use global
        window.jspaint_main_canvas_element.height = Math.max(
          1,
          my_canvas_height
        );
        ctx.disable_image_smoothing();
        if (!transparency) {
          ctx.fillStyle = colors.background;
          ctx.fillRect(
            0,
            0,
            window.jspaint_main_canvas_element.width,
            window.jspaint_main_canvas_element.height
          );
        }
        $canvas_area.trigger("resize");
      }
    );
  }
);

const lerp = (a, b, b_ness) => a + (b - a) * b_ness;
const color_ramp = (num_colors, start_hsla, end_hsla) =>
  Array(num_colors)
    .fill()
    .map(
      (_undefined, index, array) =>
        `hsla(${lerp(
          start_hsla[0],
          end_hsla[0],
          index / array.length
        )}deg, ${lerp(
          start_hsla[1],
          end_hsla[1],
          index / array.length
        )}%, ${lerp(start_hsla[2], end_hsla[2], index / array.length)}%, ${lerp(
          start_hsla[3],
          end_hsla[3],
          index / array.length
        )}%)`
    );
const update_palette_from_theme = () => {
  if (get_theme() === "winter.css") {
    const make_stripe_patterns_local = (reverse) => [
      make_stripe_pattern(reverse, ["hsl(166, 93%, 38%)", "white"]),
      make_stripe_pattern(reverse, ["white", "hsl(355, 78%, 46%)"]),
      make_stripe_pattern(
        reverse,
        [
          "hsl(355, 78%, 46%)",
          "white",
          "white",
          "hsl(355, 78%, 46%)",
          "hsl(355, 78%, 46%)",
          "hsl(355, 78%, 46%)",
          "white",
          "white",
          "hsl(355, 78%, 46%)",
          "white",
        ],
        2
      ),
      make_stripe_pattern(
        reverse,
        [
          "hsl(166, 93%, 38%)",
          "white",
          "white",
          "hsl(166, 93%, 38%)",
          "hsl(166, 93%, 38%)",
          "hsl(166, 93%, 38%)",
          "white",
          "white",
          "hsl(166, 93%, 38%)",
          "white",
        ],
        2
      ),
      make_stripe_pattern(
        reverse,
        ["hsl(166, 93%, 38%)", "white", "hsl(355, 78%, 46%)", "white"],
        2
      ),
    ];
    palette = [
      "black",
      "hsl(91, 55%, 81%)",
      "hsl(142, 57%, 64%)",
      "hsl(166, 93%, 38%)",
      "#04ce1f",
      "hsl(159, 93%, 16%)",
      "hsl(2, 77%, 27%)",
      "hsl(350, 100%, 50%)",
      "hsl(356, 97%, 64%)",
      "#ad4632",
      "#5b3b1d",
      ...make_stripe_patterns_local(false),
      ...color_ramp(6, [200, 100, 100, 100], [200, 100, 10, 100]),
      "#fcbaf8",
      "hsl(0, 0%, 90%)",
      "hsl(22, 5%, 71%)",
      "hsl(48, 82%, 54%)",
      "hsl(49, 82%, 72%)",
      ...make_stripe_patterns_local(true),
    ];
    $colorbox.rebuild_palette();
  } else {
    palette = default_palette;
    $colorbox.rebuild_palette();
  }
};
$G.on("theme-load", update_palette_from_theme);
update_palette_from_theme();

function to_canvas_coords({ clientX, clientY }) {
  const rect = canvas_bounding_client_rect; // This should be updated if canvas_bounding_client_rect is from the global canvas
  const current_canvas_el = window.jspaint_main_canvas_element;
  if (!current_canvas_el) return { x: 0, y: 0 };
  const current_rect = current_canvas_el.getBoundingClientRect(); // Use current rect of the global canvas
  const cx = clientX - current_rect.left;
  const cy = clientY - current_rect.top;
  return {
    x: ~~((cx / current_rect.width) * current_canvas_el.width),
    y: ~~((cy / current_rect.height) * current_canvas_el.height),
  };
}
function update_fill_and_stroke_colors_and_lineWidth(selected_tool_arg) {
  const tool = selected_tool_arg || selected_tool;
  ctx.lineWidth = stroke_size;
  const reverse_because_fill_only =
    tool.$options && tool.$options.fill && !tool.$options.stroke;
  ctx.fillStyle =
    fill_color =
    ctx.strokeStyle =
    stroke_color =
      colors[
        ctrl && colors.ternary && pointer_active
          ? "ternary"
          : reverse ^ reverse_because_fill_only
          ? "background"
          : "foreground"
      ];
  fill_color_k = stroke_color_k = ctrl
    ? "ternary"
    : reverse ^ reverse_because_fill_only
    ? "background"
    : "foreground";
  if (tool.shape || tool.shape_colors) {
    if (!tool.stroke_only) {
      if (reverse ^ reverse_because_fill_only) {
        fill_color_k = "foreground";
        stroke_color_k = "background";
      } else {
        fill_color_k = "background";
        stroke_color_k = "foreground";
      }
    }
    ctx.fillStyle = fill_color = colors[fill_color_k];
    ctx.strokeStyle = stroke_color = colors[stroke_color_k];
  }
}
function tool_go(target_tool, event_name) {
  update_fill_and_stroke_colors_and_lineWidth(target_tool);
  if (target_tool[event_name]) {
    target_tool[event_name](ctx, pointer.x, pointer.y);
  }
  if (target_tool.paint) {
    target_tool.paint(ctx, pointer.x, pointer.y);
  }
}
function canvas_pointer_move(e) {
  ctrl = e.ctrlKey;
  shift = e.shiftKey;
  pointer = to_canvas_coords(e);
  if (pointers.length && e.button != -1) {
    const MMB = 4;
    if (
      e.pointerType != pointer_type ||
      (e.buttons | MMB) != (pointer_buttons | MMB)
    ) {
      cancel();
      pointer_active = false;
      return;
    }
  }
  if (e.shiftKey) {
    if (selected_tool.name.match(/Line|Curve/)) {
      const dist = Math.sqrt(
        (pointer.y - pointer_start.y) * (pointer.y - pointer_start.y) +
          (pointer.x - pointer_start.x) * (pointer.x - pointer_start.x)
      );
      const eighth_turn = (typeof TAU !== "undefined" ? TAU : 2 * Math.PI) / 8;
      const angle_0_to_8 =
        Math.atan2(pointer.y - pointer_start.y, pointer.x - pointer_start.x) /
        eighth_turn;
      const angle = Math.round(angle_0_to_8) * eighth_turn;
      pointer.x = Math.round(pointer_start.x + Math.cos(angle) * dist);
      pointer.y = Math.round(pointer_start.y + Math.sin(angle) * dist);
    } else if (selected_tool.shape) {
      const w = Math.abs(pointer.x - pointer_start.x);
      const h = Math.abs(pointer.y - pointer_start.y);
      if (w < h) {
        if (pointer.y > pointer_start.y) {
          pointer.y = pointer_start.y + w;
        } else {
          pointer.y = pointer_start.y - w;
        }
      } else {
        if (pointer.x > pointer_start.x) {
          pointer.x = pointer_start.x + h;
        } else {
          pointer.x = pointer_start.x - h;
        }
      }
    }
  }
  selected_tools.forEach((current_selected_tool) => {
    tool_go(current_selected_tool);
  });
  pointer_previous = pointer;
}

$canvas.on("pointermove", (e) => {
  pointer = to_canvas_coords(e);
  $status_position.text(`${pointer.x},${pointer.y}`);
});
$canvas.on("pointerenter", () => {
  pointer_over_canvas = true;
  update_helper_layer();
  if (!update_helper_layer_on_pointermove_active) {
    $G.on("pointermove", update_helper_layer);
    update_helper_layer_on_pointermove_active = true;
  }
});
$canvas.on("pointerleave", () => {
  pointer_over_canvas = false;
  $status_position.text("");
  update_helper_layer();
  if (!pointer_active && update_helper_layer_on_pointermove_active) {
    $G.off("pointermove", update_helper_layer);
    update_helper_layer_on_pointermove_active = false;
  }
});

let clean_up_eye_gaze_mode = () => {};
$G.on("eye-gaze-mode-toggled", () => {
  if ($("body").hasClass("eye-gaze-mode")) {
    init_eye_gaze_mode();
  } else {
    clean_up_eye_gaze_mode();
  }
});
if ($("body").hasClass("eye-gaze-mode")) {
  init_eye_gaze_mode();
}

function init_eye_gaze_mode() {
  const circle_radius_max = 50;
  const hover_timespan = 500;
  const averaging_window_timespan = 500;
  const inactive_at_startup_timespan = 1500;
  const inactive_after_release_timespan = 1000;
  const inactive_after_hovered_timespan = 1000;
  const inactive_after_invalid_timespan = 1000;
  const inactive_after_focused_timespan = 1000;
  let recent_points = [];
  let inactive_until_time = Date.now();
  let paused = false;
  let $pause_button;
  let hover_candidate;
  let gaze_dragging = null;
  const deactivate_for_at_least = (timespan) => {
    inactive_until_time = Math.max(inactive_until_time, Date.now() + timespan);
  };
  deactivate_for_at_least(inactive_at_startup_timespan);
  const $halo = $("<div class='hover-halo'>").appendTo("body").hide();
  const $dwell_indicator = $("<div class='dwell-indicator'>")
    .css({ width: circle_radius_max, height: circle_radius_max })
    .appendTo("body")
    .hide();
  const on_pointer_move = (e) => {
    recent_points.push({ x: e.clientX, y: e.clientY, time: Date.now() });
  };
  const on_pointer_up_or_cancel = (e) => {
    deactivate_for_at_least(inactive_after_release_timespan);
    gaze_dragging = null;
  };
  let page_focused = document.visibilityState === "visible";
  let mouse_inside_page = true;
  const on_focus = () => {
    page_focused = true;
    deactivate_for_at_least(inactive_after_focused_timespan);
  };
  const on_blur = () => {
    page_focused = false;
  };
  const on_mouse_leave_page = () => {
    mouse_inside_page = false;
  };
  const on_mouse_enter_page = () => {
    mouse_inside_page = true;
  };
  $G.on("pointermove", on_pointer_move);
  $G.on("pointerup pointercancel", on_pointer_up_or_cancel);
  $G.on("focus", on_focus);
  $G.on("blur", on_blur);
  $(document).on("mouseleave", on_mouse_leave_page);
  $(document).on("mouseenter", on_mouse_enter_page);
  const get_hover_candidate = (clientX, clientY) => {
    if (!page_focused || !mouse_inside_page) return null;
    let target = document.elementFromPoint(clientX, clientY);
    if (!target) {
      return null;
    }
    let hover_candidate_ghc = { x: clientX, y: clientY, time: Date.now() };
    if (
      (target.closest(".menu-button") || target.matches(".menu-container")) &&
      $(".menu-button.active").length
    ) {
      return null;
    }
    const target_selector_ghc = `button:not([disabled]), input, textarea, label, a, .current-colors, .color-button, .tool:not(.selected), .chooser-option, .menu-button:not(.active), .menu-item, .main-canvas, .selection canvas, .handle, .window:not(.maximized) .window-titlebar, .history-entry, .canvas-area`;
    target = target.closest(target_selector_ghc);
    if (!target) {
      return null;
    }
    if (target.matches(".color-button input")) {
      target = target.closest(".color-button");
    }
    if (target === $canvas_area[0]) {
      const margin_ghc = 50;
      if (
        hover_candidate_ghc.x > canvas_bounding_client_rect.left - margin_ghc &&
        hover_candidate_ghc.y > canvas_bounding_client_rect.top - margin_ghc &&
        hover_candidate_ghc.x <
          canvas_bounding_client_rect.right + margin_ghc &&
        hover_candidate_ghc.y < canvas_bounding_client_rect.bottom + margin_ghc
      ) {
        target = window.jspaint_main_canvas_element; // Use global canvas
        hover_candidate_ghc.x = Math.min(
          canvas_bounding_client_rect.right - 1,
          Math.max(canvas_bounding_client_rect.left, hover_candidate_ghc.x)
        );
        hover_candidate_ghc.y = Math.min(
          canvas_bounding_client_rect.bottom - 1,
          Math.max(canvas_bounding_client_rect.top, hover_candidate_ghc.y)
        );
      } else {
        return null;
      }
    } else if (
      !target.matches(".main-canvas, .selection canvas, .window-titlebar")
    ) {
      const rect_ghc = target.getBoundingClientRect();
      hover_candidate_ghc.x = rect_ghc.left + rect_ghc.width / 2;
      hover_candidate_ghc.y = rect_ghc.top + rect_ghc.height / 2;
    }
    hover_candidate_ghc.target = target;
    return hover_candidate_ghc;
  };
  const update_eye_gaze = () => {
    const time_ueg = Date.now();
    recent_points = recent_points.filter(
      (point_record_ueg) =>
        time_ueg < point_record_ueg.time + averaging_window_timespan
    );
    if (recent_points.length) {
      const latest_point_ueg = recent_points[recent_points.length - 1];
      recent_points.push({
        x: latest_point_ueg.x,
        y: latest_point_ueg.y,
        time: time_ueg,
      });
      const average_point_ueg = average_points(recent_points);
      const recent_movement_amount_ueg = Math.hypot(
        latest_point_ueg.x - average_point_ueg.x,
        latest_point_ueg.y - average_point_ueg.y
      );
      if (hover_candidate && !gaze_dragging) {
        const apparent_hover_candidate_ueg = get_hover_candidate(
          hover_candidate.x,
          hover_candidate.y
        );
        if (apparent_hover_candidate_ueg) {
          if (
            apparent_hover_candidate_ueg.target !== hover_candidate.target &&
            apparent_hover_candidate_ueg.target.closest("label") !==
              hover_candidate.target
          ) {
            hover_candidate = null;
            deactivate_for_at_least(inactive_after_invalid_timespan);
          }
        } else {
          hover_candidate = null;
          deactivate_for_at_least(inactive_after_invalid_timespan);
        }
      }
      let circle_position_ueg = latest_point_ueg;
      let circle_opacity_ueg = 0;
      let circle_radius_ueg = 0;
      if (hover_candidate) {
        circle_position_ueg = hover_candidate;
        circle_opacity_ueg = 0.4;
        circle_radius_ueg =
          ((hover_candidate.time - time_ueg + hover_timespan) /
            hover_timespan) *
          circle_radius_max;
        if (time_ueg > hover_candidate.time + hover_timespan) {
          if (pointer_active || gaze_dragging) {
            $(hover_candidate.target).trigger(
              $.Event("pointerup", {
                clientX: hover_candidate.x,
                clientY: hover_candidate.y,
                pointerId: 1234567890,
                pointerType: "mouse",
                button: 0,
                buttons: 0,
                isPrimary: true,
              })
            );
          } else {
            pointers = [];
            $(hover_candidate.target).trigger(
              $.Event("pointerdown", {
                clientX: hover_candidate.x,
                clientY: hover_candidate.y,
                pointerId: 1234567890,
                pointerType: "mouse",
                button: 0,
                buttons: 1,
                isPrimary: true,
              })
            );
            const is_drag_ueg =
              hover_candidate.target.matches(
                ".window-titlebar, .window-titlebar *:not(button)"
              ) ||
              hover_candidate.target.matches(
                ".selection, .selection *, .handle"
              ) ||
              (hover_candidate.target === window.jspaint_main_canvas_element &&
                selected_tool.name !== "Pick Color" &&
                selected_tool.name !== "Fill With Color" &&
                selected_tool.name !== "Magnifier" &&
                selected_tool.name !== "Polygon" &&
                selected_tool.name !== "Curve");
            if (is_drag_ueg) {
              gaze_dragging = hover_candidate.target;
            } else {
              $(hover_candidate.target).trigger(
                $.Event("pointerup", {
                  clientX: hover_candidate.x,
                  clientY: hover_candidate.y,
                  pointerId: 1234567890,
                  pointerType: "mouse",
                  button: 0,
                  buttons: 0,
                  isPrimary: true,
                })
              );
              if (hover_candidate.target.matches("button:not(.toggle)")) {
                ((button_ueg) => {
                  button_ueg.style.borderImage =
                    "var(--inset-deep-border-image)";
                  setTimeout(() => {
                    button_ueg.style.borderImage = "";
                    button_ueg.click();
                  }, 100);
                })(hover_candidate.target);
              } else {
                hover_candidate.target.click();
                if (hover_candidate.target.matches("input, textarea")) {
                  hover_candidate.target.focus();
                }
              }
            }
          }
          hover_candidate = null;
          deactivate_for_at_least(inactive_after_hovered_timespan);
        }
      }
      if (gaze_dragging) {
        $dwell_indicator.addClass("for-release");
      } else {
        $dwell_indicator.removeClass("for-release");
      }
      $dwell_indicator
        .show()
        .css({
          opacity: circle_opacity_ueg,
          transform: `scale(${circle_radius_ueg / circle_radius_max})`,
          left: circle_position_ueg.x - circle_radius_max / 2,
          top: circle_position_ueg.y - circle_radius_max / 2,
        });
      let halo_target_ueg =
        gaze_dragging ||
        (
          hover_candidate ||
          get_hover_candidate(latest_point_ueg.x, latest_point_ueg.y) ||
          {}
        ).target;
      if (halo_target_ueg && (!paused || $pause_button.is(halo_target_ueg))) {
        let rect_ueg = halo_target_ueg.getBoundingClientRect();
        if (halo_target_ueg.closest(".canvas-area")) {
          const scroll_area_rect_ueg = $canvas_area[0].getBoundingClientRect();
          rect_ueg = {
            left: Math.max(rect_ueg.left, scroll_area_rect_ueg.left),
            top: Math.max(rect_ueg.top, scroll_area_rect_ueg.top),
            right: Math.min(rect_ueg.right, scroll_area_rect_ueg.right),
            bottom: Math.min(rect_ueg.bottom, scroll_area_rect_ueg.bottom),
          };
          rect_ueg.width = rect_ueg.right - rect_ueg.left;
          rect_ueg.height = rect_ueg.bottom - rect_ueg.top;
        }
        const computed_style_ueg = getComputedStyle(halo_target_ueg);
        const border_radius_scale_ueg = parseInt(
          (
            $(halo_target_ueg).closest(".component").css("transform") || ""
          ).match(/\d+/) || 1
        );
        $halo.css({
          display: "block",
          position: "fixed",
          left: rect_ueg.left,
          top: rect_ueg.top,
          width: rect_ueg.width,
          height: rect_ueg.height,
          borderTopRightRadius:
            parseFloat(computed_style_ueg.borderTopRightRadius) *
            border_radius_scale_ueg,
          borderTopLeftRadius:
            parseFloat(computed_style_ueg.borderTopLeftRadius) *
            border_radius_scale_ueg,
          borderBottomRightRadius:
            parseFloat(computed_style_ueg.borderBottomRightRadius) *
            border_radius_scale_ueg,
          borderBottomLeftRadius:
            parseFloat(computed_style_ueg.borderBottomLeftRadius) *
            border_radius_scale_ueg,
        });
      } else {
        $halo.hide();
      }
      if (time_ueg < inactive_until_time) {
        return;
      }
      if (recent_movement_amount_ueg < 5) {
        if (!hover_candidate) {
          hover_candidate = {
            x: average_point_ueg.x,
            y: average_point_ueg.y,
            time: Date.now(),
            target: gaze_dragging || null,
          };
          if (!gaze_dragging) {
            hover_candidate = get_hover_candidate(
              hover_candidate.x,
              hover_candidate.y
            );
          }
          if (
            hover_candidate &&
            paused &&
            !$pause_button.is(hover_candidate.target)
          ) {
            hover_candidate = null;
          }
        }
      }
      if (recent_movement_amount_ueg > 100) {
        if (gaze_dragging) {
          $G.trigger(
            $.Event("pointerup", {
              clientX: average_point_ueg.x,
              clientY: average_point_ueg.y,
              pointerId: 1234567890,
              pointerType: "mouse",
              button: 0,
              buttons: 0,
              isPrimary: true,
            })
          );
          pointers = [];
        }
      }
      if (recent_movement_amount_ueg > 60) {
        hover_candidate = null;
      }
    }
  };
  let raf_id_eye_gaze;
  const animate_eye_gaze = () => {
    raf_id_eye_gaze = requestAnimationFrame(animate_eye_gaze);
    update_eye_gaze();
  };
  raf_id_eye_gaze = requestAnimationFrame(animate_eye_gaze);
  const $floating_buttons = $("<div/>")
    .appendTo("body")
    .css({
      position: "fixed",
      bottom: 0,
      left: 0,
      transformOrigin: "bottom left",
      transform: "scale(3)",
    });
  $("<button title='Undo'/>")
    .on("click", undo)
    .appendTo($floating_buttons)
    .css({
      width: 28,
      height: 28,
      verticalAlign: "bottom",
      position: "relative",
    })
    .append(
      $("<div>").css({
        position: "absolute",
        left: 0,
        top: 0,
        width: 24,
        height: 24,
        backgroundImage: "url(images/classic/undo.svg)",
      })
    );
  const pause_button_text_eye_gaze = "Pause Dwell Clicking";
  const resume_button_text_eye_gaze = "Resume Dwell Clicking";
  $pause_button = $(`<button title="${pause_button_text_eye_gaze}"/>`)
    .on("click", () => {
      paused = !paused;
      $pause_button
        .attr(
          "title",
          paused ? resume_button_text_eye_gaze : pause_button_text_eye_gaze
        )
        .find("div")
        .css({
          backgroundImage: paused
            ? "url(images/classic/eye-gaze-unpause.svg)"
            : "url(images/classic/eye-gaze-pause.svg)",
        });
    })
    .appendTo($floating_buttons)
    .css({
      width: 28,
      height: 28,
      verticalAlign: "bottom",
      position: "relative",
    })
    .append(
      $("<div>").css({
        position: "absolute",
        left: 0,
        top: 0,
        width: 24,
        height: 24,
        backgroundImage: "url(images/classic/eye-gaze-pause.svg)",
      })
    );
  clean_up_eye_gaze_mode = () => {
    console.log("Cleaning up / disabling eye gaze mode");
    cancelAnimationFrame(raf_id_eye_gaze);
    $halo.remove();
    $dwell_indicator.remove();
    $floating_buttons.remove();
    $G.off("pointermove", on_pointer_move);
    $G.off("pointerup pointercancel", on_pointer_up_or_cancel);
    $G.off("focus", on_focus);
    $G.off("blur", on_blur);
    $(document).off("mouseleave", on_mouse_leave_page);
    $(document).off("mouseenter", on_mouse_enter_page);
    clean_up_eye_gaze_mode = () => {};
  };
}

let pan_start_pos_app_js_pan;
let pan_start_scroll_top_app_js_pan;
let pan_start_scroll_left_app_js_pan;
function average_points_app_js_pan(points_app_js_pan) {
  const average_app_js_pan = { x: 0, y: 0 };
  for (const pointer_app_js_pan of points_app_js_pan) {
    average_app_js_pan.x += pointer_app_js_pan.x;
    average_app_js_pan.y += pointer_app_js_pan.y;
  }
  average_app_js_pan.x /= points_app_js_pan.length;
  average_app_js_pan.y /= points_app_js_pan.length;
  return average_app_js_pan;
}
$canvas_area.on("pointerdown", (event_app_js_pan) => {
  if (
    pointers.every(
      (pointer_app_js_pan_every) =>
        pointer_app_js_pan_every.pointerId !== 1234567890 &&
        !(
          pointer_app_js_pan_every.isPrimary &&
          (pointer_app_js_pan_every.pointerType === "mouse" ||
            pointer_app_js_pan_every.pointerType === "pen")
        )
    )
  ) {
    pointers.push({
      pointerId: event_app_js_pan.pointerId,
      pointerType: event_app_js_pan.pointerType,
      isPrimary:
        (event_app_js_pan.originalEvent &&
          event_app_js_pan.originalEvent.isPrimary) ||
        event_app_js_pan.isPrimary,
      x: event_app_js_pan.clientX,
      y: event_app_js_pan.clientY,
    });
  }

  if (pointers.length == 2) {
    pan_start_pos_app_js_pan = average_points_app_js_pan(pointers);
    pan_start_scroll_top_app_js_pan = $canvas_area.scrollTop();
    pan_start_scroll_left_app_js_pan = $canvas_area.scrollLeft();
  }
  if (pointers.length >= 2) {
    cancel();
    pointer_active = false;
    return;
  }
});
$G.on("pointerup pointercancel", (event_app_js_pan_gpc) => {
  pointers = pointers.filter(
    (pointer_app_js_pan_gpc_filter) =>
      pointer_app_js_pan_gpc_filter.pointerId !== event_app_js_pan_gpc.pointerId
  );
});
$G.on("pointermove", (event_app_js_pan_gpm) => {
  for (const pointer_app_js_pan_gpm_for of pointers) {
    if (
      pointer_app_js_pan_gpm_for.pointerId === event_app_js_pan_gpm.pointerId
    ) {
      pointer_app_js_pan_gpm_for.x = event_app_js_pan_gpm.clientX;
      pointer_app_js_pan_gpm_for.y = event_app_js_pan_gpm.clientY;
    }
  }
  if (pointers.length >= 2 && pan_start_pos_app_js_pan) {
    const current_pos_app_js_pan_gpm = average_points_app_js_pan(pointers);
    const difference_in_x_app_js_pan_gpm =
      current_pos_app_js_pan_gpm.x - pan_start_pos_app_js_pan.x;
    const difference_in_y_app_js_pan_gpm =
      current_pos_app_js_pan_gpm.y - pan_start_pos_app_js_pan.y;
    $canvas_area.scrollLeft(
      pan_start_scroll_left_app_js_pan - difference_in_x_app_js_pan_gpm
    );
    $canvas_area.scrollTop(
      pan_start_scroll_top_app_js_pan - difference_in_y_app_js_pan_gpm
    );
  }
});

$canvas.on("pointerdown", (e_canvas_pd) => {
  update_canvas_rect();
  if (pointers.length >= 1) {
    cancel();
    pointer_active = false;
    pointers = pointers.filter(
      (p_canvas_pd) => p_canvas_pd.pointerId !== 1234567890
    );
    return;
  }
  history_node_to_cancel_to = current_history_node;
  pointer_active = !!(e_canvas_pd.buttons & (1 | 2));
  pointer_type = e_canvas_pd.pointerType;
  pointer_buttons = e_canvas_pd.buttons;
  $G.one("pointerup", () => {
    pointer_active = false;
    update_helper_layer();
    if (!pointer_over_canvas && update_helper_layer_on_pointermove_active) {
      $G.off("pointermove", update_helper_layer);
      update_helper_layer_on_pointermove_active = false;
    }
  });
  if (e_canvas_pd.button === 0) {
    reverse = false;
  } else if (e_canvas_pd.button === 2) {
    reverse = true;
  } else {
    return;
  }
  button = e_canvas_pd.button;
  ctrl = e_canvas_pd.ctrlKey;
  shift = e_canvas_pd.shiftKey;
  pointer_start = pointer_previous = pointer = to_canvas_coords(e_canvas_pd);
  const pointerdown_action_canvas_pd = () => {
    let interval_ids_canvas_pd = [];
    selected_tools.forEach((selected_tool_canvas_pd) => {
      if (
        selected_tool_canvas_pd.paint ||
        selected_tool_canvas_pd.pointerdown
      ) {
        tool_go(selected_tool_canvas_pd, "pointerdown");
      }
      if (selected_tool_canvas_pd.paint_on_time_interval != null) {
        interval_ids_canvas_pd.push(
          setInterval(() => {
            tool_go(selected_tool_canvas_pd);
          }, selected_tool_canvas_pd.paint_on_time_interval)
        );
      }
    });
    $G.on("pointermove", canvas_pointer_move);
    $G.one("pointerup", (e_canvas_pu, canceling_canvas_pu) => {
      button = undefined;
      reverse = false;
      pointer = to_canvas_coords(e_canvas_pu);
      selected_tools.forEach((selected_tool_canvas_pu) => {
        selected_tool_canvas_pu.pointerup &&
          selected_tool_canvas_pu.pointerup(ctx, pointer.x, pointer.y);
      });
      if (selected_tools.length === 1) {
        if (selected_tool.deselect) {
          select_tools(return_to_tools);
        }
      }
      $G.off("pointermove", canvas_pointer_move);
      for (const interval_id_canvas_pu of interval_ids_canvas_pd) {
        clearInterval(interval_id_canvas_pu);
      }
      if (!canceling_canvas_pu) {
        history_node_to_cancel_to = null;
        if (
          selected_tool.paint ||
          selected_tool.pointerdown ||
          selected_tool.pointerup
        ) {
          // If an actual drawing operation happened
          saved = false;
          if (window.jspaint_parent_origin)
            parent.postMessage(
              { xpPaintAction: "dirtyStateChanged", isDirty: true },
              window.jspaint_parent_origin
            );
        }
      }
    });
  };
  pointerdown_action_canvas_pd();
  update_helper_layer();
});
$canvas_area.on("pointerdown", (e_canvas_area_pd) => {
  if (e_canvas_area_pd.button === 0) {
    if ($canvas_area.is(e_canvas_area_pd.target)) {
      if (selection) {
        deselect();
      }
    }
  }
});

function prevent_selection($el_prevent) {
  $el_prevent.on("mousedown selectstart contextmenu", (e_prevent) => {
    if (e_prevent.isDefaultPrevented()) {
      return;
    }
    if (
      e_prevent.target instanceof HTMLSelectElement ||
      e_prevent.target instanceof HTMLTextAreaElement ||
      (e_prevent.target instanceof HTMLLabelElement &&
        e_prevent.type !== "contextmenu") ||
      (e_prevent.target instanceof HTMLInputElement &&
        e_prevent.target.type !== "color")
    ) {
      return;
    }
    if (e_prevent.button === 1) {
      return;
    }
    e_prevent.preventDefault();
    window.getSelection().removeAllRanges();
  });
}

prevent_selection($app);
prevent_selection($toolbox);
prevent_selection($colorbox);

$G.on("blur", () => {
  $G.triggerHandler("pointerup");
});
