import user_model from "../model/user_model.js";
import bcrypt from "bcrypt";
export async function login (req, res) {
    res.send({
        message:"Login rPage"
    });
}

export async function user(req,res){
    
}
export async function register(req,res){
    const {name, email, password, username } = req.body;

    if(!name) return res.status(403).send({"message": "Please input a name" });
    if(!email) return res.status(403).send({"message": "Please input an email" });
    if(!password) return res.status(403).send({"message": "Please input a password" });
    if(!username) return res.status(403).send({"message": "Please input a username" });
        
    
        const existingUser = await user_model.find({$or:[{ email}, { username }]});
        if (existingUser.length > 0) {
          return res.status(409).json({ message: 'User already exists',
        status: "409"});
        }
            bcrypt.hash(password, 10).then(hashPass =>{
                const user = new user_model({ name, email, password:hashPass, username });
                user.save().then(
                    result=>{
                        res.status(200).send({
                            message: "User Created Successfully",
                            data:{
                                "name" : name,
                                "email" : email,
                                "username" : username,
                                "password" : hashPass
                            },
                            status: "200"
                        });
                    }
                ).catch(error => {
                    res.status(500).send({
                        message: error,
                        status: "500"
                    });
                });
            }).catch(error => {
                res.status(403).send({
                    message: "Unable to Hash Password",
                    status: "403"
                });
            });
        
        
    


    
    
}