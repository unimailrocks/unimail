const SELECT_TOOL = 'editor/select-tool';
const LOAD_TEMPLATE = 'editor/load-template';
const ENTER_UNGUIDED_MODE = 'editor/modes/guided/off';
const ENTER_GUIDED_MODE = 'editor/modes/guided/on';

const initialState = {
  tool: null,
  templateHeight: 300,
  modes: {
    guided: true,
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
