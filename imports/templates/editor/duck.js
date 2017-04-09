const SELECT_TOOL = 'editor/select-tool';
const LOAD_TEMPLATE = 'editor/load-template';

const initialState = {
  tool: null,
  templateHeight: 300,
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
      return state;
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
