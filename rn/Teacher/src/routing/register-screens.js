// @flow

import FavoritedCourseList from '../modules/course-list/FavoritedCourseList'
import AllCourseList from '../modules/course-list/AllCourseList'
import CourseDetails from '../modules/course-details/CourseDetails'
import Inbox from '../modules/inbox/Inbox'
import Profile from '../modules/profile/Profile'
import DefaultState from '../modules/default-state/DefaultState'
import LegoSets from '../modules/toys/legos/LegoSets'
import ActionFigures from '../modules/toys/action-figures/ActionFigures'

import { Store } from 'redux'
import { registerScreen } from './'

export function registerScreens (store: Store): void {
  registerScreen('/', () => FavoritedCourseList, store)
  registerScreen('/courses', () => AllCourseList, store)
  registerScreen('/courses/:courseID', () => CourseDetails, store)
  registerScreen('/conversations', () => Inbox, store)
  registerScreen('/profile', () => Profile, store)
  registerScreen('/default', () => DefaultState, store)
  registerScreen('/toys/legosets', () => LegoSets, store)
  registerScreen('/toys/actionfigures', () => ActionFigures, store)
}
