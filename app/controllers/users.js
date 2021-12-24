const moment = require('moment');
const zipcodes = require('zipcodes');
const utils = require('../middleware/utils');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const pwd = await utils.createPasswordHash(password);
        const user = await User().findOne({ where: { username, password: pwd } })
        if (!user) {
            return res.send({
                status: "ERROR",
                message: "invalid credentials",
                statusCode: 400,
                data:{}
            })
        }
        user.password = undefined;
        const token = jwt.sign({ id: user.id, role_id: user.role_id, role: user.role }, process.env.JWT_SECRET)
        const result =await User().update({ access_token:token }, {
            where: {
                id: user.id
            }
        })
        return res.send({
            status: "SUCCESS",
            message: "user logged in",
            data: { token, user },
            statusCode: 1000
        })

    } catch (error) {
        console.log(error);
        return res.send({
            status: "ERROR",
            message: "Something went wrong",
            statusCode: 401
        })
    }
}
const test = async (req, res) => {
    try {
       
        return res.send({
            status: "SUCCESS",
            data:req.user,
            statusCode: 1000
        })

    } catch (error) {
        console.log(error);
        return res.send({
            status: "ERROR",
            message: "Something went wrong",
            statusCode: 401
        })
    }
}

module.exports = {
    login,
    test
}