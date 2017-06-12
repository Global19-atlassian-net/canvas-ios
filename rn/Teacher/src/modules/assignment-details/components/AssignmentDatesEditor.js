/**
 * @flow
 */

import React, { Component } from 'react'

import {
  View,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  Alert,
  LayoutAnimation,
  DatePickerIOS,
  Image,
} from 'react-native'
import i18n from 'format-message'
import colors from '../../../common/colors'
import { formattedDueDate } from '../../../common/formatters'
import AssignmentDates from '../../../common/AssignmentDates'
import { type Assignee } from '../../assignee-picker/map-state-to-props'
import uuid from 'uuid/v1'
import { cloneDeep } from 'lodash'
import { Text } from '../../../common/text'
import EditSectionHeader from './EditSectionHeader'
import Button from 'react-native-button'
import Images from '../../../images'
import DisclosureIndicator from '../../../common/components/DisclosureIndicator'
import Navigator from '../../../routing/Navigator'
import RequiredFieldSubscript from '../../../common/components/RequiredFieldSubscript'
import { extractDateFromString } from '../../../utils/dateUtils'

type Props = {
  assignment: Assignment,
  scrollTo: Function,
  navigator: Navigator,
  canEditAssignees?: boolean,
  canAddDates?: boolean,
}

// Which date is currently being modified, or none at all
export type ModifyDateType = 'due_at' | 'lock_at' | 'unlock_at' | 'none'

// So, the data we get back from the api is a little confusing.
// There is a big mishmash of dates and things spread across the assignment object,
// the overrides object and the all_dates object
// This mashes all that data together so that it's pretty easy to consume
export type StagedAssignmentDate = {
  id: string, // Will be the id, or base if it's a base date for everyone. If it's a new date, will have a uuid
  isNew?: boolean, // Is it a new date, meaning it hasn't been pushed to the server yet
  base: boolean,
  title?: string,
  due_at?: ?string,
  unlock_at?: ?string,
  lock_at?: ?string,
  student_ids?: ?string[],
  course_section_id?: ?string,
  group_id?: ?string,
  validAssignees: boolean,
  validDates: boolean,
  modifyType?: ModifyDateType,
}

type State = {
  dates: StagedAssignmentDate[],
}

// These this component is rendered, it makes a copy of the assignment overrides and uses that as display
// At any time, you can call the results method to get an updated view on edits that were made
// Call validate to perform validation. (validation checks to see if there are any assignees, that's all. :))
export default class AssignmentDatesEditor extends Component<any, Props, any> {
  state: State
  layouts: any

  constructor (props: Props) {
    super(props)
    const dateManager = new AssignmentDates(props.assignment)
    const allDates = dateManager.allDates()
    const dates: StagedAssignmentDate[] = allDates.map((date) => {
      let staged: StagedAssignmentDate = {
        id: date.id || 'base',
        base: date.base || false,
        title: date.title,
        due_at: date.due_at,
        unlock_at: date.unlock_at,
        lock_at: date.lock_at,
        validAssignees: true,
        validDates: true,
      }
      const dateID = date.id
      // If the date has an ID, there is a override associated with it
      if (dateID) {
        const override = dateManager.overrideForID(dateID)
        if (override) {
          staged.group_id = override.group_id
          staged.course_section_id = override.course_section_id
          staged.student_ids = override.student_ids
        }
      } else {
        staged.title = (allDates.length > 1) ? i18n('Everyone else') : i18n('Everyone')
      }
      return staged
    }).filter(item => item)

    this.state = {
      dates,
    }
    this.layouts = {}
  }

  checkDates (date: StagedAssignmentDate) {
    let dueDate = extractDateFromString(date.due_at)
    let lockDate = extractDateFromString(date.lock_at)
    let unlockDate = extractDateFromString(date.unlock_at)
    if (!dueDate) {
      return true
    }
    let insideLock = lockDate ? dueDate <= lockDate : true
    let insideUnlock = unlockDate ? dueDate >= unlockDate : true
    return insideLock && insideUnlock
  }

