import { CustomRouteObject } from './types'
import { lazyLoad } from './utils'

// ----------- Pages -----------
// Lists
const BillableMetricsList = lazyLoad(() => import('~/pages/BillableMetricsList'))
const PlansList = lazyLoad(() => import('~/pages/PlansList'))
const CouponsList = lazyLoad(() => import('~/pages/CouponsList'))
const AddOnsList = lazyLoad(() => import('~/pages/AddOnsList'))
const InvoicesPage = lazyLoad(() => import('~/pages/InvoicesPage'))

// Creation
const ApiKeysForm = lazyLoad(() => import('~/pages/developers/ApiKeysForm'))
const CreateBillableMetric = lazyLoad(() => import('~/pages/CreateBillableMetric'))
const CreateCustomer = lazyLoad(() => import('~/pages/CreateCustomer'))
const CreatePlan = lazyLoad(() => import('~/pages/CreatePlan'))
const CreateTax = lazyLoad(() => import('~/pages/CreateTax'))
const CreateInvoice = lazyLoad(() => import('~/pages/CreateInvoice'))
const CreateCoupon = lazyLoad(() => import('~/pages/CreateCoupon'))
const CreateAddOn = lazyLoad(() => import('~/pages/CreateAddOn'))
const CreateSubscription = lazyLoad(() => import('~/pages/CreateSubscription'))
const CreateWallet = lazyLoad(() => import('~/pages/wallet/CreateWallet'))
const CreateWalletTopUp = lazyLoad(() => import('~/pages/wallet/CreateWalletTopUp'))
const CreatePayment = lazyLoad(() => import('~/pages/CreatePayment'))
const AlertForm = lazyLoad(() => import('~/pages/AlertForm'))

// Details
const SubscriptionDetails = lazyLoad(() => import('~/pages/SubscriptionDetails'))
const PlanDetails = lazyLoad(() => import('~/pages/PlanDetails'))
const AddOnDetails = lazyLoad(() => import('~/pages/AddOnDetails'))
const CouponDetails = lazyLoad(() => import('~/pages/CouponDetails'))
const PaymentDetails = lazyLoad(() => import('~/pages/PaymentDetails'))
const BillableMetricDetails = lazyLoad(() => import('~/pages/BillableMetricDetails'))

// ----------- Routes -----------
// Lists
export const BILLABLE_METRICS_ROUTE = '/billable-metrics'
export const PLANS_ROUTE = '/plans'
export const COUPONS_ROUTE = '/coupons'
export const ADD_ONS_ROUTE = '/add-ons'
export const INVOICES_ROUTE = '/invoices'
export const INVOICES_TAB_ROUTE = '/invoices/:tab'

// Creation
export const CREATE_CUSTOMER_ROUTE = `/customer/create`
export const UPDATE_CUSTOMER_ROUTE = `/customer/:customerId/edit`

export const CREATE_API_KEYS_ROUTE = `/api-keys/create`
export const UPDATE_API_KEYS_ROUTE = `/api-keys/:apiKeyId/edit`

export const CREATE_BILLABLE_METRIC_ROUTE = '/create/billable-metrics'
export const UPDATE_BILLABLE_METRIC_ROUTE = '/update/billable-metric/:billableMetricId'
export const DUPLICATE_BILLABLE_METRIC_ROUTE = '/duplicate/billable-metric/:billableMetricId'

export const CREATE_PLAN_ROUTE = '/create/plans'
export const UPDATE_PLAN_ROUTE = '/update/plan/:planId'

export const CREATE_COUPON_ROUTE = '/create/coupons'
export const UPDATE_COUPON_ROUTE = '/update/coupons/:couponId'

export const CREATE_ADD_ON_ROUTE = '/create/add-on'
export const UPDATE_ADD_ON_ROUTE = '/update/add-on/:addOnId'

export const CREATE_TAX_ROUTE = '/create/tax'
export const UPDATE_TAX_ROUTE = '/update/tax/:taxId'

export const CREATE_INVOICE_ROUTE = '/customer/:customerId/create-invoice'

