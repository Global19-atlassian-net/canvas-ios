//
// This file is part of Canvas.
// Copyright (C) 2017-present  Instructure, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

// @flow
import { NativeModules, Linking } from 'react-native'
import { route } from './index'
import { getAuthenticatedSessionURL } from '../canvas-api'
import { recordRoute } from '../modules/developer-menu/DeveloperMenu'
import { logEvent } from '../common/CanvasAnalytics'
import { isStudent } from '../modules/app'

const { Helm } = NativeModules

type ShowOptions = {
  modal: boolean,
  modalPresentationStyle: string,
  embedInNavigationController: boolean,
  disableSwipeDownToDismissModal: boolean,
}

export type TraitCollectionType = 'compact' | 'regular' | 'unspecified'
export type TraitCollection = {
  ['screen' | 'window']: {
    horizontal: TraitCollectionType,
    vertical: TraitCollectionType,
  },
}

export default class Navigator {
  moduleName = ''
  isModal = false

  constructor (moduleName: string, options: { [string]: any } = {}) {
    this.moduleName = moduleName
    // options consists of any option that was passed into show when
    // routing so we can add other options here as needed
    this.isModal = options.modal
  }

  show (url: string, options: Object = { modal: false, modalPresentationStyle: 'formsheet', deepLink: false, detail: false }, additionalProps: Object = {}) {
    recordRoute(url, options, additionalProps)
    const r = route(url, additionalProps)
    if (!r) {
      return this.showWebView(url)
    }
    if (r.config.showInWebView || (options.deepLink && !r.config.deepLink)) {
      return this.showWebView(url)
    }

    let canBecomeMaster = false
    if (r.config && r.config.canBecomeMaster) {
      canBecomeMaster = r.config.canBecomeMaster
    }
    if (options.modal) {
      const embedInNavigationController = options.embedInNavigationController == null || options.embedInNavigationController
      const modalPresentationStyle = options.modalPresentationStyle || 'formsheet'
      let disableSwipeDownToDismissModal = options.disableSwipeDownToDismissModal == null || options.disableSwipeDownToDismissModal
      if (modalPresentationStyle === 'fullscreen') disableSwipeDownToDismissModal = false
      return this.present(r, { modal: options.modal, modalPresentationStyle, embedInNavigationController, canBecomeMaster: canBecomeMaster, modalTransitionStyle: options.modalTransitionStyle, disableSwipeDownToDismissModal })
    } else {
      return this.push(r, { detail: options.detail })
    }
  }

  async showWebView (url: string) {
    url = url.replace(/^canvas-[^:]*:/i, 'https:')
    if (url.startsWith('http') || url.startsWith('https')) {
      logEvent('webview_content_selected', { url })
      let openURL = isStudent() ? Linking.openURL.bind(Linking) : Helm.openInSafariViewController
      try {
        let { data: { session_url: authenticatedURL } } = await getAuthenticatedSessionURL(url)
        openURL(authenticatedURL)
      } catch (err) {
        openURL(url)
      }
    } else {
      Linking.openURL(url)
    }
  }

  replace (url: string, options: Object = { modal: false, modalPresentationStyle: 'formsheet' }, additionalProps: Object = {}) {
    const r = route(url, additionalProps)
    if (r) NativeModules.Helm.pushFrom(this.moduleName, r.screen, r.passProps, { ...r.config, replace: true })
  }

  push (route: RouteOptions, options) {
    const opts = { ...route.config, ...options }
    return NativeModules.Helm.pushFrom(this.moduleName, route.screen, route.passProps, opts)
  }

  pop () {
    return NativeModules.Helm.popFrom(this.moduleName)
  }

  present (route: RouteOptions, options: ShowOptions) {
    return NativeModules.Helm.present(route.screen, route.passProps, options)
  }

  dismiss () {
    return NativeModules.Helm.dismiss({})
  }

  dismissAllModals () {
    return NativeModules.Helm.dismissAllModals({})
  }

  traitCollection (handler: (traits: TraitCollection) => void): any {
    return NativeModules.Helm.traitCollection(this.moduleName, handler)
  }
}
