import Roles from '../models/roleModel.js'

export const getAllRoles = async (req,res)=>{
    const roles = await Roles.find()
    return res.status(200).send(roles)
}

export const getRole=async(req, res)=>{
    const role = await Roles.findOne({slug:req.params.slug})
    return res.status(200).send(role)
}

export const createRole = async(req,res)=>{
    const name = req.body.name
    const slug = await checkSlugExist(name)
    const newRole = new Roles({slug, name})
    const role = await newRole.save()

    res.status(200).json(role)
}

export const editRole = async(req,res)=>{
    const _id = req.params.id
    let roleExist = await Roles.findOne({_id}) 
    
    if(!roleExist){
        return res.status(404).send('Couldn\'t find role')
    }
    const name=req.body.name
    const slug = await checkSlugExist(name)
    const editRole = await Roles.findOneAndUpdate({_id},{name, slug},{new:true})
    
    if(!editRole){
        return res.status(500).send('Couldn\'t update role')
    }
    res.status(200).json(editRole)
}

export const deleteRole = async(req,res)=>{
    const _id = req.params.id

    let roleExist = await Roles.findOne({_id})
    if(!roleExist){
        return res.status(404).send('Couldn\'t find role')
    }

    const isDeleted = await Roles.findOneAndUpdate({_id}, {isDeleted:true}, {new:true})

    if(!isDeleted){
        return res.status(500).send('Couldn\'t delete role')
    }
    
    res.status(200).send("Role deleted succesfully")
}


async function checkSlugExist(name){
    let slug = name.replace(/ /g,"-").toLowerCase()
    let slugExist = await Roles.findOne({slug}) 
    let counter =2
    while(slugExist){
        slug = `${slug}-${counter}`
        slugExist = await Roles.findOne({slug})
        counter++
    }
    return slug
}