  validate () {
    var allDatesAreValid = true
    const dates = this.state.dates.map((date) => {
      let thisDateIsValid = this.checkDates(date)

      if (date.base) {
        if (allDatesAreValid && !thisDateIsValid) {
          allDatesAreValid = false
        }
        return date
      } else if (((date.student_ids && date.student_ids.length === 0) || !date.student_ids) &&
          !date.course_section_id &&
          !date.group_id) {
        const newDate = cloneDeep(date)
        newDate.validAssignees = false
        if (!thisDateIsValid) {
          newDate.validDates = false
        }
        allDatesAreValid = false
        return newDate
      } else if (!thisDateIsValid) {
        const newDate = cloneDeep(date)
        newDate.validDates = false
        allDatesAreValid = false
        return newDate
      } else {
        return date
      }
    })

    this.setState({
      dates,
    })

    return allDatesAreValid
  }

  // Once editing is complete, send the staged assignment in here for updates
  updateAssignment = (assignment: Assignment) => {
    return AssignmentDatesEditor.updateAssignmentWithDates(assignment, this.state.dates)
  }

  addAdditionalDueDate = () => {
    const dates = this.state.dates.slice()
    dates.push({
      id: uuid(),
      isNew: true,
      base: false,
      validAssignees: true,
      validDates: true,
    })
    this.setState({
      dates,
    })
  }

  static updateAssignmentWithDates = (assignment: Assignment, dates: StagedAssignmentDate[]) => {
    const overrides = []
    dates.forEach((date) => {
      if (date.base) {
        assignment.due_at = date.due_at || null
        assignment.lock_at = date.lock_at || null
        assignment.unlock_at = date.unlock_at || null
      } else {
        // $FlowFixMe
        const override: AssignmentOverride = {
          due_at: date.due_at || null,
          unlock_at: date.unlock_at || null,
          lock_at: date.lock_at || null,
        }

        if (date.course_section_id) { override.course_section_id = date.course_section_id }
        if (date.student_ids) { override.student_ids = date.student_ids }
        if (date.group_id) { override.group_id = date.group_id }

        if (!date.isNew) {
          override.id = date.id
        }

        overrides.push(override)
      }
    })

    assignment.overrides = overrides
    return assignment
  }

  static assigneesFromDate = (date: StagedAssignmentDate) => {
    let assignees: Assignee[] = []
    if (date.base) {
      assignees.push({
        id: 'everyone',
        dataId: 'everyone',
        type: 'everyone',
        name: i18n('Everyone'),
      })
    }

    const studentIds = date.student_ids
    if (studentIds) {
      const studentAssignees = studentIds.map((id) => {
        return {
          id: `student-${id}`,
          dataId: id,
          type: 'student',
          name: '--',
        }
      })
      assignees = assignees.concat(studentAssignees)
    }

    const sectionId = date.course_section_id
    if (sectionId) {
      assignees.push({
        id: `section-${sectionId}`,
        dataId: sectionId,
        type: 'section',
        name: '--',
      })
    }

    const groupId = date.group_id
    if (groupId) {
      assignees.push({
        id: `group-${groupId}`,
        dataId: groupId,
        type: 'group',
        name: '--',
      })
    }

    return assignees
  }

  // One dates can turn into many dates, based on what the assignees are
  // For example, if the date previously has a single section, and the user adds multiple sections,
  // That means there is now more than one date, because only one section per date is allowed
  // Although, one date can have multiple students
  // Note that this always creates completely new date StagedAssignmentDate. I talked to MDB about this, and he said it's best
  // to just not update old overrides, but to create completely new ones
  static updateDateWithAssignees = (date: StagedAssignmentDate, assignees: Assignee[]): StagedAssignmentDate[] => {
    const createNewDate = (props: Object): StagedAssignmentDate => {
      const aDate = {
        id: uuid(),
        base: date.base,
        isNew: true,
        validAssignees: true,
        validDates: true,
        due_at: date.due_at,
        unlock_at: date.unlock_at,
        lock_at: date.lock_at,
      }

      Object.assign(aDate, props)

      return aDate
    }

    // If all assignees have been removed, it's basically completely new date again
    if (assignees.length === 0) {
      const newDate = createNewDate({
        validAssignees: false,
        base: false,
        id: uuid(),
      })
      return [newDate]
    }

    let base: ?StagedAssignmentDate = null
    let student: ?StagedAssignmentDate = null
    let sections: StagedAssignmentDate[] = []
    let groups: StagedAssignmentDate[] = []

    assignees.forEach((a) => {
      switch (a.type) {
        case 'everyone':
          base = createNewDate({
            id: 'base',
            base: true,
            title: i18n('Everyone'),
          })
          break
        case 'student':
          if (!student) {
            student = createNewDate({
              base: false,
              student_ids: [a.dataId],
            })
          } else {
            const ids = student.student_ids || []
            student.student_ids = ids.concat([a.dataId])
          }
          student.title = i18n(`{
            count, plural,
                =0 {0 students}
              one {# student}
            other {# students}
          }`, { count: (student.student_ids || []).length })
          break
        case 'section':
          sections.push(createNewDate({
            base: false,
            course_section_id: a.dataId,
            title: a.name,
          }))
          break
        case 'group':
          groups.push(createNewDate({
            base: false,
            group_id: a.dataId,
            title: a.name,
          }))
          break
      }
    })

    let newDates: StagedAssignmentDate[] = []
    if (base) { newDates.push(base) }
    if (student) { newDates.push(student) }
    return [...newDates, ...sections, ...groups]
  }

