import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema(
  {
    size: String,
    color: String,
    stock: { type: Number, default: 0 },
    sku: String,
    price: Number,
    images: [String]
  },
  { _id: false }
)

const productSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: true
        },
        description: String,
        brand: String,
        category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
        },
        basePrice: Number,
        discount:Number,
        variants: [variantSchema],
        mainImages: [String],
        tags: [String],
        isFeatured: {
        type: Boolean,
        default: false
        },

        ratingAverage: {
        type: Number,
        default: 0
        },

        ratingCount: {
        type: Number,
        default: 0
        }
    },
  { timestamps: true }
)

export default ProductSchema = mongoose.model('Product', productSchema)