export const CREATE_SUBSCRIPTION = '/customer/:customerId/create/subscription'
export const UPDATE_SUBSCRIPTION = '/customer/:customerId/update/subscription/:subscriptionId'
export const UPGRADE_DOWNGRADE_SUBSCRIPTION =
  '/customer/:customerId/upgrade-downgrade/subscription/:subscriptionId'

export const CREATE_WALLET_ROUTE = '/customer/:customerId/wallet/create'
export const EDIT_WALLET_ROUTE = '/customer/:customerId/wallet/:walletId'

export const CREATE_WALLET_TOP_UP_ROUTE = '/customer/:customerId/wallet/:walletId/top-up'

export const CREATE_PAYMENT_ROUTE = '/create/payment'
export const CREATE_INVOICE_PAYMENT_ROUTE = '/invoice/:invoiceId/create/payment'

export const CREATE_ALERT_PLAN_SUBSCRIPTION_ROUTE =
  '/plan/:planId/subscription/:subscriptionId/alert/create'
export const CREATE_ALERT_CUSTOMER_SUBSCRIPTION_ROUTE =
  '/customer/:customerId/subscription/:subscriptionId/alert/create'
export const UPDATE_ALERT_PLAN_SUBSCRIPTION_ROUTE =
  '/plan/:planId/subscription/:subscriptionId/alert/:alertId/edit'
export const UPDATE_ALERT_CUSTOMER_SUBSCRIPTION_ROUTE =
  '/customer/:customerId/subscription/:subscriptionId/alert/:alertId/edit'

// Details
export const CUSTOMER_SUBSCRIPTION_DETAILS_ROUTE =
  '/customer/:customerId/subscription/:subscriptionId/:tab'
export const PLAN_SUBSCRIPTION_DETAILS_ROUTE = '/plan/:planId/subscription/:subscriptionId/:tab'
export const PLAN_DETAILS_ROUTE = '/plan/:planId/:tab'
export const CUSTOMER_SUBSCRIPTION_PLAN_DETAILS =
  '/customer/:customerId/subscription/:subscriptionId/plan/:planId/:tab'
export const ADD_ON_DETAILS_ROUTE = '/add-on/:addOnId'
export const COUPON_DETAILS_ROUTE = '/coupon/:couponId/:tab'
export const PAYMENT_DETAILS_ROUTE = '/payment/:paymentId'
export const CUSTOMER_PAYMENT_DETAILS_ROUTE = '/customer/:customerId/payment/:paymentId'

export const BILLABLE_METRIC_DETAILS_ROUTE = '/billable-metric/:billableMetricId/:tab'

export const objectListRoutes: CustomRouteObject[] = [
  {
    path: [BILLABLE_METRICS_ROUTE],
    private: true,
    element: <BillableMetricsList />,
    permissions: ['billableMetricsView'],
  },
  {
    path: PLANS_ROUTE,
    private: true,
    element: <PlansList />,
    permissions: ['plansView'],
  },
  {
    path: COUPONS_ROUTE,
    private: true,
    element: <CouponsList />,
    permissions: ['couponsView'],
  },
  {
    path: ADD_ONS_ROUTE,
    private: true,
    element: <AddOnsList />,
    permissions: ['addonsView'],
  },
  {
    path: [INVOICES_ROUTE, INVOICES_TAB_ROUTE],
    private: true,
    element: <InvoicesPage />,
    permissions: ['invoicesView', 'creditNotesView'],
  },
]

