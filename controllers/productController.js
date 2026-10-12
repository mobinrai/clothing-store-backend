import ProductModel from '../models/productModel.js'
import { getSlug, uploadImageToImageKit } from '../utils/common.js'
import { imagekit } from './imageKitController.js'


export const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            brand,
            minPrice,
            maxPrice,
            featured,
            tags,
            sortBy = "createdAt",
            order = "desc",
            page = 1,
            limit = 5,
            inStock
        } = req.query;
        const query = {};

        if (search) {
            if (search.length < 3) {
                query.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                    { brand: { $regex: search, $options: "i" } },
                    { tags: { $regex: search, $options: "i" } },
                    { materials: { $regex: search, $options: "i" } }
                ];
            } else {
                query.$text = { $search: search };
            }
        }

        if (category) {
            query.category = category;
        }

        if (brand) {
            query.brand = new RegExp(brand, "i");
        }

        if (featured !== undefined) {
            query.isFeatured = featured === "true";
        }

        if (tags) {
            query.tags = {
                $in: tags.split(",")
            };
        }
        if (minPrice || maxPrice) {
            query.basePrice = {};
            if (minPrice) query.basePrice.$gte = Number(minPrice);
            if (maxPrice) query.basePrice.$lte = Number(maxPrice);
        }
        if (inStock === "true") {
            query["variants"] = {
                $elemMatch: {
                    stock: { $gt: 10 }
                }
            };
        }

        const sort = {};
        sort[sortBy] = order === "asc" ? 1 : -1;

        const skip = (Number(page) - 1) * Number(limit);

        const [products, totalProducts] = await Promise.all([
            ProductModel.find(query)
                .populate("category", "name slug")
                .sort(sort)
                .skip(skip)
                .limit(Number(limit)),
            ProductModel.countDocuments(query)
        ]);
        const transformedProducts = products.map(product => {
            const productObj = product.toJSON();
            if (product.variants && product.variants.length > 0) {
                const prices = product.variants
                    .filter(v => v.stock > 0)
                    .map(v => v.price || product.basePrice);
                
                if (prices.length > 0) {
                    productObj.minPrice = Math.min(...prices);
                    productObj.maxPrice = Math.max(...prices);
                    productObj.displayPrice = productObj.minPrice === productObj.maxPrice 
                        ? productObj.minPrice 
                        : `${productObj.minPrice} - ${productObj.maxPrice}`;
                } else {
                    // No variants in stock
                    productObj.displayPrice = 'Out of stock';
                }
            } else {
                productObj.minPrice = product.basePrice;
                productObj.maxPrice = product.basePrice;
                productObj.displayPrice = product.basePrice;
            }
            
            return productObj;
        });

        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            success: true,
            pagination: {
                currentPage: Number(page),
                totalPages: totalPages,
                totalItems: totalProducts,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null
            },
            products: transformedProducts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



