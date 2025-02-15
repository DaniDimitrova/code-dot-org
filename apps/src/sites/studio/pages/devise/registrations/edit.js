import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import ChangeEmailController from '@cdo/apps/lib/ui/accounts/ChangeEmailController';
import AddPasswordController from '@cdo/apps/lib/ui/accounts/AddPasswordController';
import ChangeUserTypeController from '@cdo/apps/lib/ui/accounts/ChangeUserTypeController';
import ManageLinkedAccountsController from '@cdo/apps/lib/ui/accounts/ManageLinkedAccountsController';
import DeleteAccount from '@cdo/apps/lib/ui/accounts/DeleteAccount';
import getScriptData from '@cdo/apps/util/getScriptData';
import experiments from '@cdo/apps/util/experiments';

// Values loaded from scriptData are always initial values, not the latest
// (possibly unsaved) user-edited values on the form.
const scriptData = getScriptData('edit');
const {
  userAge,
  userType,
  isPasswordRequired,
  authenticationOptions,
  isGoogleClassroomStudent,
  isCleverStudent,
  dependedUponForLogin,
} = scriptData;

$(document).ready(() => {
  new ChangeEmailController({
    form: $('#change-email-modal-form'),
    link: $('#edit-email-link'),
    displayedUserEmail: $('#displayed-user-email'),
    userAge,
    userType,
    isPasswordRequired,
    emailChangedCallback: onEmailChanged,
  });

  new ChangeUserTypeController(
    $('#change-user-type-modal-form'),
    userType,
  );

  const addPasswordMountPoint = document.getElementById('add-password-fields');
  if (addPasswordMountPoint) {
    new AddPasswordController($('#add-password-form'), addPasswordMountPoint);
  }

  const manageLinkedAccountsMountPoint = document.getElementById('manage-linked-accounts');
  if (manageLinkedAccountsMountPoint) {
    new ManageLinkedAccountsController(
      manageLinkedAccountsMountPoint,
      authenticationOptions,
      isPasswordRequired,
      isGoogleClassroomStudent,
      isCleverStudent,
    );
  }

  if (experiments.isEnabled(experiments.ACCOUNT_DELETION_NEW_FLOW)) {
    const deleteAccountMountPoint = document.getElementById('delete-account');
    // Replace deleteAccountMountPoint Rails contents with DeleteAccount component.
    if (deleteAccountMountPoint) {
      ReactDOM.render(
        <DeleteAccount
          isPasswordRequired={isPasswordRequired}
          isTeacher={userType === 'teacher'}
          dependedUponForLogin={dependedUponForLogin}
        />,
        deleteAccountMountPoint
      );
    }
  }

  initializeCreatePersonalAccountControls();
});

function onEmailChanged(newEmail, newHashedEmail) {
  $('#user_hashed_email').val(newHashedEmail);
  $('#change-user-type_user_email').val(newEmail);
  $('#change-user-type_user_hashed_email').val(newHashedEmail);
  $('#change-email-modal_user_email').val(newEmail);
  $('#change-email-modal_user_hashed_email').val(newHashedEmail);
}

function initializeCreatePersonalAccountControls() {
  $( "#edit_user_create_personal_account" ).on("submit", function (e) {
    if ($('#create_personal_user_email').length) {
      window.dashboard.hashEmail({
        email_selector: '#create_personal_user_email',
        hashed_email_selector: '#create_personal_user_hashed_email',
        age_selector: '#user_age'
      });
    }
  });
}
