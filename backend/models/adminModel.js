import mongoose from "mongoose";

const adminSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxLength:50
    },
    password:{
        type:String,
        required:true,
        maxLength:25
    },
    email:{
        type:String,
        required:true,
        unique:true,
        maxLength:100
    },
    userType: {
        type: String,
        enum: ['customer', 'admin'],
        required: true,
        default: 'admin'
    }
})


const Admin=mongoose.model('Admin',adminSchema);
export default Admin;