export const getProductById = async (req, res) => {
    try {        
        const product = await ProductModel.findOne({_id:req.params.id})
        .populate({
            path:'category',
            select:'_id name'
        });

        if (!product)
        return res.status(404).json({ message: "Product not found" });

        res.json({ success: true, data: product });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const createProduct = async (req, res) => {
    try {
        var fileUploadedDetails = []
        const newProduct = await getProductFromRequest(req.body, req.user._id)
        const mainImageFiles = req.files.filter(file => file.fieldname === 'mainImages')

        if(Array.isArray(mainImageFiles) && mainImageFiles.length) {
            const result = await uploadMainImages(mainImageFiles)
            if(result.length){
                newProduct.mainImages = result
                result.forEach(res=>{
                    fileUploadedDetails.push(res.imageId)
                })
            }
        }
        
        const {variantResult, uploadedNewImageId} = await uploadVariantImages(newProduct.variants, req.files)
        newProduct.variants = variantResult
        fileUploadedDetails.concat(uploadedNewImageId)
        
        const savedProduct = new ProductModel(newProduct);
        await savedProduct.save();
        
        res.status(200).json({ 
            success: true,
            message: 'Product added successfully', 
            product: savedProduct 
        });
    } catch (err) {
        console.log(err);
        if(fileUploadedDetails.length){
            console.log(fileUploadedDetails);
            await imagekit.bulkDeleteFiles(fileUploadedDetails)
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateProduct = async (req, res) => {
    
    try {
        var fileUploadedIds = [], deleteImagesId=[]
        const _id = req.params.id
        const updatedProductDetails = await getProductFromRequest(req.body, req.user._id)
        const deletedMainImageIds = JSON.parse(req.body.deletedMainImageIds)
        const storedVariantImages = JSON.parse(req.body.storedVariantImages)
        const deletedVariantImageIds = JSON.parse(req.body.deletedVariantImageIds)
        const productExists = await ProductModel.findOne({_id});
        const mainImageFiles = req.files.filter(file => file.fieldname === 'mainImages')
        deleteImagesId.concat(deletedMainImageIds, deletedVariantImageIds)
        const result = await uploadMainImages(mainImageFiles)

        if(result.length){
            updatedProductDetails.mainImages = [...updatedProductDetails.mainImages, ...result]
            result.forEach(res=>{
                fileUploadedIds.push(res.imageId)
            })
        }
        if(Object.keys(storedVariantImages).length){
            updatedProductDetails.variants = updatedProductDetails.variants.map((variant,vIndex)=>{
                return {
                    ...variant,
                    images:[...(variant.images??[]), ...storedVariantImages[`variants.${vIndex}`]]
                }
            })
        }
        const {variantResult, uploadedNewImageId} = await uploadVariantImages(updatedProductDetails.variants, req.files)
        updatedProductDetails.variants = variantResult
        fileUploadedIds.concat(uploadedNewImageId)      
        
        if (!productExists)
            return res.status(404).json({ message: "Product not found" });

        const newUpdateProduct = await ProductModel.findOneAndUpdate({_id},updatedProductDetails,{returnDocument: 'after', runValidators:true})
        if(!newUpdateProduct)
            return res.status(500).json({
                success:false,
                message:'Could not update product. Something went wrong.'
        })
        if(deleteImagesId.length){
            await imagekit.bulkDeleteFiles(deleteImagesId)
        }
        res.json({ success: true, message: "Product updated successfully", data: newUpdateProduct });

    } catch (err) {
        console.log(err);
        if(fileUploadedIds.length){
            await imagekit.bulkDeleteFiles(fileUploadedIds)
        }
        res.status(500).json({ message: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await ProductModel.findByIdAndDelete(req.params.id);

        if (!product){
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ success: true, message: "Product deleted successfully" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message })
    }
};

async function getProductFromRequest(requestBody, userId){
    return {
            name: requestBody.name,
            slug:await getSlug(requestBody.name, ProductModel),
            description: requestBody.description,
            brand: requestBody.brand,
            category: requestBody.category,
            basePrice: parseFloat(requestBody.basePrice),
            discount: parseInt(requestBody.discount),
            isFeatured: requestBody.isFeatured,
            materials: JSON.parse(requestBody.materials || '[]'),
            tags: JSON.parse(requestBody.tags || '[]'),
            variants: JSON.parse(requestBody.variants || '[]'),
            mainImages: JSON.parse(requestBody.storedMainImages || '[]'),
            createdAt: new Date(),
            shipmentDays:JSON.parse(requestBody.shipmentDays),
            createdBy:userId,
            isFeatured:false
        };
}

async function uploadVariantImages(variants, files) {
    let variantImagesObj={}
    files.forEach((file) => {
        if (file.fieldname.startsWith('variant-')) {
            variantImagesObj[file.fieldname] = file;
        }
    })
    let uploadedNewImageId=[], variantResult=variants
    if(Object.keys(variantImagesObj).length){
        variantResult = await Promise.all(variants.map(async (variant, vIndex) => {
                const variantImages = [];
                for (const key in variantImagesObj) {
                    if (key.startsWith(`variant-${vIndex}-image-`)) {
                        const file = variantImagesObj[key]
                        const result = await uploadImageToImageKit({
                            fileBuffer: file.buffer,
                            fileName: file.originalname,
                            tags: ['variants',variant.size,Date.now(), variant.color]
                        });
                        variantImages.push(result);
                        uploadedNewImageId.push(result.imageId)
                    }
                }
                return {
                    ...variant,
                    images: [...(variant.images??[]), ...variantImages]
                };
            })
        )
    }
    return {uploadedNewImageId, variantResult}
}
async function uploadMainImages(mainImageFiles) {
    const mainImagePromise= mainImageFiles.map(async (file) => {
        return await uploadImageToImageKit({fileBuffer:file.buffer, fileName:file.originalname, tags:['product', 'mainImages']})
    });
    return await Promise.all(mainImagePromise)
}