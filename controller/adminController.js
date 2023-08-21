const jwt = require('jsonwebtoken')
const User = require('../model/user/user')
const Admin = require('../model/admin/admin')

//Admin login
const adminlogin = async (req, res) => {
    console.log("inside admin");
    const AdminDetails = await Admin.findOne({ email: req.body.email })
    if (!AdminDetails) {
        return res.status(404).send({
            message: "Admin not Found"
        })
    }
    if (!(req.body.password == AdminDetails.password)) {
        return res.status(404).send({
            message: "Password is Incorrect"
        })
    }
    const token = jwt.sign({ _id: AdminDetails._id }, process.env._JWT_ADMIN_SECERETKEY, { expiresIn: 3600 })
    console.log(token);
    res.status(200).json({ token })

}





module.exports = {
    adminlogin
}