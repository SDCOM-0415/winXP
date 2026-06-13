(() => {
  const looksLikeChrome = !!(
    window.chrome &&
    (window.chrome.loadTimes || window.chrome.csi)
  );

  const postWallpaperRequest = (mode) => {
    if (window.jspaint_main_canvas_element && window.jspaint_parent_origin) {
      try {
        const imageDataUrl =
          window.jspaint_main_canvas_element.toDataURL("image/png");
        parent.postMessage(
          {
            xpPaintAction: "requestSetWallpaper",
            imageDataUrl: imageDataUrl,
            wallpaperMode: mode,
          },
          window.jspaint_parent_origin
        );
      } catch (e) {
        console.error("XP Paint: Error getting canvas data for wallpaper:", e);
        if (typeof show_error_message === "function") {
          // jspaint's internal error display
          show_error_message("Could not get image data to set as wallpaper.");
        }
      }
    } else {
      console.error(
        "XP Paint menus: Canvas or PARENT_ORIGIN not available for Set Wallpaper."
      );
    }
  };

  window.menus = {
    "文件(&F)": [
      {
        item: "新建(&N)",
        shortcut: "Ctrl+Alt+N",
        speech_recognition: [],
        action: () => {
          if (window.jspaint_parent_origin)
            parent.postMessage(
              { xpPaintAction: "requestNewFromPaint" },
              window.jspaint_parent_origin
            );
          else console.error("XP Paint menus: PARENT_ORIGIN not set for New");
        },
        description: "创建新文档。",
      },
      {
        item: "打开(&O)",
        shortcut: "Ctrl+O",
        speech_recognition: [],
        action: () => {
          if (window.jspaint_parent_origin)
            parent.postMessage(
              { xpPaintAction: "requestOpenFromPaint" },
              window.jspaint_parent_origin
            );
          else console.error("XP Paint menus: PARENT_ORIGIN not set for Open");
        },
        description: "打开现有文档。",
      },
      {
        item: "保存(&S)",
        shortcut: "Ctrl+S",
        speech_recognition: [],
        action: () => {
          if (
            window.jspaint_main_canvas_element &&
            window.jspaint_parent_origin &&
            typeof window.current_file_name !== "undefined"
          ) {
            const imageDataUrl =
              window.jspaint_main_canvas_element.toDataURL("image/png");
            const currentFileName = window.current_file_name || "untitled.png";
            parent.postMessage(
              {
                xpPaintAction: "requestSave",
                imageDataUrl: imageDataUrl,
                fileName: currentFileName,
              },
              window.jspaint_parent_origin
            );
          } else {
            console.error(
              "XP Paint menus: main_canvas, PARENT_ORIGIN or current_file_name not available for Save"
            );
          }
        },
        description: "保存当前文档。",
      },
      {
        item: "另存为(&A)",
        shortcut: "Ctrl+Shift+S",
        speech_recognition: [],
        action: () => {
          if (
            window.jspaint_main_canvas_element &&
            window.jspaint_parent_origin &&
            typeof window.current_file_name !== "undefined"
          ) {
            const imageDataUrl =
              window.jspaint_main_canvas_element.toDataURL("image/png");
            const currentFileName = window.current_file_name || "untitled.png";
            parent.postMessage(
              {
                xpPaintAction: "requestSaveAs",
                imageDataUrl: imageDataUrl,
                fileName: currentFileName,
              },
              window.jspaint_parent_origin
            );
          } else {
            console.error(
              "XP Paint menus: main_canvas, PARENT_ORIGIN or current_file_name not available for Save As"
            );
          }
        },
        description: "用新名称保存当前文档。",
      },
      MENU_DIVIDER,
      {
        item: "打印预览(&V)",
        speech_recognition: [],
        action: () => {
          print();
        },
        description: "打印当前文档并设置打印选项。",
      },
      {
        item: "打印(&P)",
        shortcut: "Ctrl+P",
        speech_recognition: [],
        action: () => {
          print();
        },
        description: "打印当前文档并设置打印选项。",
      },
      MENU_DIVIDER,
      {
        item: "设为桌面背景(平铺)(&W)",
        speech_recognition: [],
        action: () => {
          postWallpaperRequest("tile");
        },
        description: "将此位图平铺为桌面背景。",
      },
      {
        item: "设为桌面背景(居中)(&C)",
        speech_recognition: [],
        action: () => {
          postWallpaperRequest("center");
        },
        description: "将此位图居中为桌面背景。",
      },
      {
        item: "设为桌面背景(拉伸)(&T)",
        speech_recognition: [],
        action: () => {
          postWallpaperRequest("stretch");
        },
        description: "将此位图拉伸为桌面背景。",
      },
      MENU_DIVIDER,
      {
        item: "退出(&X)",
        speech_recognition: [],
        action: () => {
          if (window.jspaint_parent_origin)
            parent.postMessage(
              { xpPaintAction: "requestExitFromPaint" },
              window.jspaint_parent_origin
            );
          else console.error("XP Paint menus: PARENT_ORIGIN not set for Exit");
        },
        description: "退出画图。",
      },
    ],
    "编辑(&E)": [
      {
        item: "撤销(&U)",
        shortcut: "Ctrl+Z",
        speech_recognition: [],
        enabled: () => typeof undos !== "undefined" && undos.length >= 1,
        action: () => {
          if (typeof undo === "function") undo();
        },
        description: "撤销上一次操作。",
      },
      {
        item: "重做(&R)",
        shortcut: "F4",
        speech_recognition: [],
        enabled: () => typeof redos !== "undefined" && redos.length >= 1,
        action: () => {
          if (typeof redo === "function") redo();
        },
        description: "重做已撤销的操作。",
      },

      MENU_DIVIDER,
      {
        item: "剪切(&T)",
        shortcut: "Ctrl+X",
        speech_recognition: [],
        enabled: () => typeof selection !== "undefined" && !!selection,
        action: () => {
          if (typeof edit_cut === "function") edit_cut(true);
        },
        description: "剪切选择区域并放到剪贴板。",
      },
      {
        item: "复制(&C)",
        shortcut: "Ctrl+C",
        speech_recognition: [],
        enabled: () => typeof selection !== "undefined" && !!selection,
        action: () => {
          if (typeof edit_copy === "function") edit_copy(true);
        },
        description: "复制选择区域并放到剪贴板。",
      },
      {
        item: "粘贴(&P)",
        shortcut: "Ctrl+V",
        speech_recognition: [],
        enabled: () => true,
        action: () => {
          if (typeof edit_paste === "function") edit_paste(true);
        },
        description: "插入剪贴板的内容。",
      },
      {
        item: "清除选择(&L)",
        shortcut: "Del",
        speech_recognition: [],
        enabled: () => typeof selection !== "undefined" && !!selection,
        action: () => {
          if (typeof delete_selection === "function") delete_selection();
        },
        description: "删除选择区域。",
      },
      {
        item: "全选(&A)",
        shortcut: "Ctrl+A",
        speech_recognition: [],
        action: () => {
          if (typeof select_all === "function") select_all();
        },
        description: "全选所有内容。",
      },
      MENU_DIVIDER,
      {
        item: "复制到...(&O)",
        speech_recognition: [],
        enabled: () => typeof selection !== "undefined" && !!selection,
        action: () => {
          if (typeof save_selection_to_file === "function")
            save_selection_to_file();
        },
        description: "将选择区域复制到文件。",
      },
      {
        item: "从文件粘贴...(&F)",
        speech_recognition: [],
        action: () => {
          if (typeof paste_from_file_select_dialog === "function")
            paste_from_file_select_dialog();
        },
        description: "从文件粘贴到选择区域。",
      },
    ],
    "查看(&V)": [
      {
        item: "工具箱(&T)",
        speech_recognition: [],
        checkbox: {
          toggle: () => {
            if (typeof $toolbox !== "undefined") $toolbox.toggle();
          },
          check: () =>
            typeof $toolbox !== "undefined" && $toolbox.is(":visible"),
        },
        description: "显示或隐藏工具箱。",
      },
      {
        item: "颜色框(&C)",
        speech_recognition: [],
        checkbox: {
          toggle: () => {
            if (typeof $colorbox !== "undefined") $colorbox.toggle();
          },
          check: () =>
            typeof $colorbox !== "undefined" && $colorbox.is(":visible"),
        },
        description: "显示或隐藏颜色框。",
      },
      {
        item: "状态栏(&S)",
        speech_recognition: [],
        checkbox: {
          toggle: () => {
            if (typeof $status_area !== "undefined") $status_area.toggle();
          },
          check: () =>
            typeof $status_area !== "undefined" && $status_area.is(":visible"),
        },
        description: "显示或隐藏状态栏。",
      },
      {
        item: "文字工具栏(&E)",
        speech_recognition: [],
        enabled: false,
        checkbox: {},
        description: "显示或隐藏文字工具栏。",
      },
      MENU_DIVIDER,
      {
        item: "缩放(&Z)",
        submenu: [
          {
            item: "正常大小(&N)",
            speech_recognition: [],
            description: "将图片缩放到100%。",
            enabled: () =>
              typeof magnification !== "undefined" && magnification !== 1,
            action: () => {
              if (typeof set_magnification === "function") set_magnification(1);
            },
          },
          {
            item: "放大(&L)",
            speech_recognition: [],
            description: "将图片缩放到400%。",
            enabled: () =>
              typeof magnification !== "undefined" && magnification !== 4,
            action: () => {
              if (typeof set_magnification === "function") set_magnification(4);
            },
          },
          {
            item: "适应窗口(&W)",
            speech_recognition: [],
            description: "将图片缩放以适应视图。",
            action: () => {
              if (
                typeof $canvas_area === "undefined" ||
                typeof canvas === "undefined" ||
                typeof set_magnification !== "function"
              )
                return;
              const rect = $canvas_area[0].getBoundingClientRect();
              const margin = 30;
              let mag = Math.min(
                (rect.width - margin) / canvas.width,
                (rect.height - margin) / canvas.height
              );
              mag = Math.floor(100 * mag) / 100;
              set_magnification(mag);
            },
          },
          {
            item: "自定义...(&U)",
            description: "缩放图片。",
            speech_recognition: [],
            action: () => {
              if (typeof show_custom_zoom_window === "function")
                show_custom_zoom_window();
            },
          },
          MENU_DIVIDER,
          {
            item: "显示网格线(&G)",
            shortcut: "Ctrl+G",
            speech_recognition: [],
            enabled: () =>
              typeof magnification !== "undefined" && magnification >= 4,
            checkbox: {
              toggle: () => {
                if (typeof toggle_grid === "function") toggle_grid();
              },
              check: () => typeof show_grid !== "undefined" && show_grid,
            },
            description: "显示或隐藏网格线。",
          },
          {
            item: "显示缩略图(&H)",
            speech_recognition: [],
            enabled: false,
            checkbox: {},
            description: "显示或隐藏缩略图。",
          },
        ],
      },
      {
        item: "查看位图(&V)",
        shortcut: "Ctrl+F",
        speech_recognition: [],
        action: () => {
          if (typeof view_bitmap === "function") view_bitmap();
        },
        description: "显示整张图片。",
      },
    ],
    "图像(&I)": [
      {
        item: "翻转/旋转(&F)",
        speech_recognition: [],
        action: () => {
          if (typeof image_flip_and_rotate === "function")
            image_flip_and_rotate();
        },
        description: "翻转或旋转图片或选区。",
      },
      {
        item: "拉伸/扭曲(&S)",
        speech_recognition: [],
        action: () => {
          if (typeof image_stretch_and_skew === "function")
            image_stretch_and_skew();
        },
        description: "拉伸或扭曲图片或选区。",
      },
      {
        item: "反转颜色(&I)",
        shortcut: "Ctrl+I",
        speech_recognition: [],
        action: () => {
          if (typeof image_invert_colors === "function") image_invert_colors();
        },
        description: "反转图片或选区的颜色。",
      },
      {
        item: "属性...(&A)",
        shortcut: "Ctrl+E",
        speech_recognition: [],
        action: () => {
          if (typeof image_attributes === "function") image_attributes();
        },
        description: "更改图片属性。",
      },
      {
        item: "清除图像(&C)",
        shortcut: looksLikeChrome ? undefined : "Ctrl+Shift+N",
        speech_recognition: [],
        action: () => {
          if (
            typeof selection === "undefined" ||
            (!selection && typeof clear === "function")
          )
            clear();
        },
        enabled: () => typeof selection === "undefined" || !selection,
        description: "清除图片。",
      },
      {
        item: "不透明绘图(&D)",
        speech_recognition: [],
        checkbox: {
          toggle: () => {
            if (typeof tool_transparent_mode !== "undefined")
              tool_transparent_mode = !tool_transparent_mode;
            if (typeof $G !== "undefined") $G.trigger("option-changed");
          },
          check: () =>
            typeof tool_transparent_mode !== "undefined" &&
            !tool_transparent_mode,
        },
        description:
          "使当前选区不透明或透明。",
      },
    ],
    "颜色(&C)": [
      {
        item: "编辑颜色...(&E)",
        speech_recognition: [],
        action: () => {
          if (typeof $colorbox !== "undefined") $colorbox.edit_last_color();
        },
        description: "创建新颜色。",
      },
      {
        item: "获取颜色(&G)",
        speech_recognition: [],
        action: () => {
          if (
            typeof get_FileList_from_file_select_dialog !== "function" ||
            typeof Palette === "undefined" ||
            typeof show_error_message !== "function" ||
            typeof $colorbox === "undefined"
          )
            return;
          get_FileList_from_file_select_dialog((files) => {
            const file = files[0];
            Palette.load(file, (err, new_palette) => {
              if (err) {
                show_error_message(
                  "This file is not in a format that paint recognizes, or no colors were found."
                );
              } else {
                palette = new_palette;
                $colorbox.rebuild_palette();
              }
            });
          });
        },
        description: "使用已保存的调色板。",
      },
      {
        item: "保存颜色(&S)",
        speech_recognition: [],
        action: () => {
          if (
            typeof palette === "undefined" ||
            typeof sanity_check_blob !== "function" ||
            typeof saveAs !== "function"
          )
            return;
          const blob = new Blob([JSON.stringify(palette)], {
            type: "application/json",
          });
          sanity_check_blob(blob, () => {
            saveAs(blob, "colors.json");
          });
        },
        description: "将当前调色板保存到文件。",
      },
    ],
    "帮助(&H)": [
      {
        item: "帮助主题(&H)",
        speech_recognition: [],
        action: () => {},
        description: "打开帮助文档。",
      },
      MENU_DIVIDER,

      {
        item: "关于画图(&A)",
        speech_recognition: [],
        action: () => {
          if (window.jspaint_parent_origin) {
            parent.postMessage(
              { xpPaintAction: "requestOpenWinver" },
              window.jspaint_parent_origin
            );
          } else {
            console.error(
              "XP Paint menus: PARENT_ORIGIN not set for About Paint > Winver"
            );
          }
        },
        description: "显示此应用程序的相关信息。",
      },
    ],
  };
})();
