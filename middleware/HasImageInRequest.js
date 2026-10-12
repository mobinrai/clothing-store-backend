export const hasImageInRequest= (fileName)=>{
    return (req, res, next)=>{
        const contentType = req.headers['content-type'] || '';
        const isMultipart = contentType.includes('multipart/form-data');
        if (isMultipart && req.headers['content-length'] > 100 && fileName) {
        return upload.single(fieldName)(req, res, (err) => {
            if (err) {
                return next(err);
            }
            next();
            });
        }
        next();
    }
    
}