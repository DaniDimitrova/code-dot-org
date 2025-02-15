import React, { Component, PropTypes } from 'react';
import $ from 'jquery';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import CourseScript from './CourseScript';
import CourseOverviewTopRow from './CourseOverviewTopRow';
import { resourceShape } from './resourceType';
import styleConstants from '@cdo/apps/styleConstants';
import VerifiedResourcesNotification from './VerifiedResourcesNotification';
import * as utils from '../../utils';
import { queryParams } from '../../code-studio/utils';
import i18n from '@cdo/locale';
import Notification, { NotificationType } from '@cdo/apps/templates/Notification';

const styles = {
  main: {
    width: styleConstants['content-width'],
  },
  description: {
    marginBottom: 20
  },
  titleWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    display: 'inline-block',
  },
  versionDropdown: {
    display: 'inline-block',
    marginBottom: 13,
  }
};

export default class CourseOverview extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    assignmentFamilyTitle: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    descriptionStudent: PropTypes.string,
    descriptionTeacher: PropTypes.string,
    sectionsInfo: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape).isRequired,
    isTeacher: PropTypes.bool.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    scripts: PropTypes.array.isRequired,
    isVerifiedTeacher: PropTypes.bool.isRequired,
    hasVerifiedResources: PropTypes.bool.isRequired,
    versions: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      version_year: PropTypes.string.isRequired
    })).isRequired,
    showVersionWarning: PropTypes.bool,
  };

  onChangeVersion = event => {
    const courseName = event.target.value;
    if (courseName !== this.props.name) {
      const sectionId = queryParams('section_id');
      const queryString = sectionId ? `?section_id=${sectionId}` : '';
      utils.navigateToHref(`/courses/${courseName}${queryString}`);
    }
  };

  render() {
    const {
      name,
      title,
      assignmentFamilyTitle,
      id,
      descriptionStudent,
      descriptionTeacher,
      sectionsInfo,
      teacherResources,
      isTeacher,
      viewAs,
      scripts,
      isVerifiedTeacher,
      hasVerifiedResources,
      versions,
      showVersionWarning,
    } = this.props;

    // We currently set .container.main to have a width of 940 at a pretty high
    // level and are not comfortable moving it to 970 across the board yet. The
    // hack below makes it so that this component will be 970px and centered
    // properly. It can be removed if/when we fix .container.main
    const mainStyle = {
      ...styles.main,
      marginLeft: ($(".container.main").width() - styleConstants['content-width']) / 2,
    };
    const showNotification = viewAs === ViewType.Teacher && isTeacher &&
      !isVerifiedTeacher && hasVerifiedResources;

    return (
      <div style={mainStyle}>
        {showVersionWarning &&
          <Notification
            type={NotificationType.warning}
            notice={i18n.wrongCourseVersionWarningNotice()}
            details={i18n.wrongCourseVersionWarningDetails()}
            dismissible={true}
          />
        }
        <div style={styles.titleWrapper}>
          <h1 style={styles.title}>{assignmentFamilyTitle}</h1>
          {versions.length > 1 &&
            <select
              onChange={this.onChangeVersion}
              value={name}
              style={styles.versionDropdown}
              id="version-selector"
            >
              {versions.map(version => (
                <option key={version.name} value={version.name}>
                  {version.version_title}
                </option>
              ))}
            </select>
          }
        </div>
        <div style={styles.description}>
          {viewAs === ViewType.Student ? descriptionStudent : descriptionTeacher}
        </div>
        {showNotification && <VerifiedResourcesNotification/>}
        {isTeacher &&
          <CourseOverviewTopRow
            sectionsInfo={sectionsInfo}
            id={id}
            title={title}
            resources={teacherResources}
          />
        }
        {scripts.map((script, index) => (
          <CourseScript
            key={index}
            title={script.title}
            name={script.name}
            id={script.id}
            description={script.description}
          />
        ))}
      </div>
    );
  }
}
