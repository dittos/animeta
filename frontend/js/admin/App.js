import * as React from 'react';
import { Link, withRouter } from 'react-router-dom';
import {
  Button,
  FormGroup,
  Navbar,
  Nav,
  NavDropdown,
  MenuItem,
  Grid,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Loading from './Loading';
import Login from './Login';
import TitleAutosuggest from './TitleAutosuggest';
import * as API from './API';
import { NavItem } from 'react-bootstrap/lib';

class App extends React.Component {
  state = {
    isLoading: true,
    currentUser: null,
  };

  componentDidMount() {
    API.loadSession();
    if (API.hasSession()) {
      API.getCurrentUser().then(
        currentUser => {
          this.setState({
            isLoading: false,
            currentUser,
          });
        },
        () => {
          this.setState({ isLoading: false });
        }
      );
    } else {
      this.setState({ isLoading: false });
    }
  }

  render() {
    if (this.state.isLoading) {
      return <Loading />;
    }

    if (this.state.currentUser) {
      return (
        <div>
          <Navbar>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to="/">animeta</Link>
              </Navbar.Brand>
            </Navbar.Header>
            <Nav>
              <LinkContainer to="/works"><NavItem>Works</NavItem></LinkContainer>
              <LinkContainer to="/people"><NavItem>People</NavItem></LinkContainer>
            </Nav>
            <Nav pullRight>
              <NavDropdown
                id="navbar-user-dropdown"
                title={this.state.currentUser.name}
              >
                <MenuItem onSelect={this._logout}>Logout</MenuItem>
              </NavDropdown>
            </Nav>
            <Navbar.Form pullRight>
              <FormGroup>
                <TitleAutosuggest
                  onSelected={this._onTitleSelected}
                  ref="titleSearch"
                />
              </FormGroup>{' '}
              <Button onClick={this._addWork}>Add work</Button>
            </Navbar.Form>
            <Navbar.Form pullRight>
              <Button onClick={this._clearCache}>Clear cache</Button>
            </Navbar.Form>
          </Navbar>

          <Grid>{this.props.children}</Grid>
        </div>
      );
    } else {
      return <Login onLogin={this._login} />;
    }
  }

  _login = async () => {
    this.setState({ currentUser: await API.getCurrentUser() });
  };

  _logout = () => {
    API.clearSession();
    this.setState({ currentUser: null });
  };

  _onTitleSelected = item => {
    this.props.history.push(`/works/${item.id}`);
    this.refs.titleSearch.clear();
  };

  _addWork = () => {
    const title = this.refs.titleSearch.getValue();
    API.createWork(title).then(work => {
      this.props.history.push(`/works/${work.id}`);
    });
  };

  _clearCache = () => {
    API.clearCache().then(() => alert('Clear cache ok'));
  };
}

export default withRouter(App);
