// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { LinkedComponent } from 'utilities';
import {
  Flyout,
  FlyoutHeader,
  FlyoutTitle,
  FlyoutCloseBtn,
  FlyoutContent,
  FormGroup,
  FormLabel,
  Radio
} from 'components/shared';
import {
  DeviceJobTags,
  DeviceJobMethods,
  DeviceJobProperties
} from './';

import './jobs.scss';

export class Jobs extends LinkedComponent {
  constructor(props) {
    super(props);
    this.state = {
      isPending: false,
      error: undefined,
      successCount: 0,
      changesApplied: false,
      formData: {
        jobType: 'tags'
      }
    };

    // Linked components
    this.formDataLink = this.linkTo('formData');

    this.jobTypeLink = this.formDataLink.forkTo('jobType');
  }

  render() {
    const {
      t,
      onClose,
      devices,
      updateTags,
      updateProperties
    } = this.props;

    return (
      <Flyout>
        <FlyoutHeader>
          <FlyoutTitle>{t('devices.flyouts.jobs.title')}</FlyoutTitle>
          <FlyoutCloseBtn onClick={onClose} />
        </FlyoutHeader>
        <FlyoutContent>
          <div className="device-jobs-container">
            <FormGroup>
              <FormLabel>{t('devices.flyouts.jobs.selectJob')}</FormLabel>
              <Radio link={this.jobTypeLink} value="tags">
                {t('devices.flyouts.jobs.tags.radioLabel')}
              </Radio>
              <Radio link={this.jobTypeLink} value="methods">
                {t('devices.flyouts.jobs.methods.radioLabel')}
              </Radio>
              <Radio link={this.jobTypeLink} value="properties">
                {t('devices.flyouts.jobs.properties.radioLabel')}
              </Radio>
            </FormGroup>
            {
              this.jobTypeLink.value === 'tags' &&
              <DeviceJobTags key="job-details" t={t} onClose={onClose} devices={devices} updateTags={updateTags} />
            }
            {
              this.jobTypeLink.value === 'methods' &&
              <DeviceJobMethods key="job-details" t={t} onClose={onClose} devices={devices} />
            }
            {
              this.jobTypeLink.value === 'properties' &&
              <DeviceJobProperties key="job-details" t={t} onClose={onClose} devices={devices} updateProperties={updateProperties} />
            }
          </div>
        </FlyoutContent>
      </Flyout>
    );
  }
}
