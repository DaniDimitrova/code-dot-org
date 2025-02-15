import React from 'react';
import FreeResponseDetailsDialog from '@cdo/apps/templates/sectionAssessments/FreeResponseDetailsDialog';

export default storybook => {
  return storybook
    .storiesOf('Dialogs/FreeResponseDetailsDialog', module)
    .addStoryTable([
      {
        name: 'FreeResponseDetailsDialog',
        description: 'Detail view of a free response question',
        story: () => (
          <FreeResponseDetailsDialog
            isDialogOpen={true}
            closeDialog={() => {}}
            questionText={"Hello world. I display markdown questions."}
          />
        )
      }
    ]);
};
