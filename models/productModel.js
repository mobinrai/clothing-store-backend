import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema(
    {
        size: String,
        color:[String],
        stock: { type: Number, default: 0, min:0 },
        sku: {type:String, required:true},
        price: { type: Number, min:0 },
        images: [{name:String,imageId:String, imageUrl:String}]
    }
)

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        slug:{type:String, unique:true},
        description: String,
        brand: String,
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        },
        basePrice: { type: Number, min:0 },
        discount:{ type: Number, min:0, max:100,default:0 },
        materials:[String],
        variants: [variantSchema],
        mainImages: [{name:String, imageId:String, imageUrl:String}],
        tags: [String],
        shipmentDays:[Number],
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
        },
        createdBy:{type: mongoose.Schema.Types.ObjectId,
            ref: 'User'}
    },
    { timestamps: true }
)

productSchema.index({
    name: "text",
    description: "text",
    brand: "text",
    tags: "text",
    materials: "text"
});


productSchema.index({ basePrice: 1, ratingAverage: -1 });
productSchema.index({ category: 1, isFeatured: 1 });

export default mongoose.model('Product', productSchema)
