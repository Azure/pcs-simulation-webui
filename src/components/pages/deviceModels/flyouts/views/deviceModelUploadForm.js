// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { isEqual, isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { SimulationScriptsService } from 'services';
import { svgs } from 'utilities';
import {
  Btn,
  BtnToolbar,
  ErrorMsg,
  FormActions,
  FormGroup,
  FormLabel,
  FormSection,
  Indicator
} from 'components/shared';

import './deviceModelForm.css';

const initialFormState = {
  deviceModel: undefined,
  scripts: [],
  fileMismatching: false
};

class DeviceModelUploadForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...initialFormState,
      formVersion: 0
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { scripts } = this.state;

    if (scripts.length > 0 && scripts.some(({ validationResult }) => !validationResult)) {
      Observable.from(scripts)
        .filter(({ validation = {} }) => !validation.success)
        .flatMap(({ file }) =>
          SimulationScriptsService.validateSimulationScript(file)
            .map(validationResult => ({ file, validationResult }))
            .catch(error => {
              return Observable.of({
                file,
                validationResult: {
                  success: false,
                  messages: [error.ajaxError.response.Messages]
                }
              });
            })
        )
        .reduce((scripts, script) => [...scripts, script], [])
        .subscribe(scripts => {
          this.setState({
            scripts: [
              ...this.state.scripts.filter(({ validationResult }) => (validationResult || {}).success),
              ...scripts
            ]
          });
        });
    }
  }

  uploadFiles = ({ target: value }) => {
    const files = [];
    for (let i = 0; i < value.files.length; i++) files.push(value.files[i]);
    const result = this.filesSanityCheck(files);
    this.setState({ ...initialFormState, fileMismatching: !result });
  };

  filesSanityCheck = (files = []) => {
    if (files.length === 0) return false;
    const jsonFiles = files.filter(file => file.type === 'application/json');

    // Allow one json file only per device model
    if (jsonFiles.length !== 1) return false;
    const [jsonFile] = jsonFiles;
    const scripts = files.filter(file => file.type === 'application/javascript');
    // Require at least one js file from user
    if (scripts.length < 1) return false;

    const uploadedScriptNames = new Set(scripts.map(({ name }) => name));

    // Parse json file
    this.readFileAsText(jsonFile)
      .then(content => {
        const deviceModel = JSON.parse(content);
        const { CloudToDeviceMethods = {}, Simulation: { Scripts } = { Scripts: [] } } = deviceModel;
        const requiredScripts = [...Object.values(CloudToDeviceMethods), ...Scripts];
        const requiredScriptNames = new Set(requiredScripts.map(({ Path }) => Path));
        if (!isEqual(requiredScriptNames, uploadedScriptNames)) {
          this.setState({
            fileMismatching: true
          });
        } else {
          this.setState({
            deviceModel,
            scripts: scripts.map(file => ({
              file,
              validationResult: undefined
            }))
          });
        }
      })
      .catch(e => {
        // TODO: show error message to user
        console.warn(e.message);
      });
  };

  readFileAsText = file => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException('Problem parsing input file.'));
      };

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.readAsText(file);
    });
  };

  formIsValid() {
    const { deviceModel, scripts } = this.state;
    return !isEmpty(deviceModel) && scripts.every(({ validationResult }) => (validationResult || {}).success);
  }

  apply = event => {
    event.preventDefault();
    const { deviceModel, scripts } = this.state;

    // Uploading scripts
    Observable.from(scripts)
      .flatMap(({ file }) => SimulationScriptsService.uploadsSimulationScript(file).catch(error => console.log(error)))
      .reduce((scripts, script) => ({ ...scripts, [script.name]: script }), {})
      .map(scripts => {
        const {
          CloudToDeviceMethods = {},
          Simulation: { Scripts }
        } = deviceModel;

        // Mapping methods with storage id
        const methods = Object.keys(CloudToDeviceMethods)
          .map(key => {
            const fileName = CloudToDeviceMethods[key].Path;
            const script = scripts[fileName];
            return {
              [key]: {
                Id: script.id,
                Path: 'Storage',
                Type: 'javascript'
              }
            };
          })
          .reduce((methods, method) => ({ ...methods, ...method }), {});

        // Mapping behavior scripts with storage id
        const simulationScripts = Scripts.map(({ Path }) => ({
          Id: scripts[Path].id,
          Path: 'Storage',
          Type: 'javascript'
        }));

        // Update the device model with uploaded scripts
        const model = {
          ...deviceModel,
          Simulation: {
            ...deviceModel.Simulation,
            Scripts: simulationScripts
          },
          CloudToDeviceMethods: methods
        };

        // Create the device model in storage
        return this.props.uploadDeviceModel(model);
      })
      .subscribe(response => {
        // TODO: Decide to show success message or not
      });
  };

  clearAll = () => {
    const formVersion = this.state.formVersion + 1;
    this.setState({ ...initialFormState, formVersion });
  };

  render() {
    const { t } = this.props;
    const { deviceModel, scripts, changesApplied, formVersion, fileMismatching } = this.state;
    const showError = fileMismatching && !deviceModel && scripts.length === 0;
    return (
      <form key={`device-model-form-${formVersion}`} onSubmit={this.apply} className="device-model-form-container">
        <FormSection>
          <FormLabel>{t('deviceModels.flyouts.upload.create')}</FormLabel>
        </FormSection>
        <FormSection>
          <FormLabel>{t('deviceModels.flyouts.upload.files')}</FormLabel>
          <div className="file-uploader-container">
            <input
              className="file-uploader"
              type="file"
              id="uploader"
              name="uploader"
              accept=".json, .js"
              multiple
              onChange={this.uploadFiles}
            />
            <label htmlFor="fileUpload">{t('deviceModels.flyouts.upload.browse')}</label>
          </div>
        </FormSection>
        <FormSection>
          {this.state.deviceModel && (
            <FormGroup>
              <FormLabel>{t('deviceModels.flyouts.new.name')}</FormLabel>
              <div>{deviceModel.Name}</div>
            </FormGroup>
          )}
          {scripts.length > 0 && (
            <FormGroup>
              <FormLabel>{t('deviceModels.flyouts.upload.uploadedFiles')}</FormLabel>
              {this.state.scripts
                .sort((a, b) => a.file.name.localeCompare(b.file.name))
                .map(({ file, validationResult = {} }, idx) => (
                  <div key={`script-${idx}`} className="upload-results-container">
                    <div className="file-name">{file.name}</div>
                    <div className={`validation-result ${validationResult.success ? 'success-result' : 'failed-result'}`}>
                      {validationResult.success === undefined ? (
                        <Indicator size="mini" />
                      ) : validationResult.success ? (
                        '\u2714'
                      ) : (
                        '\u2716'
                      )}
                    </div>
                    <div className="validation-message">
                      {(validationResult.messages || []).map((error, idx) => (
                        <ErrorMsg key={`script-error-${idx}`}>{error}</ErrorMsg>
                      ))}
                    </div>
                  </div>
                ))}
            </FormGroup>
          )}
        </FormSection>
        {showError && <ErrorMsg>{t('deviceModels.flyouts.upload.errorMsg')}</ErrorMsg>}
        <FormActions>
          <BtnToolbar>
            <Btn disabled={!this.formIsValid() || changesApplied} type="submit">
              {t('deviceModels.flyouts.save')}
            </Btn>
            <Btn svg={svgs.cancelX} onClick={this.clearAll}>
              {t('deviceModels.flyouts.clearAll')}
            </Btn>
          </BtnToolbar>
        </FormActions>
      </form>
    );
  }
}

export default DeviceModelUploadForm;