  selectAssignees = (date: StagedAssignmentDate) => {
    const callback = (assignees: Assignee[]) => {
      this.props.navigator.dismiss()
      const dates = (this.state.dates || []).filter((d) => d.id !== date.id)
      const newDates = AssignmentDatesEditor.updateDateWithAssignees(date, assignees)
      this.setState({
        dates: [...dates, ...newDates],
      })
    }

    const assignees = AssignmentDatesEditor.assigneesFromDate(date)
    const route = `/courses/${this.props.assignment.course_id}/assignee-picker`
    this.props.navigator.show(route, { modal: true }, { assignees, callback })
  }

  modifyDate = (date: StagedAssignmentDate, type: ModifyDateType) => {
    const dates = this.state.dates.map((d) => {
      if (date.id === d.id) {
        if (d.modifyType === type) {
          d.modifyType = 'none'
        } else {
          d.modifyType = type
        }
      } else {
        d.modifyType = 'none'
      }

      return this.validateDateChange(d)
    })

    LayoutAnimation.easeInEaseOut()
    this.setState({
      dates,
    })
  }

  removeDateType = (date: StagedAssignmentDate, type: ModifyDateType) => {
    const dates = this.state.dates.map((d) => {
      if (date.id === d.id && type !== 'none') {
        d[type] = null
      }

      return this.validateDateChange(d)
    })

    this.setState({
      dates,
    })
  }

  updateDate = (date: StagedAssignmentDate, type: ModifyDateType, newDate: Date) => {
    const dates = this.state.dates.map((d) => {
      if (date.id === d.id && type !== 'none') {
        d[type] = newDate.toISOString()
      }
      return this.validateDateChange(d)
    })

    this.setState({
      dates,
    })
  }

  validateDateChange (date: StagedAssignmentDate) {
    let datesAreValid = this.checkDates(date)
    const newDate = cloneDeep(date)
    newDate.validDates = datesAreValid
    return newDate
  }

  removeDate = (date: StagedAssignmentDate) => {
    if (date.base) return

    let remove = () => {
      const dates = this.state.dates.filter((d) => d.id !== date.id)
      this.setState({
        dates,
      })
    }

    Alert.alert(
      i18n('Are you sure?'),
      i18n('You cannot undo this action'),
      [
        { text: i18n('Remove'), onPress: remove, style: 'destructive' },
        { text: i18n('Cancel'), style: 'cancel' },
      ],
      { cancelable: false }
    )
  }

  renderRemoveButton = (date: StagedAssignmentDate) => {
    if (date.base) return <View />

    return <View style={styles.removeButtonContainer}>
      <TouchableOpacity onPress={() => this.removeDate(date)}>
        <View>
          <Text style={styles.removeButton}>Remove</Text>
        </View>
      </TouchableOpacity>
    </View>
  }

  renderDatePicker = (date: StagedAssignmentDate, type: ModifyDateType) => {
    if (type === 'none') return <View />
    return <View style={styles.dateEditorContainer}>
            <DatePickerIOS date={date[type] ? new Date(date[type]) : new Date()} onDateChange={(updated) => this.updateDate(date, type, updated)}/>
          </View>
  }

