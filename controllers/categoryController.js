import Categories from '../models/categoryModel.js'
import { deleteImage, findSingleById, getSlug, uploadImageToImageKit } from '../utils/common.js'
import { imagekit } from './imageKitController.js'

export const getAllCategories = async (req,res)=>{
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        let filter = {};
        if(limit>5){
            page=1
        }
        if (search) {
            console.log(search);
            page=1
            limit=10
            filter = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } }
                ]
            };
        }
        if (req.query.isDeleted !== undefined) {
            filter.isDeleted = req.query.isDeleted === 'true';
        }
        const skip = (page - 1) * limit;
        
        const [totalCategories, categories] = await Promise.all([
            Categories.countDocuments(filter),
            Categories.find(filter)
                .populate({
                    path: 'parent',
                    select: '_id name'
                })
                .skip(skip)
                .limit(limit)
                .sort({ [sortBy]: sortOrder })
        ]);
        const totalPages = Math.ceil(totalCategories / limit);

        return res.status(200).json({
            success: true,
            categories,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCategories,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null
            },
            filters: {
                search: search || null,
                isDeleted: req.query.isDeleted || null
            }
        });
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
}

export const getCategory=async(req, res)=>{
    try{
        const category = await Categories.findOne({_id:req.params.id})
        return res.status(200).json({success:true, category})
    }catch(err){
        return res.status(500).json({success:false, message:err.message})
    }
}

export const createCategory = async(req,res)=>{
    let fileUploadedDetails=[]
    try{
        let {name, parent} = req.body
        
        parent = JSON.parse(parent)

        const categoryData = {name, parent, slug: await getSlug(name, Categories), image:null}
        if(req.file){
            const {imageId, imageUrl, name} = await uploadImageToImageKit({fileBuffer:req.file.buffer, fileName:req.file.originalname, tags:['category']})
            fileUploadedDetails.push(imageId)
            categoryData.image = {name, imageId, imageUrl}
        }
        const newCategory = new Categories(categoryData)
        const category = await newCategory.save()
        return res.status(201).json({ 
                    success: true, 
                    message: 'Category added successfully', 
                    category 
                });
    }
    catch(err)
    {
        console.log(err);
        if(fileUploadedDetails.length>0){
            await imagekit.bulkDeleteFiles(fileUploadedDetails)
        }
        return res.status(500).json({ success: false, message: err.message });
    }
    
}

export const editCategory = async(req,res)=>{
    let newUploadedImage='';
    try{
        const _id = req.params.id
        if(!_id){
            return res.status(400).json({
                success:false,
                message:'Category id is missing'
            })
        }
        let categoryExists = await findSingleById(_id, Categories)        
        if(!categoryExists){
            return res.status(404).json({
                success:false,
                message:'Couldn\'t find category'
            })
        }
        const oldImageId = categoryExists.image?.imageId
        const updatedProduct = {
            name:req.body.name,
            slug:await getSlug(req.body.name, Categories),
            parent:JSON.parse(req.body.parent),
            image:{}
        }
        if(req.file){
            try{
                const imageName = req.file.originalname;
                const {imageId, imageUrl,name} = await uploadImageToImageKit({fileBuffer:req.file.buffer, fileName:imageName,tags:['category']})
                if(imageId && imageUrl){
                    updatedProduct.image = {imageUrl,imageId,name}
                    newUploadedImage=imageId
                }
            } catch(error){
                console.log(error)
                return res.status(500).json({ 
                            error: 'Image upload failed',
                            message: error.message 
                        });
            }
        }
        
        const editCategory = await Categories.findOneAndUpdate({_id},updatedProduct,{returnDocument: 'after', runValidators:true})
        
        if(!editCategory){
            return res.status(500).json({
                        success:false,
                        message: 'Failed to update category',
                    });
        }
        if(oldImageId){
            await deleteImage(categoryExists.image?.imageId)
        }
        return res.status(200).json({success:true, message:'Category edited successfullu', category:editCategory})
    }catch(err){
        if(newUploadedImage){
            await deleteImage(newUploadedImage)
        }
        return res.status(500).json({success:false, message:err.message})
    }
}

export const deleteCategory = async(req,res)=>{
    try{
        const _id = req.params.id
        
        let categoryExists = await findSingleById(_id, Categories)
        
        if(!categoryExists){
            return res.status(404).json({success:false, message:'Couldn\'t find category'})
        }

        if(categoryExists.image && categoryExists.image.imageId)
        {
            await imagekit.deleteFile(categoryExists.image.imageId)
        }

        const isDeleted = await Categories.findByIdAndDelete({_id})
        
        if(!isDeleted)
        {
            return res.status(500).json({success:false, message:'Couldn\'t delete category'})
        }   
        
        return res.status(200).json({success:true, message:"Category deleted succesfully"})
    }catch(err){
        return res.status(500).json({success:false, message:err.message})
    }
}


