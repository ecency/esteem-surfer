import React, {Component, Fragment} from 'react';
import PropTypes from "prop-types";
import Login from '../dialogs/Login'
import {Modal} from "antd";


class LoginRequired extends Component {


  constructor(props) {
    super(props);

    this.state = {
      loginModalVisible: false
    };
  }


  showLoginModal = () => {

    console.log("aaa")
    this.setState({
      loginModalVisible: true
    });
  };

  onLoginModalCancel = () => {
    this.setState({
      loginModalVisible: false
    });
  };

  onLoginSuccess = () => {
    this.setState({
      loginModalVisible: false
    });
  };

  render() {
    const {children, activeAccount, requiredKeys} = this.props;
    const {loginModalVisible} = this.state;

    if (activeAccount) {
      return children
    }


    const newChild = React.cloneElement(children, {
      onClick: () => {
        this.showLoginModal()
      }
    });

    return (
      <Fragment>
        {newChild}

        <Modal
          visible={loginModalVisible}
          onCancel={this.onLoginModalCancel}
          footer={false}
          width="500px"
          closable={false}
          destroyOnClose
          centered
        >
          <Login {...this.props} onSuccess={this.onLoginSuccess}/>
        </Modal>
      </Fragment>
    )
  }
}

LoginRequired.defaultProps = {
  activeAccount: null,
};


LoginRequired.propTypes = {
  children: PropTypes.element.isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  requiredKeys: PropTypes.array.isRequired
};

export default LoginRequired;
