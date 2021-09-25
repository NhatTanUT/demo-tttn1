const auth_admin = async (req, res, next) => {
    try {
        if (req.user.role === 'admin') 
            next()
        else {
            return res.status(500).json({msg: 'You do not have permission to access this content'})
        }
    } catch (error) {
        return res.status(401).json({ msg: err.message })
    }
}

module.exports = {auth_admin}