import { isEqual, reject, partition } from 'lodash/fp';
import * as Templates from '/imports/templates/methods';

const SELECT_TOOL = 'editor/select-tool';
const LOAD_TEMPLATE = 'editor/load-template';
const HOVER_ITEM = 'editor/items/hovered';
const SELECT_ITEM = 'editor/items/selected/add';
const UNSELECT_ITEM = 'editor/items/selected/remove';
const UNSELECT_ALL_ITEMS = 'editor/items/selected/clear';
const ENTER_UNGUIDED_MODE = 'editor/modes/guided/off';
const ENTER_GUIDED_MODE = 'editor/modes/guided/on';
const ENTER_LOCKED_MODE = 'editor/modes/locked/on';
const ENTER_UNLOCKED_MODE = 'editor/modes/locked/off';
const OPEN_RENDER_PREVIEW = 'editor/renders/preview/open';
const CLOSE_RENDER_PREVIEW = 'editor/renders/preview/close';
const START_DELETE = 'editor/items/modes/deletion/on';
const CANCEL_DELETE = 'editor/items/modes/deletion/off';
const CONFIRM_DELETE = 'editor/items/selected/delete';
const SHIELD_KEYS = 'editor/modes/shield-keys/on';
const UNSHIELD_KEYS = 'editor/modes/shield-keys/off';
const PREVIEW_STYLES = 'editor/styles/preview/change';

const initialState = {
  tool: null,
  templateHeight: 300,
  selectedItemPaths: [],
  deleting: false,
  modes: {
    guided: true,
    locked: false,
    shieldKeys: false,
  },
  template: null,
  // for things that shouldn't be committed yet but the UI
  // should reflect an optimistic version
  previewing: {
    styles: [],
  },
};

export default function editorReducer(state = initialState, { type, payload }) {
  switch (type) {
    case SELECT_TOOL: {
      const validTools = [
        'draw-image',
        'draw-container',
        'select-box',
      ];

      if (payload && !validTools.includes(payload)) {
        console.error('Tried to select invalid tool:', payload);
        return state;
      }
      return {
        ...state,
        tool: payload,
      };
    }

    case LOAD_TEMPLATE: {
      // TODO calculate height to render
      return {
        ...state,
        template: payload,
      };
    }

    case HOVER_ITEM: {
      return {
        ...state,
        hoveredItemPath: payload,
      };
    }

    case SELECT_ITEM: {
      // yes, I recognize that in pretty much all cases the first condition is sufficient
      // give me a break
      if (!payload || !payload.length || payload.length === 0) {
        throw new Error(`Item path must be a non-empty array. Got ${JSON.stringify(payload)}`);
      }

      if (state.deleting) {
        return state;
      }

      const hasItem = state.selectedItemPaths.find(isEqual(payload));
      if (hasItem) {
        return state;
      }

      return {
        ...state,
        selectedItemPaths: [...state.selectedItemPaths, payload],
      };
    }

    case UNSELECT_ITEM: {
      if (state.deleting) {
        return state;
      }

      return {
        ...state,
        selectedItemPaths: reject(isEqual(payload))(state.selectedItemPaths),
      };
    }

    case START_DELETE: {
      if (state.selectedItemPaths.length === 0) {
        return state;
      }

      return {
        ...state,
        deleting: true,
      };
    }

    case CANCEL_DELETE: {
      return {
        ...state,
        deleting: false,
      };
    }

    case CONFIRM_DELETE: {
      return {
        ...state,
        selectedItemPaths: [],
        deleting: false,
      };
    }

    case UNSELECT_ALL_ITEMS: {
      if (state.deleting) {
        return state;
      }

      return {
        ...state,
        selectedItemPaths: [],
      };
    }

    case ENTER_UNGUIDED_MODE: {
      return {
        ...state,
        modes: {
          ...state.modes,
          guided: false,
        },
      };
    }
    case ENTER_GUIDED_MODE: {
      return {
        ...state,
        modes: {
          ...state.modes,
          guided: true,
        },
      };
    }

    case ENTER_UNLOCKED_MODE: {
      return {
        ...state,
        modes: {
          ...state.modes,
          locked: false,
        },
      };
    }

    case ENTER_LOCKED_MODE: {
      return {
        ...state,
        modes: {
          ...state.modes,
          locked: true,
        },
      };
    }

    case SHIELD_KEYS: {
      return {
        ...state,
        modes: {
          ...state.modes,
          shieldKeys: true,
        },
      };
    }

    case UNSHIELD_KEYS: {
      return {
        ...state,
        modes: {
          ...state.modes,
          shieldKeys: false,
        },
      };
    }

    case OPEN_RENDER_PREVIEW: {
      return {
        ...state,
        previewingRender: payload.render,
      };
    }

    case CLOSE_RENDER_PREVIEW: {
      return {
        ...state,
        previewingRender: null,
      };
    }

    case PREVIEW_STYLES: {
      const { style, path } = payload;
      const newStyles = (styles => {
        const [[currentPathStyle], withoutCurrent] = partition(
          s => isEqual(s.path, path),
        )(styles);

        // allows you to remove styles by passing `null` as a value
        const newStyle = reject(x => !x, {
          ...(currentPathStyle || {}),
          ...style,
        });

        return [
          ...withoutCurrent,
          newStyle,
        ];
      })(state.previews.styles);

      return {
        ...state,
        previews: {
          ...state.previews,
          styles: newStyles,
        },
      };
    }

    default:
      return state;
  }
}

export function selectTool(tool) {
  return {
    type: SELECT_TOOL,
    payload: tool,
  };
}

export function hoverItem(path) {
  return {
    type: HOVER_ITEM,
    payload: path,
  };
}

export const items = {
  select(path) {
    return {
      type: SELECT_ITEM,
      payload: path,
    };
  },
  unselect(path) {
    return {
      type: UNSELECT_ITEM,
      payload: path,
    };
  },
  unselectAll() {
    return {
      type: UNSELECT_ALL_ITEMS,
    };
  },
};

// when template is first loaded
export function registerTemplate(template) {
  return {
    type: LOAD_TEMPLATE,
    payload: template,
  };
}

export function enterUnguidedMode() {
  return {
    type: ENTER_UNGUIDED_MODE,
  };
}

export function enterGuidedMode() {
  return {
    type: ENTER_GUIDED_MODE,
  };
}

export function enterUnlockedMode() {
  return {
    type: ENTER_UNLOCKED_MODE,
  };
}

export function enterLockedMode() {
  return {
    type: ENTER_LOCKED_MODE,
  };
}

export function openRenderPreview(render) {
  return {
    type: OPEN_RENDER_PREVIEW,
    payload: {
      render,
    },
  };
}

export function closeRenderPreview() {
  return {
    type: CLOSE_RENDER_PREVIEW,
  };
}

export function tryDelete() {
  return async (dispatch, getState) => {
    const { editor } = getState();
    const templateID = editor.template._id;
    if (editor.deleting) {
      await Promise.all(editor.selectedItemPaths.map(path => (
        Templates.Items.destroyItem.call({ path, templateID })
      )));

      dispatch({ type: CONFIRM_DELETE });
    } else {
      dispatch({ type: START_DELETE });
    }
  };
}

export function shieldKeys() {
  return {
    type: SHIELD_KEYS,
  };
}

export function unshieldKeys() {
  return {
    type: UNSHIELD_KEYS,
  };
}

export function cancelDelete() {
  return { type: CANCEL_DELETE };
}

export function previewStyles({ path, styles }) {
  return {
    type: PREVIEW_STYLES,
    payload: {
      path,
      styles,
    },
  };
}
