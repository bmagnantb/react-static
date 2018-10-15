import React from 'react'
import axios from 'axios'
//
import { getEmbeddedRouteInfo } from '../utils'
import Spinner from './Spinner'

// Share a single promise for all siteData requests
let siteDataPromise

const embeddedRouteInfo = getEmbeddedRouteInfo()

export default class SiteData extends React.Component {
  static defaultProps = {
    Loader: Spinner,
  }
  state = {
    // Default siteData to use the exportContext if possible
    // This will be undefined in development, which will
    // then be requested at runtime.
    siteData: embeddedRouteInfo ? embeddedRouteInfo.siteInfo : null,
  }
  componentDidMount() {
    this.fetchSiteData()
  }
  componentWillUnmount() {
    this.unmounting = true
  }
  fetchSiteData = async () => {
    // We only fetch siteData in development. Normally
    // it is already embedded in the HTML.
    if (process.env.REACT_STATIC_ENV === 'development') {
      // If there is an error here, it should be caught
      // by the nearest React ErrorBoundary
      const { data: siteData } = await (() => {
        if (siteDataPromise) {
          return siteDataPromise
        }
        siteDataPromise = axios.get('/__react-static__/siteData')
        return siteDataPromise
      })()
      if (this.unmounting) {
        return
      }
      this.setState({
        siteData,
      })
    }
  }
  render() {
    const { children, Loader } = this.props
    const { siteData, siteDataError } = this.state

    // If there was a fetch error in dev, throw it to the nearest ErrorBoundary
    if (siteDataError) {
      throw siteDataError
    }

    if (!siteData) {
      return <Loader />
    }

    return children(siteData)
  }
}

export function withSiteData(Comp, opts = {}) {
  return props => (
    <SiteData {...opts}>
      {siteData => <Comp {...siteData} {...props} />}
    </SiteData>
  )
}