// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { isEqual, isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { DeviceModelScriptsService } from 'services';
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
  error: undefined
};

class DeviceModelUploadForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...initialFormState,
      formVersion: 0
    };

    this.subscriptions = [];
  }

  componentDidUpdate(prevProps, prevState) {
    const { scripts } = this.state;

    if (scripts.length > 0 && scripts.some(({ validationResult }) => !validationResult)) {
      const validationSubscrition = Observable.from(scripts)
        .filter(({ validation = {} }) => !validation.isValid)
        .flatMap(({ file }) =>
          DeviceModelScriptsService.validateDeviceModelScript(file)
            .map(validationResult => ({ file, validationResult }))
            .catch(error => {
              const { ajaxError: { response: { Messages = [] } } = { response: {} } } = error;

              return Observable.of({
                file,
                validationResult: {
                  isValid: false,
                  messages: [Messages]
                }
              });
            })
        )
        .toArray()
        .subscribe(scripts => {
          this.setState({
            scripts: [
              ...scripts
            ]
          });
        });

      this.subscriptions.push(
        validationSubscrition
      );
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  uploadFiles = e => {
    e.preventDefault();
    this.clearAll();
    const { target: value } = e;
    const { t } = this.props;

    this.filesSanityCheck(Object.values((value || {}).files || {}), t).subscribe(
      ({ deviceModel, scriptFiles, error, jsonFile, missingScripts }) => {
        this.setState({
          error,
          deviceModel,
          jsonFile,
          missingScripts,
          scripts: (scriptFiles || []).map(file => ({
            file,
            validationResult: undefined
          }))
        });
      },
      error => this.setState({ error })
    );
  };

  filesSanityCheck = (files = [], t) =>
    Observable.from(files)
      .reduce(
        (acc, file) => {
          if (file.type === 'application/json') {
            acc.jsonFiles.push(file);
          } else if (file.type === 'text/javascript' || file.name.endsWith('.js')) {
            acc.scriptFiles.push(file);
          }
          return acc;
        },
        { jsonFiles: [], scriptFiles: [] }
      )
      .flatMap(({ jsonFiles, scriptFiles }) => {
        if (jsonFiles.length < 1) {
          return Observable.throw(t('deviceModels.flyouts.upload.missingJsonFileErrorMessage'));
        }

        if (jsonFiles.length > 1) {
          return Observable.throw(t('deviceModels.flyouts.upload.tooManyJsonFilesErrorMessage'));
        }

        return this.readFileAsText(jsonFiles[0]).map(content => {
          let deviceModel = null;

          try {
            deviceModel = JSON.parse(content);
          }
          catch (error) {
            return Observable.throw(t('deviceModels.flyouts.upload.invalidJSONFileErrorMessage', { error }));
          }

          const jsonFile = jsonFiles[0];
          const { CloudToDeviceMethods = {}, Simulation: { Scripts } = { Scripts: [] } } = deviceModel;
          const requiredScripts = [...Object.values(CloudToDeviceMethods), ...Scripts];
          const requiredScriptNames = new Set(requiredScripts.map(({ Path }) => Path));
          const uploadedScriptNames = new Set(scriptFiles.map(({ name }) => name));
          let missingScripts = [];
          if (!isEqual(requiredScriptNames, uploadedScriptNames)) {
            const missingScriptNames = new Set([...requiredScriptNames].filter(x => !uploadedScriptNames.has(x)));
            missingScripts = [...missingScriptNames];
            const scriptsToBeRemoved = new Set([...uploadedScriptNames].filter(x => !requiredScriptNames.has(x)));

            for (let script of scriptsToBeRemoved) {
              scriptFiles.splice(scriptFiles.findIndex(x => x.name === script), 1);
            }
          }

          return {
            deviceModel,
            scriptFiles,
            jsonFile,
            missingScripts
          };
        });
      });

  readFileAsText = file => {
    const reader = new FileReader();

    return Observable.create(observer => {
      reader.onerror = ({ target: error }) => {
        reader.abort();
        observer.throw(error);
      };

      reader.onload = () => {
        observer.next(reader.result);
        observer.complete();
      };

      reader.readAsText(file);
    });
  };

  formIsValid() {
    const { deviceModel, scripts } = this.state;
    return !isEmpty(deviceModel) && scripts.every(({ validationResult }) => (validationResult || {}).isValid);
  }

  apply = event => {
    event.preventDefault();
    const { deviceModel, scripts } = this.state;

    // Uploading scripts
    Observable.from(scripts)
      .flatMap(({ file }) => DeviceModelScriptsService.uploadsDeviceModelScript(file))
      .reduce((scripts, script) => ({ ...scripts, [script.name.replace(/^.*[\\/]/, '')]: script }), {})
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

  reloadUpload = e => {
    const uploadedFile = e.target.files[0];
    if (e.target.parentElement.id === uploadedFile.name) {
      const addMissingScriptIndex = this.state.missingScripts.findIndex(script => (script === uploadedFile.name));
      const replaceIncorrectScriptIndex = this.state.scripts.findIndex(
        script => (script.file.name === uploadedFile.name && script.validationResult.isValid === false));

      if (addMissingScriptIndex !== -1) {
        this.state.missingScripts.splice(addMissingScriptIndex, 1);
      } else if (replaceIncorrectScriptIndex !== -1) {
        this.state.scripts.splice(replaceIncorrectScriptIndex, 1);
      }

      this.state.scripts.push({ file: uploadedFile });
      this.setState({
        ...initialFormState,
        scripts: this.state.scripts,
        deviceModel: this.state.deviceModel,
        missingScripts: this.state.missingScripts
      });
    }
  };

  clearAll = () => {
    const formVersion = this.state.formVersion + 1;
    this.setState({ ...initialFormState, formVersion });
  };

  render() {
    const { t } = this.props;
    const { deviceModel, scripts, jsonFile, changesApplied, formVersion, error, missingScripts } = this.state;
    return (
      <form key={`device-model-form-${formVersion}`} onSubmit={this.apply} className="device-model-form-container">
        <FormSection>
          <FormLabel>{t('deviceModels.flyouts.upload.deviceModelInfoText')}</FormLabel>
          <br /><br />
          <FormLabel>{t('deviceModels.flyouts.upload.deviceModelFilesInfoText')}</FormLabel>
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
            <button className="browse-button" htmlFor="fileUpload">{t('deviceModels.flyouts.upload.browse')}</button>
          </div>
        </FormSection>
        <FormSection>
        {
          this.state.deviceModel && (
            <FormGroup>
              <FormLabel>{t('deviceModels.flyouts.new.name')}</FormLabel>
              <div>{deviceModel.Name}</div>
            </FormGroup>
          )
        }
        {
          missingScripts && missingScripts.length > 0 && (
          <FormGroup>
            <FormLabel>{t('deviceModels.flyouts.upload.missingFiles')}</FormLabel>
            {
              missingScripts
                .sort((a, b) => a.localeCompare(b))
                .map((file) => (
                  <div key={`missing-scripts-container-${file}`} className="upload-results-container">
                    <div className="file-name">{file}</div>
                    <div className="validation-message">
                      <div id={file} className="file-uploader-container">
                        <input
                          className="file-uploader"
                          type="file"
                          id="missingScriptsUploader"
                          name="missingScriptsuploader"
                          accept=".json, .js"
                          onChange={this.reloadUpload}
                        />
                        <button className="browse-button" htmlFor="fileUpload">{t('deviceModels.flyouts.upload.browse')}</button>
                      </div>
                    </div>
                  </div>
                ))
            }
           </FormGroup>
          )
        }
        {
          scripts.length > 0 && jsonFile && (
            <FormGroup>
              <FormLabel>{t('deviceModels.flyouts.upload.uploadedFiles')}</FormLabel>
              <div className="upload-results-container">
                <div className="file-name">{jsonFile.name}</div>
                <div className={`${'success-result'}`}>
                  {'\u2714'}
                </div>
              </div>
              {this.state.scripts
                .sort((a, b) => a.file.name.localeCompare(b.file.name))
                .map(({ file, validationResult = {} }, idx) => (
                  <div key={`script-${idx}`} className="upload-results-container">

                    <div className="file-name">{file.name}
                      <div className="validation-message">
                        {(validationResult.messages || []).map((error, idx) => (
                          <ErrorMsg key={`script-error-${idx}`}>{error}</ErrorMsg>
                        ))}
                      </div>
                    </div>
                    <div
                      className={`validation-result ${validationResult.isValid ? 'success-result' : 'failed-result'}`}>
                      {validationResult.isValid === undefined ? (
                        <Indicator size="mini" />
                      ) : validationResult.isValid ? (
                        '\u2714'
                      ) : (
                        '\u2716'
                      )}
                    </div>
                    <div>
                      {(validationResult.messages || []).map((error, idx) => (
                        <div id={file.name} className="file-uploader-container">
                          <input
                            className="file-uploader"
                            type="file"
                            id="replaceIncorrectScriptUploader"
                            name="replaceIncorrectScriptUploader"
                            accept=".json, .js"
                            onChange={this.reloadUpload}
                          />
                          <button className="browse-button" htmlFor="fileUpload">{t('deviceModels.flyouts.upload.browse')}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </FormGroup>
          )
        }
        </FormSection>
        {error && <ErrorMsg>{error}</ErrorMsg>}
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