export const objectCreationRoutes: CustomRouteObject[] = [
  {
    path: [CREATE_CUSTOMER_ROUTE, UPDATE_CUSTOMER_ROUTE],
    private: true,
    element: <CreateCustomer />,
    permissions: ['customersCreate', 'customersUpdate'],
  },
  {
    path: [CREATE_API_KEYS_ROUTE, UPDATE_API_KEYS_ROUTE],
    private: true,
    element: <ApiKeysForm />,
    permissions: ['developersManage', 'developersKeysManage'],
  },
  {
    path: [CREATE_ADD_ON_ROUTE, UPDATE_ADD_ON_ROUTE],
    private: true,
    element: <CreateAddOn />,
    permissions: ['addonsCreate', 'addonsUpdate'],
  },
  {
    path: [CREATE_COUPON_ROUTE, UPDATE_COUPON_ROUTE],
    private: true,
    element: <CreateCoupon />,
    permissions: ['couponsCreate', 'couponsUpdate'],
  },
  {
    path: [
      CREATE_BILLABLE_METRIC_ROUTE,
      UPDATE_BILLABLE_METRIC_ROUTE,
      DUPLICATE_BILLABLE_METRIC_ROUTE,
    ],
    private: true,
    element: <CreateBillableMetric />,
    permissions: ['billableMetricsCreate', 'billableMetricsUpdate'],
  },
  {
    path: [CREATE_PLAN_ROUTE, UPDATE_PLAN_ROUTE],
    private: true,
    element: <CreatePlan />,
    permissions: ['plansCreate', 'plansUpdate'],
  },
  {
    path: [CREATE_TAX_ROUTE, UPDATE_TAX_ROUTE],
    private: true,
    element: <CreateTax />,
    permissions: ['organizationTaxesUpdate'],
  },
  {
    path: [CREATE_INVOICE_ROUTE],
    private: true,
    element: <CreateInvoice />,
    permissions: ['invoicesCreate'],
  },
  {
    path: [CREATE_SUBSCRIPTION, UPDATE_SUBSCRIPTION, UPGRADE_DOWNGRADE_SUBSCRIPTION],
    private: true,
    element: <CreateSubscription />,
    permissions: ['subscriptionsCreate', 'subscriptionsUpdate'],
  },
  {
    path: [CREATE_WALLET_ROUTE, EDIT_WALLET_ROUTE],
    private: true,
    element: <CreateWallet />,
    permissions: ['walletsCreate', 'walletsUpdate'],
  },
  {
    path: [CREATE_WALLET_TOP_UP_ROUTE],
    private: true,
    element: <CreateWalletTopUp />,
    permissions: ['walletsTopUp'],
  },
  {
    path: [CREATE_PAYMENT_ROUTE, CREATE_INVOICE_PAYMENT_ROUTE],
    private: true,
    element: <CreatePayment />,
    permissions: ['paymentsCreate'],
  },
  {
    path: [
      CREATE_ALERT_PLAN_SUBSCRIPTION_ROUTE,
      CREATE_ALERT_CUSTOMER_SUBSCRIPTION_ROUTE,
      UPDATE_ALERT_PLAN_SUBSCRIPTION_ROUTE,
      UPDATE_ALERT_CUSTOMER_SUBSCRIPTION_ROUTE,
    ],
    private: true,
    element: <AlertForm />,
    permissions: ['subscriptionsCreate', 'subscriptionsUpdate'],
  },
]

export const objectDetailsRoutes: CustomRouteObject[] = [
  {
    path: [CUSTOMER_SUBSCRIPTION_DETAILS_ROUTE, PLAN_SUBSCRIPTION_DETAILS_ROUTE],
    private: true,
    element: <SubscriptionDetails />,
    permissions: ['subscriptionsView'],
  },
  {
    path: [PLAN_DETAILS_ROUTE, CUSTOMER_SUBSCRIPTION_PLAN_DETAILS],
    private: true,
    element: <PlanDetails />,
    permissions: ['plansView'],
  },
  {
    path: [ADD_ON_DETAILS_ROUTE],
    private: true,
    element: <AddOnDetails />,
    permissions: ['addonsView'],
  },
  {
    path: [COUPON_DETAILS_ROUTE],
    private: true,
    element: <CouponDetails />,
    permissions: ['couponsView'],
  },
  {
    path: [PAYMENT_DETAILS_ROUTE, CUSTOMER_PAYMENT_DETAILS_ROUTE],
    private: true,
    element: <PaymentDetails />,
    permissions: ['paymentsView'],
  },
  {
    path: [BILLABLE_METRIC_DETAILS_ROUTE],
    private: true,
    element: <BillableMetricDetails />,
    permissions: ['billableMetricsView'],
  },
]
