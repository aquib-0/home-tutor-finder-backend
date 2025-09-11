const jwt = require('jsonwebtoken');

module.exports = function (req, res, next){
    //get token from header
    const token = req.header('x-auth-token');

    //check if no token
    if(!token)
    {
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    //verify token
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; //add user from payload to the request object
        next();
    } catch(err)
    {
        console.error(err.message);
        res.status(401).json({msg: 'Token is not valid'});
    }
};