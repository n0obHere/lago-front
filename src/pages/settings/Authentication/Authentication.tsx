import { gql } from '@apollo/client'
import { Avatar } from 'lago-design-system'
import { useRef } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'

import { Chip, Selector, Typography } from '~/components/designSystem'
import { PageBannerHeaderWithBurgerMenu } from '~/components/layouts/CenteredPage'
import {
  SettingsListItem,
  SettingsListItemLoadingSkeleton,
  SettingsListWrapper,
  SettingsPaddedContainer,
  SettingsPageHeaderContainer,
} from '~/components/layouts/Settings'
import { PremiumWarningDialog, PremiumWarningDialogRef } from '~/components/PremiumWarningDialog'
import { AddOktaDialog, AddOktaDialogRef } from '~/components/settings/authentication/AddOktaDialog'
import {
  DeleteOktaIntegrationDialog,
  DeleteOktaIntegrationDialogRef,
} from '~/components/settings/authentication/DeleteOktaIntegrationDialog'
import { OKTA_AUTHENTICATION_ROUTE } from '~/core/router'
import {
  AddOktaIntegrationDialogFragmentDoc,
  DeleteOktaIntegrationDialogFragmentDoc,
  OktaIntegration,
  PremiumIntegrationTypeEnum,
  useGetAuthIntegrationsQuery,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import { useOrganizationInfos } from '~/hooks/useOrganizationInfos'
import Okta from '~/public/images/okta.svg'

gql`
  query GetAuthIntegrations($limit: Int!) {
    integrations(limit: $limit) {
      collection {
        ... on OktaIntegration {
          id
          ...AddOktaIntegrationDialog
          ...DeleteOktaIntegrationDialog
        }
      }
    }
  }

  ${AddOktaIntegrationDialogFragmentDoc}
  ${DeleteOktaIntegrationDialogFragmentDoc}
`

const Authentication = () => {
  const { isPremium } = useCurrentUser()
  const { translate } = useInternationalization()
  const { organization: { premiumIntegrations } = {} } = useOrganizationInfos()
  const navigate = useNavigate()

  const premiumWarningDialogRef = useRef<PremiumWarningDialogRef>(null)
  const addOktaDialogRef = useRef<AddOktaDialogRef>(null)
  const deleteOktaDialogRef = useRef<DeleteOktaIntegrationDialogRef>(null)

  const { data, loading } = useGetAuthIntegrationsQuery({ variables: { limit: 10 } })

  const hasAccessTOktaPremiumIntegration = !!premiumIntegrations?.includes(
    PremiumIntegrationTypeEnum.Okta,
  )

  const oktaIntegration = data?.integrations?.collection.find(
    (integration) => integration.__typename === 'OktaIntegration',
  ) as OktaIntegration | undefined

  const shouldSeeOktaIntegration = hasAccessTOktaPremiumIntegration && isPremium

  return (
    <>
      <PageBannerHeaderWithBurgerMenu>
        <Typography variant="bodyHl" color="grey700">
          {translate('text_664c732c264d7eed1c74fd96')}
        </Typography>
      </PageBannerHeaderWithBurgerMenu>

      <SettingsPaddedContainer>
        <SettingsPageHeaderContainer>
          <Typography variant="headline">{translate('text_664c732c264d7eed1c74fd96')}</Typography>
          <Typography>{translate('text_664c732c264d7eed1c74fd9c')}</Typography>
        </SettingsPageHeaderContainer>

        <SettingsListWrapper>
          {!!loading ? (
            <SettingsListItemLoadingSkeleton count={2} />
          ) : (
            <SettingsListItem>
              <Selector
                title={translate('text_664c732c264d7eed1c74fda2')}
                subtitle={translate('text_664c732c264d7eed1c74fda8')}
                icon={
                  <Avatar size="big" variant="connector-full">
                    <Okta />
                  </Avatar>
                }
                endIcon={
                  shouldSeeOktaIntegration ? (
                    oktaIntegration?.id ? (
                      <Chip label={translate('text_634ea0ecc6147de10ddb662d')} />
                    ) : undefined
                  ) : (
                    'sparkles'
                  )
                }
                onClick={() => {
                  if (!shouldSeeOktaIntegration) {
                    return premiumWarningDialogRef.current?.openDialog()
                  }

                  if (oktaIntegration?.id) {
                    return navigate(
                      generatePath(OKTA_AUTHENTICATION_ROUTE, {
                        integrationId: oktaIntegration.id,
                      }),
                    )
                  }

                  return addOktaDialogRef.current?.openDialog({
                    integration: oktaIntegration,
                    callback: (id) =>
                      navigate(generatePath(OKTA_AUTHENTICATION_ROUTE, { integrationId: id })),
                  })
                }}
              />
            </SettingsListItem>
          )}
        </SettingsListWrapper>

        <PremiumWarningDialog ref={premiumWarningDialogRef} />
        <AddOktaDialog ref={addOktaDialogRef} />
        <DeleteOktaIntegrationDialog ref={deleteOktaDialogRef} />
      </SettingsPaddedContainer>
    </>
  )
}

export default Authentication
