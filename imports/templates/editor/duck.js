const SELECT_TOOL = 'editor/select-tool';

export default function editorReducer(state = {}, { type, payload }) {
  switch (type) {
    case SELECT_TOOL: {
      const validTools = [
        'draw-image',
      ];

      if (!validTools.includes(payload)) {
        console.error('Tried to select invalid tool:', payload);
        return state;
      }
      return {
        ...state,
        tool: payload,
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
