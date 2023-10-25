const Joi = require("joi")

const signUpValidation = Joi.object().keys({
    firstName: Joi.string().required().messages({
        "string.empty": "The first name field is required.",
    }),
    lastName: Joi.string().required().messages({
        "string.empty": "The last name field is required.",
    }),
    email: Joi.string().required().messages({
        "string.empty": "The email field is required.",
        "string.email": "The email must be a valid email."
    }),
    password: Joi.string().required().messages({
        "string.empty": "The password field is required.",
    }),
    phoneNumber: Joi.number().required().messages({
        "number.empty": "The phone number field is required.",
    }),
    roleId: Joi.number().required().messages({
        "number.empty": "The roleId field is required.",
    }),
    address: Joi.string().required().messages({
        "string.empty": "The address field is required.",
    }),
    referralId: Joi.number(),
    isReferral: Joi.string()
})

const login = Joi.object().keys({
    email: Joi.string().required().messages({
        "string.empty": "The email field is required.",
        "string.email": "The email must be a valid email."
    }),
    password: Joi.string().required().messages({
        "string.empty": "The password field is required.",
    })
})

const addProductValidation = [
    'categoryId', 'productName', 'price', 'description', 'warranty', 'quantity', 'deliveryInDays'
]

const addToCartValidation = Joi.object().keys({
    productId: Joi.number().required().messages({
        "number.empty": "The productId field is required.",
    }),
    selectedVariantId: Joi.number(),
    totalQuantity: Joi.number().required().messages({
        "number.empty": "The total quantity field is required.",
    }),
})

const orderPlaceValidation = [
    'productId', 'quantity'
]

const addDiscountValidation = Joi.object().keys({
    productId: Joi.number().required().messages({
        "number.empty": "The productId field is required.",
    }),
    discount: Joi.number().required().messages({
        "string.empty": "The discount field is required.",
    }),
    startDate: Joi.date().required().messages({
        "string.empty": "The start date field is required.",
    }),
    endDate: Joi.date().required().messages({
        "string.empty": "The end date field is required.",
    }),
})

const addRewardValidation = Joi.object().keys({
    rewardAmount: Joi.number().required().messages({
        "number.empty": "The reward amount field is required.",
    })
})

const addCouponValidation = Joi.object().keys({
    discount: Joi.number().required().messages({
        "number.empty": "The discount percentage field is required.",
    }),
    applyOnParches: Joi.number().required().messages({
        "number.empty": "The apply on parches amount field is required.",
    }),
    startDate: Joi.date().required().messages({
        "date.empty": "The start date field is required.",
    }),
    endDate: Joi.date().required().messages({
        "date.empty": "The end date field is required.",
    }),
})

module.exports = {
    signUpValidation,
    login,
    addProductValidation,
    addToCartValidation,
    orderPlaceValidation,
    addDiscountValidation,
    addRewardValidation,
    addCouponValidation
}