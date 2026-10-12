import ImageKit from "imagekit"

export const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGEKIT_ENDPOINT,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
})

export const imgKitAuth = async (req, res) => {
    var result = imagekit.getAuthenticationParameters()
    res.send(result)
}