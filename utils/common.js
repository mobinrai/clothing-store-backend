import {imagekit} from '../controllers/imageKitController.js'

export async function getSlug(name, Model){
    let slug = name.replace(/ /g,"-").toLowerCase()
    let slugExist = await Model.findOne({slug}) 
    let counter =2
    while(slugExist){
        slug = `${slug}-${counter}`
        slugExist = await Model.findOne({slug})
        counter++
    }
    return slug
}

export async function findSingleById(_id, Model) {
    return await Model.findOne({_id})
}

export async function uploadImageToImageKit({fileBuffer, fileName, tags}) {
        let imageUrl, imageId = null
        const replacedFileName = fileName.replace(/[^0-9_]/g,'-')
        const lastIndex = replacedFileName.lastIndexOf('.')
        const name = lastIndex!==-1?fileName.slice(0, lastIndex)+Date.now()+'.'+fileName.slice(lastIndex+1):fileName
        const result = await imagekit.upload({
            file: fileBuffer,
            fileName: name,
            tags: [...tags, name],
            useUniqueFileName: true,
            });
            if(result){
                imageUrl=result.url
                imageId=result.fileId
            }
        return {imageUrl, imageId, name}    
}

export async function deleteImage(fileId) {
    const result = await imagekit.deleteFile(fileId)
    return result
}