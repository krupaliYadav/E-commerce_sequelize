const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")
exports.paginate = async ({ model, offsetData, limitData, where = {}, options }) => {
    try {
        const limit = parseInt(limitData, 10) || 10;
        const offset = parseInt(offsetData, 10) || 0;
        const { attributes = {}, include = [] } = options || {}
        let rows = await model.findAll({
            where: where,
            include: include,
            order: [['id', 'DESC']],
            attributes: attributes,
            limit: limit,
            offset: offset,
        });

        return rows

    } catch (error) {
        return { status: HTTP_STATUS_CODE.INTERNAL_SERVER, success: false, message: error.message }
    }
};