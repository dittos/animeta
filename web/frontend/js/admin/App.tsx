import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  Button,
  Form,
  Navbar,
  Nav,
  NavDropdown,
  Container,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Loading from './Loading';
import Login from './Login';
import * as API from './ApiClient';
import { API as ApiClient } from './ApiClient';
import { WorkAddForm } from './WorkAddForm';

type State = {
  isLoading: boolean;
  currentUser: { name: string } | null;
}

class App extends React.Component<RouteComponentProps, State> {
  state: State = {
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
          <Navbar bg="light" expand="lg">
            <Navbar.Brand>
              <Link to="/">animeta</Link>
            </Navbar.Brand>
            <Nav className="mr-auto">
              <LinkContainer to="/works"><Nav.Link>Works</Nav.Link></LinkContainer>
              <LinkContainer to="/people"><Nav.Link>People</Nav.Link></LinkContainer>
              <LinkContainer to="/companies"><Nav.Link>Companies</Nav.Link></LinkContainer>
            </Nav>
            <Form inline className="mr-sm-3">
              <Button onClick={this._clearCache}>Clear cache</Button>
            </Form>
            <WorkAddForm />
            <Nav>
              <NavDropdown
                id="navbar-user-dropdown"
                title={this.state.currentUser.name}
              >
                <NavDropdown.Item onSelect={this._logout}>Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar>

          <Container className="py-sm-3">{this.props.children}</Container>
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

  _clearCache = () => {
    ApiClient.call('/api/admin/v1/clearCache', {}).then(() => alert('Clear cache ok'));
  };
}

export default withRouter(App);
