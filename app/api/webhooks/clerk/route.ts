import { NextRequest } from "next/server"
import { 
  verifyWebhookSignature, 
  createErrorResponse, 
  createSuccessResponse,
  logSecurityEvent 
} from "@/lib/security"
import { 
  logSecurity, 
  AuditEventType 
} from "@/lib/audit-logger"

// Webhook event types from Clerk
interface ClerkWebhookEvent {
  type: string
  data: {
    id: string
    email_addresses?: Array<{ email_address: string; id: string }>
    first_name?: string
    last_name?: string
    username?: string
    created_at: number
    updated_at: number
    last_sign_in_at?: number
    last_active_at?: number
    [key: string]: any
  }
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not configured")
      return createErrorResponse("Webhook secret not configured", 500, request)
    }

    // Verify webhook signature
    const verification = await verifyWebhookSignature(request, webhookSecret)
    
    if (!verification.isValid) {
      logSecurityEvent("WEBHOOK_VERIFICATION_FAILED", request, undefined, {
        error: verification.error
      })
      return createErrorResponse("Invalid webhook signature", 401, request)
    }

    const event = verification.payload as ClerkWebhookEvent
    
    // Log webhook received
    logSecurityEvent("WEBHOOK_RECEIVED", request, undefined, {
      eventType: event.type,
      userId: event.data.id
    })

    // Process different webhook events
    switch (event.type) {
      case "user.created":
        await handleUserCreated(event, request)
        break
        
      case "user.updated":
        await handleUserUpdated(event, request)
        break
        
      case "user.deleted":
        await handleUserDeleted(event, request)
        break
        
      case "session.created":
        await handleSessionCreated(event, request)
        break
        
      case "session.ended":
        await handleSessionEnded(event, request)
        break
        
      case "session.removed":
        await handleSessionRemoved(event, request)
        break
        
      case "session.token.updated":
        await handleSessionTokenUpdated(event, request)
        break
        
      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return createSuccessResponse({ received: true }, 200, request)

  } catch (error) {
    console.error("Webhook processing error:", error)
    logSecurityEvent("WEBHOOK_PROCESSING_ERROR", request, undefined, {
      error: error instanceof Error ? error.message : "Unknown error"
    })
    return createErrorResponse("Webhook processing failed", 500, request)
  }
}

async function handleUserCreated(event: ClerkWebhookEvent, request: NextRequest) {
  const { data } = event
  const email = data.email_addresses?.[0]?.email_address
  
  // Log user creation
  await logSecurity(AuditEventType.SYSTEM_ERROR, request, data.id, {
    event: "user_created",
    email,
    firstName: data.first_name,
    lastName: data.last_name,
    username: data.username,
    createdAt: new Date(data.created_at).toISOString()
  })

  // User profile creation can be implemented here if needed

  console.log(`User created: ${data.id} (${email})`)
}

async function handleUserUpdated(event: ClerkWebhookEvent, request: NextRequest) {
  const { data } = event
  const email = data.email_addresses?.[0]?.email_address
  
  // Log user update
  await logSecurity(AuditEventType.SYSTEM_ERROR, request, data.id, {
    event: "user_updated",
    email,
    updatedAt: new Date(data.updated_at).toISOString(),
    lastActiveAt: data.last_active_at ? new Date(data.last_active_at).toISOString() : null
  })

  // User profile update can be implemented here if needed

  console.log(`User updated: ${data.id} (${email})`)
}

async function handleUserDeleted(event: ClerkWebhookEvent, request: NextRequest) {
  const { data } = event
  
  // Log user deletion
  await logSecurity(AuditEventType.SYSTEM_ERROR, request, data.id, {
    event: "user_deleted",
    deletedAt: new Date().toISOString()
  })

  // User deletion handling can be implemented here if needed
  // - Soft delete user profile
  // - Anonymize or delete user data according to GDPR/privacy policy
  // - Archive user's invoices and clients

  console.log(`User deleted: ${data.id}`)
}

async function handleSessionCreated(event: ClerkWebhookEvent, request: NextRequest) {
  const { data } = event
  
  // Log session creation
  await logSecurity(AuditEventType.SYSTEM_ERROR, request, data.user_id, {
    event: "session_created",
    sessionId: data.id,
    createdAt: new Date(data.created_at).toISOString(),
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    userAgent: request.headers.get("user-agent")
  })

  console.log(`Session created: ${data.id} for user ${data.user_id}`)
}

async function handleSessionEnded(event: ClerkWebhookEvent, request: NextRequest) {
  const { data } = event
  
  // Log session end
  await logSecurity(AuditEventType.SYSTEM_ERROR, request, data.user_id, {
    event: "session_ended",
    sessionId: data.id,
    endedAt: new Date().toISOString()
  })

  console.log(`Session ended: ${data.id} for user ${data.user_id}`)
}

async function handleSessionRemoved(event: ClerkWebhookEvent, request: NextRequest) {
  const { data } = event
  
  // Log session removal
  await logSecurity(AuditEventType.SYSTEM_ERROR, request, data.user_id, {
    event: "session_removed",
    sessionId: data.id,
    removedAt: new Date().toISOString()
  })

  console.log(`Session removed: ${data.id} for user ${data.user_id}`)
}

async function handleSessionTokenUpdated(event: ClerkWebhookEvent, request: NextRequest) {
  const { data } = event
  
  // Log token update
  await logSecurity(AuditEventType.SUSPICIOUS_ACTIVITY, request, data.user_id, {
    event: "session_token_updated",
    sessionId: data.id,
    tokenUpdatedAt: new Date().toISOString(),
    reason: "Token refresh"
  })

  console.log(`Session token updated: ${data.id} for user ${data.user_id}`)
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return createSuccessResponse({}, 200, request)
}
