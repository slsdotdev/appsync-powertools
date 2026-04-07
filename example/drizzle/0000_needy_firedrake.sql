CREATE TYPE "public"."access_scope_enum" AS ENUM('ADMIN', 'VENDOR', 'SHOP');--> statement-breakpoint
CREATE DOMAIN "public"."access_scope_enum" AS "text" CHECK (VALUE IN ('ADMIN', 'VENDOR', 'SHOP'));--> statement-breakpoint
CREATE TYPE "public"."actor_type_enum" AS ENUM('CUSTOMER', 'VENDOR', 'ADMIN', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."address_label_enum" AS ENUM('HOME', 'WORK', 'MARKET_PICKUP', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."allergen_enum" AS ENUM('MILK', 'EGGS', 'FISH', 'SHELLFISH', 'TREE_NUTS', 'PEANUTS', 'WHEAT', 'SOY', 'SESAME');--> statement-breakpoint
CREATE TYPE "public"."application_rejection_reason_enum" AS ENUM('INCOMPLETE_DOCUMENTATION', 'OUTSIDE_SERVICE_AREA', 'PRODUCT_CATEGORY_MISMATCH', 'FAILED_BACKGROUND_CHECK', 'DUPLICATE_APPLICATION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."application_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN');--> statement-breakpoint
CREATE TYPE "public"."assignment_status_enum" AS ENUM('ACTIVE', 'PENDING', 'EXPIRED', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."audit_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'ARCHIVE', 'RESTORE', 'LOGIN', 'LOGOUT', 'PERMISSION_CHANGE', 'STATUS_CHANGE', 'EXPORT');--> statement-breakpoint
CREATE TYPE "public"."business_type_enum" AS ENUM('SOLE_PROPRIETOR', 'PARTNERSHIP', 'LLC', 'CORPORATION', 'COOPERATIVE', 'NONPROFIT');--> statement-breakpoint
CREATE TYPE "public"."cache_scope_enum" AS ENUM('PUBLIC', 'PRIVATE');--> statement-breakpoint
CREATE TYPE "public"."card_brand_enum" AS ENUM('VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."config_value_type_enum" AS ENUM('STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'JSON');--> statement-breakpoint
CREATE TYPE "public"."currency_enum" AS ENUM('USD', 'EUR', 'GBP', 'CAD');--> statement-breakpoint
CREATE TYPE "public"."day_of_week_enum" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');--> statement-breakpoint
CREATE TYPE "public"."delivery_status_enum" AS ENUM('QUEUED', 'SENT', 'DELIVERED', 'BOUNCED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."dietary_tag_enum" AS ENUM('VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'NUT_FREE', 'PALEO', 'KETO', 'ORGANIC_ONLY', 'LOCAL_ONLY');--> statement-breakpoint
CREATE TYPE "public"."discount_type_enum" AS ENUM('FIXED_AMOUNT', 'PERCENTAGE', 'FREE_DELIVERY');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_method_enum" AS ENUM('DELIVERY', 'MARKET_PICKUP', 'SHIPPING');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_status_enum" AS ENUM('PENDING', 'PACKING', 'PACKED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'READY_FOR_PICKUP', 'PICKED_UP', 'FAILED_DELIVERY', 'RETURNED_TO_VENDOR');--> statement-breakpoint
CREATE TYPE "public"."harvest_method_enum" AS ENUM('HAND_PICKED', 'MACHINE_HARVESTED', 'WILD_FORAGED', 'GREENHOUSE', 'HYDROPONIC', 'AQUAPONIC');--> statement-breakpoint
CREATE TYPE "public"."inventory_adjustment_reason_enum" AS ENUM('RECEIVED', 'SOLD', 'RETURNED', 'DAMAGED', 'EXPIRED', 'CORRECTION', 'TRANSFER', 'RESERVED', 'RELEASED');--> statement-breakpoint
CREATE TYPE "public"."line_item_fulfillment_status_enum" AS ENUM('UNFULFILLED', 'FULFILLED', 'PARTIALLY_FULFILLED', 'RETURNED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."locale_enum" AS ENUM('EN_US', 'EN_GB', 'ES_US', 'FR_CA');--> statement-breakpoint
CREATE TYPE "public"."market_amenity_enum" AS ENUM('PARKING', 'RESTROOMS', 'ATM', 'LIVE_MUSIC', 'PET_FRIENDLY', 'WHEELCHAIR_ACCESSIBLE', 'EBT_ACCEPTED', 'COVERED_STALLS', 'FOOD_COURT');--> statement-breakpoint
CREATE TYPE "public"."moderation_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');--> statement-breakpoint
CREATE TYPE "public"."notification_category_enum" AS ENUM('ORDER_UPDATE', 'VENDOR_UPDATE', 'PRODUCT_ALERT', 'REVIEW_ACTIVITY', 'PAYMENT_UPDATE', 'PROMOTION', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."notification_channel_enum" AS ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH');--> statement-breakpoint
CREATE TYPE "public"."notification_priority_enum" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."order_cancellation_reason_enum" AS ENUM('CUSTOMER_REQUEST', 'PAYMENT_FAILED', 'OUT_OF_STOCK', 'VENDOR_UNABLE', 'FRAUD_SUSPECTED', 'ADMIN_ACTION');--> statement-breakpoint
CREATE TYPE "public"."order_event_enum" AS ENUM('ORDER_PLACED', 'PAYMENT_CAPTURED', 'PAYMENT_FAILED', 'VENDOR_ORDER_CREATED', 'VENDOR_ACKNOWLEDGED', 'PREPARATION_STARTED', 'READY_FOR_HANDOFF', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PICKED_UP', 'PARTIALLY_FULFILLED', 'FULLY_FULFILLED', 'CANCELLATION_REQUESTED', 'CANCELLED', 'REFUND_INITIATED', 'REFUND_COMPLETED', 'DISPUTE_OPENED', 'DISPUTE_RESOLVED', 'NOTE_ADDED');--> statement-breakpoint
CREATE TYPE "public"."order_status_enum" AS ENUM('PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."payment_event_enum" AS ENUM('PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'REFUND_ISSUED', 'PAYOUT_COMPLETED', 'PAYOUT_FAILED');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type_enum" AS ENUM('CREDIT_CARD', 'DEBIT_CARD', 'BANK_ACCOUNT', 'APPLE_PAY', 'GOOGLE_PAY', 'EBT', 'GIFT_CARD');--> statement-breakpoint
CREATE TYPE "public"."payout_status_enum" AS ENUM('SCHEDULED', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'ON_HOLD');--> statement-breakpoint
CREATE TYPE "public"."pricing_model_enum" AS ENUM('FIXED', 'PER_UNIT_WEIGHT', 'PAY_WHAT_YOU_WANT');--> statement-breakpoint
CREATE TYPE "public"."product_alert_type_enum" AS ENUM('BACK_IN_STOCK', 'LOW_STOCK', 'PRICE_DROP', 'SEASON_STARTED', 'SEASON_ENDING', 'NEW_PRODUCT');--> statement-breakpoint
CREATE TYPE "public"."product_status_enum" AS ENUM('DRAFT', 'ACTIVE', 'OUT_OF_SEASON', 'DISCONTINUED');--> statement-breakpoint
CREATE TYPE "public"."product_visibility_enum" AS ENUM('PUBLIC', 'UNLISTED', 'PRIVATE');--> statement-breakpoint
CREATE TYPE "public"."refund_reason_enum" AS ENUM('DAMAGED_PRODUCT', 'WRONG_ITEM', 'QUALITY_ISSUE', 'NEVER_RECEIVED', 'CHANGED_MIND', 'DUPLICATE_ORDER', 'VENDOR_CANCELLATION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."refund_status_enum" AS ENUM('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."refund_type_enum" AS ENUM('FULL', 'PARTIAL', 'LINE_ITEM');--> statement-breakpoint
CREATE TYPE "public"."review_report_reason_enum" AS ENUM('SPAM', 'OFFENSIVE_LANGUAGE', 'FAKE_REVIEW', 'IRRELEVANT_CONTENT', 'CONTAINS_PERSONAL_INFO', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."review_report_status_enum" AS ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED_NO_ACTION', 'RESOLVED_REMOVED', 'RESOLVED_EDITED');--> statement-breakpoint
CREATE TYPE "public"."review_vote_type_enum" AS ENUM('HELPFUL', 'NOT_HELPFUL');--> statement-breakpoint
CREATE TYPE "public"."role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'VENDOR_OWNER', 'VENDOR_STAFF', 'CUSTOMER', 'GUEST');--> statement-breakpoint
CREATE TYPE "public"."sort_direction_enum" AS ENUM('ASC', 'DESC');--> statement-breakpoint
CREATE TYPE "public"."system_severity_enum" AS ENUM('INFO', 'WARNING', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."transaction_status_enum" AS ENUM('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type_enum" AS ENUM('AUTHORIZATION', 'CAPTURE', 'VOID', 'REFUND', 'CHARGEBACK', 'CHARGEBACK_REVERSAL');--> statement-breakpoint
CREATE TYPE "public"."vendor_certification_enum" AS ENUM('USDA_ORGANIC', 'CERTIFIED_NATURALLY_GROWN', 'ANIMAL_WELFARE_APPROVED', 'FAIR_TRADE', 'NON_GMO_PROJECT', 'GAP_CERTIFIED', 'RAINFOREST_ALLIANCE');--> statement-breakpoint
CREATE TYPE "public"."vendor_member_role_enum" AS ENUM('OWNER', 'MANAGER', 'STAFF');--> statement-breakpoint
CREATE TYPE "public"."vendor_order_status_enum" AS ENUM('PENDING_ACKNOWLEDGEMENT', 'ACKNOWLEDGED', 'PREPARING', 'READY', 'HANDED_OFF', 'COMPLETED', 'CANCELLED', 'DISPUTED');--> statement-breakpoint
CREATE TYPE "public"."vendor_permission_enum" AS ENUM('MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_TEAM', 'VIEW_ANALYTICS', 'MANAGE_PAYOUTS', 'MANAGE_SETTINGS');--> statement-breakpoint
CREATE TYPE "public"."vendor_status_enum" AS ENUM('PENDING_APPLICATION', 'UNDER_REVIEW', 'APPROVED', 'SUSPENDED', 'DEACTIVATED');--> statement-breakpoint
CREATE TYPE "public"."verification_purpose_enum" AS ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION');--> statement-breakpoint
CREATE TYPE "public"."weight_unit_enum" AS ENUM('LB', 'KG', 'OZ', 'G');--> statement-breakpoint
CREATE TYPE "public"."wishlist_visibility_enum" AS ENUM('PRIVATE', 'SHARED_VIA_LINK', 'PUBLIC');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" "address_label_enum" NOT NULL,
	"recipient_name" text,
	"line_1" text NOT NULL,
	"line_2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"country_code" text NOT NULL,
	"location" json,
	"is_default" boolean NOT NULL,
	"delivery_notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" "audit_action_enum" NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"actor_type" "actor_type_enum" NOT NULL,
	"actor_id" uuid,
	"ip_address" text,
	"user_agent" text,
	"payload" json,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" json NOT NULL,
	"notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_token" text NOT NULL,
	"applied_coupon_codes" text[] NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"cart_item_id" uuid
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon_url" text,
	"sort_order" integer NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	"is_archived" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"discount_applied" json NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" "discount_type_enum" NOT NULL,
	"discount_value" varchar NOT NULL,
	"max_discount_amount" json,
	"minimum_order_amount" json,
	"applicable_vendor_ids" uuid[] NOT NULL,
	"applicable_category_ids" uuid[] NOT NULL,
	"usage_limit" integer,
	"usage_limit_per_user" integer,
	"current_usage_count" integer NOT NULL,
	"starts_at" timestamp NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean NOT NULL,
	"first_time_customer_only" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_at" timestamp,
	"is_archived" boolean NOT NULL,
	"coupon_redemption_id" uuid
);
--> statement-breakpoint
CREATE TABLE "delivery_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"boundary_geo_json" json NOT NULL,
	"center_point" json,
	"radius_miles" double precision,
	"delivery_fee" json NOT NULL,
	"minimum_order_amount" json,
	"free_delivery_threshold" json,
	"estimated_delivery_minutes" integer,
	"priority" integer NOT NULL,
	"is_active" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fulfillments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_order_id" uuid NOT NULL,
	"status" "fulfillment_status_enum" NOT NULL,
	"method" "fulfillment_method_enum" NOT NULL,
	"carrier" text,
	"tracking_number" text,
	"tracking_url" text,
	"scheduled_date" date,
	"scheduled_time_range" json,
	"packed_at" timestamp,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"delivery_proof_url" text,
	"internal_notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_adjustments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quantity_change" integer NOT NULL,
	"reason" "inventory_adjustment_reason_enum" NOT NULL,
	"reference_type" text,
	"reference_id" uuid,
	"notes" text,
	"performed_by_user_id" uuid,
	"inventory_record_id" uuid,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quantity_on_hand" integer NOT NULL,
	"quantity_reserved" integer NOT NULL,
	"low_stock_threshold" integer NOT NULL,
	"track_inventory" boolean NOT NULL,
	"allow_backorder" boolean NOT NULL,
	"backorder_limit" integer,
	"variant_id" uuid,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"version" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_order_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"variant_name" text NOT NULL,
	"sku" text,
	"quantity" integer NOT NULL,
	"unit_price" json NOT NULL,
	"discount" json NOT NULL,
	"tax" json NOT NULL,
	"line_total" json NOT NULL,
	"actual_weight" double precision,
	"actual_weight_unit" "weight_unit_enum",
	"notes" text,
	"fulfillment_status" "line_item_fulfillment_status_enum" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"address" text NOT NULL,
	"location" json NOT NULL,
	"cover_image_url" text,
	"amenities" "market_amenity_enum"[] NOT NULL,
	"accepting_vendors" boolean NOT NULL,
	"max_vendor_capacity" integer,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	"is_archived" boolean NOT NULL,
	"order_id" uuid,
	"operating_schedule_id" uuid
);
--> statement-breakpoint
CREATE TABLE "market_vendor_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"market_location_id" uuid NOT NULL,
	"stall_number" text,
	"assigned_days" "day_of_week_enum"[] NOT NULL,
	"effective_from" date NOT NULL,
	"effective_until" date,
	"status" "assignment_status_enum" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "notification_category_enum" NOT NULL,
	"channel" "notification_channel_enum" NOT NULL,
	"enabled" boolean NOT NULL,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_user_id" uuid NOT NULL,
	"channel" "notification_channel_enum" NOT NULL,
	"category" "notification_category_enum" NOT NULL,
	"priority" "notification_priority_enum" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"payload" json NOT NULL,
	"read_at" timestamp,
	"dismissed_at" timestamp,
	"clicked_at" timestamp,
	"delivery_ref" text,
	"delivery_status" "delivery_status_enum" NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operating_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"market_location_id" uuid,
	"day_of_week" "day_of_week_enum" NOT NULL,
	"time_range" json NOT NULL,
	"is_active" boolean NOT NULL,
	"seasonal_start" date,
	"seasonal_end" date,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_timeline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"vendor_order_id" uuid,
	"event" "order_event_enum" NOT NULL,
	"actor_type" "actor_type_enum" NOT NULL,
	"actor_id" uuid,
	"public_message" text,
	"internal_message" text,
	"metadata" json,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"order_number" text NOT NULL,
	"status" "order_status_enum" NOT NULL,
	"fulfillment_method" "fulfillment_method_enum" NOT NULL,
	"shipping_address" json,
	"pickup_location_id" uuid,
	"requested_date" date,
	"customer_notes" text,
	"subtotal" json NOT NULL,
	"discount_total" json NOT NULL,
	"tax_total" json NOT NULL,
	"delivery_fee" json NOT NULL,
	"tip" json NOT NULL,
	"grand_total" json NOT NULL,
	"tax_jurisdiction" text,
	"cancelled_at" timestamp,
	"cancellation_reason" "order_cancellation_reason_enum",
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"vendor_order_id" uuid,
	"payment_transaction_id" uuid,
	"refund_id" uuid,
	"coupon_redemption_id" uuid
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "payment_method_type_enum" NOT NULL,
	"processor_token" text NOT NULL,
	"last_four" text,
	"brand" "card_brand_enum",
	"expiry_month" integer,
	"expiry_year" integer,
	"billing_address" json,
	"is_default" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"payment_transaction_id" uuid
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_method_id" uuid,
	"idempotency_key" uuid NOT NULL,
	"type" "transaction_type_enum" NOT NULL,
	"status" "transaction_status_enum" NOT NULL,
	"amount" json NOT NULL,
	"processor_transaction_id" text,
	"processor_response" json,
	"failure_code" text,
	"failure_message" text,
	"parent_transaction_id" uuid,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"transaction_id" uuid
);
--> statement-breakpoint
CREATE TABLE "platform_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"value_type" "config_value_type_enum" NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "price_history_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"previous_price" json NOT NULL,
	"new_price" json NOT NULL,
	"changed_by_user_id" uuid,
	"reason" text,
	"product_id" uuid,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"variant_id" uuid
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"price" json NOT NULL,
	"compare_at_price" json,
	"cost_of_goods" json,
	"weight" double precision,
	"weight_unit" "weight_unit_enum",
	"is_default" boolean NOT NULL,
	"sort_order" integer NOT NULL,
	"product_id" uuid,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"version" integer NOT NULL,
	"cart_item_id" uuid,
	"line_item_id" uuid,
	"wishlist_item_id" uuid
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"short_description" text,
	"status" "product_status_enum" NOT NULL,
	"visibility" "product_visibility_enum" NOT NULL,
	"pricing_model" "pricing_model_enum" NOT NULL,
	"featured_image_url" text,
	"image_urls" text[] NOT NULL,
	"attributes" json NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"tags" text[] NOT NULL,
	"seasonal_start" date,
	"seasonal_end" date,
	"pre_order_enabled" boolean NOT NULL,
	"pre_order_lead_days" integer,
	"category_id" uuid,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_at" timestamp,
	"is_archived" boolean NOT NULL,
	"vendor_id" uuid,
	"review_id" uuid,
	"wishlist_item_id" uuid
);
--> statement-breakpoint
CREATE TABLE "refresh_token_families" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"family_id" uuid NOT NULL,
	"generation_counter" integer NOT NULL,
	"user_agent" text,
	"ip_address" text,
	"revoked_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"vendor_order_id" uuid,
	"status" "refund_status_enum" NOT NULL,
	"type" "refund_type_enum" NOT NULL,
	"reason" "refund_reason_enum" NOT NULL,
	"customer_note" text,
	"internal_note" text,
	"requested_amount" json NOT NULL,
	"approved_amount" json,
	"line_item_ids" uuid[],
	"transaction_id" uuid,
	"requested_at" timestamp NOT NULL,
	"reviewed_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "review_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"reporter_user_id" uuid NOT NULL,
	"reason" "review_report_reason_enum" NOT NULL,
	"details" text,
	"status" "review_report_status_enum" NOT NULL,
	"resolved_at" timestamp,
	"resolver_notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL,
	"review_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"responded_by_user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"moderation_status" "moderation_status_enum" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"vote" "review_vote_type_enum" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"body" text,
	"image_urls" text[] NOT NULL,
	"is_verified_purchase" boolean NOT NULL,
	"moderation_status" "moderation_status_enum" NOT NULL,
	"moderated_at" timestamp,
	"moderator_notes" text,
	"helpful_count" integer NOT NULL,
	"report_count" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	"is_archived" boolean NOT NULL,
	"review_response_id" uuid,
	"review_report_id" uuid
);
--> statement-breakpoint
CREATE TABLE "saved_searches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" text,
	"query" text NOT NULL,
	"filters" json NOT NULL,
	"notify_on_new_results" boolean NOT NULL,
	"last_notified_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_notifications" boolean NOT NULL,
	"sms_notifications" boolean NOT NULL,
	"push_notifications" boolean NOT NULL,
	"marketing_opt_in" boolean NOT NULL,
	"marketing_opt_in_at" timestamp,
	"preferred_currency" "currency_enum" NOT NULL,
	"preferred_locale" "locale_enum" NOT NULL,
	"dietary_tags" "dietary_tag_enum"[] NOT NULL,
	"allergen_alerts" "allergen_enum"[] NOT NULL,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"password_hash" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"roles" "role_enum"[] NOT NULL,
	"email_verified_at" timestamp,
	"phone_verified_at" timestamp,
	"last_login_at" timestamp,
	"login_count" integer,
	"locale" "locale_enum",
	"timezone" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	"is_archived" boolean,
	"cart_id" uuid,
	"order_id" uuid,
	"payment_method_id" uuid,
	"coupon_redemption_id" uuid,
	"review_id" uuid,
	"wishlist_id" uuid,
	"saved_search_id" uuid,
	"refresh_token_family_id" uuid,
	"verification_token_id" uuid,
	"applicant_user_id" uuid,
	"vendor_member_id" uuid
);
--> statement-breakpoint
CREATE TABLE "vendor_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"applicant_user_id" uuid NOT NULL,
	"business_type" "business_type_enum" NOT NULL,
	"years_in_operation" integer,
	"product_categories" text[] NOT NULL,
	"estimated_weekly_revenue" json,
	"farm_size_acres" double precision,
	"farm_address" text,
	"practices_description" text,
	"document_urls" text[] NOT NULL,
	"status" "application_status_enum" NOT NULL,
	"reviewer_user_id" uuid,
	"review_notes" text,
	"reviewed_at" timestamp,
	"rejection_reason" "application_rejection_reason_enum",
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "vendor_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "vendor_member_role_enum" NOT NULL,
	"permissions" "vendor_permission_enum"[] NOT NULL,
	"invited_by_user_id" uuid,
	"invited_at" timestamp,
	"accepted_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL,
	"order_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"reference_number" text NOT NULL,
	"status" "vendor_order_status_enum" NOT NULL,
	"subtotal" json NOT NULL,
	"commission_amount" json NOT NULL,
	"vendor_net_amount" json NOT NULL,
	"vendor_notes" text,
	"acknowledged_at" timestamp,
	"estimated_ready_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"line_item_id" uuid,
	"fulfillment_id" uuid
);
--> statement-breakpoint
CREATE TABLE "vendor_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"status" "payout_status_enum" NOT NULL,
	"gross_amount" json NOT NULL,
	"commission_deducted" json NOT NULL,
	"adjustments" json NOT NULL,
	"net_amount" json NOT NULL,
	"currency" "currency_enum" NOT NULL,
	"processor_payout_id" text,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"scheduled_at" timestamp,
	"initiated_at" timestamp,
	"completed_at" timestamp,
	"failed_at" timestamp,
	"failure_reason" text,
	"vendor_order_ids" uuid[] NOT NULL,
	"line_item_summary" json[] NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL,
	"slug" text NOT NULL,
	"business_name" text NOT NULL,
	"legal_name" text,
	"description" text,
	"short_bio" text,
	"logo_url" text,
	"banner_url" text,
	"website_url" text,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"status" "vendor_status_enum" NOT NULL,
	"tax_id" text,
	"payout_account_id" text,
	"commission_rate" varchar NOT NULL,
	"payout_hold_hours" integer NOT NULL,
	"certifications" "vendor_certification_enum"[] NOT NULL,
	"tags" text[] NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_at" timestamp,
	"is_archived" boolean NOT NULL,
	"vendor_order_id" uuid,
	"vendor_payout_id" uuid,
	"review_response_id" uuid,
	"vendor_application_id" uuid,
	"vendor_member_id" uuid,
	"operating_schedule_id" uuid
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"purpose" "verification_purpose_enum" NOT NULL,
	"consumed_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wishlist_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"notes" text,
	"product_name" text NOT NULL,
	"product_image_url" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean NOT NULL,
	"visibility" "wishlist_visibility_enum" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"wishlist_item_id" uuid
);
