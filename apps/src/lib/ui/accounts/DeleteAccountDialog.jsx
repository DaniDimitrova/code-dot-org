import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {Header, Field, ConfirmCancelFooter} from '../SystemDialog/SystemDialog';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';

const GUTTER = 20;
const styles = {
  container: {
    margin: GUTTER,
    color: color.charcoal,
  },
  bodyContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: GUTTER / 2,
    paddingBottom: GUTTER,
  },
  icon: {
    color: color.red,
    fontSize: 100,
  },
  text: {
    paddingLeft: GUTTER,
  },
  dangerText: {
    color: color.red,
  },
  italicText: {
    fontStyle: 'italic',
  },
  section: {
    paddingBottom: GUTTER,
  },
  checkboxContainer: {
    display: 'flex',
    paddingTop: GUTTER / 2,
  },
  label: {
    paddingLeft: GUTTER / 2,
  },
  input: {
    width: 490
  },
};

export default class DeleteAccountDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    isPasswordRequired: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired,
    checkboxes: PropTypes.objectOf(PropTypes.shape({
      checked: PropTypes.bool.isRequired,
      label: PropTypes.object.isRequired,
    })).isRequired,
    password: PropTypes.string.isRequired,
    passwordError: PropTypes.string,
    deleteVerification: PropTypes.string.isRequired,
    onCheckboxChange: PropTypes.func.isRequired,
    onPasswordChange: PropTypes.func.isRequired,
    onDeleteVerificationChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    disableConfirm: PropTypes.bool.isRequired,
    deleteUser: PropTypes.func.isRequired,
    deleteError: PropTypes.string,
  };

  render() {
    const {
      isOpen,
      isPasswordRequired,
      isTeacher,
      checkboxes,
      password,
      passwordError,
      deleteVerification,
      onCheckboxChange,
      onPasswordChange,
      onDeleteVerificationChange,
      onCancel,
      disableConfirm,
      deleteUser,
      deleteError,
    } = this.props;

    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={550}
        isOpen={isOpen}
        handleClose={onCancel}
      >
        <div style={styles.container}>
          <Header text={i18n.deleteAccountDialog_header()}/>
          <div style={styles.bodyContainer}>
            <FontAwesome
              icon="exclamation-triangle"
              style={styles.icon}
            />
            <div style={styles.text}>
              <strong>{i18n.deleteAccountDialog_body1()}</strong>
              {i18n.deleteAccountDialog_body2()}
              <strong style={styles.dangerText}>{i18n.deleteAccountDialog_body3()}</strong>
              {i18n.deleteAccountDialog_body4()}
              {isTeacher &&
                <span>
                  {i18n.deleteAccountDialog_body5()}
                  <strong style={styles.dangerText}>{i18n.deleteAccountDialog_body6()}</strong>
                  {i18n.deleteAccountDialog_body7()}
                </span>
              }
            </div>
          </div>
          {isTeacher &&
            <div style={styles.section}>
              <strong>{i18n.deleteAccountDialog_checkboxTitle()}</strong>
              {Object.keys(checkboxes).map(id => {
                return (
                  <div key={id} style={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id={id}
                      checked={checkboxes[id].checked}
                      onChange={() => onCheckboxChange(id)}
                    />
                    <label htmlFor={id} style={styles.label}>{checkboxes[id].label}</label>
                  </div>
                );
              })}
            </div>
          }
          {isPasswordRequired &&
            <Field
              label={i18n.deleteAccountDialog_currentPassword()}
              error={passwordError}
            >
              <input
                type="password"
                style={styles.input}
                value={password}
                onChange={onPasswordChange}
              />
            </Field>
          }
          <Field
            label={i18n.deleteAccountDialog_verification({verificationString: i18n.deleteAccountDialog_verificationString()})}
          >
            <input
              type="text"
              style={styles.input}
              value={deleteVerification}
              onChange={onDeleteVerificationChange}
            />
          </Field>
          <div style={styles.section}>
            {i18n.deleteAccountDialog_emailUs()}
          </div>
          <ConfirmCancelFooter
            confirmText={isTeacher ? i18n.deleteAccountDialog_teacherButton() : i18n.deleteAccountDialog_studentButton()}
            confirmColor={Button.ButtonColor.red}
            onConfirm={deleteUser}
            onCancel={onCancel}
            disableConfirm={disableConfirm}
            tabIndex="1"
          >
            <span
              id="uitest-delete-error"
              style={{...styles.dangerText, ...styles.italicText}}
            >
              {deleteError}
            </span>
          </ConfirmCancelFooter>
        </div>
      </BaseDialog>
    );
  }
}
