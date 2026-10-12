import CategoryModel from '../models/categoryModel.js';
import ProductModel from '../models/productModel.js'

export const homeIndex = async(req,res)=>{
    try{
        const data = await ProductModel.aggregate([
        {
            $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category"
            }
        },
        {$unwind: "$category"},
        {
            $facet: {
            
            newArrivals: [
                { $match: { tags: "new-arrival" } }
            ],
            
            sliders: [
                { $match: { tags: "slider" } }
            ],

            trending: [
                { $match: { tags: "weekly-trending" } },
                {$limit:1}
            ],

            sale: [
                { $match: { tags: "season-sale" } }
            ],

            mens: [{
                $match: {
                    tags: "featured",
                    "category.slug": "mens"
                }}
            ],
            womens: [{
                $match: {
                    tags: "featured",
                    "category.slug": "womens"
                }}
            ],
            girls: [{
                $match: {
                    tags: "featured",
                    "category.slug": "girls"
                }}
            ],
            boys: [{
                $match: {
                    tags: "featured",
                    "category.slug": "boys"
                }}
            ],
            children: [{
                $match: {
                    tags: "featured",
                    "category.slug": "children"
                }}]
            }
        }])
        const removeTags = ["featured", "slider", "new-arrival", "weekly-trending","season-sale"]
        Object.keys(data[0]).forEach(key => {
        data[0][key] = data[0][key].map(product => ({
            ...product,
            tags: product.tags.filter(tag => !removeTags.includes(tag))
        }));
        });
        res.json({ success: true, data });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    
}