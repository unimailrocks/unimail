import { isEqual, reject } from 'lodash/fp';

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

const initialState = {
  tool: null,
  templateHeight: 300,
  selectedItemPaths: [],
  modes: {
    guided: true,
    locked: false,
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
      console.log('selecting');
      if (!payload || !payload.length || payload.length === 0) {
        throw new Error(`Item path must be a non-empty array. Got ${JSON.stringify(payload)}`);
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
      return {
        ...state,
        selectedItemPaths: reject(isEqual(payload))(state.selectedItemPaths),
      };
    }

    case UNSELECT_ALL_ITEMS: {
      console.log('droppem');
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
