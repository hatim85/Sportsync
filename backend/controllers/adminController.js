import Admin from '../models/adminModel.js';

const createAdmin = async (req, res) => {
    try {
        const { name, password, email, userType } = req.body;

        const admin = new Admin({
            name,
            password,
            email,
            userType
        });

        const createdAdmin = await admin.save();

        res.status(201).json(createdAdmin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();

        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteAdminById = async (req, res) => {
    try {
        const adminId = req.params.id;

        const deletedAdmin = await Admin.findByIdAndDelete(adminId);

        if (!deletedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { createAdmin, getAllAdmins, deleteAdminById };