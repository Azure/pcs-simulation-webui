// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { isEqual, isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { DeviceModelScriptsService } from 'services';
import { svgs } from 'utilities';
import { Svg } from 'components/shared';
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
  missingScripts: [],
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
          missingScripts: (missingScripts || []).map(fileName => ({
            fileName: fileName
          })),
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
            const scriptsToBeRemoved = new Set([...uploadedScriptNames].filter(x => !requiredScriptNames.has(x)));

            missingScripts = [...missingScriptNames];

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

  uploadSingleFile = e => {
    const uploadedFile = e.target.files[0];
    const addMissingScriptIndex = this.state.missingScripts.findIndex(
      script => (script.fileName === e.target.id));
    const replaceIncorrectScriptIndex = this.state.scripts.findIndex(
      script => (script.file.name === e.target.id));

    let scripts = [...this.state.scripts];
    let missingScripts = [...this.state.missingScripts];
    let validationResults = null;

    if(this.state.validationResults === undefined){
      validationResults = scripts
      .map(({file, validationResult}) => ({fileName: file.name, validationResult}))
      .reduce((acc, {fileName, validationResult}) => ({ ...acc, [fileName]: validationResult }), {})
    } else {
      validationResults = {...this.state.validationResults};
    }

    if (uploadedFile && e.target.id === uploadedFile.name) {
      validationResults[e.target.id] = undefined;

      addMissingScriptIndex !== -1
        ? missingScripts.splice(addMissingScriptIndex, 1)
        : scripts.splice(replaceIncorrectScriptIndex, 1);

      scripts = [
        ...scripts,
        {file: uploadedFile}
      ];
    } else {
      const index = scripts.findIndex(
        script => (script.file.name === e.target.id));

      if(index!== -1){
      scripts[index].validationResult = {
        isValid: false,
        messages: [
          `Expected file is ${ e.target.id}`
        ]
      };
      }

      validationResults[e.target.id] = {
        isValid: undefined,
        messages: [
          `Expected file is ${ e.target.id}`
        ]
      };
    }

    this.setState({
      ...initialFormState,
      scripts: scripts,
      deviceModel: this.state.deviceModel,
      missingScripts: missingScripts,
      validationResults: validationResults
    })
  };

  clearAll = () => {
    const formVersion = this.state.formVersion + 1;
    const validationResults = undefined

    this.setState({ ...initialFormState, formVersion, validationResults });
  };

  render() {
    const { t } = this.props;
    const { deviceModel, scripts, jsonFile, changesApplied, formVersion, error, missingScripts, validationResults } = this.state;
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
                  .sort((a, b) => a.fileName.localeCompare(b.fileName))
                  .map(({ fileName, validationResult = {} }, idx) => (
                    <div key={fileName} className="upload-results-container">
                      <div className="file-name">
                        {fileName}
                        <div className="validation-message">
                          {
                            (validationResults && validationResults[fileName] !== undefined) && (
                              (validationResults[fileName].messages || []).map((error, idx) => (
                                <ErrorMsg key={idx}>{error}</ErrorMsg>
                              ))
                            )
                          }
                        </div>
                      </div>
                      <div className="validation-message">
                        <div className="file-uploader-container">
                          <input
                            className="file-uploader"
                            type="file"
                            id={fileName}
                            name="missingScriptsuploader"
                            accept=".json, .js"
                            onChange={this.uploadSingleFile}
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
                <Svg path={svgs.success} className="success-result json-file-validation" />
              </div>
              {this.state.scripts
                .sort((a, b) => a.file.name.localeCompare(b.file.name))
                .map(({ file, validationResult = {} }, idx) => (
                  <div key={idx} className="upload-results-container">
                    <div className="file-name">
                      {file.name}
                      <div className="validation-message">
                        {
                          (validationResults === undefined || validationResults[file.name] === undefined)
                          ?(
                            (validationResult.messages || []).map((error, idx) => (
                              <ErrorMsg key={idx}>{error}</ErrorMsg>
                            ))
                          )
                          :(
                            (validationResults[file.name].messages || []).map((error, idx) => (
                            <ErrorMsg key={idx}>{error}</ErrorMsg>
                          ))
                          )
                        }
                      </div>
                    </div>
                    <div
                      className={`validation-result ${validationResult.isValid ? 'success-result' : 'failed-result'}`}>
                      {validationResult.isValid === undefined ? (
                        <Indicator size="mini" />
                      ) : validationResult.isValid ? (
                        <Svg path={svgs.success} className="success-result" />
                      ) : (
                        <Svg path={svgs.failure} className="failed-result" />
                      )}
                    </div>
                    <div>
                      {
                        (validationResult.messages || []).map((error, idx) => (
                          <div key={idx} className="file-uploader-container">
                            <input
                              className="file-uploader"
                              type="file"
                              id={file.name}
                              name="replaceIncorrectScriptUploader"
                              accept=".json, .js"
                              onChange={this.uploadSingleFile}
                            />
                            <button className="browse-button" htmlFor="fileUpload">{t('deviceModels.flyouts.upload.browse')}</button>
                        </div>
                        ))
                      }
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
