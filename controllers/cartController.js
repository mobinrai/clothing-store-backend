import ProductModel from '../models/productModel.js'
import CartModel from '../models/cartModel.js'

export const getCart = async (req, res) => {
    try {
        const userId = req.user._id
        
        let cart = await CartModel.findOne({ user: userId })
            .populate('items.product')

        if (!cart) {
            cart = new CartModel({
                user: userId,
                items: [],
                totalItems: 0,
                totalPrice: 0
            })
            await cart.save()
        }

        res.status(200).json({
            success: true,
            data: cart
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching cart',
            error: error.message
        })
    }
}

// Add item to cart
export const addToCart = async (req, res) => {
    try {
        console.log(req.body);
        const userId = req.user.id
        const { productId, variant, quantity = 1 } = req.body

        // Validate product exists
        const product = await ProductModel.findById(productId)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        // Validate variant if provided
        if (variant) {
            const validVariant = product.variants?.find(
                v => v.size === variant.size && v.color === variant.color
            )
            if (!validVariant) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product variant'
                })
            }
        }

        let cart = await CartModel.findOne({ user: userId })
        
        if (!cart) {
            cart = new CartModel({
                user: userId,
                items: [],
                totalItems: 0,
                totalPrice: 0
            })
        }
        const existingItemIndex = cart.items.findIndex(
            item => {
                const variantMatch = !variant || (
                    item.variant?.size === variant.size &&
                    item.variant?.color === variant.color
                )
                return item.product.toString() === productId && variantMatch
            }
        )

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity
        } else {
            const price = variant ? 
                product.variants.find(v => v.size === variant.size && v.color === variant.color).basePrice :
                product.basePrice
            
            cart.items.push({
                product: productId,
                variant: variant || undefined,
                quantity: quantity,
                price: price
            })
        }

        // Recalculate totals
        cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
        cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        await cart.save()
        await cart.populate('items.product', 'name description mainImages variants')

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: cart
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error adding item to cart',
            error: error.message
        })
    }
}

export const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id
        const { itemIndex } = req.params
        const { quantity } = req.body

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            })
        }

        const cart = await CartModel.findOne({ user: userId })
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            })
        }

        if (itemIndex < 0 || itemIndex >= cart.items.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item index'
            })
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity

        // Recalculate totals
        cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
        cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        await cart.save()
        await cart.populate('items.product', 'name description images')

        res.status(200).json({
            success: true,
            message: 'Cart item updated successfully',
            data: cart
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating cart item',
            error: error.message
        })
    }
}

export const removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id
        const { itemIndex } = req.params

        const cart = await CartModel.findOne({ user: userId })
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            })
        }

        if (itemIndex < 0 || itemIndex >= cart.items.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item index'
            })
        }
        // Remove item
        cart.items.splice(itemIndex, 1)
        // Recalculate totals
        cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
        cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        await cart.save()
        await cart.populate('items.product', 'name description images')

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: cart
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing item from cart',
            error: error.message
        })
    }
}

export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id

        const cart = await CartModel.findOne({ user: userId })
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            })
        }

        cart.items = []
        cart.totalItems = 0
        cart.totalPrice = 0

        await cart.save()

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: cart
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error clearing cart',
            error: error.message
        })
    }
}

// Apply coupon/discount (optional)
export const applyDiscount = async (req, res) => {
    try {
        const userId = req.user.id
        const { discountCode } = req.body

        const cart = await CartModel.findOne({ user: userId })
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            })
        }

        // Your discount logic here
        // For example:
        // const discount = await Discount.findOne({ code: discountCode })
        // if (!discount) {
        //     return res.status(404).json({
        //         success: false,
        //         message: 'Invalid discount code'
        //     })
        // }
        // cart.totalPrice = applyDiscount(cart.totalPrice, discount)

        await cart.save()

        res.status(200).json({
            success: true,
            message: 'Discount applied successfully',
            data: cart
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error applying discount',
            error: error.message
        })
    }
}