  renderDateType = (date: StagedAssignmentDate, type: ModifyDateType) => {
    if (type === 'none') return <View />

    const stringDate = date[type] ? formattedDueDate(new Date(date[type])) : '--'

    let title = i18n('Due Date')
    switch (type) {
      case 'unlock_at':
        title = i18n('Available From')
        break
      case 'lock_at':
        title = i18n('Available To')
        break
    }

    const modifyFunction = () => {
      this.modifyDate(date, type)
    }

    const removeDateTypeFunction = () => {
      this.removeDateType(date, type)
    }

    return (<TouchableHighlight style={styles.row} onPress={modifyFunction}>
              <View style={styles.rowContainer}>
                <Text style={styles.titleText}>{title}</Text>
                <View style={styles.detailsRowContainer}>
                  <Text style={styles.detailText}>{stringDate}</Text>
                  {date[type] && <Button onPress={removeDateTypeFunction} containerStyle={styles.deleteDateTypeButton}><Image source={Images.clear} /></Button>}
                </View>
              </View>
            </TouchableHighlight>)
  }

  renderDate = (date: StagedAssignmentDate) => {
    let title = i18n('Assign To')
    let requiredAssigneesText = i18n('Assignees required')
    let requiredDueDateText = i18n("'Due Date' must be between 'Available From' and 'Available To' dates")

    let removeButton = this.renderRemoveButton(date)
    let detailTextStyle = date.title ? styles.detailText : styles.detailTextMissing

    const canEditAssignees = this.props.canEditAssignees || this.props.canEditAssignees == null

    return (<View>
              <View style={styles.dateContainer} key={date.id || 'base'} onLayout={ (event) => { this.layouts[date.id] = event.nativeEvent.layout } } >
                <EditSectionHeader title={title} style={styles.headerText}>
                  {removeButton}
                </EditSectionHeader>
                <TouchableHighlight style={styles.row} onPress={canEditAssignees && (() => this.selectAssignees(date))}>
                  <View style={styles.rowContainer}>
                    <Text style={styles.titleText}>{i18n('Assignees')}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <Text style={detailTextStyle}>{date.title || i18n('None')}</Text>
                      { this.props.canEditAssignees &&
                        <DisclosureIndicator />
                      }
                    </View>
                  </View>
                </TouchableHighlight>
                { this.renderDateType(date, 'due_at') }
                { date.modifyType === 'due_at' && this.renderDatePicker(date, 'due_at') }
                { this.renderDateType(date, 'unlock_at') }
                { date.modifyType === 'unlock_at' && this.renderDatePicker(date, 'unlock_at') }
                { this.renderDateType(date, 'lock_at') }
                { date.modifyType === 'lock_at' && this.renderDatePicker(date, 'lock_at') }
              </View>
              <RequiredFieldSubscript title={requiredAssigneesText} visible={!date.validAssignees} />
              <RequiredFieldSubscript title={requiredDueDateText} visible={!date.validDates} />
            </View>)
  }

  renderButton = () => {
    return (<TouchableHighlight style={styles.button} onPress={this.addAdditionalDueDate}>
              <View style={styles.buttonInnerContainer}>
                <Image source={Images.add} style={styles.buttonImage} />
                <Text style={styles.buttonText}>{i18n('Add Due Date')}</Text>
              </View>
            </TouchableHighlight>)
  }

  render () {
    const rows = this.state.dates.map(this.renderDate)
    const button = this.renderButton()
    const showButton = this.props.canAddDueDates || this.props.canAddDueDates == null
    return (<View style={styles.container}>
              {rows}
              <View style={styles.space} />
              { showButton &&
                <View>
                  {button}
                  <View style={styles.space} />
                </View>
              }
            </View>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateContainer: {
  },
  row: {
    height: 54,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.seperatorColor,
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingLeft: global.style.defaultPadding,
    paddingRight: global.style.defaultPadding,
  },
  detailsRowContainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    borderTopWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.seperatorColor,
  },
  titleText: {
    fontWeight: '600',
  },
  detailText: {
  },
  detailTextMissing: {
    color: '#8B969E',
  },
  space: {
    height: 24,
    backgroundColor: '#F5F5F5',
  },
  button: {
    height: 54,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.seperatorColor,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.seperatorColor,
  },
  buttonInnerContainer: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: global.style.defaultPadding,
    paddingRight: global.style.defaultPadding,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008EE2',
  },
  buttonImage: {
    tintColor: colors.primaryButton,
    marginRight: 8,
    height: 18,
    width: 18,
  },
  removeButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: global.style.defaultPadding,
    paddingTop: 14,
  },
  removeButton: {
    fontSize: 14,
    color: '#EE0612',
    fontWeight: '500',
  },
  dateEditorContainer: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.seperatorColor,
    backgroundColor: 'white',
  },
  deleteDateTypeButton: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
