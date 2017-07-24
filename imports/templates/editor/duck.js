const SELECT_TOOL = 'editor/select-tool';
const LOAD_TEMPLATE = 'editor/load-template';
const HOVER_ITEM = 'editor/items/hovered';
const SELECT_ITEM = 'editor/items/selected';
const ENTER_UNGUIDED_MODE = 'editor/modes/guided/off';
const ENTER_GUIDED_MODE = 'editor/modes/guided/on';
const ENTER_LOCKED_MODE = 'editor/modes/locked/on';
const ENTER_UNLOCKED_MODE = 'editor/modes/locked/off';
const OPEN_RENDER_PREVIEW = 'editor/renders/preview/open';
const CLOSE_RENDER_PREVIEW = 'editor/renders/preview/close';

const initialState = {
  tool: null,
  templateHeight: 300,
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
      return {
        ...state,
        selectedItemPath: payload,
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

export function selectItem(path) {
  return {
    type: SELECT_ITEM,
    payload: path,
  };
}


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
