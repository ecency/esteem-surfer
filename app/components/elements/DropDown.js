// @flow
import React, {Component} from 'react';
import styles from './DropDown.less';
import {Dropdown as RealDropDown} from 'antd';
import Mi from './Mi'

type Props = {
    menu: object
};

export default class DropDown extends Component<Props> {
    props: Props;


    constructor(props) {
        super(props);

        this.state = {
            hover: false
        }
    }

    visibleChanged(e) {
        this.setState({hover: e});
    }

    render() {

        let caretClassName = styles.caret;

        if (this.state.hover) {
            caretClassName += ' ' + styles.hover;
        }

        return (
            <RealDropDown overlay={this.props.menu} onVisibleChange={this.visibleChanged.bind(this)}>
                <span className={caretClassName}><Mi icon="arrow_drop_down"/></span>
            </RealDropDown>
        )
    }
}
