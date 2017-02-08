import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import React, { PropTypes, Component } from 'react';
import { Checkbox, Button, Modal, Header, Form, Icon, Divider } from 'semantic-ui-react';
import { WithContext as ReactTags } from 'react-tag-input';

import { Organizations } from '/imports/organizations';

class TemplatePermissionsFormModal extends Component {
  static propTypes = {
    template: PropTypes.shape({
      title: PropTypes.string.isRequired,
      editors: PropTypes.arrayOf(PropTypes.string),
      viewers: PropTypes.arrayOf(PropTypes.string),
    }),
    users: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      emails: PropTypes.arrayOf(PropTypes.shape({
        address: PropTypes.string.isRequired,
      })),
    })),
    organization: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    trigger: PropTypes.element.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
  };

  static defaultProps = {
    template: null,
    users: null,
    organization: null,
  };

  constructor(props) {
    super(props);

    const { editors, viewers } = props.template;
    this.state = {
      editors,
      viewers,
    };
  }

  userIDToTag = userID => ({
    id: userID,
    text: this.props.users.find(u => u._id === userID).emails[0].address,
  });

  isRestricted() {
    return !!this.state.editors && !!this.state.viewers;
  }

  toggleRestricted = () => {
    if (this.isRestricted()) {
      return this.setState({
        editors: null,
        viewers: null,
      });
    }

    return this.setState({
      editors: [Meteor.user()._id],
      viewers: [],
    });
  };

  changeRestriction = restricted => {
    if (restricted) {
      return this.setState({
        editors: [Meteor.user()._id],
        viewers: [Meteor.user()._id],
      });
    }

    return this.setState({
      editors: null,
      viewers: null,
    });
  };

  addEditor = editor => {
    const user = this.props.users.find(u => u.emails[0].address === editor);
    if (!user) {
      return;
    }
    const userID = user._id;
    if (this.state.editors.includes(userID)) {
      return;
    }

    this.setState({
      editors: this.state.editors.concat([userID]),
      viewers: this.state.viewers.filter(v => v !== userID),
    });
  };

  addViewer = viewer => {
    const user = this.props.users.find(u => u.emails[0].address === viewer);
    if (!user) {
      return;
    }

    const userID = user._id;
    if (this.state.editors.concat(this.state.viewers).includes(userID)) {
      return;
    }

    this.setState({
      viewers: this.state.viewers.concat([userID]),
    });
  };

  removeEditor = index => {
    const id = this.state.editors[index];
    if (id === Meteor.user()._id) {
      return;
    }

    this.setState({
      editors: this.state.editors.filter(e => e !== id),
    });
  };

  removeViewer = index => {
    const id = this.state.viewers[index];
    this.setState({
      viewers: this.state.viewers.filter(e => e !== id),
    });
  };

  nonEditors() {
    return this.props.users.filter(user => (
      !this.state.editors.includes(user._id)
    ));
  }

  nonViewers() {
    return this.props.users.filter(user => (
      !(this.state.viewers.concat(this.state.editors).includes(user._id))
    ));
  }

  savePermissions = () => {
    this.props.onSave(this.state);
  };

  render() {
    const {
      trigger,
      open,
      onClose,
      template,
      organization,
    } = this.props;

    if (!organization) {
      // while organization is still loading,
      // still display the trigger but don't render anything else
      return trigger;
    }

    const {
      editors,
      viewers,
    } = this.state;

    const form = this.isRestricted() ? (
      <div>
        <Divider horizontal>Permissions</Divider>
        <Header sub>Editors</Header>
        <ReactTags
          classNames={{
            tags: 'ui blue labels',
            tag: 'ui label',
            tagInput: 'ui input',
          }}
          autocomplete
          suggestions={this.nonEditors().map(u => u.emails[0].address)}
          tags={editors && editors.map(this.userIDToTag)}
          handleAddition={this.addEditor}
          handleDelete={this.removeEditor}
        />

        <Header sub>Viewers</Header>
        <ReactTags
          classNames={{
            tags: 'ui blue labels',
            tag: 'ui label',
            tagInput: 'ui input',
          }}
          autocomplete
          suggestions={this.nonViewers().map(u => u.emails[0].address)}
          tags={viewers && viewers.map(this.userIDToTag)}
          handleAddition={this.addViewer}
          handleDelete={this.removeViewer}
        />
      </div>
    ) : null;

    return (
      <Modal
        trigger={trigger}
        open={open}
        onClose={onClose}
        size="small"
      >
        <Header>
          <Icon name="lock" />
          Permissions for Template &ldquo;{template.title}&rdquo;
        </Header>
        <Modal.Content>
          <Form>
            <Checkbox
              onChange={this.toggleRestricted}
              checked={!this.isRestricted()}
              toggle
              label={`Allow anyone with adequate permissions in ${organization.name} to edit ${template.title}`}
            />
            {form}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button basic onClick={onClose}>Cancel</Button>
          <Button basic color="green" onClick={this.savePermissions}>
            <Icon name="save" />Save
          </Button>
        </Modal.Actions>
      </Modal>

    );
  }
}

export default createContainer(() => {
  Meteor.subscribe('users');
  Meteor.subscribe('organizations');
  const user = Meteor.user();

  return {
    users: Meteor.users.find({ organizationID: user.organizationID }).fetch(),
    organization: user && Organizations.findOne(user.organizationID),
  };
}, TemplatePermissionsFormModal);
