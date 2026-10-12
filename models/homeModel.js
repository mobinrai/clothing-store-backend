import mongoose from "mongoose";

const homeConfigurationSchema= new mongoose.Schema({
    featuredCollections: [{
        name: {
            type: String,
            required: true
        },
        description: String,
        image: {
            url: { type: String, required: true },
            altText: String
        },
        products: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],
        filterCriteria: {
            tags: [String],
            categories: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category'
            }],
            priceRange: {
                min: Number,
                max: Number
            },
            attributes: [{
                name: String,
                value: String
            }]
        },
        isActive: {
            type: Boolean,
            default: true
        },
    }],
    weeklyTrending: {
        title: {
            type: String,
            default: 'Weekly Trending'
        },
        subtitle: String,
        products: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],        
        period: {
            type: String,
            enum: ['7days', '30days', 'alltime'],
            default: '7days'
        },       
        isActive: {
            type: Boolean,
            default: true
        }
    },
    newArrivals: {
        title: {
            type: String,
            default: 'New Arrivals'
        },
        subtitle: String,
        products: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],
        
        daysThreshold: {
            type: Number,
            default: 30
        },
        limit: {
            type: Number,
            default: 10
        },
        isActive: {
            type: Boolean,
            default: true
        },
    },
    bestSellers: {
        title: {
            type: String,
            default: 'Best Sellers'
        },
        subtitle: String,
        products: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],        
        period: {
            type: String,
            enum: ['monthly', 'quarterly', 'yearly', 'alltime'],
            default: 'monthly'
        },
        limit: {
            type: Number,
            default: 8
        },
        isActive: {
        type: Boolean,
        default: true
        }
    },
    seasonalSales: [{
        title: {
            type: String,
            required: true
        },
        subtitle: String,
        description: String,
        image: {
            url: { type: String, required: true },
            altText: String
        },
        backgroundColor: String,
        textColor: {
            title: { type: String, default: '#000000' },
            subtitle: { type: String, default: '#666666' }
        },
        buttonText: String,
        buttonLink: String,
        saleEndDate: Date,
        discountText: String,
        isActive: {
            type: Boolean,
            default: true
        },
    }],
    heroSliders: [{
        title: {
            type: String,
            required: true
        },
        subtitle: String,
        description: String,
        image: {
        desktop: {
            url: { type: String, required: true },
            altText: String
        },
        mobile: {
            url: { type: String, required: true },
            altText: String
        }
        },
        buttonText: String,
        buttonLink: String,
        backgroundColor: String,
        textColor: {
            title: { type: String, default: '#000000' },
            subtitle: { type: String, default: '#666666' },
            button: { type: String, default: '#ffffff' }
        },
        
        isActive: {
            type: Boolean,
            default: true
        },        
        startDate: Date,
        endDate: Date
    }]
})


export default mongoose.model('HomeConfigurationSchema', homeConfigurationSchema)