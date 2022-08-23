import { gql } from '@apollo/client'
import { Outlet } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { ClickAwayListener, Typography } from '@mui/material'
import { useApolloClient } from '@apollo/client'
import { useLocation, Location } from 'react-router-dom'

import { useInternationalization } from '~/hooks/core/useInternationalization'
import { logOut, useCurrentUserInfosVar, envGlobalVar } from '~/core/apolloClient'
import { AppEnvEnum } from '~/globalTypes'
import {
  Avatar,
  Button,
  ButtonLink,
  Icon,
  IconName,
  Popper,
  Skeleton,
  NavigationTab,
} from '~/components/designSystem'
import { theme } from '~/styles'
import { DOCUMENTATION_URL } from '~/externalUrls'
import { MenuPopper } from '~/styles/designSystem'
import {
  BILLABLE_METRICS_ROUTE,
  PLANS_ROUTE,
  CUSTOMERS_LIST_ROUTE,
  CUSTOMER_DETAILS_TAB_ROUTE,
  DEVELOPPERS_ROUTE,
  SETTINGS_ROUTE,
  HOME_ROUTE,
  COUPONS_ROUTE,
  CUSTOMER_DETAILS_ROUTE,
  ADD_ONS_ROUTE,
  ONLY_DEV_DESIGN_SYSTEM_ROUTE,
  ONLY_DEV_DESIGN_SYSTEM_TAB_ROUTE,
} from '~/core/router'
import { useCurrentVersionQuery } from '~/generated/graphql'

const NAV_WIDTH = 240
const { appEnv } = envGlobalVar()

gql`
  query CurrentVersion {
    currentVersion {
      githubUrl
      number
    }
  }
`

interface TabProps {
  title: string
  icon: IconName
  link: string
  match?: string[]
  external?: boolean
}

