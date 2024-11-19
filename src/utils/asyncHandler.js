const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        process.resolve(requestHandler(req, res, next)).
        catch ((err) => next(err))
    }
}

export {asyncHandler}





// <<<<<<<<<<< it is just anthor method>>>>>>>>


// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }