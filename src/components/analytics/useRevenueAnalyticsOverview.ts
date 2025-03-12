import { gql } from '@apollo/client'
import Decimal from 'decimal.js'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { formatRevenueStreamsData } from '~/components/analytics/utils'
import { AvailableFiltersEnum } from '~/components/designSystem/Filters'
import {
  formatFiltersForRevenueStreamsQuery,
  getFilterValue,
} from '~/components/designSystem/Filters/utils'
import { REVENUE_STREAMS_OVERVIEW_FILTER_PREFIX } from '~/core/constants/filters'
import {
  CurrencyEnum,
  RevenueStreamDataForOverviewSectionFragment,
  RevenueStreamDataForOverviewSectionFragmentDoc,
  useGetRevenueStreamsQuery,
} from '~/generated/graphql'
import { useOrganizationInfos } from '~/hooks/useOrganizationInfos'

gql`
  query getRevenueStreams(
    $currency: CurrencyEnum
    $customerCountry: CountryCode
    $customerType: CustomerTypeEnum
    $externalCustomerId: String
    $externalSubscriptionId: String
    $fromDate: ISO8601Date
    $planCode: String
    $timeGranularity: TimeGranularityEnum
    $toDate: ISO8601Date
  ) {
    dataApiRevenueStreams(
      currency: $currency
      customerCountry: $customerCountry
      customerType: $customerType
      externalCustomerId: $externalCustomerId
      externalSubscriptionId: $externalSubscriptionId
      fromDate: $fromDate
      planCode: $planCode
      timeGranularity: $timeGranularity
      toDate: $toDate
    ) {
      collection {
        ...RevenueStreamDataForOverviewSection
      }
    }
  }

  ${RevenueStreamDataForOverviewSectionFragmentDoc}
`

type RevenueAnalyticsOverviewReturn = {
  currency: CurrencyEnum
  data: RevenueStreamDataForOverviewSectionFragment[]
  hasError: boolean
  isLoading: boolean
  lastNetRevenueAmountCents: string
  netRevenueAmountCentsProgressionOnPeriod: string
  timeGranularity: string | null
}

const getFilterByKey = (key: AvailableFiltersEnum, searchParams: URLSearchParams) => {
  return getFilterValue({
    key,
    searchParams,
    prefix: REVENUE_STREAMS_OVERVIEW_FILTER_PREFIX,
  })
}

export const useRevenueAnalyticsOverview = (): RevenueAnalyticsOverviewReturn => {
  const [searchParams] = useSearchParams()
  const { organization } = useOrganizationInfos()

  const filtersForRevenueStreamsQuery = useMemo(() => {
    return formatFiltersForRevenueStreamsQuery(searchParams)
  }, [searchParams])

  const {
    data: revenueStreamsData,
    loading: revenueStreamsLoading,
    error: revenueStreamsError,
  } = useGetRevenueStreamsQuery({
    variables: {
      ...filtersForRevenueStreamsQuery,
    },
  })

  const timeGranularity = getFilterByKey(AvailableFiltersEnum.timeGranularity, searchParams)

  const currency = useMemo(() => {
    const currencyFromFilter = getFilterByKey(AvailableFiltersEnum.currency, searchParams)

    if (!!currencyFromFilter) {
      return currencyFromFilter as CurrencyEnum
    }
    return organization?.defaultCurrency || CurrencyEnum.Usd
  }, [searchParams, organization])

  const formattedRevenueStreamsData = useMemo(() => {
    return formatRevenueStreamsData({
      searchParams,
      data: revenueStreamsData?.dataApiRevenueStreams.collection,
    })
  }, [revenueStreamsData, searchParams])

  const { lastNetRevenueAmountCents, netRevenueAmountCentsProgressionOnPeriod } = useMemo(() => {
    if (!formattedRevenueStreamsData.length) {
      return {
        lastNetRevenueAmountCents: '0',
        netRevenueAmountCentsProgressionOnPeriod: '0',
      }
    }

    const localFirstNetRevenueAmountCents = Number(
      formattedRevenueStreamsData[0]?.netRevenueAmountCents,
    )
    const localLastNetRevenueAmountCents: string =
      formattedRevenueStreamsData[formattedRevenueStreamsData.length - 1]?.netRevenueAmountCents

    // Bellow calcul should *100 but values are already in cents so no need to do it
    // Also explain why the toFixed is 4 and not 2
    const localNetRevenueAmountCentsProgressionOnPeriod = new Decimal(
      Number(localLastNetRevenueAmountCents || 0),
    )
      .sub(localFirstNetRevenueAmountCents)
      .dividedBy(localFirstNetRevenueAmountCents || 1)
      .toFixed(4)

    return {
      lastNetRevenueAmountCents: localLastNetRevenueAmountCents,
      netRevenueAmountCentsProgressionOnPeriod: localNetRevenueAmountCentsProgressionOnPeriod,
    }
  }, [formattedRevenueStreamsData])

  return {
    currency,
    lastNetRevenueAmountCents,
    netRevenueAmountCentsProgressionOnPeriod,
    timeGranularity,
    data: formattedRevenueStreamsData,
    hasError: !!revenueStreamsError && !revenueStreamsLoading,
    isLoading: revenueStreamsLoading,
  }
}
