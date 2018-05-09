// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { joinClasses } from 'utilities';

import './modal.css';

export class Modal extends Component {

  componentDidMount() {
    if (this.props.onClose) {
      window.addEventListener('keydown', this.listenKeyboard.bind(this), true);
    }
  }

  componentWillUnmount() {
    if (this.props.onClose) {
      window.removeEventListener('keydown', this.listenKeyboard.bind(this), true);
    }
  }

  listenKeyboard(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      this.props.onClose();
    }
  }

  onOverlayClick() {
    this.props.onClose();
  }

  onDialogClick(event) {
    event.stopPropagation();
  }

  render() {
    const { children, className } = this.props;
    return  (
      <div className={joinClasses('modal-container', className)}>
        <div className="modal-overlay" />
        <div className="modal-content" onClick={this.onOverlayClick.bind(this)}>
          <div className="modal-dialog" onClick={this.onDialogClick}>
            { children }
          </div>
        </div>
      </div>
    );
  }
}
