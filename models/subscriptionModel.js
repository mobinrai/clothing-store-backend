import mongoose from 'mongoose'

const newsletterSubscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      enum: ['homepage', 'popup', 'checkout', 'footer', 'manual'],
      default: 'homepage'
    },
    preferences: {
      productUpdates: {
        type: Boolean,
        default: true
      },
      promotions: {
        type: Boolean,
        default: true
      },
      blogPosts: {
        type: Boolean,
        default: true
      },
      weeklyDigest: {
        type: Boolean,
        default: true
      }
    },
    isSubscribed: {
      type: Boolean,
      default: true
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    },
    unsubscribedAt: Date,
    lastEmailSent: Date,
    emailCount: {
      type: Number,
      default: 0
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      pageUrl: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);