import { gql } from '@apollo/client'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { generatePath, useNavigate, useParams } from 'react-router-dom'

import { Button, Typography } from '~/components/designSystem'
import { EVENT_LOG_ROUTE } from '~/components/developers/DevtoolsRouter'
import { EventDetails } from '~/components/developers/events/EventDetails'
import { EventTable } from '~/components/developers/events/EventTable'
import { ListSectionRef, LogsLayout } from '~/components/developers/LogsLayout'
import { getCurrentBreakpoint } from '~/core/utils/getCurrentBreakpoint'
import { useEventsQuery } from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { useDeveloperTool } from '~/hooks/useDeveloperTool'

gql`
  fragment EventItem on Event {
    id
    code
    receivedAt
  }

  query events($page: Int, $limit: Int) {
    events(page: $page, limit: $limit) {
      collection {
        ...EventItem
      }
      metadata {
        currentPage
        totalPages
      }
    }
  }
`

export const Events = () => {
  const { translate } = useInternationalization()
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const { size } = useDeveloperTool()
  const logListRef = useRef<ListSectionRef>(null)

  const getEventsResult = useEventsQuery({
    variables: { limit: 20 },
    notifyOnNetworkStatusChange: true,
  })

  const { data, loading, refetch } = getEventsResult

  // If no eventId is provided in params, navigate to the first event
  useEffect(() => {
    if (!eventId) {
      const firstEvent = data?.events?.collection[0]

      if (firstEvent && getCurrentBreakpoint() !== 'sm') {
        navigate(generatePath(EVENT_LOG_ROUTE, { eventId: firstEvent.id }), {
          replace: true,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.events?.collection, eventId])

  // The table should highlight the selected row when the eventId is provided in params
  useLayoutEffect(() => {
    if (eventId) {
      logListRef.current?.setActiveRow(eventId)
    }
  }, [eventId])

  const shouldDisplayLogDetails = !!eventId && !!data?.events?.collection.length

  return (
    <div className="not-last-child:shadow-b">
      <Typography variant="headline" className="p-4">
        {translate('text_1747058197364ivug6k5e2nc')}
      </Typography>

      <LogsLayout.CTASection>
        <Button
          variant="quaternary"
          size="small"
          startIcon="reload"
          loading={loading}
          onClick={async () => await refetch()}
        >
          {translate('text_1738748043939zqoqzz350yj')}
        </Button>
      </LogsLayout.CTASection>

      <LogsLayout.ListSection
        ref={logListRef}
        leftSide={<EventTable getEventsResult={getEventsResult} logListRef={logListRef} />}
        rightSide={<EventDetails goBack={() => logListRef.current?.updateView('backward')} />}
        shouldDisplayRightSide={shouldDisplayLogDetails}
        sectionHeight={shouldDisplayLogDetails ? `calc(${size}vh - 182px)` : '100%'} // 182px is the height of the headers (52px+64px+64px+2px of borders)
      />
    </div>
  )
}
