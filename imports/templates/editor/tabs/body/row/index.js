import React, { Component, PropTypes } from 'react';

export default class Row extends Component {
  static propTypes = {
    row: PropTypes.shape({
      _id: PropTypes.string.isRequired,
    }).isRequired,
    onFocusContent: PropTypes.func.isRequired,
  };

  focusRow = () => {
    this.props.onFocusContent('row', this.props.row);
  }

  render() {
    const { row } = this.props;
    return (
      <div className="fit" onClick={this.focusRow}>
        {row._id}
      </div>
    );
  }
}
