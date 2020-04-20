/*
 * IMPORTANT NOTE
 * Please don't modify this file throughout the project
 * You are allowed to add new items in any object
 */

const AggregationMethods = Object.freeze({
  NearBy: 'near_by', // Search the nearest provider and assign job
  Broadcast: 'broadcast', // Broadcast the job and available service provider will accept
  Customer: 'customer', // Customer will receive a list of providers and will select manually
  BiddingMiddleman: 'middleman' // Middleman broadcast the job to the provider on behalf of customer and then provide filtered providers to the customer
});

const ServiceDeliveryMethods = Object.freeze({
  Consultancy: 'consultancy', // Online Service
  CustomerLocation: 'customer_location', // Provider will visit customer location for the service
  ProviderLocation: 'provider_location', // Customer needs to visit provider location for the service
  JobTracking: 'job_tracking' // No Deleivery but Time and location tracking of provider will be calculated
});

const ServiceCostMethods = Object.freeze({
  DistanceRange: 'distance_range', // Cost on the basis of distance will be calculated (e.g. per KM)
  HourlyProvider: 'hourly_provider', // Cost will be calculated on the basis of the Hourly rate of provider
  HourlyCategory: 'hourly_category', // Cost will be calculated on the basis of the Hourly rate of category
  FixedPrice: 'fixed_price', // Provider will set the fixed price for the service
  FixedPriceAdmin: 'fixed_price', // Admin will set the fixed price for the service
  BidMilestone: 'bid_milestone' // Cost will be calculated on the milestones of job after bidding of providers
});

const PaymentMethods = Object.freeze({
  Cash: 'cash', // Customer will pay in cash
  CreditDebitCard: 'credit_debit_card', // Customer will use credit or debit card for the payment
  MobileMoney: 'mobile_money', // Customer will use mobile payment methods
  Credit: 'credit', // Customer will pay using the credits purchased externally or through our system
  Subscription: 'subscription',
  Escrow: 'escrow'
});

const BusinessModels = Object.freeze({
  Subscription: 'subscription',
  PaymentSplit: 'payment_split',
  Credit: 'credit',
  CompletePaymentToAdmin: 'complete_payment_to_admin'
});

module.exports = {
  AggregationMethods,
  ServiceDeliveryMethods,
  ServiceCostMethods,
  PaymentMethods,
  BusinessModels
};
