import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Grid, Container, Header, Input, Statistic, Segment } from 'semantic-ui-react';
import { Organizations } from '/imports/organizations';
import AdminOrganizationsList from './list';

const searchValue = new ReactiveVar('');

class AdminOrganizationsPage extends Component {
  searchChanged = event => {
    searchValue.set(event.target.value);
  };

  addNewOrganization = async () => {
    const { value } = this.newOrgInput;
    if (value.length === 0) {
      return;
    }

    try {
      await Meteor.callPromise('organizations.create', value);
    } catch (e) {
      console.error('Error creating organization:', e.message);
    }
    this.newOrgInput.value = '';
  };

  newOrgInputKeyDown = e => {
    if (e.key === 'Enter') {
      this.addNewOrganization();
    }
  };

  render() {
    return (
      <Container>
        <Segment textAlign="center" basic>
          <Header as="h1">
            Admin Organizations page
          </Header>
          <Statistic>
            <Statistic.Value>{this.props.numOrganizations}</Statistic.Value>
            <Statistic.Label>Organizations</Statistic.Label>
          </Statistic>
        </Segment>
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column textAlign="left">
              {/* use semantic ui directly */}
              <div className="ui action input">
                <input
                  type="text"
                  placeholder="New Organization Name"
                  ref={r => { this.newOrgInput = r; }}
                  onKeyDown={this.newOrgInputKeyDown}
                />
                <button
                  className="ui icon button"
                  onClick={this.addNewOrganization}
                >
                  <i className="plus icon" />
                </button>
              </div>
            </Grid.Column>
            <Grid.Column textAlign="right">
              <Input onChange={this.searchChanged} icon="search" placeholder="Search..." />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <AdminOrganizationsList organizations={this.props.organizations} />
      </Container>
    );
  }
}

AdminOrganizationsPage.propTypes = {
  organizations: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  numOrganizations: PropTypes.number.isRequired,
};

export default createContainer(() => {
  Meteor.subscribe('organizations');

  return {
    numOrganizations: Organizations.find().count(),
    organizations: Organizations.find({
      name: { $regex: searchValue.get() },
    }, {
      limit: 20,
    }).fetch(),
  };
}, AdminOrganizationsPage);