const SideNav = () => {
  const client = useApolloClient()
  const { currentOrganization } = useCurrentUserInfosVar()
  const { translate } = useInternationalization()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { data, loading, error } = useCurrentVersionQuery()
  const { pathname, state } = location as Location & { state: { disableScrollTop?: boolean } }
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Avoid weird scroll behaviour on navigation
    if (!contentRef.current || state?.disableScrollTop) return

    contentRef.current?.scrollTo(0, 0)
  }, [pathname, contentRef, state?.disableScrollTop])

  return (
    <Container>
      <BurgerButton
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        icon="burger"
        variant="quaternary"
      />
      <ClickAwayListener
        onClickAway={() => {
          if (open) setOpen(false)
        }}
      >
        <Drawer className="drawer" $open={open}>
          <Header className="header">
            <Popper
              PopperProps={{ placement: 'bottom-start' }}
              minWidth={320}
              maxHeight={`calc(100vh - 64px - 16px)`}
              enableFlip={false}
              opener={
                <HeaderButton data-test="side-nav-name" variant="quaternary">
                  {currentOrganization?.logoUrl ? (
                    <Avatar size="small" variant="connector">
                      <img
                        src={currentOrganization?.logoUrl as string}
                        alt={`${currentOrganization?.name}'s logo`}
                      />
                    </Avatar>
                  ) : (
                    <Avatar
                      variant="company"
                      identifier={currentOrganization?.name || ''}
                      size="small"
                      initials={(currentOrganization?.name ?? 'Lago')[0]}
                    />
                  )}
                  {currentOrganization?.name}
                </HeaderButton>
              }
            >
              {() => (
                <StyledMenuPopper>
                  <Logout>
                    <Button
                      variant="quaternary"
                      align="left"
                      startIcon="logout"
                      onClick={async () => await logOut(client, true)}
                    >
                      {translate('text_623b497ad05b960101be3444')}
                    </Button>
                  </Logout>
                  {!!loading && !error ? (
                    <Version>
                      <Skeleton variant="text" height={12} width={48} />
                      <Skeleton variant="text" height={12} width={120} />
                    </Version>
                  ) : !!data && !error ? (
                    <Version>
                      <Typography>{translate('text_62c6c95fe73d08be5b86c334')}</Typography>
                      <ExternalLink
                        href={data?.currentVersion?.githubUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {data?.currentVersion?.number}
                        <ExternalLinkIcon name="outside" size="small" />
                      </ExternalLink>
                    </Version>
                  ) : undefined}
                </StyledMenuPopper>
              )}
            </Popper>
          </Header>
          <Nav className="nav">
            <TabsButtons>
              <NavigationTab
                onClick={() => setOpen(false)}
                tabs={[
                  {
                    title: translate('text_623b497ad05b960101be3448'),
                    icon: 'pulse',
                    link: BILLABLE_METRICS_ROUTE,
                    match: [BILLABLE_METRICS_ROUTE, HOME_ROUTE],
                  },
                  {
                    title: translate('text_62442e40cea25600b0b6d85a'),
                    icon: 'board',
                    link: PLANS_ROUTE,
                  },
                  {
                    title: translate('text_629728388c4d2300e2d3801a'),
                    icon: 'puzzle',
                    link: ADD_ONS_ROUTE,
                  },
                  {
                    title: translate('text_62865498824cc10126ab2940'),
                    icon: 'coupon',
                    link: COUPONS_ROUTE,
                  },
                  {
                    title: translate('text_624efab67eb2570101d117a5'),
                    icon: 'user-multiple',
                    link: CUSTOMERS_LIST_ROUTE,
                    canBeClickedOnActive: true,
                    match: [
                      CUSTOMERS_LIST_ROUTE,
                      CUSTOMER_DETAILS_ROUTE,
                      CUSTOMER_DETAILS_TAB_ROUTE,
                    ],
                  },
                ]}
                orientation="vertical"
              />
            </TabsButtons>
            <BottomButtons>
              <NavigationTab
                onClick={() => setOpen(false)}
                tabs={[
                  ...([AppEnvEnum.qa, AppEnvEnum.development].includes(appEnv)
                    ? [
                        {
                          title: 'Design System',
                          icon: 'rocket',
                          link: ONLY_DEV_DESIGN_SYSTEM_ROUTE,
                          match: [ONLY_DEV_DESIGN_SYSTEM_TAB_ROUTE, ONLY_DEV_DESIGN_SYSTEM_ROUTE],
                        } as TabProps,
                      ]
                    : []),
                  {
                    title: translate('text_6295e58352f39200d902b01c'),
                    icon: 'book',
                    link: DOCUMENTATION_URL,
                    external: true,
                  },
                  {
                    title: translate('text_6271200984178801ba8bdeac'),
                    icon: 'laptop',
                    link: DEVELOPPERS_ROUTE,
                  },
                  {
                    title: translate('text_62728ff857d47b013204c726'),
                    icon: 'settings',
                    link: SETTINGS_ROUTE,
                  },
                ]}
                orientation="vertical"
              />
            </BottomButtons>
          </Nav>
        </Drawer>
      </ClickAwayListener>
      <Content ref={contentRef}>
        <Outlet />
        <Gift
          type="button"
          buttonProps={{ variant: 'quaternary', size: 'medium' }}
          to="https://www.incredibox.com/demo/"
          external
        >
          <span role="img" aria-label="gift">
            🎁
          </span>
        </Gift>
      </Content>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  height: 100vh;
`

const BurgerButton = styled(Button)`
  && {
    position: absolute;
    z-index: ${theme.zIndex.drawer};
    left: ${theme.spacing(4)};
    top: ${theme.spacing(4)};

    ${theme.breakpoints.up('md')} {
      display: none;
    }
  }
`

const Drawer = styled.div<{ $open: boolean }>`
  height: 100vh;
  box-shadow: ${theme.shadows[6]};
  width: ${NAV_WIDTH}px;
  overflow: hidden;
  transition: left 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  display: flex;
  flex-direction: column;
  background-color: ${theme.palette.common.white};

  ${theme.breakpoints.down('md')} {
    position: absolute;
    z-index: ${theme.zIndex.drawer - 1};
    left: ${({ $open }) => ($open ? 0 : -NAV_WIDTH)}px;
  }
`

const Header = styled.div`
  padding: ${theme.spacing(4)} ${theme.spacing(4)} ${theme.spacing(2)} ${theme.spacing(4)};

  ${theme.breakpoints.down('md')} {
    margin-top: calc(40px + ${theme.spacing(4)});
  }
`

const HeaderButton = styled(Button)`
  max-width: calc(${NAV_WIDTH}px - ${theme.spacing(8)});
  color: ${theme.palette.text.secondary};
  text-align: left;
  :hover {
    color: ${theme.palette.text.secondary};
  }

  :focus:not(:active) {
    box-shadow: none;
    border-radius: 12px;
  }

  > *:first-child {
    margin-right: ${theme.spacing(2)};
  }
`

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`

const Nav = styled.div`
  padding: ${theme.spacing(2)} ${theme.spacing(4)} ${theme.spacing(4)};
  overflow: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
`

const TabsButtons = styled.div`
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  width: 100%;

  > * {
    text-align: left;

    &:not(:last-child) {
      margin-bottom: ${theme.spacing(1)};
    }
  }
`

const BottomButtons = styled.div`
  margin-top: auto;
  width: 100%;
  box-sizing: border-box;
  flex-direction: column;
  display: flex;

  > * {
    text-align: left;

    &:not(:last-child) {
      margin-bottom: ${theme.spacing(1)};
    }
  }
`

const StyledMenuPopper = styled(MenuPopper)`
  padding: 0;
  overflow: hidden;
  height: inherit;
  max-height: inherit;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  > :first-child {
    margin-bottom: 0;
  }
`

const Logout = styled.div`
  box-shadow: ${theme.shadows[7]};
  padding: ${theme.spacing(2)};

  > * {
    width: 100%;
    text-align: left;
  }
`

const Version = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  height: ${theme.spacing(5)};
`

const ExternalLinkIcon = styled(Icon)`
  margin-left: ${theme.spacing(2)};

  &:hover {
    cursor: pointer;
  }
`

const ExternalLink = styled.a`
  color: ${theme.palette.primary[600]};

  &:visited {
    color: ${theme.palette.primary[600]};
  }
`

const Gift = styled(ButtonLink)`
  position: absolute;
  bottom: ${theme.spacing(3)};
  right: ${theme.spacing(3)};
  opacity: 0.03;
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  > * {
    min-width: 30px;
    height: 30px;
    width: 30px;
    padding: 0;
  }

  &:hover {
    opacity: 1;
  }
`

export default SideNav
