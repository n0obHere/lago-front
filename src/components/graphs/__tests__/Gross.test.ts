import { DateTime } from 'luxon'

import { AreaGrossRevenuesChartFakeData } from '~/components/designSystem/graphs/fixtures'
import { getAllDataForGrossDisplay } from '~/components/graphs/Gross'
import { AnalyticsPeriodScopeEnum } from '~/components/graphs/MonthSelectorDropdown'
import { GRAPH_YEAR_MONTH_DATE_FORMAT } from '~/components/graphs/utils'
import { CurrencyEnum } from '~/generated/graphql'

describe('components/graphs/Gross', () => {
  describe('getAllDataForGrossDisplay', () => {
    it('should return 12 months on year blur mode', () => {
      const res = getAllDataForGrossDisplay({
        data: AreaGrossRevenuesChartFakeData,
        currency: CurrencyEnum.Eur,
        demoMode: false,
        blur: true,
        period: AnalyticsPeriodScopeEnum.Year,
      })

      expect(res.dataForAreaChart.length).toBe(13)
      expect(res.dataForAreaChart[0].axisName).toBe(
        DateTime.now().minus({ month: 12 }).startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )
      expect(res.dataForAreaChart[12].axisName).toBe(
        DateTime.now().startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )
      expect(res.dateFrom).toBe(
        DateTime.now().minus({ month: 12 }).startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )
      expect(res.dateTo).toBe(
        DateTime.now().startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )

      expect(typeof res.amountSum).toBe('number')
    })

    it('should return 12 months on year demo mode', () => {
      const res = getAllDataForGrossDisplay({
        data: AreaGrossRevenuesChartFakeData,
        currency: CurrencyEnum.Eur,
        demoMode: true,
        blur: false,
        period: AnalyticsPeriodScopeEnum.Year,
      })

      expect(res.dataForAreaChart.length).toBe(13)
      expect(res.dataForAreaChart[0].axisName).toBe(
        DateTime.now().minus({ month: 12 }).startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )
      expect(res.dataForAreaChart[12].axisName).toBe(
        DateTime.now().startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )
      expect(res.dateFrom).toBe(
        DateTime.now().minus({ month: 12 }).startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )
      expect(res.dateTo).toBe(
        DateTime.now().startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )

      expect(typeof res.amountSum).toBe('number')
    })

    it('should return 4 months on quarterly demo mode', () => {
      const res = getAllDataForGrossDisplay({
        data: AreaGrossRevenuesChartFakeData,
        currency: CurrencyEnum.Eur,
        demoMode: true,
        blur: false,
        period: AnalyticsPeriodScopeEnum.Quarter,
      })

      expect(res.dataForAreaChart.length).toBe(4)
      expect(res.dataForAreaChart[0].axisName).toBe(
        DateTime.now().minus({ month: 3 }).startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )
      expect(res.dataForAreaChart[3].axisName).toBe(
        DateTime.now().startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )
      expect(res.dateFrom).toBe(
        DateTime.now().minus({ month: 3 }).startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )
      expect(res.dateTo).toBe(
        DateTime.now().startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )

      expect(typeof res.amountSum).toBe('number')
    })

    it('should return 2 months on quarterly demo mode', () => {
      const res = getAllDataForGrossDisplay({
        data: AreaGrossRevenuesChartFakeData,
        currency: CurrencyEnum.Eur,
        demoMode: true,
        blur: false,
        period: AnalyticsPeriodScopeEnum.Month,
      })

      expect(res.dataForAreaChart.length).toBe(2)
      expect(res.dataForAreaChart[0].axisName).toBe(
        DateTime.now().minus({ month: 1 }).startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )
      expect(res.dataForAreaChart[1].axisName).toBe(
        DateTime.now().startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )
      expect(res.dateFrom).toBe(
        DateTime.now().minus({ month: 1 }).startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )
      expect(res.dateTo).toBe(
        DateTime.now().startOf('month').toFormat(GRAPH_YEAR_MONTH_DATE_FORMAT),
      )

      expect(typeof res.amountSum).toBe('number')
    })
    it('should return correct total amount', () => {
      const res = getAllDataForGrossDisplay({
        data: [
          {
            amountCents: '5810000',
            currency: CurrencyEnum.Eur,
            month: DateTime.now().startOf('month').toISO(),
          },
          {
            amountCents: '3600000',
            currency: CurrencyEnum.Eur,
            month: DateTime.now().minus({ month: 1 }).startOf('month').toISO(),
          },
        ],
        currency: CurrencyEnum.Eur,
        demoMode: false,
        blur: false,
        period: AnalyticsPeriodScopeEnum.Month,
      })

      expect(res.amountSum).toBe(9410000)
    })
  })
})
