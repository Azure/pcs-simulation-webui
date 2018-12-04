// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import Svgs from 'svgs';
import { Btn, BtnToolbar, Modal } from 'components/shared';

import './deleteModal.scss';

export const DeleteModal = ({ t, onClose, deviceModelId, onDelete }) => (
  <Modal onClose={onClose}>
    <div className="delete-modal-container">
      <div className="delete-modal-header">
        {t('deviceModels.flyouts.delete.header')}
        <Btn svg={Svgs.X} className="modal-icon" onClick={onClose} />
      </div>
      <div className="delete-modal-content">
      {t('deviceModels.flyouts.delete.description', { deviceModelId })}
      </div>
      <BtnToolbar>
        <Btn svg={Svgs.Trash} onClick={onDelete}>
          {t('deviceModels.flyouts.delete.apply')}
        </Btn>
        <Btn svg={Svgs.CancelX} onClick={onClose}>{t('deviceModels.flyouts.cancel')}</Btn>
      </BtnToolbar>
    </div>
  </Modal>
);
