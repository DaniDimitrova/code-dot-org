/* eslint-disable react/no-danger */
import React, {Component, PropTypes} from 'react';
import Button from '@cdo/apps/templates/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from "@cdo/locale";
import DialogFooter from "@cdo/apps/templates/teacherDashboard/DialogFooter";
import processMarkdown from 'marked';
import renderer from "@cdo/apps/util/StylelessRenderer";

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  instructions: {
    marginTop: 20
  }
};

export default class FreeResponseDetailsDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    questionText: PropTypes.string,
  };

  render() {
    // Questions are in markdown format and should not display as plain text in the dialog.
    const renderedMarkdown = processMarkdown(this.props.questionText, { renderer });

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isDialogOpen}
        style={styles.dialog}
        handleClose={this.props.closeDialog}
      >
        <h2>{i18n.questionText()}</h2>
        <div
          style={styles.instructions}
          dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
        />
        <DialogFooter>
          <Button
            text={i18n.done()}
            onClick={this.props.closeDialog}
            color={Button.ButtonColor.gray}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
