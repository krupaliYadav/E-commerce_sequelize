const HTTP_STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    DELETED: 202,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    CONFLICT: 409,
    BAD_GATEWAY: 502,
    INTERNAL_SERVER: 500,
}

const IMAGE_PATH = {
    PROFILE_IMAGE_URL: 'http://localhost:8000/public/profile/',
    PRODUCT_IMAGE_URL: 'http://localhost:8000/public/products/',
    CATEGORY_IMAGE_URL: 'http://localhost:8000/public/category/',
    CUSTOM_IMAGE_URL: 'http://localhost:8000/public/customCake/'
}

module.exports = { HTTP_STATUS_CODE, IMAGE_PATH }